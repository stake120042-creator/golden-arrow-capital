import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';
import authService from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, otp } = body;
    
    if (!email || !otp) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and OTP are required'
        },
        { status: 400 }
      );
    }

    const verify = await otpService.verifyOTP({ email, otp, type: 'signup' });
    
    if (verify.success) {
      // Get stored user data from OTP
      console.log('🔍 Getting user data from OTP for:', email);
      const userData = await otpService.getUserDataFromOTP(email, 'signup');
      console.log('📝 Retrieved user data:', userData);
      
      // Create user account after successful OTP verification
      const user = await authService.createUserAfterSignup(email, userData);
      const token = authService.generateToken(user);
      
      return NextResponse.json({
        success: true,
        message: 'Account created successfully! You can now log in.',
        user,
        token
      });
    } else {
      return NextResponse.json(verify, { status: 400 });
    }
  } catch (error) {
    console.error('Error in verify signup route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during verification'
      },
      { status: 500 }
    );
  }
}
