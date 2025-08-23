import { NextRequest, NextResponse } from 'next/server';
import userService from '@/services/userService';

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Repair investment details API called');
    
    // This endpoint should be protected in production
    // For now, we'll allow it for debugging purposes
    
    const result = await userService.repairMissingInvestmentDetails();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        repairedCount: result.repairedCount
      });
    } else {
      return NextResponse.json({
        success: false,
        message: result.message
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Error in repair investment details route:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Internal server error during repair',
        error: process.env.NODE_ENV === 'development' ? error instanceof Error ? error.message : String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { success: false, message: 'Method GET not supported for repair investment details' },
    { status: 405 }
  );
}
