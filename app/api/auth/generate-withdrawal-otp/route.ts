import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';
import { EmailOTPRequest } from '@/types/user';

// Withdrawal limits from environment variables
const MIN_WITHDRAWAL = process.env.NEXT_MINIMUM_WITHDRAWAL ? parseFloat(process.env.NEXT_MINIMUM_WITHDRAWAL) : 50;
const MAX_WITHDRAWAL = process.env.NEXT_MAXIMUM_WITHDRAWAL ? parseFloat(process.env.NEXT_MAXIMUM_WITHDRAWAL) : 1000;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, withdrawalData } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!withdrawalData || !withdrawalData.amount || !withdrawalData.address) {
      return NextResponse.json(
        { success: false, message: 'Withdrawal amount and address are required' },
        { status: 400 }
      );
    }

    // Validate withdrawal amount
    const amount = parseFloat(withdrawalData.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid amount' },
        { status: 400 }
      );
    }

    if (amount < MIN_WITHDRAWAL) {
      return NextResponse.json(
        { success: false, message: `Minimum withdrawal amount is $${MIN_WITHDRAWAL} USDT` },
        { status: 400 }
      );
    }

    if (amount > MAX_WITHDRAWAL) {
      return NextResponse.json(
        { success: false, message: `Maximum withdrawal amount is $${MAX_WITHDRAWAL} USDT` },
        { status: 400 }
      );
    }

    const otpRequest: EmailOTPRequest = {
      email,
      type: 'withdrawal',
      firstName,
      withdrawalData
    };

    const result = await otpService.generateAndSendOTP(otpRequest);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating withdrawal OTP:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while generating OTP' },
      { status: 500 }
    );
  }
}
