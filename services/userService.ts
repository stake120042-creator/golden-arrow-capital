import supabaseServer from './supabaseServer';

export interface UserUpdateData {
  is_active?: boolean;
  business_value?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
}

class UserService {
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

      // Get all descendants
      const { data, error } = await supabaseServer
        .from('users')
        .select('id, username, email, first_name, last_name, is_active, business_value, created_at, path')
        .ltree('path', userData.path)
        .neq('id', userId) // Exclude the user themselves
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching team members:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (err) {
      console.error('UserService getTeamMembers error:', err);
      return { success: false, error: 'Failed to fetch team members' };
    }
  }
}

export default new UserService();