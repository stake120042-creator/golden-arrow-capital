import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/config/database';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { success: false, message: 'Username is required' },
        { status: 400 }
      );
    }

    // Check if username exists in the database using Supabase
    const { data, error } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (error && error.code === 'PGRST116') {
      // User not found
      return NextResponse.json({
        success: true,
        exists: false,
        message: 'Username does not exist'
      });
    }

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { success: false, message: 'Database error occurred' },
        { status: 500 }
      );
    }

    // User exists
    return NextResponse.json({
      success: true,
      exists: true,
      message: 'Username exists'
    });

  } catch (error) {
    console.error('Error verifying username:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method GET not supported for username verification' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { success: false, message: 'Method PUT not supported for username verification' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { success: false, message: 'Method DELETE not supported for username verification' },
    { status: 405 }
  );
}
