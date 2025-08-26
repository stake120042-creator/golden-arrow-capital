import { NextRequest, NextResponse } from 'next/server';

// Dummy data for eligible transactions
const eligibleTransactions = [
  {
    id: 'TXN001',
    amount: 500.00,
    date: '2024-01-15',
    type: 'Investment',
    status: 'Completed',
    description: 'Gold Package Investment',
    userId: 'user123',
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'TXN002',
    amount: 1000.00,
    date: '2024-01-10',
    type: 'Investment',
    status: 'Completed',
    description: 'Platinum Package Investment',
    userId: 'user123',
    createdAt: new Date('2024-01-10')
  },
  {
    id: 'TXN003',
    amount: 250.00,
    date: '2024-01-05',
    type: 'Investment',
    status: 'Completed',
    description: 'Silver Package Investment',
    userId: 'user123',
    createdAt: new Date('2024-01-05')
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Verify user authentication
    // 2. Query the database for transactions within 7 days
    // 3. Filter by user ID and status
    
    return NextResponse.json({
      success: true,
      message: 'Eligible transactions retrieved successfully',
      transactions: eligibleTransactions
    });
  } catch (error) {
    console.error('Error fetching eligible transactions:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch eligible transactions',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
