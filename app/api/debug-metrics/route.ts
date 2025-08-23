import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';
import authService from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug metrics API called');
    
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
    console.log('✅ Token verified for user:', userId);

    // Get current user data
    const { data: currentUser, error: userError } = await supabaseServer
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('❌ Error fetching current user:', userError);
      return NextResponse.json({ success: false, message: 'Failed to fetch user data' }, { status: 500 });
    }

    // Get all users to see the structure
    const { data: allUsers, error: allUsersError } = await supabaseServer
      .from('users')
      .select('id, username, email, parent_id, path, is_active, business_value')
      .order('created_at', { ascending: false });

    if (allUsersError) {
      console.error('❌ Error fetching all users:', allUsersError);
      return NextResponse.json({ success: false, message: 'Failed to fetch all users' }, { status: 500 });
    }

    // Get direct members manually
    const { data: directMembers, error: directError } = await supabaseServer
      .from('users')
      .select('id, username, email, is_active, business_value')
      .eq('parent_id', userId);

    if (directError) {
      console.error('❌ Error fetching direct members:', directError);
      return NextResponse.json({ success: false, message: 'Failed to fetch direct members' }, { status: 500 });
    }

    // Test the functions manually
    const { data: businessMetrics, error: businessError } = await supabaseServer
      .rpc('get_business_metrics', { p_user_id: userId });

    const { data: memberMetrics, error: memberError } = await supabaseServer
      .rpc('get_team_member_metrics', { p_user_id: userId });

    // Manual calculation for comparison
    let manualDirectBusiness = 0;
    let manualDirectMembers = 0;
    let manualDirectActive = 0;
    let manualDirectInactive = 0;

    if (directMembers) {
      manualDirectMembers = directMembers.length;
      manualDirectActive = directMembers.filter(u => u.is_active).length;
      manualDirectInactive = directMembers.filter(u => !u.is_active).length;
      manualDirectBusiness = directMembers.reduce((sum, u) => sum + (Number(u.business_value) || 0), 0);
    }

    const debugData = {
      currentUser: {
        id: currentUser.id,
        username: currentUser.username,
        parent_id: currentUser.parent_id,
        path: currentUser.path,
        is_active: currentUser.is_active,
        business_value: currentUser.business_value
      },
      allUsers: allUsers?.slice(0, 10), // First 10 users
      directMembers: directMembers,
      manualCalculations: {
        directMembers: manualDirectMembers,
        directActive: manualDirectActive,
        directInactive: manualDirectInactive,
        directBusiness: manualDirectBusiness
      },
      functionResults: {
        businessMetrics: businessMetrics,
        businessError: businessError,
        memberMetrics: memberMetrics,
        memberError: memberError
      }
    };

    return NextResponse.json({ success: true, data: debugData });
  } catch (err) {
    console.error('Debug metrics route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
