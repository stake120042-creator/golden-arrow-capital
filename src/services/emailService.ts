import { EmailOTPRequest } from '../types/user';

// Mock email service for demonstration
// In production, you would use a service like SendGrid, Mailgun, or AWS SES

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

class EmailService {
  private static instance: EmailService;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private getOTPEmailTemplate(otp: string, type: 'signup' | 'login', firstName?: string): EmailTemplate {
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
      }
    };

    return templates[type];
  }

  public async sendOTP(request: EmailOTPRequest, otp: string): Promise<boolean> {
    try {
      console.log('📧 Sending OTP Email...');
      console.log('To:', request.email);
      console.log('Type:', request.type);
      console.log('OTP:', otp);

      const template = this.getOTPEmailTemplate(otp, request.type, request.firstName);

      // Simulate email sending delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock email service call
      console.log('📧 Email sent successfully!');
      console.log('Subject:', template.subject);
      console.log('Content preview:', template.text.substring(0, 100) + '...');

      // In production, you would use a real email service:
      /*
      const emailProvider = new SendGridAPI(); // or your chosen provider
      await emailProvider.send({
        to: request.email,
        from: 'noreply@goldenarrrowcapital.com',
        subject: template.subject,
        html: template.html,
        text: template.text
      });
      */

      return true;
    } catch (error) {
      console.error('❌ Failed to send OTP email:', error);
      return false;
    }
  }

  public async sendWelcomeEmail(user: { email: string; firstName: string; lastName: string }): Promise<boolean> {
    try {
      console.log('📧 Sending Welcome Email...');
      console.log('To:', user.email);

      // Mock welcome email
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
        `
      };

      // Simulate email sending
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('📧 Welcome email sent successfully!');

      return true;
    } catch (error) {
      console.error('❌ Failed to send welcome email:', error);
      return false;
    }
  }
}

export default EmailService.getInstance(); 