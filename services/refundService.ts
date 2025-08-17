import apiClient from './apiClient';
import { 
  RefundTicket, 
  CreateRefundRequest, 
  RefundResponse, 
  RefundTicketListResponse,
  EligibleTransactionsResponse,
  RefundTransaction 
} from '@/types/refund';

// Generic API request function for refund operations
async function refundApiRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return await response.json();
}

export class RefundService {
  // Get eligible transactions for refund (within 7 days)
  static async getEligibleTransactions(): Promise<RefundTransaction[]> {
    try {
      const response = await refundApiRequest<EligibleTransactionsResponse>('/refund/eligible-transactions', 'GET');
      return response.transactions || [];
    } catch (error) {
      console.error('Error fetching eligible transactions:', error);
      return [];
    }
  }

  // Get user's refund tickets
  static async getUserRefundTickets(): Promise<RefundTicket[]> {
    try {
      const response = await refundApiRequest<RefundTicketListResponse>('/refund/tickets', 'GET');
      return response.tickets || [];
    } catch (error) {
      console.error('Error fetching refund tickets:', error);
      return [];
    }
  }

  // Create a new refund ticket
  static async createRefundTicket(request: CreateRefundRequest): Promise<RefundTicket | null> {
    try {
      const response = await refundApiRequest<RefundResponse>('/refund/tickets', 'POST', request);
      return response.ticket || null;
    } catch (error) {
      console.error('Error creating refund ticket:', error);
      return null;
    }
  }

  // Get a specific refund ticket by ID
  static async getRefundTicket(ticketId: string): Promise<RefundTicket | null> {
    try {
      const response = await refundApiRequest<RefundResponse>(`/refund/tickets/${ticketId}`, 'GET');
      return response.ticket || null;
    } catch (error) {
      console.error('Error fetching refund ticket:', error);
      return null;
    }
  }

  // Update refund ticket (for admin responses)
  static async updateRefundTicket(ticketId: string, updates: Partial<RefundTicket>): Promise<RefundTicket | null> {
    try {
      const response = await refundApiRequest<RefundResponse>(`/refund/tickets/${ticketId}`, 'PUT', updates);
      return response.ticket || null;
    } catch (error) {
      console.error('Error updating refund ticket:', error);
      return null;
    }
  }

  // Cancel a refund ticket (if still pending)
  static async cancelRefundTicket(ticketId: string): Promise<boolean> {
    try {
      const response = await refundApiRequest<RefundResponse>(`/refund/tickets/${ticketId}`, 'DELETE');
      return response.success;
    } catch (error) {
      console.error('Error canceling refund ticket:', error);
      return false;
    }
  }

  // Get refund statistics for user
  static async getRefundStats(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    totalRefunded: number;
  }> {
    try {
      const response = await refundApiRequest('/refund/stats', 'GET');
      return response.stats || {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalRefunded: 0
      };
    } catch (error) {
      console.error('Error fetching refund stats:', error);
      return {
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        totalRefunded: 0
      };
    }
  }
}
