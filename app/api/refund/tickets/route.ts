import { NextRequest, NextResponse } from 'next/server';

// Dummy data for existing refund tickets
let refundTickets = [
  {
    id: 'REF001',
    transactionId: 'TXN001',
    amount: 500.00,
    status: 'Pending' as const,
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22',
    reason: 'Change in investment strategy',
    adminResponse: 'Your refund request is under review. We will process it within 3-5 business days.',
    userId: 'user123'
  },
  {
    id: 'REF002',
    transactionId: 'TXN002',
    amount: 1000.00,
    status: 'Approved' as const,
    createdAt: '2024-01-18',
    updatedAt: '2024-01-21',
    reason: 'Personal financial emergency',
    adminResponse: 'Refund approved. Amount will be credited to your deposit wallet within 24 hours.',
    userId: 'user123'
  }
];

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, you would:
    // 1. Verify user authentication
    // 2. Query the database for user's refund tickets
    // 3. Filter by user ID
    
    return NextResponse.json({
      success: true,
      message: 'Refund tickets retrieved successfully',
      tickets: refundTickets
    });
  } catch (error) {
    console.error('Error fetching refund tickets:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch refund tickets',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { transactionId, reason, userId } = body;

    // Validate required fields
    if (!transactionId || !reason || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Missing required fields',
          error: 'Transaction ID, reason, and user ID are required'
        },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Verify user authentication
    // 2. Validate that the transaction exists and is eligible for refund
    // 3. Check if a refund ticket already exists for this transaction
    // 4. Create the refund ticket in the database

    const newTicket = {
      id: `REF${String(refundTickets.length + 1).padStart(3, '0')}`,
      transactionId,
      amount: 500.00, // This would come from the transaction
      status: 'Pending' as const,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      reason,
      userId
    };

    refundTickets.push(newTicket);

    return NextResponse.json({
      success: true,
      message: 'Refund ticket created successfully',
      ticket: newTicket
    });
  } catch (error) {
    console.error('Error creating refund ticket:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create refund ticket',
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
