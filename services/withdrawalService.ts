import supabaseServer from './supabaseServer';

export interface WithdrawalRequest {
  id: number;
  user_id: string;
  amount: number;
  wallet_address: string;
  description?: string;
  balance_before: number;
  balance_after: number;
  transaction_hash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

class WithdrawalService {
  private static instance: WithdrawalService;

  public static getInstance(): WithdrawalService {
    if (!WithdrawalService.instance) {
      WithdrawalService.instance = new WithdrawalService();
    }
    return WithdrawalService.instance;
  }

  // Create a new withdrawal request
  public async createWithdrawalRequest(
    userId: string,
    amount: number,
    walletAddress: string,
    description?: string
  ): Promise<{ success: boolean; data?: WithdrawalRequest; message?: string }> {
    try {
      console.log('🔧 Creating withdrawal request for user:', userId);
      
      // Get current income balance
      const { data: walletData, error: walletError } = await supabaseServer
        .rpc('get_or_create_wallet', {
          p_user_id: userId
        });

      if (walletError) {
        console.error('❌ Error getting wallet balance:', walletError);
        return { success: false, message: 'Failed to get wallet balance' };
      }

      if (!walletData || walletData.length === 0) {
        return { success: false, message: 'Wallet not found' };
      }

      const currentBalance = walletData[0].income_balance;
      const newBalance = currentBalance - amount;

      // Validate balance
      if (newBalance < 0) {
        return { success: false, message: 'Insufficient balance' };
      }

      // Create withdrawal request
      const { data: withdrawalData, error: withdrawalError } = await supabaseServer
        .from('withdrawal_requests')
        .insert({
          user_id: userId,
          amount: amount,
          wallet_address: walletAddress,
          description: description || 'Manual withdrawal',
          balance_before: currentBalance,
          balance_after: newBalance,
          status: 'pending'
        })
        .select('*')
        .single();

      if (withdrawalError) {
        console.error('❌ Error creating withdrawal request:', withdrawalError);
        return { success: false, message: 'Failed to create withdrawal request' };
      }

      // Update wallet balance
      const { error: updateError } = await supabaseServer
        .rpc('process_wallet_transaction', {
          p_user_id: userId,
          p_transaction_type: 'withdrawal',
          p_amount: amount,
          p_wallet_type: 'income',
          p_description: `Withdrawal to ${walletAddress}`
        });

      if (updateError) {
        console.error('❌ Error updating wallet balance:', updateError);
        // Note: We don't fail here as the withdrawal request was created
      }

      console.log('✅ Withdrawal request created successfully');
      return { success: true, data: withdrawalData };
    } catch (error) {
      console.error('❌ Error in createWithdrawalRequest:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get withdrawal history for a user
  public async getWithdrawalHistory(
    userId: string, 
    limit: number = 20, 
    offset: number = 0
  ): Promise<{ success: boolean; data?: WithdrawalRequest[]; message?: string }> {
    try {
      console.log('🔧 Getting withdrawal history for user:', userId);
      
      const { data, error } = await supabaseServer
        .from('withdrawal_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('❌ Error getting withdrawal history:', error);
        return { success: false, message: 'Failed to get withdrawal history' };
      }

      console.log('✅ Withdrawal history retrieved successfully');
      return { success: true, data: data || [] };
    } catch (error) {
      console.error('❌ Error in getWithdrawalHistory:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default WithdrawalService.getInstance();

