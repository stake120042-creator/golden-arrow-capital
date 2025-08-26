import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';
import authService from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = verified.user.id;
    const body = await request.json();
    
    const {
      amount,
      transaction_hash,
      description = 'USDT Deposit'
    } = body;

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid amount. Must be a positive number.' 
      }, { status: 400 });
    }

    if (!transaction_hash || typeof transaction_hash !== 'string') {
      return NextResponse.json({ 
        success: false, 
        message: 'Transaction hash is required.' 
      }, { status: 400 });
    }

    // Process the deposit transaction
    const { data: result, error: transactionError } = await supabaseServer
      .rpc('process_wallet_transaction', {
        p_user_id: userId,
        p_transaction_type: 'deposit',
        p_amount: amount,
        p_wallet_type: 'deposit',
        p_transaction_hash: transaction_hash,
        p_description: description
      });

    if (transactionError) {
      console.error('Error processing deposit:', transactionError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to process deposit',
        error: transactionError.message 
      }, { status: 500 });
    }

    if (!result) {
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to process deposit transaction' 
      }, { status: 500 });
    }

    // Get updated wallet balance
    const { data: walletData, error: walletError } = await supabaseServer
      .rpc('get_or_create_wallet', { p_user_id: userId });

    if (walletError) {
      console.error('Error fetching updated wallet balance:', walletError);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Deposit processed successfully',
      data: {
        amount,
        transaction_hash,
        new_balance: walletData?.[0]?.deposit_balance || 0
      }
    });
  } catch (err) {
    console.error('Deposit route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
