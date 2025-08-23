import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';
import authService from '@/services/authService';

export async function GET(request: NextRequest) {
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

    // Get wallet balance using the database function
    const { data: walletData, error: walletError } = await supabaseServer
      .rpc('get_or_create_wallet', { p_user_id: userId });

    if (walletError) {
      console.error('Error fetching wallet balance:', walletError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch wallet balance',
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

    return NextResponse.json({ 
      success: true, 
      data: walletBalance 
    });
  } catch (err) {
    console.error('Wallet balance route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
