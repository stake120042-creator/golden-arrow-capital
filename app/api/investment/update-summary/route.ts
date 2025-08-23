import { NextRequest, NextResponse } from 'next/server';
import supabaseServer from '@/services/supabaseServer';
import authService from '@/services/authService';

export async function POST(request: NextRequest) {
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

    const userId = verified.user.id;

    // Get all investments for the user
    const { data: investments, error: investmentsError } = await supabaseServer
      .from('investments')
      .select('amount, is_active')
      .eq('user_id', userId);

    if (investmentsError) {
      console.error('Error fetching investments:', investmentsError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to fetch investments',
        error: investmentsError.message 
      }, { status: 500 });
    }

    // Calculate totals
    const totalInvestment = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    const activeInvestment = investments?.filter(inv => inv.is_active).reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    const expiredInvestment = investments?.filter(inv => !inv.is_active).reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

    // Update investment details using the database function
    const { error: updateError } = await supabaseServer
      .rpc('update_investment_details', {
        p_user_id: userId,
        p_total_investment: totalInvestment,
        p_active_investment: activeInvestment,
        p_expired_investment: expiredInvestment,
        p_referral_income: 0, // These would be calculated from other sources
        p_rank_income: 0,
        p_self_income: 0
      });

    if (updateError) {
      console.error('Error updating investment details:', updateError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update investment summary',
        error: updateError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Investment summary updated successfully',
      data: {
        total_investment: totalInvestment,
        active_investment: activeInvestment,
        expired_investment: expiredInvestment,
        total_investments_count: investments?.length || 0,
        active_investments_count: investments?.filter(inv => inv.is_active).length || 0
      }
    });
  } catch (err) {
    console.error('Investment summary update route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
