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

    // Get current wallet balance
    const { data: wallet, error: walletError } = await supabaseServer
      .from('user_wallets')
      .select('balance')
      .eq('user_id', userId)
      .single();

    if (walletError || !wallet) {
      return NextResponse.json({ 
        success: false, 
        message: 'Wallet not found' 
      }, { status: 404 });
    }

    const currentBalance = parseFloat(wallet.balance || '0');
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

    // Update wallet balance
    const { error: updateError } = await supabaseServer
      .from('user_wallets')
      .update({ balance: newBalance })
      .eq('user_id', userId);

    if (updateError) {
      console.error('Error updating wallet balance:', updateError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update wallet balance',
        error: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Wallet balance updated successfully',
      data: {
        previousBalance: currentBalance,
        newBalance: newBalance,
        operation: operation,
        amount: amount
      }
    });
  } catch (err) {
    console.error('Wallet balance update route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
