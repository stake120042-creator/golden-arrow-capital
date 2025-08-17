import { SignupData, LoginData, ApiResponse, OTPVerificationResponse } from '../types/user';

// Base URL for API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Generic API request function
async function apiRequest<T>(endpoint: string, method: string, data?: any): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Include cookies for sessions
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  // Handle API errors
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return await response.json();
}

// API client for user-related operations
const apiClient = {
  // Auth endpoints
  auth: {
    signup: (data: SignupData): Promise<ApiResponse> => 
      apiRequest('/auth/signup', 'POST', data),
    
    verifySignupOTP: (email: string, otp: string): Promise<OTPVerificationResponse> =>
      apiRequest('/auth/verify-signup', 'POST', { email, otp }),
    
    login: (data: LoginData): Promise<ApiResponse> =>
      apiRequest('/auth/login', 'POST', data),
    
    verifyLoginOTP: (email: string, otp: string): Promise<OTPVerificationResponse> =>
      apiRequest('/auth/verify-login', 'POST', { email, otp }),
    
    resendOTP: (email: string, type: 'signup' | 'login'): Promise<ApiResponse> =>
      apiRequest('/auth/resend-otp', 'POST', { email, type }),
  },
  
  // User endpoints
  user: {
    getProfile: (): Promise<ApiResponse> =>
      apiRequest('/user/profile', 'GET'),
    
    updateProfile: (data: any): Promise<ApiResponse> =>
      apiRequest('/user/profile', 'PUT', data),
  },

  wallet: {
    getOrCreate: (userId: string): Promise<any> =>
      apiRequest('/wallet/get-or-create', 'POST', { userId }),
  },
};

// Export both default and named export for flexibility
export { apiClient };
export default apiClient;