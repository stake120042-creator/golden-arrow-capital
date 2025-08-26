import { OTPData, EmailOTPRequest } from '../types/user';
import emailService from './emailService';

// Global storage to persist across hot reloads in development
declare global {
  var globalOTPStorage: Map<string, { otp: string; expiresAt: Date; attempts: number; isUsed: boolean; userData?: any }> | undefined;
}

if (!global.globalOTPStorage) {
  global.globalOTPStorage = new Map();
}

class OTPService {
  private static instance: OTPService;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly isEmailSendStrict = process.env.NODE_ENV === 'development' ? false : (process.env.EMAIL_SEND_STRICT ?? 'true') === 'true';
  private inMemoryOTPs: Map<string, { otp: string; expiresAt: Date; attempts: number; isUsed: boolean; userData?: any }> = global.globalOTPStorage!;

  private constructor() {
    // Clean up expired OTPs every 5 minutes (reduced frequency to avoid timing issues)
    setInterval(() => {
      this.cleanupExpiredOTPs();
    }, 300000); // 5 minutes instead of 1 minute
  }

  public static getInstance(): OTPService {
    if (!OTPService.instance) {
      OTPService.instance = new OTPService();
    }
    return OTPService.instance;
  }

  private generateOTP(): string {
    // Generate a 6-digit OTP
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private keyFor(email: string, type: 'signup' | 'login' | 'withdrawal' | 'refund' | 'profile_update'): string {
    return `${email}|${type}`;
  }

  private async cleanupExpiredOTPs(): Promise<void> {
    try {
      const now = new Date();
      let deleted = 0;
      for (const [key, value] of this.inMemoryOTPs.entries()) {
        if (value.expiresAt < now) {
          this.inMemoryOTPs.delete(key);
          deleted += 1;
        }
      }
      if (deleted > 0) {
        console.log(`🧹 Cleaned up ${deleted} expired OTPs (memory)`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired OTPs:', error);
    }
  }

  public async generateAndSendOTP(request: EmailOTPRequest): Promise<{ success: boolean; message: string }> {
    try {
      const email = request.email.toLowerCase();
      const key = this.keyFor(email, request.type);
      const existing = this.inMemoryOTPs.get(key);
      
      if (existing && existing.expiresAt > new Date()) {
        const remainingTime = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 60000);
        return { success: false, message: `Please wait ${remainingTime} minutes before requesting a new OTP.` };
      }

      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);
      this.inMemoryOTPs.set(key, { otp, expiresAt, attempts: 0, isUsed: false, userData: request.userData });

      console.log('📧 Attempting to send OTP email...');
      const emailSent = await emailService.sendOTP(request, otp);
      console.log('📧 Email send result:', emailSent);
      
      if (!emailSent && this.isEmailSendStrict) {
        this.inMemoryOTPs.delete(key);
        console.error('❌ Failed to send OTP email in strict mode');
        return { 
          success: false, 
          message: 'An error occurred while sending OTP. Please try again.'
        };
      }

      console.log(`✅ OTP generated${emailSent ? ' and sent' : ''} to ${email} for ${request.type} (memory)`);
      return { success: true, message: `OTP ${emailSent ? 'sent' : 'generated'} successfully to ${email}. Please check your email.` };

    } catch (error) {
      console.error('❌ Error generating/sending OTP:', error);
      return { success: false, message: 'An error occurred while sending OTP. Please try again.' };
    }
  }

  public async verifyOTP(otpData: OTPData): Promise<{ success: boolean; message: string }> {
    try {
      const email = otpData.email.toLowerCase();
      const key = this.keyFor(email, otpData.type);
      const stored = this.inMemoryOTPs.get(key);
      
      if (!stored) {
        return { success: false, message: 'No OTP found for this email. Please request a new one.' };
      }
      
      if (stored.expiresAt < new Date()) {
        this.inMemoryOTPs.delete(key);
        return { success: false, message: 'OTP has expired. Please request a new one.' };
      }
      
      if (stored.isUsed) {
        return { success: false, message: 'This OTP has already been used. Please request a new one.' };
      }
      
      if (stored.attempts >= this.MAX_ATTEMPTS) {
        this.inMemoryOTPs.delete(key);
        return { success: false, message: 'Maximum verification attempts exceeded. Please request a new OTP.' };
      }
      
      stored.attempts += 1;
      if (stored.otp !== otpData.otp.trim()) {
        const remaining = this.MAX_ATTEMPTS - stored.attempts;
        if (remaining > 0) {
          return { success: false, message: `Invalid OTP. ${remaining} attempts remaining.` };
        } else {
          this.inMemoryOTPs.delete(key);
          return { success: false, message: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.' };
        }
      }
      
      stored.isUsed = true;
      setTimeout(() => this.inMemoryOTPs.delete(key), 5000);
      console.log(`✅ OTP verified successfully for ${email} (${otpData.type}) (memory)`);
      return { success: true, message: 'OTP verified successfully!' };

    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      return {
        success: false,
        message: 'An error occurred while verifying OTP. Please try again.'
      };
    }
  }

  public async resendOTP(email: string, type: 'signup' | 'login' | 'withdrawal' | 'refund' | 'profile_update', firstName?: string): Promise<{ success: boolean; message: string }> {
    try {
      const normalizedEmail = email.toLowerCase();
      const key = this.keyFor(normalizedEmail, type);
      this.inMemoryOTPs.delete(key);
      
      const result = await this.generateAndSendOTP({ email: normalizedEmail, type, firstName });

      if (result.success) {
        console.log(`🔄 OTP resent to ${normalizedEmail}`);
      }

      return result;

    } catch (error) {
      console.error('❌ Error resending OTP:', error);
      return {
        success: false,
        message: 'An error occurred while resending OTP. Please try again.'
      };
    }
  }

  // Method to check if OTP exists and is valid (for debugging)
  public async getOTPStatus(email: string, type: 'signup' | 'login' | 'withdrawal' | 'refund' | 'profile_update'): Promise<{ exists: boolean; expired?: boolean; attempts?: number }> {
    try {
      const normalizedEmail = email.toLowerCase();
      const key = this.keyFor(normalizedEmail, type);
      const stored = this.inMemoryOTPs.get(key);
      
      if (!stored) return { exists: false };
      return { exists: true, expired: stored.expiresAt < new Date(), attempts: stored.attempts };
    } catch (error) {
      console.error('Error getting OTP status:', error);
      return { exists: false };
    }
  }

  // Get stored user data from OTP
  public async getUserDataFromOTP(email: string, type: 'signup' | 'login' | 'withdrawal' | 'refund' | 'profile_update'): Promise<any> {
    try {
      const normalizedEmail = email.toLowerCase();
      const key = this.keyFor(normalizedEmail, type);
      const stored = this.inMemoryOTPs.get(key);
      console.log(`🔍 [DEBUG] Getting user data from memory for ${email}:`, stored?.userData);
      return stored?.userData || null;
    } catch (error) {
      console.error('❌ Error getting user data from OTP:', error);
      return null;
    }
  }

  // Clear all OTPs (for testing purposes)
  public async clearAllOTPs(): Promise<void> {
    try {
      this.inMemoryOTPs.clear();
      console.log('🧹 All OTPs cleared (memory)');
    } catch (error) {
      console.error('Error clearing OTPs:', error);
    }
  }

  // DEVELOPMENT ONLY - Get current OTP for debugging
  public getDebugOTP(email: string, type: 'signup' | 'login' | 'withdrawal' | 'refund' | 'profile_update'): any {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    
    try {
      const key = this.keyFor(email.toLowerCase(), type);
      const stored = this.inMemoryOTPs.get(key);
      return stored || null;
    } catch (error) {
      console.error('❌ Error getting debug OTP:', error);
      return null;
    }
  }
}

export default OTPService.getInstance();
