import { EmailOTPRequest } from '../types/user';
import nodemailer, { Transporter } from 'nodemailer';

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private static instance: EmailService;
  private transporter: Transporter | null = null;
  private fromAddress: string | null = null;
  private initialized = false;

  private constructor() {
    // Constructor is empty - initialization happens lazily
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private initialize(): void {
    if (this.initialized) return;

    // Gmail SMTP configuration (for reliable email delivery)
    const host = process.env.GMAIL_SMTP_HOST || 'smtp.gmail.com';
    const port = Number(process.env.GMAIL_SMTP_PORT || 587);
    const user = process.env.GMAIL_SMTP_USER || '';
    const pass = process.env.GMAIL_SMTP_PASS || '';

    // SES Configuration (commented out until credentials are fixed)
    // const host = process.env.SES_SMTP_HOST || 'email-smtp.us-east-1.amazonaws.com';
    // const port = Number(process.env.SES_SMTP_PORT || 587);
    // const user = process.env.SES_SMTP_USER || '';
    // const pass = process.env.SES_SMTP_PASS || '';

    this.fromAddress = process.env.EMAIL_FROM || 'Golden Arrow Capital <goldenarrowcapital2023@gmail.com>';

    // Debug logging
    console.log('🔧 EmailService initialization - SMTP Configuration:');
    console.log('  SMTP_HOST:', host);
    console.log('  SMTP_PORT:', port);
    console.log('  SMTP_USER:', user ? `${user.substring(0, 8)}...` : 'NOT SET');
    console.log('  SMTP_PASS:', pass ? `${pass.substring(0, 8)}...` : 'NOT SET');
    console.log('  EMAIL_FROM:', this.fromAddress);

    // Remove development mode restriction - always try to send emails

    if (!user || !pass) {
      console.error('❌ Gmail SMTP credentials not set. Emails cannot be sent.');
      console.error('   Missing environment variables:');
      if (!user) console.error('   - GMAIL_SMTP_USER is missing');
      if (!pass) console.error('   - GMAIL_SMTP_PASS is missing');
      console.error('   Setup Instructions:');
      console.error('   1. Enable 2FA on your Gmail account');
      console.error('   2. Generate an App Password (16 characters)');
      console.error('   3. Add GMAIL_SMTP_USER=your-email@gmail.com to .env file');
      console.error('   4. Add GMAIL_SMTP_PASS=your-16-digit-app-password to .env file');
      
      // In development, allow the service to continue without throwing error
      if (process.env.NODE_ENV === 'development') {
        console.log('📧 [DEV MODE] Email service will simulate sending emails');
        this.initialized = true;
        return;
      }
      
      // Throw error in production to make it clear what's wrong
      if (process.env.NODE_ENV === 'production') {
        throw new Error('Email service not configured: Missing Gmail SMTP credentials in production environment');
      }
      
      this.initialized = true;
      return;
    }

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false, // true for 465, false for 587
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    this.initialized = true;
  }

  private getOTPEmailTemplate(otp: string, type: 'signup' | 'login' | 'withdrawal' | 'refund' | 'profile_update', firstName?: string): EmailTemplate {
    const name = firstName ? ` ${firstName}` : '';
    
    const templates = {
      signup: {
        subject: 'Verify Your Golden Arrow Capital Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="margin: 0; color: #0f172a; font-size: 24px;">Golden Arrow Capital</h1>
              </div>
            </div>
            
            <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #fbbf24;">
              <h2 style="color: #fbbf24; margin-top: 0;">Welcome to Golden Arrow Capital${name}!</h2>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                Thank you for joining our exclusive investment platform. To complete your account setup and verify your email address, please use the verification code below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                This verification code will expire in <strong style="color: #fbbf24;">10 minutes</strong>. If you didn't request this verification, please ignore this email.
              </p>
              
              <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  The Golden Arrow Capital Team
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #64748b; font-size: 12px;">
                © 2025 Golden Arrow Capital. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
Welcome to Golden Arrow Capital${name}!

Thank you for joining our exclusive investment platform. To complete your account setup, please use this verification code:

${otp}

This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.

Best regards,
The Golden Arrow Capital Team

© 2025 Golden Arrow Capital. All rights reserved.
        `
      },
      login: {
        subject: 'Golden Arrow Capital - Login Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="margin: 0; color: #0f172a; font-size: 24px;">Golden Arrow Capital</h1>
              </div>
            </div>
            
            <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #fbbf24;">
              <h2 style="color: #fbbf24; margin-top: 0;">Secure Login Verification</h2>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                Hello${name}! A login attempt was made to your Golden Arrow Capital account. For your security, please verify your identity using the code below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                This verification code will expire in <strong style="color: #fbbf24;">10 minutes</strong>. If you didn't attempt to log in, please secure your account immediately by changing your password.
              </p>
              
              <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Stay secure,<br>
                  The Golden Arrow Capital Security Team
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #64748b; font-size: 12px;">
                © 2025 Golden Arrow Capital. All rights reserved.<br>
                This is an automated security message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
Golden Arrow Capital - Login Verification

Hello${name}! A login attempt was made to your account. For your security, please verify your identity using this code:

${otp}

This code will expire in 10 minutes. If you didn't attempt to log in, please secure your account immediately.

Stay secure,
The Golden Arrow Capital Security Team

© 2025 Golden Arrow Capital. All rights reserved.
        `
      },
      withdrawal: {
        subject: 'Golden Arrow Capital - Withdrawal Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="margin: 0; color: #0f172a; font-size: 24px;">Golden Arrow Capital</h1>
              </div>
            </div>
            
            <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #fbbf24;">
              <h2 style="color: #fbbf24; margin-top: 0;">Withdrawal Security Verification</h2>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                Hello${name}! A withdrawal request has been initiated from your Golden Arrow Capital account. For your security, please verify this transaction using the code below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                This withdrawal code will expire in <strong style="color: #fbbf24;">10 minutes</strong>. If you didn't initiate this withdrawal, please contact our support team immediately and secure your account.
              </p>
              
              <div style="background-color: #374151; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
                <h3 style="color: #fbbf24; margin-top: 0;">Security Reminder</h3>
                <ul style="color: #cbd5e1; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Never share this code with anyone</li>
                  <li>Our team will never ask for this code</li>
                  <li>Double-check the withdrawal address before confirming</li>
                  <li>Contact support if you notice any suspicious activity</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Stay secure,<br>
                  The Golden Arrow Capital Security Team
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #64748b; font-size: 12px;">
                © 2025 Golden Arrow Capital. All rights reserved.<br>
                This is an automated security message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
Golden Arrow Capital - Withdrawal Code

Hello${name}! A withdrawal request has been initiated from your account. For your security, please verify this transaction using this code:

${otp}

This code will expire in 10 minutes. If you didn't initiate this withdrawal, please contact our support team immediately.

Security Reminder:
- Never share this code with anyone
- Our team will never ask for this code
- Double-check the withdrawal address before confirming
- Contact support if you notice any suspicious activity

Stay secure,
The Golden Arrow Capital Security Team

© 2025 Golden Arrow Capital. All rights reserved.
        `
      },
      refund: {
        subject: 'Golden Arrow Capital - Refund Verification Code',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="margin: 0; color: #0f172a; font-size: 24px;">Golden Arrow Capital</h1>
              </div>
            </div>
            <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #fbbf24;">
              <h2 style="color: #fbbf24; margin-top: 0;">Refund Request Verification</h2>
              <p style="color: #cbd5e1; line-height: 1.6;">
                Hello${name}! A refund request has been initiated from your Golden Arrow Capital account. Please verify this request using the code below:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">
                  ${otp}
                </div>
              </div>
              <p style="color: #cbd5e1; line-height: 1.6;">
                This verification code will expire in <strong style="color: #fbbf24;">10 minutes</strong>. If you didn't initiate this refund, please contact our support team immediately.
              </p>
              <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Stay secure,<br>
                  The Golden Arrow Capital Team
                </p>
              </div>
            </div>
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #64748b; font-size: 12px;">
                © 2025 Golden Arrow Capital. All rights reserved.<br>
                This is an automated message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
Golden Arrow Capital - Refund Verification Code

Hello${name}! A refund request has been initiated from your account. Please verify this request using this code:

${otp}

This code will expire in 10 minutes. If you didn't initiate this refund, please contact our support team immediately.

Stay secure,
The Golden Arrow Capital Team

© 2025 Golden Arrow Capital. All rights reserved.
        `
      },
      profile_update: {
        subject: 'Golden Arrow Capital - Profile Update Verification',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="margin: 0; color: #0f172a; font-size: 24px;">Golden Arrow Capital</h1>
              </div>
            </div>
            
            <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #fbbf24;">
              <h2 style="color: #fbbf24; margin-top: 0;">Profile Update Verification</h2>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                Hello${name}! A request to update your Golden Arrow Capital profile has been initiated. For your security, please verify this action using the code below:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #0f172a;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                This verification code will expire in <strong style="color: #fbbf24;">10 minutes</strong>. If you didn't request this profile update, please contact our support team immediately and secure your account.
              </p>
              
              <div style="background-color: #374151; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24;">
                <h3 style="color: #fbbf24; margin-top: 0;">Security Reminder</h3>
                <ul style="color: #cbd5e1; line-height: 1.8; margin: 0; padding-left: 20px;">
                  <li>Never share this code with anyone</li>
                  <li>Our team will never ask for this code</li>
                  <li>Keep your profile information secure</li>
                  <li>Contact support if you notice any suspicious activity</li>
                </ul>
              </div>
              
              <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Stay secure,<br>
                  The Golden Arrow Capital Security Team
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #64748b; font-size: 12px;">
                © 2025 Golden Arrow Capital. All rights reserved.<br>
                This is an automated security message, please do not reply to this email.
              </p>
            </div>
          </div>
        `,
        text: `
Golden Arrow Capital - Profile Update Verification

Hello${name}! A request to update your profile has been initiated. For your security, please verify this action using this code:

${otp}

This code will expire in 10 minutes. If you didn't request this profile update, please contact our support team immediately.

Security Reminder:
- Never share this code with anyone
- Our team will never ask for this code
- Keep your profile information secure
- Contact support if you notice any suspicious activity

Stay secure,
The Golden Arrow Capital Security Team

© 2025 Golden Arrow Capital. All rights reserved.
        `
      }
    };

    return templates[type];
  }

    public async sendOTP(request: EmailOTPRequest, otp: string): Promise<boolean> {
    try {
      this.initialize();

      if (!this.transporter || !this.fromAddress) {
        console.error('❌ Email service not properly configured. Cannot send OTP.');
        console.error('📧 Missing configuration:', {
          hasTransporter: !!this.transporter,
          hasFromAddress: !!this.fromAddress,
          NODE_ENV: process.env.NODE_ENV,
          EMAIL_SEND_STRICT: process.env.EMAIL_SEND_STRICT,
          hasGmailUser: !!process.env.GMAIL_SMTP_USER,
          hasGmailPass: !!process.env.GMAIL_SMTP_PASS
        });

        // In development mode, simulate email sending
        if (process.env.NODE_ENV === 'development') {
          console.log('📧 [DEV MODE] Simulating email send - OTP:', otp);
          console.log('📧 [DEV MODE] Would send to:', request.email);
          console.log('📧 [DEV MODE] Email type:', request.type);
          return true; // Always return true in development
        }

        // In production, always fail if email service is not configured
        if (process.env.NODE_ENV === 'production') {
          console.error('❌ Email service failure in production - Gmail SMTP credentials required');
          return false;
        }

        // Fallback for other environments
        const isEmailOptional = process.env.EMAIL_SEND_STRICT === 'false';
        return isEmailOptional;
      }

      const template = this.getOTPEmailTemplate(otp, request.type, request.firstName);

      await this.transporter.sendMail({
        from: this.fromAddress,
        to: request.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      });

      console.log(`📧 OTP email sent via Gmail SMTP to ${request.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP email via Gmail SMTP:', error);
      return false;
    }
  }

  public async sendWelcomeEmail(user: { email: string; firstName: string; lastName: string }): Promise<boolean> {
    try {
      this.initialize();
      
      if (!this.transporter || !this.fromAddress) {
        throw new Error('EmailService not properly initialized');
      }

      const welcomeTemplate = {
        subject: 'Welcome to Golden Arrow Capital - Your Premium Investment Journey Begins',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #0f172a; color: #ffffff;">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="background: linear-gradient(135deg, #fbbf24, #f59e0b); padding: 20px; border-radius: 10px; display: inline-block;">
                <h1 style="margin: 0; color: #0f172a; font-size: 24px;">Golden Arrow Capital</h1>
              </div>
            </div>
            
            <div style="background-color: #1e293b; padding: 30px; border-radius: 10px; border: 1px solid #fbbf24;">
              <h2 style="color: #fbbf24; margin-top: 0;">Welcome to Golden Arrow Capital, ${user.firstName}!</h2>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                Congratulations! Your account has been successfully verified and you're now part of our exclusive investment community.
              </p>
              
              <div style="background-color: #374151; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #fbbf24; margin-top: 0;">What's Next?</h3>
                <ul style="color: #cbd5e1; line-height: 1.8;">
                  <li>Explore your personalized dashboard</li>
                  <li>Review available investment plans</li>
                  <li>Set up your portfolio preferences</li>
                  <li>Start your wealth building journey</li>
                </ul>
              </div>
              
              <p style="color: #cbd5e1; line-height: 1.6;">
                Our team of financial experts is here to guide you towards exceptional returns and secure wealth management.
              </p>
              
              <div style="border-top: 1px solid #374151; margin-top: 30px; padding-top: 20px;">
                <p style="color: #64748b; font-size: 14px; margin: 0;">
                  Welcome aboard,<br>
                  The Golden Arrow Capital Team
                </p>
              </div>
            </div>
          </div>
        `,
        text: `Welcome to Golden Arrow Capital, ${user.firstName}!`
      };

      await this.transporter.sendMail({
        from: this.fromAddress,
        to: user.email,
        subject: welcomeTemplate.subject,
        html: welcomeTemplate.html,
        text: welcomeTemplate.text,
      });

      console.log(`📧 Welcome email sent via SES to ${user.email}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email via SES:', error);
      return false;
    }
  }
}

export default EmailService.getInstance(); 