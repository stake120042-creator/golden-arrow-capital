// app/api/wallet/sync-deposit/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import authService from '@/services/authService';
import 'dotenv/config';

// Load environment variables.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';

// Initialize services with a secure Supabase client
const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

// Helper function to get current block number using REST API
async function getCurrentBlockNumber(): Promise<number> {
    try {
        const response = await fetch(`https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_blockNumber',
                params: []
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message);
        }
        
        return parseInt(data.result, 16);
    } catch (error) {
        console.error('❌ Failed to get current block number');
        return 30000000;
    }
}

// Helper function to get asset transfers using REST API
async function getAssetTransfers(fromBlock: string, toAddress: string): Promise<any> {
    const response = await fetch(`https://bnb-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            jsonrpc: '2.0',
            id: 1,
            method: 'alchemy_getAssetTransfers',
            params: [{
                fromBlock,
                toAddress,
                contractAddresses: [USDT_CONTRACT_ADDRESS],
                category: ["erc20"],
                order: "asc"
            }]
        })
    });
    
    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.error) {
        throw new Error(data.error.message);
    }

    return data.result;
}

export async function POST(request: NextRequest) {
    try {
        // --- SECURE AUTHENTICATION FIX ---
        // Get the token from the Authorization header
        const authHeader = request.headers.get('authorization') || '';
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        
        if (!token) {
            console.log('❌ No authorization token provided');
            return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
        }

        // Use authService.verifyToken method like other routes
        const verified = authService.verifyToken(token);
        if (!verified.valid || !verified.user) {
            console.log('❌ Invalid token:', verified);
            return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
        }
        
        const userId = verified.user.id;
        // 4. Fetch the user's deposit address from the database.
        const { data: walletData, error: walletError } = await supabase
            .from('user_wallets')
            .select('deposit_address')
            .eq('user_id', userId)
            .single();

        if (walletError || !walletData) {
            console.error('❌ Wallet not found for user:', userId);
            return NextResponse.json({ 
                success: false, 
                message: 'Wallet not found. Please create a wallet first.' 
            }, { status: 404 });
        }
        const userDepositAddress = walletData.deposit_address;

        // 5. Get or create the last synced block number to prevent double-processing.
        let lastSyncedBlock = 0;
        const { data: syncState } = await supabase
            .from('wallet_sync_state')
            .select('last_synced_block')
            .eq('user_id', userId)
            .single();

        if (syncState) {
            lastSyncedBlock = syncState.last_synced_block;
        } else {
            // Create a new entry for the user if none exists.
            await supabase.from('wallet_sync_state').insert({ user_id: userId });
        }

        // 6. Get current block number and validate the range
        const currentBlock = await getCurrentBlockNumber();
        
        // Ensure fromBlock is not higher than current block
        const fromBlockNumber = Math.min((lastSyncedBlock || 0) + 1, currentBlock);
        const fromBlock = `0x${fromBlockNumber.toString(16)}`;
        
        // 7. Query the blockchain using REST API directly (more reliable)
        let transfers;
        try {
            transfers = await getAssetTransfers(fromBlock, userDepositAddress);
        } catch (alchemyError) {
            console.error('❌ Alchemy API error');
            return NextResponse.json({ 
                success: false, 
                message: 'Failed to fetch blockchain data. Please try again later.' 
            }, { status: 500 });
        }

        const list = transfers?.transfers || [];
        if (!Array.isArray(list) || list.length === 0) {
            return NextResponse.json({ success: true, message: 'No new deposits found.', synced_count: 0, last_synced_block: lastSyncedBlock });
        }

        let syncedCount = 0;
        let latestBlock = lastSyncedBlock;

        // 8. Process each transaction.
        for (const tx of list) {
            // Only consider incoming USDT (BEP-20) transfers to this user's address
            const toMatches = typeof tx.to === 'string' && tx.to.toLowerCase() === userDepositAddress.toLowerCase();
            const isUsdt = typeof tx.rawContract?.address === 'string' && tx.rawContract.address.toLowerCase() === USDT_CONTRACT_ADDRESS.toLowerCase();
            if (!toMatches || !isUsdt) {
                continue;
            }

            // Check if the transaction already exists in our database.
            const { count } = await supabase
                .from('wallet_transactions')
                .select('id', { count: 'exact', head: true })
                .eq('transaction_hash', tx.hash);

            if (count === 0) {
                // Parse amount from hex wei in rawContract.value (Alchemy sets value=null for some ERC20s)
                const rawHex = typeof tx.rawContract?.value === 'string' ? tx.rawContract.value : '0x0';
                const amountInWei = BigInt(rawHex);
                const amount = Number(amountInWei) / 1e18; // USDT on BSC uses 18 decimals

                // Call the `process_wallet_transaction` RPC to update the user's balance.
                const { error: rpcError } = await supabase.rpc('process_wallet_transaction', {
                    p_user_id: userId,
                    p_transaction_type: 'deposit',
                    p_amount: amount,
                    p_wallet_type: 'deposit',
                    p_transaction_hash: tx.hash,
                    p_description: `USDT deposit of ${amount}`
                });

                if (!rpcError) {
                    syncedCount++;
                    if (typeof tx.blockNum === 'string') {
                        latestBlock = Math.max(latestBlock, parseInt(tx.blockNum, 16));
                    }
                } else {
                    console.error('❌ Error processing transaction:', tx.hash);
                }
            } else {
                // already processed
            }
        }

        // 9. Update the last synced block in the database for the next run.
        const { error: updateError } = await supabase
            .from('wallet_sync_state')
            .upsert({ 
                user_id: userId, 
                last_synced_block: latestBlock,
                last_synced_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (updateError) {
            console.error('❌ Error updating sync state:', updateError);
        }

        return NextResponse.json({
            success: true,
            message: `Successfully synced ${syncedCount} new deposits.`,
            synced_count: syncedCount,
            last_synced_block: latestBlock
        });
        
    } catch (err) {
        console.error('❌ Sync deposit route error:', err);
        return NextResponse.json({ 
            success: false, 
            message: 'Internal server error during sync' 
        }, { status: 500 });
    }
}