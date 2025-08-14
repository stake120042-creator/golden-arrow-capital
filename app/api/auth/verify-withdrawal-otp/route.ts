import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';
import { OTPData } from '@/types/user';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp, type } = body;

    if (!email || !otp) {
      return NextResponse.json(
        { success: false, message: 'Email and OTP are required' },
        { status: 400 }
      );
    }

    if (type !== 'withdrawal') {
      return NextResponse.json(
        { success: false, message: 'Invalid OTP type' },
        { status: 400 }
      );
    }

    const otpData: OTPData = {
      email,
      otp,
      type: 'withdrawal'
    };

    const result = await otpService.verifyOTP(otpData);

    if (result.success) {
      return NextResponse.json(result);
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Error verifying withdrawal OTP:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while verifying OTP' },
      { status: 500 }
    );
  }
}
