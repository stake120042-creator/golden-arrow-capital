import { User } from '../types/user';
import crypto from 'crypto';

class AuthService {
  private static instance: AuthService;

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Generate a secure JWT-like token (simplified for this demo)
  public generateToken(user: User): string {
    const payload = {
      id: user.id,
      email: user.email,
      username: user.username,
      iat: Date.now(),
      exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    };
    
    // In production, use proper JWT with secret key
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  // Verify token (simplified for demo)
  public verifyToken(token: string): { valid: boolean; user?: User } {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      
      if (payload.exp < Date.now()) {
        return { valid: false };
      }
      
      return {
        valid: true,
        user: {
          id: payload.id,
          email: payload.email,
          username: payload.username,
          firstName: '',
          lastName: '',
          isVerified: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      };
    } catch (error) {
      return { valid: false };
    }
  }

  // Create user after successful signup verification
  public async createUserAfterSignup(email: string, userData?: any): Promise<User> {
    // Generate unique user ID and username
    const userId = this.generateUserId();
    const username = this.generateUsername(email);
    
    const user: User = {
      id: userId,
      username: username,
      email: email.toLowerCase(),
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      sponsor: userData?.sponsor || '',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // In a real app, save to database here
    console.log(`👤 New user created: ${user.email} (${user.username})`);
    
    return user;
  }

  // Get user for login verification
  public async getUserForLogin(email: string): Promise<User | null> {
    // In a real app, fetch from database
    // For demo, create a mock user
    const user: User = {
      id: this.generateUserId(),
      username: this.generateUsername(email),
      email: email.toLowerCase(),
      firstName: 'Demo',
      lastName: 'User',
      sponsor: '',
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log(`👤 User retrieved for login: ${user.email} (${user.username})`);
    return user;
  }

  private generateUserId(): string {
    return 'user_' + crypto.randomBytes(16).toString('hex');
  }

  private generateUsername(email: string): string {
    const emailPrefix = email.split('@')[0];
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    return `${emailPrefix}_${randomSuffix}`;
  }
}

export default AuthService.getInstance(); 