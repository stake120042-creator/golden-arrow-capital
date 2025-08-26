import { NextRequest, NextResponse } from 'next/server';
import authService from '@/services/authService';
import userService from '@/services/userService';

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, isActive } = body;

    if (typeof userId !== 'string' || typeof isActive !== 'boolean') {
      return NextResponse.json({ success: false, message: 'Invalid request data' }, { status: 400 });
    }

    // Only allow users to update their own status or admin users (you can add admin check here)
    if (userId !== verified.user.id) {
      return NextResponse.json({ success: false, message: 'Unauthorized to update other users' }, { status: 403 });
    }

    const result = await userService.updateUserStatus(userId, isActive);

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.error || 'Failed to update user status' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'User status updated successfully' });
  } catch (err) {
    console.error('user status route error', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
