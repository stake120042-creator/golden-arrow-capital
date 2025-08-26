import supabaseServer from './supabaseServer';

export interface UserUpdateData {
  is_active?: boolean;
  business_value?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

class UserService {
  private static instance: UserService;

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Update user's active status
   */
  async updateUserStatus(userId: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseServer
        .from('users')
        .update({ is_active: isActive })
        .eq('id', userId);

      if (error) {
        console.error('Error updating user status:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('UserService updateUserStatus error:', err);
      return { success: false, error: 'Failed to update user status' };
    }
  }

  /**
   * Get user by ID with all fields
   */
  async getUserById(userId: string): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const { data, error } = await supabaseServer
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (err) {
      console.error('UserService getUserById error:', err);
      return { success: false, error: 'Failed to fetch user' };
    }
  }

  /**
   * Update user data
   */
  async updateUser(userId: string, updateData: UserUpdateData): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabaseServer
        .from('users')
        .update(updateData)
        .eq('id', userId);

      if (error) {
        console.error('Error updating user:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err) {
      console.error('UserService updateUser error:', err);
      return { success: false, error: 'Failed to update user' };
    }
  }

  /**
   * Get direct members of a user
   */
  async getDirectMembers(userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      const { data, error } = await supabaseServer
        .from('users')
        .select('id, username, email, first_name, last_name, is_active, business_value, created_at')
        .eq('parent_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching direct members:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('UserService getDirectMembers error:', err);
      return { success: false, error: 'Failed to fetch direct members' };
    }
  }

  /**
   * Get team members (all downline) of a user
   */
  async getTeamMembers(userId: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    try {
      // First get the user's path
      const { data: userData, error: userError } = await supabaseServer
        .from('users')
        .select('path')
        .eq('id', userId)
        .single();

      if (userError || !userData?.path) {
        return { success: false, error: 'User not found or invalid path' };
      }

      // Get all descendants using a raw query for ltree
      const { data, error } = await supabaseServer
        .from('users')
        .select('id, username, email, first_name, last_name, is_active, business_value, created_at, path')
        .neq('id', userId) // Exclude the user themselves
        .order('created_at', { ascending: false });
      
      // Filter descendants manually since ltree is not directly supported in the client
      const descendants = data?.filter(user => {
        if (!user.path || !userData.path) return false;
        return user.path.startsWith(userData.path + '.') || user.path === userData.path;
      }) || [];

      if (error) {
        console.error('Error fetching team members:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: descendants };
    } catch (err) {
      console.error('UserService getTeamMembers error:', err);
      return { success: false, error: 'Failed to fetch team members' };
    }
  }

  // Repair missing investment details for existing users
  public async repairMissingInvestmentDetails(): Promise<{ success: boolean; message: string; repairedCount: number }> {
    try {
      console.log('🔧 Starting repair of missing investment details...');
      
      // Find users without investment_details records
      const { data: usersWithoutInvestment, error: queryError } = await supabaseServer
        .from('users')
        .select('id, username, email')
        .not('id', 'in', `(
          SELECT user_id FROM investment_details
        )`);

      if (queryError) {
        console.error('❌ Error querying users without investment details:', queryError);
        return { success: false, message: 'Failed to query users', repairedCount: 0 };
      }

      if (!usersWithoutInvestment || usersWithoutInvestment.length === 0) {
        console.log('✅ All users already have investment details');
        return { success: true, message: 'All users already have investment details', repairedCount: 0 };
      }

      console.log(`🔧 Found ${usersWithoutInvestment.length} users without investment details`);

      let repairedCount = 0;
      const errors: string[] = [];

      // Create investment details for each user
      for (const user of usersWithoutInvestment) {
        try {
          const { error: investmentError } = await supabaseServer
            .rpc('update_investment_details', {
              p_user_id: user.id,
              p_total_investment: 0,
              p_active_investment: 0,
              p_expired_investment: 0,
              p_referral_income: 0,
              p_rank_income: 0,
              p_self_income: 0
            });

          if (investmentError) {
            console.error(`❌ Failed creating investment details for user ${user.username}:`, investmentError);
            errors.push(`User ${user.username}: ${investmentError.message}`);
          } else {
            console.log(`✅ Created investment details for user: ${user.username}`);
            repairedCount++;
          }
        } catch (err: any) {
          console.error(`❌ Error creating investment details for user ${user.username}:`, err);
          errors.push(`User ${user.username}: ${err.message}`);
        }
      }

      // Repair missing platform wallets
      const { data: usersWithoutWallet, error: walletQueryError } = await supabaseServer
        .from('users')
        .select('id, username, email')
        .not('id', 'in', `(
          SELECT user_id FROM platform_wallet
        )`);

      if (!walletQueryError && usersWithoutWallet && usersWithoutWallet.length > 0) {
        console.log(`🔧 Found ${usersWithoutWallet.length} users without platform wallets`);
        
        for (const user of usersWithoutWallet) {
          try {
            const { error: walletError } = await supabaseServer
              .rpc('get_or_create_wallet', {
                p_user_id: user.id
              });

            if (walletError) {
              console.error(`❌ Failed creating platform wallet for user ${user.username}:`, walletError);
              errors.push(`Wallet for ${user.username}: ${walletError.message}`);
            } else {
              console.log(`✅ Created platform wallet for user: ${user.username}`);
            }
          } catch (err: any) {
            console.error(`❌ Error creating platform wallet for user ${user.username}:`, err);
            errors.push(`Wallet for ${user.username}: ${err.message}`);
          }
        }
      }

      const message = repairedCount > 0 
        ? `Successfully repaired ${repairedCount} users. ${errors.length > 0 ? `Errors: ${errors.join(', ')}` : ''}`
        : 'No repairs needed';

      return { 
        success: true, 
        message, 
        repairedCount 
      };
    } catch (error) {
      console.error('❌ Error in repairMissingInvestmentDetails:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error', 
        repairedCount: 0 
      };
    }
  }

  // Get user investment details
  public async getUserInvestmentDetails(userId: string): Promise<{
    success: boolean;
    data?: {
      total_investment: number;
      active_investment: number;
      expired_investment: number;
      referral_income: number;
      rank_income: number;
      self_income: number;
    };
    message?: string;
  }> {
    try {
      const { data, error } = await supabaseServer
        .rpc('get_investment_details', {
          p_user_id: userId
        });

      if (error) {
        console.error('❌ Error getting investment details:', error);
        return { success: false, message: error.message };
      }

      if (!data || data.length === 0) {
        return { success: false, message: 'No investment details found' };
      }

      return { success: true, data: data[0] };
    } catch (error) {
      console.error('❌ Error in getUserInvestmentDetails:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export default UserService.getInstance();