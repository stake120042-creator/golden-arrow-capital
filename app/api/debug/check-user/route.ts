import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/config/database';

export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, message: 'Debug endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email parameter required' },
        { status: 400 }
      );
    }

    console.log(`🔍 [DEBUG] Checking user: ${email}`);

    // Get user from database
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .or(`email.eq.${email.toLowerCase()},username.eq.${email.toLowerCase()}`)
      .single();

    if (error) {
      console.log(`🔍 [DEBUG] Database error:`, error);
      return NextResponse.json({
        success: false,
        message: 'User not found',
        error: error.message
      });
    }

    console.log(`🔍 [DEBUG] User found:`, data);

    return NextResponse.json({
      success: true,
      message: 'User found',
      user: {
        id: data.id,
        username: data.username,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        password_hash: data.password_hash, // Show password for debugging
        is_verified: data.is_verified,
        created_at: data.created_at
      }
    });

  } catch (error) {
    console.error('❌ [DEBUG] Error checking user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Error checking user',
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
