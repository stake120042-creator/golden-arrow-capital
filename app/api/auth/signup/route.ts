import { NextRequest, NextResponse } from 'next/server';
import otpService from '@/services/otpService';

export async function POST(request: NextRequest) {
  try {
    console.log('👤 Signup API called');
    
    const body = await request.json();
    const { sponsor, firstName, lastName, username, email, password, confirmPassword } = body || {};
    
    console.log('📧 Signup attempt for:', email);
    console.log('🔧 Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasGmailUser: !!process.env.GMAIL_SMTP_USER,
      hasGmailPass: !!process.env.GMAIL_SMTP_PASS,
      emailSendStrict: process.env.EMAIL_SEND_STRICT,
      otpUseMemory: process.env.OTP_USE_MEMORY
    });
    
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
    
    console.log('📝 [DEBUG] User data to store in OTP:', userData);

    console.log('🔄 Calling OTP service...');
    const result = await otpService.generateAndSendOTP({ 
      email, 
      type: 'signup', 
      firstName,
      userData
    });
    
    console.log('📬 OTP service result:', {
      success: result.success,
      message: result.message
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
    console.error('❌ Error in signup route:', error);
    console.error('❌ Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: {
        NODE_ENV: process.env.NODE_ENV,
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasGmailConfig: !!(process.env.GMAIL_SMTP_USER && process.env.GMAIL_SMTP_PASS)
      }
    });
    
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during signup',
        debug: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method GET not supported for signup' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method PUT not supported for signup' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method DELETE not supported for signup' },
    { status: 405 }
  );
}
