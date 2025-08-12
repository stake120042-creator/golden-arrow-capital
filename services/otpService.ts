import { OTPData, EmailOTPRequest } from '../types/user';
import emailService from './emailService';
import { supabase } from '../config/database';

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
  private readonly useInMemory = (process.env.OTP_USE_MEMORY ?? 'true') === 'true';
  private readonly isEmailSendStrict = (process.env.EMAIL_SEND_STRICT ?? 'true') === 'true';
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
      
      const { count } = await supabase
        .from('otps')
        .delete()
        .lt('expires_at', now.toISOString());
      
      const deletedCount = count ?? 0;
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
      }
      
      // Check if there's already a recent OTP for this email and type (DB)
      const { data: existingOTPs } = await supabase
        .from('otps')
        .select('expires_at')
        .eq('email', email)
        .eq('otp_type', request.type)
        .gt('expires_at', new Date().toISOString());
      
      if (existingOTPs && existingOTPs.length > 0) {
        const expiresAt = new Date(existingOTPs[0].expires_at);
        const remainingTime = Math.ceil((expiresAt.getTime() - Date.now()) / 60000);
        return {
          success: false,
          message: `Please wait ${remainingTime} minutes before requesting a new OTP.`
        };
      }

      // Generate new OTP
      const otp = this.generateOTP();
      const expiresAt = new Date(Date.now() + this.OTP_EXPIRY_MINUTES * 60000);

      // Store OTP in Supabase - use upsert
      console.log(`📝 [DEBUG] Storing OTP with userData for ${email}:`, request.userData);
      
      const { error: upsertError } = await supabase
        .from('otps')
        .upsert({
          email,
          otp_code: otp,
          otp_type: request.type,
          expires_at: expiresAt.toISOString(),
          attempts: 0,
          is_used: false,
          user_data: request.userData || null
        }, {
          onConflict: 'email,otp_type'
        });

      if (upsertError) {
        console.error('❌ Error storing OTP in Supabase:', upsertError);
        throw new Error('Failed to store OTP');
      }

      // Send OTP via email
      console.log('📧 Attempting to send OTP email...');
      const emailSent = await emailService.sendOTP(request, otp);
      console.log('📧 Email send result:', emailSent);

      if (!emailSent && this.isEmailSendStrict) {
        // Always fail if email sending fails in strict mode
        console.error('❌ Failed to send OTP email in strict mode');
        await supabase
          .from('otps')
          .delete()
          .eq('email', email)
          .eq('otp_type', request.type);
        return {
          success: false,
          message: 'An error occurred while sending OTP. Please try again.'
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

      // Get OTP from Supabase
      const { data: otpData_db, error } = await supabase
        .from('otps')
        .select('*')
        .eq('email', email)
        .eq('otp_type', otpData.type)
        .single();
      
      // Check if OTP exists
      if (error || !otpData_db) {
        return {
          success: false,
          message: 'No OTP found for this email. Please request a new one.'
        };
      }

      const storedOTP = otpData_db;
      const expiresAt = new Date(storedOTP.expires_at);

      // Check if OTP is expired
      if (expiresAt < new Date()) {
        // Delete expired OTP
        await supabase
          .from('otps')
          .delete()
          .eq('email', email)
          .eq('otp_type', otpData.type);
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
        await supabase
          .from('otps')
          .delete()
          .eq('email', email)
          .eq('otp_type', otpData.type);
        return {
          success: false,
          message: 'Maximum verification attempts exceeded. Please request a new OTP.'
        };
      }

      // Increment attempts
      const newAttempts = storedOTP.attempts + 1;
      
      // Update attempts in Supabase
      await supabase
        .from('otps')
        .update({ attempts: newAttempts })
        .eq('email', email)
        .eq('otp_type', otpData.type);

      // Verify OTP
      if (storedOTP.otp_code !== otpData.otp.trim()) {
        const remainingAttempts = this.MAX_ATTEMPTS - newAttempts;
        if (remainingAttempts > 0) {
          return {
            success: false,
            message: `Invalid OTP. ${remainingAttempts} attempts remaining.`
          };
        } else {
          // Delete OTP that exceeded max attempts
          await supabase
            .from('otps')
            .delete()
            .eq('email', email)
            .eq('otp_type', otpData.type);
          return {
            success: false,
            message: 'Invalid OTP. Maximum attempts exceeded. Please request a new OTP.'
          };
        }
      }

      // Mark OTP as used
      await supabase
        .from('otps')
        .update({ is_used: true })
        .eq('email', email)
        .eq('otp_type', otpData.type);
      
      // Delete used OTP after a short delay to prevent race conditions
      setTimeout(async () => {
        try {
          await supabase
            .from('otps')
            .delete()
            .eq('email', email)
            .eq('otp_type', otpData.type)
            .eq('is_used', true);
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
      await supabase
        .from('otps')
        .delete()
        .eq('email', normalizedEmail)
        .eq('otp_type', type);

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

      const { data, error } = await supabase
        .from('otps')
        .select('expires_at, attempts')
        .eq('email', normalizedEmail)
        .eq('otp_type', type)
        .single();

      if (error || !data) {
        return { exists: false };
      }

      return {
        exists: true,
        expired: new Date(data.expires_at) < new Date(),
        attempts: data.attempts
      };
    } catch (error) {
      console.error('Error getting OTP status:', error);
      return { exists: false };
    }
  }

  // Get stored user data from OTP
  public async getUserDataFromOTP(email: string, type: 'signup' | 'login'): Promise<any> {
    try {
      const normalizedEmail = email.toLowerCase();
      
      if (this.useInMemory) {
        const key = this.keyFor(normalizedEmail, type);
        const stored = this.inMemoryOTPs.get(key);
        console.log(`🔍 [DEBUG] Getting user data from memory for ${email}:`, stored?.userData);
        return stored?.userData || null;
      }

      // Database implementation: retrieve from OTP table
      const { data, error } = await supabase
        .from('otps')
        .select('user_data')
        .eq('email', normalizedEmail)
        .eq('otp_type', type)
        .single();

      if (error || !data) {
        console.log(`🔍 [DEBUG] No user data found in database for ${email}:`, error);
        return null;
      }

      console.log(`🔍 [DEBUG] Getting user data from database for ${email}:`, data.user_data);
      return data.user_data;
    } catch (error) {
      console.error('❌ Error getting user data from OTP:', error);
      return null;
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
      await supabase.from('otps').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows
      console.log('🧹 All OTPs cleared');
    } catch (error) {
      console.error('Error clearing OTPs:', error);
    }
  }

  // DEVELOPMENT ONLY - Get current OTP for debugging
  public getDebugOTP(email: string, type: 'signup' | 'login'): any {
    if (process.env.NODE_ENV !== 'development') {
      return null;
    }
    
    try {
      const key = this.keyFor(email.toLowerCase(), type);
      if (this.useInMemory) {
        const stored = this.inMemoryOTPs.get(key);
        return stored || null;
      }
      return null;
    } catch (error) {
      console.error('❌ Error getting debug OTP:', error);
      return null;
    }
  }
}

export default OTPService.getInstance(); 