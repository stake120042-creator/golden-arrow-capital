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
    const { amount, operation = 'deduct' } = body;

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Amount must be a positive number' 
      }, { status: 400 });
    }

    // Get current platform wallet balance using the database function
    const { data: walletData, error: walletError } = await supabaseServer
      .rpc('get_or_create_wallet', { p_user_id: userId });

    if (walletError) {
      console.error('Error fetching platform wallet balance:', walletError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch platform wallet balance',
        error: walletError.message 
      }, { status: 500 });
    }

    // Process the wallet data
    let walletBalance = {
      deposit_balance: 0,
      income_balance: 0,
      total_deposited: 0,
      total_withdrawn: 0
    };

    if (walletData) {
      if (Array.isArray(walletData) && walletData.length > 0) {
        walletBalance = walletData[0];
      } else if (typeof walletData === 'object' && walletData !== null) {
        walletBalance = walletData;
      }
    }

    const currentBalance = parseFloat(walletBalance.deposit_balance || '0');
    let newBalance: number;

    if (operation === 'deduct') {
      if (currentBalance < amount) {
        return NextResponse.json({ 
          success: false, 
          message: 'Insufficient balance' 
        }, { status: 400 });
      }
      newBalance = currentBalance - amount;
    } else if (operation === 'add') {
      newBalance = currentBalance + amount;
    } else {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid operation. Use "deduct" or "add"' 
      }, { status: 400 });
    }

    // Update platform wallet balance using a database function
    // We'll use the process_wallet_transaction function for consistency
    const { data: result, error: updateError } = await supabaseServer
      .rpc('process_wallet_transaction', {
        p_user_id: userId,
        p_transaction_type: operation === 'deduct' ? 'investment' : 'refund',
        p_amount: amount,
        p_wallet_type: 'deposit',
        p_transaction_hash: `manual_${Date.now()}`,
        p_description: operation === 'deduct' ? 'Investment deduction' : 'Investment refund'
      });

    if (updateError) {
      console.error('Error updating platform wallet balance:', updateError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update platform wallet balance',
        error: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Platform wallet balance updated successfully',
      data: {
        previousBalance: currentBalance,
        newBalance: newBalance,
        operation: operation,
        amount: amount
      }
    });
  } catch (err) {
    console.error('Platform wallet balance update route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
