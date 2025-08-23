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
    const body = await request.json();
    
    const {
      total_investment,
      active_investment,
      expired_investment,
      referral_income,
      rank_income,
      self_income
    } = body;

    // Validate input data
    const numericFields = [
      'total_investment', 'active_investment', 'expired_investment',
      'referral_income', 'rank_income', 'self_income'
    ];

    for (const field of numericFields) {
      if (body[field] !== undefined && (typeof body[field] !== 'number' || body[field] < 0)) {
        return NextResponse.json({ 
          success: false, 
          message: `${field} must be a non-negative number` 
        }, { status: 400 });
      }
    }

    // Update investment details using the database function
    const { error } = await supabaseServer
      .rpc('update_investment_details', {
        p_user_id: userId,
        p_total_investment: total_investment,
        p_active_investment: active_investment,
        p_expired_investment: expired_investment,
        p_referral_income: referral_income,
        p_rank_income: rank_income,
        p_self_income: self_income
      });

    if (error) {
      console.error('Error updating investment details:', error);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to update investment details',
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Investment details updated successfully' 
    });
  } catch (err) {
    console.error('Investment update route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}


