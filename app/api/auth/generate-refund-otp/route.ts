import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';
import { EmailOTPRequest } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, firstName, refundData } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!refundData || !refundData.amount || !refundData.address) {
      return NextResponse.json(
        { success: false, message: 'Refund amount and wallet address are required' },
        { status: 400 }
      );
    }

    const amount = parseFloat(refundData.amount);
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Please enter a valid amount' },
        { status: 400 }
      );
    }

    const otpRequest: EmailOTPRequest = {
      email,
      type: 'refund',
      firstName,
      refundData
    };

    const result = await otpService.generateAndSendOTP(otpRequest);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error generating refund OTP:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while generating OTP' },
      { status: 500 }
    );
  }
}


