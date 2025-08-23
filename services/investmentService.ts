import supabaseServer from './supabaseServer';

export interface Investment {
  id: number;
  user_id: string;
  package_id: number;
  amount: number;
  is_active: boolean;
  created_at: string;
}

export interface Package {
  id: number;
  interest: number;
  created_at: string;
}

export interface InvestmentWithPackage extends Investment {
  package: Package;
}

class InvestmentService {
  /**
   * Create a new investment
   */
  async createInvestment(userId: string, packageId: number, amount: number): Promise<Investment> {
    const { data, error } = await supabaseServer
      .from('investments')
      .insert({
        user_id: userId,
        package_id: packageId,
        amount: amount,
        is_active: true
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create investment: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all investments for a user
   */
  async getUserInvestments(userId: string): Promise<InvestmentWithPackage[]> {
    const { data, error } = await supabaseServer
      .from('investments')
      .select(`
        *,
        package:packages(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch user investments: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get active investments for a user
   */
  async getUserActiveInvestments(userId: string): Promise<InvestmentWithPackage[]> {
    const { data, error } = await supabaseServer
      .from('investments')
      .select(`
        *,
        package:packages(*)
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch active investments: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get all packages
   */
  async getPackages(): Promise<Package[]> {
    const { data, error } = await supabaseServer
      .from('packages')
      .select('*')
      .order('id');

    if (error) {
      throw new Error(`Failed to fetch packages: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get a specific package by ID
   */
  async getPackage(packageId: number): Promise<Package> {
    const { data, error } = await supabaseServer
      .from('packages')
      .select('*')
      .eq('id', packageId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch package: ${error.message}`);
    }

    return data;
  }

  /**
   * Deactivate an investment
   */
  async deactivateInvestment(investmentId: number): Promise<void> {
    const { error } = await supabaseServer
      .from('investments')
      .update({ is_active: false })
      .eq('id', investmentId);

    if (error) {
      throw new Error(`Failed to deactivate investment: ${error.message}`);
    }
  }

  /**
   * Get total investment amount for a user
   */
  async getTotalInvestmentAmount(userId: string): Promise<number> {
    const { data, error } = await supabaseServer
      .from('investments')
      .select('amount')
      .eq('user_id', userId)
      .eq('is_active', true);

    if (error) {
      throw new Error(`Failed to fetch total investment amount: ${error.message}`);
    }

    return data?.reduce((sum, investment) => sum + Number(investment.amount), 0) || 0;
  }

  /**
   * Get investment statistics for a user
   */
  async getUserInvestmentStats(userId: string): Promise<{
    totalInvestments: number;
    activeInvestments: number;
    totalAmount: number;
    activeAmount: number;
  }> {
    const { data, error } = await supabaseServer
      .from('investments')
      .select('amount, is_active')
      .eq('user_id', userId);

    if (error) {
      throw new Error(`Failed to fetch investment stats: ${error.message}`);
    }

    const totalInvestments = data?.length || 0;
    const activeInvestments = data?.filter(inv => inv.is_active).length || 0;
    const totalAmount = data?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;
    const activeAmount = data?.filter(inv => inv.is_active).reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

    return {
      totalInvestments,
      activeInvestments,
      totalAmount,
      activeAmount
    };
  }
}

const investmentService = new InvestmentService();
export default investmentService;
