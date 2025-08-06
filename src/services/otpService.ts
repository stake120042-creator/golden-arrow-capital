import { OTPData, EmailOTPRequest } from '../types/user';
import emailService from './emailService';

interface StoredOTP {
  otp: string;
  email: string;
  type: 'signup' | 'login';
  expiresAt: Date;
  attempts: number;
  isUsed: boolean;
}

class OTPService {
  private static instance: OTPService;
  private otpStorage: Map<string, StoredOTP> = new Map();
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;

  private constructor() {
    // Clean up expired OTPs every minute
    setInterval(() => {
      this.cleanupExpiredOTPs();
    }, 60000);
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

  private getStorageKey(email: string, type: 'signup' | 'login'): string {
    return `${email.toLowerCase()}_${type}`;
  }

  private cleanupExpiredOTPs(): void {
    const now = new Date();
    for (const [key, storedOTP] of this.otpStorage.entries()) {
      if (storedOTP.expiresAt < now) {
        this.otpStorage.delete(key);
        console.log(`🧹 Cleaned up expired OTP for ${storedOTP.email}`);
      }
    }
  }

  public async generateAndSendOTP(request: EmailOTPRequest): Promise<{ success: boolean; message: string }> {
    try {
      const email = request.email.toLowerCase();
      const storageKey = this.getStorageKey(email, request.type);

      // Check if there's already a recent OTP for this email and type
      const existingOTP = this.otpStorage.get(storageKey);
      if (existingOTP && existingOTP.expiresAt > new Date()) {
        const remainingTime = Math.ceil((existingOTP.expiresAt.getTime() - Date.now()) / 60000);
        return {
          success: false,
          message: `Please wait ${remainingTime} minutes before requesting a new OTP.`
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

      // Store OTP
      this.otpStorage.set(storageKey, {
        otp,
        email,
        type: request.type,
        expiresAt,
        attempts: 0,
        isUsed: false
      });

      // Send OTP via email
      const emailSent = await emailService.sendOTP(request, otp);

      if (!emailSent) {
        this.otpStorage.delete(storageKey);
        return {
          success: false,
          message: 'Failed to send OTP email. Please try again.'
        };
      }

      console.log(`✅ OTP generated and sent to ${email} for ${request.type}`);
      console.log(`🔐 OTP: ${otp} (expires in ${this.OTP_EXPIRY_MINUTES} minutes)`);

      return {
        success: true,
        message: `OTP sent successfully to ${email}. Please check your email.`
      };

    } catch (error) {
      console.error('❌ Error generating/sending OTP:', error);
      return {
        success: false,
        message: 'An error occurred while sending OTP. Please try again.'
      };
    }
  }

  public async verifyOTP(otpData: OTPData): Promise<{ success: boolean; message: string }> {
    try {
      const email = otpData.email.toLowerCase();
      const storageKey = this.getStorageKey(email, otpData.type);
      
      const storedOTP = this.otpStorage.get(storageKey);

      // Check if OTP exists
      if (!storedOTP) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.'
        };
      }

      // Check if OTP is expired
      if (storedOTP.expiresAt < new Date()) {
        this.otpStorage.delete(storageKey);
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check if OTP is already used
      if (storedOTP.isUsed) {
        return {
          success: false,
          message: 'This OTP has already been used. Please request a new one.'
        };
      }

      // Check maximum attempts
      if (storedOTP.attempts >= this.MAX_ATTEMPTS) {
        this.otpStorage.delete(storageKey);
        return {
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
      }

      // Increment attempts
      storedOTP.attempts++;

      // Verify OTP
      if (storedOTP.otp !== otpData.otp.trim()) {
        const remainingAttempts = this.MAX_ATTEMPTS - storedOTP.attempts;
        if (remainingAttempts > 0) {
          return {
            success: false,
            message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
          };
        } else {
          this.otpStorage.delete(storageKey);
          return {
            success: false,
            message: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.'
          };
        }
      }

      // Mark OTP as used
      storedOTP.isUsed = true;
      
      // Clean up the OTP after successful verification
      setTimeout(() => {
        this.otpStorage.delete(storageKey);
      }, 5000); // Keep for 5 seconds for any race conditions

      console.log(`✅ OTP verified successfully for ${email} (${otpData.type})`);

      return {
        success: true,
        message: 'OTP verified successfully!'
      };

    } catch (error) {
      console.error('❌ Error verifying OTP:', error);
      return {
        success: false,
        message: 'An error occurred while verifying OTP. Please try again.'
      };
    }
  }

  public async resendOTP(email: string, type: 'signup' | 'login', firstName?: string): Promise<{ success: boolean; message: string }> {
    try {
      const normalizedEmail = email.toLowerCase();
      const storageKey = this.getStorageKey(normalizedEmail, type);

      // Remove existing OTP to allow resend
      this.otpStorage.delete(storageKey);

      // Generate and send new OTP
      const result = await this.generateAndSendOTP({
        email: normalizedEmail,
        type,
        firstName
      });

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
  public getOTPStatus(email: string, type: 'signup' | 'login'): { exists: boolean; expired?: boolean; attempts?: number } {
    const storageKey = this.getStorageKey(email.toLowerCase(), type);
    const storedOTP = this.otpStorage.get(storageKey);

    if (!storedOTP) {
      return { exists: false };
    }

    return {
      exists: true,
      expired: storedOTP.expiresAt < new Date(),
      attempts: storedOTP.attempts
    };
  }

  // Clear all OTPs (for testing purposes)
  public clearAllOTPs(): void {
    this.otpStorage.clear();
    console.log('🧹 All OTPs cleared');
  }
}

export default OTPService.getInstance(); 