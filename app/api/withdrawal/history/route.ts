import { NextRequest, NextResponse } from 'next/server';
import withdrawalService from '@/services/withdrawalService';
import authService from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Withdrawal history API called');
    
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      console.log('❌ No authorization token provided');
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔍 Verifying token...');
    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      console.log('❌ Invalid token:', verified);
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = verified.user.id;
    console.log('✅ Token verified for user:', userId);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await withdrawalService.getWithdrawalHistory(userId, limit, offset);
    
    if (result.success) {
      return NextResponse.json({ success: true, data: result.data });
    } else {
      return NextResponse.json({ 
        success: false, 
        message: result.message 
      }, { status: 500 });
    }
  } catch (err) {
    console.error('Withdrawal history route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}

