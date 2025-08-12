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

    const verify = await otpService.verifyOTP({ email, otp, type: 'login' });
    
    if (verify.success) {
      // Get user and generate token for successful login
      const user = await authService.getUserForLogin(email);
      
      if (user) {
        const token = authService.generateToken(user);
        
        return NextResponse.json({
          success: true,
          message: 'Login successful! Welcome back.',
          user,
          token
        });
      } else {
        return NextResponse.json(
          {
            success: false,
            message: 'User not found. Please sign up first.'
          },
          { status: 400 }
        );
      }
    } else {
      return NextResponse.json(verify, { status: 400 });
    }
  } catch (error) {
    console.error('Error in verify login route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during verification'
      },
      { status: 500 }
    );
  }
}
