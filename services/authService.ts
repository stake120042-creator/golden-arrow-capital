import { User } from '../types/user';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/database';

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
    try {
      // Generate unique user ID and username
      const userId = this.generateUserId();
      const username = this.generateUsername(email);
      
      // Hash the password
      const passwordHash = await bcrypt.hash(userData?.password || 'defaultPass123!', 12);

      // Insert user into Supabase
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            username: username,
            email: email.toLowerCase(),
            password_hash: passwordHash,
            first_name: userData?.firstName || '',
            last_name: userData?.lastName || '',
            sponsor: userData?.sponsor || '',
            is_verified: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select('id, username, email, first_name, last_name, sponsor, is_verified, created_at, updated_at')
        .single();

      if (error) {
        console.error('❌ Supabase error:', error);
        
        // Handle duplicate email error
        if (error.code === '23505' && error.message.includes('users_email_key')) {
          throw new Error('User with this email already exists');
        }
        
        // Handle duplicate username error
        if (error.code === '23505' && error.message.includes('users_username_key')) {
          throw new Error('Username already taken');
        }
        
        throw new Error(`Failed to create user: ${error.message}`);
      }

      if (!data) {
        throw new Error('Failed to create user - no data returned');
      }

      // Transform data to match User interface
      const user: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        sponsor: data.sponsor,
        isVerified: data.is_verified,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      console.log(`👤 New user created in Supabase: ${user.email} (${user.username})`);
      return user;
    } catch (error) {
      console.error('❌ Error creating user:', error);
      console.error('❌ Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        userData,
        email
      });
      throw error instanceof Error ? error : new Error(`Failed to create user account: Unknown error`);
    }
  }

  // Get user for login verification
  public async getUserForLogin(email: string): Promise<User | null> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, email, first_name, last_name, sponsor, is_verified, created_at, updated_at')
        .or(`email.eq.${email.toLowerCase()},username.eq.${email.toLowerCase()}`)
        .single();

      if (error || !data) {
        console.log(`❌ No user found for: ${email}`);
        return null;
      }

      // Transform data to match User interface
      const user: User = {
        id: data.id,
        username: data.username,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        sponsor: data.sponsor,
        isVerified: data.is_verified,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };

      console.log(`👤 User retrieved for login: ${user.email} (${user.username})`);
      return user;
    } catch (error) {
      console.error('❌ Error retrieving user:', error);
      return null;
    }
  }

  // Verify user password
  public async verifyPassword(email: string, password: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('password_hash')
        .or(`email.eq.${email.toLowerCase()},username.eq.${email.toLowerCase()}`)
        .single();

      if (error || !data) {
        return false;
      }

      const isValid = await bcrypt.compare(password, data.password_hash);
      console.log(`🔐 Password verification for ${email}:`, isValid ? 'SUCCESS' : 'FAILED');
      return isValid;
    } catch (error) {
      console.error('❌ Error verifying password:', error);
      return false;
    }
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