import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type, firstName } = body;
    
    if (!email || !type || !['signup', 'login', 'profile_update'].includes(type)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and valid type (signup, login, or profile_update) are required'
        },
        { status: 400 }
      );
    }

    const result = await otpService.resendOTP(email, type as 'signup' | 'login' | 'profile_update', firstName);
    
    return NextResponse.json(
      result,
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('Error in resend OTP route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error while resending OTP'
      },
      { status: 500 }
    );
  }
}
