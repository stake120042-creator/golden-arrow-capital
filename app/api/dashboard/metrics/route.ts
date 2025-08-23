import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';
import authService from '@/services/authService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Dashboard metrics API called');
    
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

    // Get business metrics
    console.log('🔍 Fetching business metrics for user:', userId);
    const { data: businessData, error: businessError } = await supabaseServer
      .rpc('get_business_metrics', { p_user_id: userId });

    if (businessError) {
      console.error('❌ get_business_metrics error:', businessError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch business metrics',
        error: businessError.message 
      }, { status: 500 });
    }

    console.log('✅ Business metrics fetched:', businessData);
    console.log('📊 Business data type:', typeof businessData, 'Is array:', Array.isArray(businessData));

    // Get team member metrics
    console.log('🔍 Fetching team member metrics for user:', userId);
    const { data: memberData, error: memberError } = await supabaseServer
      .rpc('get_team_member_metrics', { p_user_id: userId });

    if (memberError) {
      console.error('❌ get_team_member_metrics error:', memberError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch team member metrics',
        error: memberError.message 
      }, { status: 500 });
    }

    console.log('✅ Team member metrics fetched:', memberData);
    console.log('📊 Member data type:', typeof memberData, 'Is array:', Array.isArray(memberData));

    // Get investment details
    console.log('🔍 Fetching investment details for user:', userId);
    const { data: investmentData, error: investmentError } = await supabaseServer
      .rpc('get_investment_details', { p_user_id: userId });

    if (investmentError) {
      console.error('❌ get_investment_details error:', investmentError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch investment details',
        error: investmentError.message 
      }, { status: 500 });
    }

    console.log('✅ Investment details fetched:', investmentData);
    console.log('📊 Investment data type:', typeof investmentData, 'Is array:', Array.isArray(investmentData));

    // Enhanced data processing with better debugging
    let businessMetrics = { direct_business: 0, team_business: 0 };
    let memberMetrics = { 
      direct_members: 0, 
      direct_active_members: 0, 
      direct_inactive_members: 0,
      total_team_members: 0, 
      team_active_members: 0, 
      team_inactive_members: 0 
    };
    let investmentMetrics = {
      total_investment: 0,
      active_investment: 0,
      expired_investment: 0,
      referral_income: 0,
      rank_income: 0,
      self_income: 0
    };

    // Process business metrics
    if (businessData) {
      if (Array.isArray(businessData) && businessData.length > 0) {
        businessMetrics = businessData[0];
        console.log('📊 Using first business metrics from array:', businessMetrics);
      } else if (typeof businessData === 'object' && businessData !== null) {
        businessMetrics = businessData;
        console.log('📊 Using business metrics object:', businessMetrics);
      } else {
        console.log('📊 Using default business metrics (no valid data)');
      }
    }

    // Process member metrics
    if (memberData) {
      if (Array.isArray(memberData) && memberData.length > 0) {
        memberMetrics = memberData[0];
        console.log('📊 Using first member metrics from array:', memberMetrics);
      } else if (typeof memberData === 'object' && memberData !== null) {
        memberMetrics = memberData;
        console.log('📊 Using member metrics object:', memberMetrics);
      } else {
        console.log('📊 Using default member metrics (no valid data)');
      }
    }

    // Process investment metrics
    if (investmentData) {
      if (Array.isArray(investmentData) && investmentData.length > 0) {
        investmentMetrics = investmentData[0];
        console.log('📊 Using first investment metrics from array:', investmentMetrics);
      } else if (typeof investmentData === 'object' && investmentData !== null) {
        investmentMetrics = investmentData;
        console.log('📊 Using investment metrics object:', investmentMetrics);
      } else {
        console.log('📊 Using default investment metrics (no valid data)');
      }
    }

    const metrics = {
      ...businessMetrics,
      ...memberMetrics,
      ...investmentMetrics
    };

    console.log('🎯 Final metrics object:', metrics);
    console.log('📊 Final metrics type:', typeof metrics);

    return NextResponse.json({ success: true, data: metrics });
  } catch (err) {
    console.error('dashboard metrics route error', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}





