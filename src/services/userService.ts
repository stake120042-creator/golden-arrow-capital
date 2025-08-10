import { User, SignupData, LoginData, ApiResponse, OTPVerificationResponse } from '../types/user';
import otpService from './otpService';
import emailService from './emailService';
import db from '../config/database';
import cryptoUtils from '../utils/cryptoUtils';
import apiClient from './apiClient';

// Determine if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

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
  private pendingSignups: Map<string, SignupData> = new Map(); // email -> signup data
  private saltRounds = 10;

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

  private async hashPassword(password: string): Promise<string> {
    // Use cryptoUtils for secure password hashing
    return await cryptoUtils.hash(password, this.saltRounds);
  }
  
  private async comparePassword(password: string, hash: string): Promise<boolean> {
    // Compare password with hash using cryptoUtils
    return await cryptoUtils.compare(password, hash);
  }

  private async validateSignupData(data: SignupData): Promise<{ isValid: boolean; errors: string[] }> {
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

    // Check if email already exists in database
    if (data.email) {
      const emailResult = await db.query(
        'SELECT email FROM users WHERE email = $1',
        [data.email.toLowerCase()]
      );
      
      if (emailResult.rows.length > 0) {
        errors.push('An account with this email already exists');
      }
    }

    // Check if username already exists in database
    if (data.username) {
      const usernameResult = await db.query(
        'SELECT username FROM users WHERE username = $1',
        [data.username.toLowerCase()]
      );
      
      if (usernameResult.rows.length > 0) {
        errors.push('This username is already taken');
      }
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

      // In browser environment, use API client
      if (isBrowser) {
        return await apiClient.auth.signup(signupData);
      }

      // Server-side code below
      // Validate signup data
      const validation = await this.validateSignupData(signupData);
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

      // In browser environment, use API client
      if (isBrowser) {
        return await apiClient.auth.verifySignupOTP(email, otp);
      }

      // Server-side code below
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
      const passwordHash = await this.hashPassword(signupData.password);

      // Insert user into database
      const insertUserResult = await db.query(
        `INSERT INTO users(
          id, username, email, first_name, last_name, sponsor, password_hash, is_verified, created_at, updated_at
        ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
        [
          userId,
          signupData.username,
          normalizedEmail,
          signupData.firstName,
          signupData.lastName,
          signupData.sponsor || null,
          passwordHash,
          true,
          new Date(),
          new Date()
        ]
      );

      if (!insertUserResult.rows || insertUserResult.rows.length === 0) {
        return {
          success: false,
          message: 'Failed to create user account. Please try again.'
        };
      }

      // Clean up pending signup
      this.pendingSignups.delete(normalizedEmail);

      // Send welcome email
      await emailService.sendWelcomeEmail({
        email: normalizedEmail,
        firstName: signupData.firstName,
        lastName: signupData.lastName
      });

      console.log(`✅ User account created successfully: ${signupData.username} (${normalizedEmail})`);

      // Convert database row to User object
      const dbUser = insertUserResult.rows[0];
      const userResponse: User = {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        sponsor: dbUser.sponsor,
        isVerified: dbUser.is_verified,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at
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

      // In browser environment, use API client
      if (isBrowser) {
        return await apiClient.auth.login(loginData);
      }

      // Server-side code below
      // Validate login data
      const validation = this.validateLoginData(loginData);
      if (!validation.isValid) {
        return {
          success: false,
          message: validation.errors.join(', ')
        };
      }

      const usernameOrEmail = loginData.usernameOrEmail.toLowerCase();

      // Find user by email or username in database
      const userQuery = await db.query(
        'SELECT * FROM users WHERE email = $1 OR username = $1',
        [usernameOrEmail]
      );

      if (userQuery.rows.length === 0) {
        return {
          success: false,
          message: 'Invalid username/email or password'
        };
      }

      const user = userQuery.rows[0];

      // Verify password with bcrypt
      const isPasswordValid = await this.comparePassword(loginData.password, user.password_hash);
      if (!isPasswordValid) {
        return {
          success: false,
          message: 'Invalid username/email or password'
        };
      }

      // Check if user is verified
      if (!user.is_verified) {
        return {
          success: false,
          message: 'Please verify your email address before logging in'
        };
      }

      // Generate and send OTP for login verification
      const otpResult = await otpService.generateAndSendOTP({
        email: user.email,
        type: 'login',
        firstName: user.first_name
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

      // In browser environment, use API client
      if (isBrowser) {
        return await apiClient.auth.verifyLoginOTP(email, otp);
      }

      // Server-side code below
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

      // Get user from database
      const userResult = await db.query(
        'SELECT * FROM users WHERE email = $1',
        [normalizedEmail]
      );

      if (userResult.rows.length === 0) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      const dbUser = userResult.rows[0];
      console.log(`✅ User logged in successfully: ${dbUser.username} (${normalizedEmail})`);

      // Convert database user to User object
      const userResponse: User = {
        id: dbUser.id,
        username: dbUser.username,
        email: dbUser.email,
        firstName: dbUser.first_name,
        lastName: dbUser.last_name,
        sponsor: dbUser.sponsor,
        isVerified: dbUser.is_verified,
        createdAt: dbUser.created_at,
        updatedAt: dbUser.updated_at
      };

      return {
        success: true,
        message: 'Login successful! Welcome back.',
        user: userResponse,
        token: `token_${dbUser.id}_${Date.now()}` // Mock JWT token
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
      // In browser environment, use API client
      if (isBrowser) {
        return await apiClient.auth.resendOTP(email, type);
      }

      // Server-side code below
      const normalizedEmail = email.toLowerCase();

      let firstName: string | undefined;

      if (type === 'signup') {
        const signupData = this.pendingSignups.get(normalizedEmail);
        firstName = signupData?.firstName;
      } else {
        // Get user from database
        const userResult = await db.query(
          'SELECT first_name FROM users WHERE email = $1',
          [normalizedEmail]
        );
        
        if (userResult.rows.length > 0) {
          firstName = userResult.rows[0].first_name;
        }
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
  public async getAllUsers(): Promise<User[]> {
    try {
      const result = await db.query('SELECT * FROM users');
      
      return result.rows.map(row => ({
        id: row.id,
        username: row.username,
        email: row.email,
        firstName: row.first_name,
        lastName: row.last_name,
        sponsor: row.sponsor,
        isVerified: row.is_verified,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      }));
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  public async clearAllData(): Promise<void> {
    try {
      await db.query('DELETE FROM users');
      await db.query('DELETE FROM otps');
      this.pendingSignups.clear();
      console.log('🧹 All user data cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
    }
  }
}

export default UserService.getInstance(); 