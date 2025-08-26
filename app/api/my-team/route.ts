import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';
import authService from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const levelParam = searchParams.get('level') || '1';
    const level = Math.max(parseInt(levelParam, 10) || 1, 0);

    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const verified = authService.verifyToken(token);
    if (!verified.valid || !verified.user) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const userId = verified.user.id;

    const { data, error } = await supabaseServer
      .rpc('get_team_members_at_level', { p_user_id: userId, p_level: level });

    if (error) {
      console.error('get_team_members_at_level error', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch team' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error('my-team route error', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}





