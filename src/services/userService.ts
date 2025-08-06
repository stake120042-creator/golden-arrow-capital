import { User, SignupData, LoginData, ApiResponse, OTPVerificationResponse } from '../types/user';
import otpService from './otpService';
import emailService from './emailService';

interface StoredUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  sponsor?: string;
  passwordHash: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

class UserService {
  private static instance: UserService;
  private users: Map<string, StoredUser> = new Map();
  private usersByEmail: Map<string, string> = new Map(); // email -> userId mapping
  private usersByUsername: Map<string, string> = new Map(); // username -> userId mapping
  private pendingSignups: Map<string, SignupData> = new Map(); // email -> signup data

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private generateUserId(): string {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private hashPassword(password: string): string {
    // In production, use a proper hashing library like bcrypt
    // This is a simple hash for demonstration
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }

  private validateSignupData(data: SignupData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Required field validation
    if (!data.firstName?.trim()) errors.push('First name is required');
    if (!data.lastName?.trim()) errors.push('Last name is required');
    if (!data.username?.trim()) errors.push('Username is required');
    if (!data.email?.trim()) errors.push('Email is required');
    if (!data.password?.trim()) errors.push('Password is required');
    if (!data.confirmPassword?.trim()) errors.push('Password confirmation is required');

    // Format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.email && !emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (data.username && !usernameRegex.test(data.username)) {
      errors.push('Username must be 3-20 characters long and contain only letters, numbers, and underscores');
    }

    // Password validation
    if (data.password && data.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Check if email already exists
    if (data.email && this.usersByEmail.has(data.email.toLowerCase())) {
      errors.push('An account with this email already exists');
    }

    // Check if username already exists
    if (data.username && this.usersByUsername.has(data.username.toLowerCase())) {
      errors.push('This username is already taken');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateLoginData(data: LoginData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.usernameOrEmail?.trim()) {
      errors.push('Username or email is required');
    }

    if (!data.password?.trim()) {
      errors.push('Password is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  public async initiateSignup(signupData: SignupData): Promise<ApiResponse> {
    try {
      console.log('🚀 Initiating signup process...');

      // Validate signup data
      const validation = this.validateSignupData(signupData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', ')
        };
      }

      const email = signupData.email.toLowerCase();

      // Store pending signup data
      this.pendingSignups.set(email, signupData);

      // Generate and send OTP
      const otpResult = await otpService.generateAndSendOTP({
        email,
        type: 'signup',
        firstName: signupData.firstName
      });

      if (!otpResult.success) {
        this.pendingSignups.delete(email);
        return {
          success: false,
          message: otpResult.message
        };
      }

      console.log(`📧 OTP sent to ${email} for signup verification`);

      return {
        success: true,
        message: 'Verification code sent to your email. Please check your inbox.',
        data: { email }
      };

    } catch (error) {
      console.error('❌ Error initiating signup:', error);
      return {
        success: false,
        message: 'An error occurred during signup. Please try again.'
      };
    }
  }

  public async verifySignupOTP(email: string, otp: string): Promise<OTPVerificationResponse> {
    try {
      console.log('🔐 Verifying signup OTP...');

      const normalizedEmail = email.toLowerCase();

      // Verify OTP
      const otpResult = await otpService.verifyOTP({
        email: normalizedEmail,
        otp,
        type: 'signup'
      });

      if (!otpResult.success) {
        return {
          success: false,
          message: otpResult.message
        };
      }

      // Get pending signup data
      const signupData = this.pendingSignups.get(normalizedEmail);
      if (!signupData) {
        return {
          success: false,
          message: 'Signup session expired. Please start the signup process again.'
        };
      }

      // Create user account
      const userId = this.generateUserId();
      const passwordHash = this.hashPassword(signupData.password);

      const newUser: StoredUser = {
        id: userId,
        username: signupData.username,
        email: normalizedEmail,
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        sponsor: signupData.sponsor,
        passwordHash,
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Store user
      this.users.set(userId, newUser);
      this.usersByEmail.set(normalizedEmail, userId);
      this.usersByUsername.set(signupData.username.toLowerCase(), userId);

      // Clean up pending signup
      this.pendingSignups.delete(normalizedEmail);

      // Send welcome email
      await emailService.sendWelcomeEmail({
        email: normalizedEmail,
        firstName: signupData.firstName,
        lastName: signupData.lastName
      });

      console.log(`✅ User account created successfully: ${signupData.username} (${normalizedEmail})`);

      // Return user without password hash
      const userResponse: User = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        sponsor: newUser.sponsor,
        isVerified: newUser.isVerified,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      };

      return {
        success: true,
        message: 'Account created successfully! Welcome to Golden Arrow Capital.',
        user: userResponse,
        token: `token_${userId}_${Date.now()}` // Mock JWT token
      };

    } catch (error) {
      console.error('❌ Error verifying signup OTP:', error);
      return {
        success: false,
        message: 'An error occurred during verification. Please try again.'
      };
    }
  }

  public async initiateLogin(loginData: LoginData): Promise<ApiResponse> {
    try {
      console.log('🔑 Initiating login process...');

      // Validate login data
      const validation = this.validateLoginData(loginData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', ')
        };
      }

      const usernameOrEmail = loginData.usernameOrEmail.toLowerCase();

      // Find user by email or username
      let userId = this.usersByEmail.get(usernameOrEmail);
      if (!userId) {
        userId = this.usersByUsername.get(usernameOrEmail);
      }

      if (!userId) {
        return {
          success: false,
          message: 'Invalid username/email or password'
        };
      }

      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      // Verify password
      const passwordHash = this.hashPassword(loginData.password);
      if (passwordHash !== user.passwordHash) {
        return {
          success: false,
          message: 'Invalid username/email or password'
        };
      }

      // Check if user is verified
      if (!user.isVerified) {
        return {
          success: false,
          message: 'Please verify your email address before logging in'
        };
      }

      // Generate and send OTP for login verification
      const otpResult = await otpService.generateAndSendOTP({
        email: user.email,
        type: 'login',
        firstName: user.firstName
      });

      if (!otpResult.success) {
        return {
          success: false,
          message: otpResult.message
        };
      }

      console.log(`📧 Login OTP sent to ${user.email}`);

      return {
        success: true,
        message: 'Password verified. Please check your email for the verification code.',
        data: { email: user.email, userId: user.id }
      };

    } catch (error) {
      console.error('❌ Error initiating login:', error);
      return {
        success: false,
        message: 'An error occurred during login. Please try again.'
      };
    }
  }

  public async verifyLoginOTP(email: string, otp: string): Promise<OTPVerificationResponse> {
    try {
      console.log('🔐 Verifying login OTP...');

      const normalizedEmail = email.toLowerCase();

      // Verify OTP
      const otpResult = await otpService.verifyOTP({
        email: normalizedEmail,
        otp,
        type: 'login'
      });

      if (!otpResult.success) {
        return {
          success: false,
          message: otpResult.message
        };
      }

      // Get user
      const userId = this.usersByEmail.get(normalizedEmail);
      if (!userId) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const user = this.users.get(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      console.log(`✅ User logged in successfully: ${user.username} (${normalizedEmail})`);

      // Return user without password hash
      const userResponse: User = {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        sponsor: user.sponsor,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };

      return {
        success: true,
        message: 'Login successful! Welcome back.',
        user: userResponse,
        token: `token_${userId}_${Date.now()}` // Mock JWT token
      };

    } catch (error) {
      console.error('❌ Error verifying login OTP:', error);
      return {
        success: false,
        message: 'An error occurred during verification. Please try again.'
      };
    }
  }

  public async resendOTP(email: string, type: 'signup' | 'login'): Promise<ApiResponse> {
    try {
      const normalizedEmail = email.toLowerCase();

      let firstName: string | undefined;

      if (type === 'signup') {
        const signupData = this.pendingSignups.get(normalizedEmail);
        firstName = signupData?.firstName;
      } else {
        const userId = this.usersByEmail.get(normalizedEmail);
        const user = userId ? this.users.get(userId) : undefined;
        firstName = user?.firstName;
      }

      const result = await otpService.resendOTP(normalizedEmail, type, firstName);

      return {
        success: result.success,
        message: result.message
      };

    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      return {
        success: false,
        message: 'An error occurred while resending OTP. Please try again.'
      };
    }
  }

  // Utility methods for debugging/testing
  public getAllUsers(): User[] {
    return Array.from(this.users.values()).map(user => ({
      id: user.id,
      username: user.username,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      sponsor: user.sponsor,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    }));
  }

  public clearAllData(): void {
    this.users.clear();
    this.usersByEmail.clear();
    this.usersByUsername.clear();
    this.pendingSignups.clear();
    console.log('🧹 All user data cleared');
  }
}

export default UserService.getInstance(); 