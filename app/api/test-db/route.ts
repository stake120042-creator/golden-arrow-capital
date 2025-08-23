import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    // Test basic connection
    console.log('🔍 dnf d vn fnmd fnm ndm :', supabaseServer);
    const { data, error } = await supabaseServer
      .from('users')
      .select('count')
      .limit(1);

    if (error) {
      console.error('Database connection test error:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Database connection failed',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      data 
    });
  } catch (err) {
    console.error('Test endpoint error:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal error',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
