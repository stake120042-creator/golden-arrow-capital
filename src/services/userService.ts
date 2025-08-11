import { User, SignupData, LoginData, ApiResponse, OTPVerificationResponse } from '../types/user';

const API_BASE_URL = (import.meta as any).env.VITE_API_URL || 'http://localhost:3000/api';

class UserService {
  private static instance: UserService;

  private constructor() {
    // Prevent direct instantiation; use getInstance()
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, defaultOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      
      return data;
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error);
      throw error;
    }
  }

  public async initiateSignup(signupData: SignupData): Promise<ApiResponse> {
    try {
      console.log('🚀 Initiating signup process...');
      
      const result = await this.apiCall<ApiResponse>('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(signupData),
      });

      console.log(`📧 OTP sent to ${signupData.email} for signup verification`);
      return result;
    } catch (error) {
      console.error('❌ Error initiating signup:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during signup. Please try again.'
      };
    }
  }

  public async verifySignupOTP(email: string, otp: string): Promise<OTPVerificationResponse> {
    try {
      console.log('🔐 Verifying signup OTP...');
      
      const result = await this.apiCall<OTPVerificationResponse>('/auth/verify-signup', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      console.log(`✅ User account created successfully: ${email}`);
      return result;
    } catch (error) {
      console.error('❌ Error verifying signup OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during verification. Please try again.'
      };
    }
  }

  public async verifyLoginOTP(email: string, otp: string): Promise<OTPVerificationResponse> {
    try {
      console.log('🔐 Verifying login OTP...');
      
      const result = await this.apiCall<OTPVerificationResponse>('/auth/verify-login', {
        method: 'POST',
        body: JSON.stringify({ email, otp }),
      });

      console.log(`✅ User logged in successfully: ${email}`);
      return result;
    } catch (error) {
      console.error('❌ Error verifying login OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during login verification. Please try again.'
      };
    }
  }

  public async initiateLogin(loginData: LoginData): Promise<ApiResponse> {
    try {
      console.log('🔑 Initiating login process...');
      
      const result = await this.apiCall<ApiResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginData),
      });

      console.log(`📧 Login OTP sent`);
      return result;
    } catch (error) {
      console.error('❌ Error initiating login:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred during login. Please try again.'
      };
    }
  }

  public async resendOTP(email: string, type: 'signup' | 'login'): Promise<ApiResponse> {
    try {
      const result = await this.apiCall<ApiResponse>('/auth/resend-otp', {
        method: 'POST',
        body: JSON.stringify({ email, type }),
      });

      return result;
    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An error occurred while resending OTP. Please try again.'
      };
    }
  }

  // Utility methods for debugging/testing
  public async getAllUsers(): Promise<User[]> {
    try {
      const result = await this.apiCall<{ success: boolean; users: User[] }>('/user/all');
      return result.users || [];
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  public async clearAllData(): Promise<void> {
    try {
      await this.apiCall('/admin/clear', { method: 'POST' });
      console.log('🧹 All user data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export default UserService.getInstance();