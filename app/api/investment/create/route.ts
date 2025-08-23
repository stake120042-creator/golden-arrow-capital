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
    
    const { package_id, amount } = body;

    // Validate input data
    if (!package_id || typeof package_id !== 'number' || package_id < 1 || package_id > 4) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid package_id. Must be between 1 and 4.' 
      }, { status: 400 });
    }

    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Invalid amount. Must be a positive number.' 
      }, { status: 400 });
    }

    // Verify package exists
    const { data: packageData, error: packageError } = await supabaseServer
      .from('packages')
      .select('id, interest')
      .eq('id', package_id)
      .single();

    if (packageError || !packageData) {
      return NextResponse.json({ 
        success: false, 
        message: 'Package not found' 
      }, { status: 404 });
    }

    // Create investment record
    const { data: investmentData, error: investmentError } = await supabaseServer
      .from('investments')
      .insert({
        user_id: userId,
        package_id: package_id,
        amount: amount,
        is_active: true
      })
      .select()
      .single();

    if (investmentError) {
      console.error('Error creating investment:', investmentError);
      return NextResponse.json({ 
        success: false, 
        message: 'Failed to create investment',
        error: investmentError.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Investment created successfully',
      data: {
        investment_id: investmentData.id,
        package_id: investmentData.package_id,
        amount: investmentData.amount,
        interest_rate: packageData.interest
      }
    });
  } catch (err) {
    console.error('Investment creation route error:', err);
    return NextResponse.json({ success: false, message: 'Internal error' }, { status: 500 });
  }
}
