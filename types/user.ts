export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  sponsor?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SignupData {
  sponsor?: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  usernameOrEmail: string;
  password: string;
  rememberMe?: boolean;
}

export interface OTPData {
  email: string;
  otp: string;
  type: 'signup' | 'login' | 'withdrawal';
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface OTPVerificationResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface EmailOTPRequest {
  email: string;
  type: 'signup' | 'login' | 'withdrawal';
  firstName?: string;
  lastName?: string;
  userData?: any;
  withdrawalData?: {
    amount: string;
    address: string;
    memo?: string;
  };
} 