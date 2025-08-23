import { NextRequest, NextResponse } from 'next/server';
import withdrawalService from '@/services/withdrawalService';
import authService from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Create withdrawal API called');
    
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      console.log('❌ No authorization token provided');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Verifying token...');
    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      console.log('❌ Invalid token:', verified);
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = verified.user.id;
    console.log('✅ Token verified for user:', userId);

    const body = await request.json();
    const { amount, walletAddress, description } = body;

    // Validation
    if (!amount || !walletAddress) {
      return NextResponse.json(
        { success: false, message: 'Amount and wallet address are required' },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid amount' },
        { status: 400 }
      );
    }

    // Check withdrawal limits
    const MIN_WITHDRAWAL = process.env.NEXT_PUBLIC_MINIMUM_WITHDRAWAL ? parseFloat(process.env.NEXT_PUBLIC_MINIMUM_WITHDRAWAL) : 50;
    const MAX_WITHDRAWAL = process.env.NEXT_PUBLIC_MAXIMUM_WITHDRAWAL ? parseFloat(process.env.NEXT_PUBLIC_MAXIMUM_WITHDRAWAL) : 1000;

    if (numAmount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { success: false, message: `Minimum withdrawal amount is $${MIN_WITHDRAWAL} USDT` },
        { status: 400 }
      );
    }

    if (numAmount > MAX_WITHDRAWAL) {
      return NextResponse.json(
        { success: false, message: `Maximum withdrawal amount is $${MAX_WITHDRAWAL} USDT` },
        { status: 400 }
      );
    }

    const result = await withdrawalService.createWithdrawalRequest(
      userId,
      numAmount,
      walletAddress,
      description
    );
    
    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Withdrawal request created successfully',
        data: result.data 
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 400 });
    }
  } catch (err) {
    console.error('Create withdrawal route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}

