import { OTPData, EmailOTPRequest } from '../types/user';
import emailService from './emailService';
import db from '../config/database';

class OTPService {
  private static instance: OTPService;
  private readonly OTP_EXPIRY_MINUTES = 10;
  private readonly MAX_ATTEMPTS = 3;
  private readonly useInMemory = (process.env.DB_DISABLED ?? 'false') === 'true';
  private readonly isEmailSendStrict = (process.env.EMAIL_SEND_STRICT ?? 'true') === 'true';
  private inMemoryOTPs: Map<string, { otp: string; expiresAt: Date; attempts: number; isUsed: boolean }> = new Map();

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

  private keyFor(email: string, type: 'signup' | 'login'): string {
    return `${email}|${type}`;
  }

  private async cleanupExpiredOTPs(): Promise<void> {
    try {
      const now = new Date();
      if (this.useInMemory) {
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
        return;
      }
      
      const result = await db.query(
        'DELETE FROM otps WHERE expires_at < $1 RETURNING email',
        [now]
      );
      
      const deletedCount = result.rowCount ?? 0;
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired OTPs`);
      }
    } catch (error) {
      console.error('❌ Error cleaning up expired OTPs:', error);
    }
  }

  public async generateAndSendOTP(request: EmailOTPRequest): Promise<{ success: boolean; message: string }> {
    try {
      const email = request.email.toLowerCase();

      if (this.useInMemory) {
        const key = this.keyFor(email, request.type);
        const existing = this.inMemoryOTPs.get(key);
        if (existing && existing.expiresAt > new Date()) {
          const remainingTime = Math.ceil((existing.expiresAt.getTime() - Date.now()) / 60000);
          return { success: false, message: `Please wait ${remainingTime} minutes before requesting a new OTP.` };
        }

        const otp = this.generateOTP();
        const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);
        this.inMemoryOTPs.set(key, { otp, expiresAt, attempts: 0, isUsed: false });

        const emailSent = await emailService.sendOTP(request, otp);
        if (!emailSent && this.isEmailSendStrict) {
          this.inMemoryOTPs.delete(key);
          return { success: false, message: 'Failed to send OTP email. Please try again.' };
        }

        console.log(`✅ OTP generated${emailSent ? ' and sent' : ''} to ${email} for ${request.type} (memory)`);
        return { success: true, message: `OTP ${emailSent ? 'sent' : 'generated'} successfully to ${email}. Please check your email.` };
      }
      
      // Check if there's already a recent OTP for this email and type (DB)
      const existingOTPResult = await db.query(
        'SELECT expires_at FROM otps WHERE email = $1 AND type = $2 AND expires_at > $3',
        [email, request.type, new Date()]
      );
      
      if (existingOTPResult.rows.length > 0) {
        const expiresAt = new Date(existingOTPResult.rows[0].expires_at);
        const remainingTime = Math.ceil((expiresAt.getTime() - Date.now()) / 60000);
        return {
          success: false,
          message: `Please wait ${remainingTime} minutes before requesting a new OTP.`
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

      // Store OTP in database - use upsert (ON CONFLICT)
      await db.query(
        `INSERT INTO otps(email, otp, type, expires_at, attempts, is_used) 
         VALUES($1, $2, $3, $4, $5, $6)
         ON CONFLICT (email, type) 
         DO UPDATE SET otp = $2, expires_at = $4, attempts = $5, is_used = $6`,
        [email, otp, request.type, expiresAt, 0, false]
      );

      // Send OTP via email
      const emailSent = await emailService.sendOTP(request, otp);

      if (!emailSent) {
        // Always fail if email sending fails
        await db.query(
          'DELETE FROM otps WHERE email = $1 AND type = $2',
          [email, request.type]
        );
        return {
          success: false,
          message: 'Failed to send OTP email. Please check email configuration and try again.'
        };
      }

      console.log(`✅ OTP generated${emailSent ? ' and sent' : ''} to ${email} for ${request.type}`);

      return {
        success: true,
        message: `OTP ${emailSent ? 'sent' : 'generated'} successfully to ${email}. Please check your email.`
      };

    } catch (error) {
      console.error('❌ Error generating/sending OTP:', error);
      // Fallback: if DB failed but memory mode is enabled, try memory path
      if (this.useInMemory) {
        return { success: false, message: 'An error occurred while sending OTP. Please try again.' };
      }
      return {
        success: false,
        message: 'An error occurred while sending OTP. Please try again.'
      };
    }
  }

  public async verifyOTP(otpData: OTPData): Promise<{ success: boolean; message: string }> {
    try {
      const email = otpData.email.toLowerCase();
      
      if (this.useInMemory) {
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
      }

      // Get OTP from database
      const otpResult = await db.query(
        'SELECT * FROM otps WHERE email = $1 AND type = $2',
        [email, otpData.type]
      );
      
      // Check if OTP exists
      if (otpResult.rows.length === 0) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.'
        };
      }

      const storedOTP = otpResult.rows[0];
      const expiresAt = new Date(storedOTP.expires_at);

      // Check if OTP is expired
      if (expiresAt < new Date()) {
        // Delete expired OTP
        await db.query(
          'DELETE FROM otps WHERE email = $1 AND type = $2',
          [email, otpData.type]
        );
        return {
          success: false,
          message: 'OTP has expired. Please request a new one.'
        };
      }

      // Check if OTP is already used
      if (storedOTP.is_used) {
        return {
          success: false,
          message: 'This OTP has already been used. Please request a new one.'
        };
      }

      // Check maximum attempts
      if (storedOTP.attempts >= this.MAX_ATTEMPTS) {
        // Delete OTP that exceeded max attempts
        await db.query(
          'DELETE FROM otps WHERE email = $1 AND type = $2',
          [email, otpData.type]
        );
        return {
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
      }

      // Increment attempts
      const newAttempts = storedOTP.attempts + 1;
      
      // Update attempts in database
      await db.query(
        'UPDATE otps SET attempts = $1 WHERE email = $2 AND type = $3',
        [newAttempts, email, otpData.type]
      );

      // Verify OTP
      if (storedOTP.otp !== otpData.otp.trim()) {
        const remainingAttempts = this.MAX_ATTEMPTS - newAttempts;
        if (remainingAttempts > 0) {
          return {
            success: false,
            message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
          };
        } else {
          // Delete OTP that exceeded max attempts
          await db.query(
            'DELETE FROM otps WHERE email = $1 AND type = $2',
            [email, otpData.type]
          );
          return {
            success: false,
            message: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.'
          };
        }
      }

      // Mark OTP as used
      await db.query(
        'UPDATE otps SET is_used = true WHERE email = $1 AND type = $2',
        [email, otpData.type]
      );
      
      // Delete used OTP after a short delay to prevent race conditions
      setTimeout(async () => {
        try {
          await db.query(
            'DELETE FROM otps WHERE email = $1 AND type = $2 AND is_used = true',
            [email, otpData.type]
          );
        } catch (error) {
          console.error('Error deleting used OTP:', error);
        }
      }, 5000);

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
      
      if (this.useInMemory) {
        const key = this.keyFor(normalizedEmail, type);
        this.inMemoryOTPs.delete(key);
        return this.generateAndSendOTP({ email: normalizedEmail, type, firstName });
      }

      // Delete any existing OTP for this email and type
      await db.query(
        'DELETE FROM otps WHERE email = $1 AND type = $2',
        [normalizedEmail, type]
      );

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
  public async getOTPStatus(email: string, type: 'signup' | 'login'): Promise<{ exists: boolean; expired?: boolean; attempts?: number }> {
    try {
      const normalizedEmail = email.toLowerCase();

      if (this.useInMemory) {
        const key = this.keyFor(normalizedEmail, type);
        const stored = this.inMemoryOTPs.get(key);
        if (!stored) return { exists: false };
        return { exists: true, expired: stored.expiresAt < new Date(), attempts: stored.attempts };
      }

      const result = await db.query(
        'SELECT expires_at, attempts FROM otps WHERE email = $1 AND type = $2',
        [normalizedEmail, type]
      );

      if (result.rows.length === 0) {
        return { exists: false };
      }

      const otp = result.rows[0];
      return {
        exists: true,
        expired: new Date(otp.expires_at) < new Date(),
        attempts: otp.attempts
      };
    } catch (error) {
      console.error('Error getting OTP status:', error);
      return { exists: false };
    }
  }

  // Clear all OTPs (for testing purposes)
  public async clearAllOTPs(): Promise<void> {
    try {
      if (this.useInMemory) {
        this.inMemoryOTPs.clear();
        console.log('🧹 All OTPs cleared (memory)');
        return;
      }
      await db.query('DELETE FROM otps');
      console.log('🧹 All OTPs cleared');
    } catch (error) {
      console.error('Error clearing OTPs:', error);
    }
  }
}

export default OTPService.getInstance(); 