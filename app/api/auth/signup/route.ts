import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sponsor, firstName, lastName, username, email, password, confirmPassword } = body || {};
    
    // Validation
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }

    // Store user data temporarily in OTP context for verification
    const userData = {
      sponsor: sponsor || '',
      firstName,
      lastName,
      username,
      password
    };

    const result = await otpService.generateAndSendOTP({ 
      email, 
      type: 'signup', 
      firstName,
      userData
    });
    
    return NextResponse.json(
      { 
        success: result.success, 
        message: result.message, 
        data: { email, firstName, lastName } 
      },
      { status: result.success ? 200 : 400 }
    );
  } catch (error) {
    console.error('Error in signup route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during signup'
      },
      { status: 500 }
    );
  }
}
