export interface RefundTransaction {
  id: string;
  amount: number;
  date: string;
  type: string;
  status: string;
  description: string;
  userId: string;
  createdAt: Date;
}

export interface RefundTicket {
  id: string;
  transactionId: string;
  amount: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Completed';
  createdAt: string;
  updatedAt: string;
  reason: string;
  adminResponse?: string;
  userId: string;
}

export interface CreateRefundRequest {
  transactionId: string;
  reason: string;
  userId: string;
}

export interface RefundResponse {
  success: boolean;
  message: string;
  ticket?: RefundTicket;
  error?: string;
}

export interface RefundTicketListResponse {
  success: boolean;
  message: string;
  tickets: RefundTicket[];
  error?: string;
}

export interface EligibleTransactionsResponse {
  success: boolean;
  message: string;
  transactions: RefundTransaction[];
  error?: string;
}
