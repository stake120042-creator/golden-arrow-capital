import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing metrics functions...');

    // First, get a user ID to test with
    const { data: users, error: usersError } = await supabaseServer
      .from('users')
      .select('id, username, email, parent_id, path, is_active, business_value')
      .limit(5);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError);
      return NextResponse.json({ success: false, message: 'Failed to fetch users' }, { status: 500 });
    }

    console.log('📋 Found users:', users);

    if (!users || users.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No users found in database',
        suggestion: 'Create some users first'
      }, { status: 404 });
    }

    // Test with the first user
    const testUserId = users[0].id;
    console.log('🧪 Testing with user:', testUserId);

    // Test business metrics function
    console.log('🔍 Testing get_business_metrics...');
    const { data: businessData, error: businessError } = await supabaseServer
      .rpc('get_business_metrics', { p_user_id: testUserId });

    console.log('📊 Business metrics result:', { data: businessData, error: businessError });

    // Test team member metrics function
    console.log('🔍 Testing get_team_member_metrics...');
    const { data: memberData, error: memberError } = await supabaseServer
      .rpc('get_team_member_metrics', { p_user_id: testUserId });

    console.log('📊 Team member metrics result:', { data: memberData, error: memberError });

    // Manual verification
    console.log('🔍 Manual verification...');
    
    // Check direct members
    const { data: directMembers, error: directError } = await supabaseServer
      .from('users')
      .select('id, username, is_active, business_value')
      .eq('parent_id', testUserId);

    console.log('📊 Direct members:', { data: directMembers, error: directError });

    // Check all descendants
    const { data: allDescendants, error: descendantsError } = await supabaseServer
      .from('users')
      .select('id, username, is_active, business_value, path')
      .ltree('path', users[0].path || '')
      .neq('id', testUserId);

    console.log('📊 All descendants:', { data: allDescendants, error: descendantsError });

    const testResults = {
      testUser: {
        id: testUserId,
        username: users[0].username,
        parent_id: users[0].parent_id,
        path: users[0].path,
        is_active: users[0].is_active,
        business_value: users[0].business_value
      },
      functionResults: {
        businessMetrics: { data: businessData, error: businessError },
        memberMetrics: { data: memberData, error: memberError }
      },
      manualVerification: {
        directMembers: { data: directMembers, error: directError },
        allDescendants: { data: allDescendants, error: descendantsError }
      },
      allUsers: users
    };

    return NextResponse.json({ success: true, data: testResults });
  } catch (err) {
    console.error('Test metrics route error:', err);
    return NextResponse.json({ 
      success: false, 
      message: 'Internal error',
      error: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}




