import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';
import authService from '@/services/authService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { usernameOrEmail, password } = body || {};
    
    if (!usernameOrEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'Username/email and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await authService.getUserForLogin(usernameOrEmail);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await authService.verifyPassword(usernameOrEmail, password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Password verified, send OTP for 2FA
    const result = await otpService.generateAndSendOTP({ 
      email: user.email, 
      type: 'login' 
    });
    
    return NextResponse.json(
      { 
        success: result.success, 
        message: result.message, 
        data: { email: user.email } 
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('❌ Error in login route:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during login'
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method GET not supported for login' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method PUT not supported for login' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method DELETE not supported for login' },
    { status: 405 }
  );
}
