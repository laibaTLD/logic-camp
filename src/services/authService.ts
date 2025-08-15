import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { User } from '../models';
import { logger } from '../utils/logger';
import { ValidationError } from '../utils/errors';

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserRegistration {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'manager' | 'member';
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
  user: {
    id: number;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
}

export interface JwtPayload {
  userId: number;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export class AuthService {
  private static instance: AuthService;
  private readonly jwtSecret: Uint8Array;
  private readonly jwtExpiresIn: string;

  private constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
    }
    
    this.jwtSecret = new TextEncoder().encode(secret);
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  /**
   * Register a new user
   */
  public async register(userData: UserRegistration): Promise<AuthToken> {
    try {
      logger.auth('registration', undefined, true);

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email: userData.email } });
      if (existingUser) {
        throw new ValidationError('User with this email already exists');
      }

      // Validate password strength
      this.validatePassword(userData.password);

      // Create user
      const user = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'member',
        emailVerified: false, // Require email verification in production
      });

      // Generate JWT token
      const token = await this.generateToken(user);

      logger.auth('registration', user.id, true);
      
      return {
        token,
        expiresAt: new Date(Date.now() + this.getTokenExpiryMs()),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      logger.auth('registration', undefined, false, error as Error);
      throw error;
    }
  }

  /**
   * Authenticate user login
   */
  public async login(credentials: UserCredentials): Promise<AuthToken> {
    try {
      logger.auth('login', undefined, true);

      // Find user by email
      const user = await User.findOne({ where: { email: credentials.email } });
      if (!user) {
        throw new ValidationError('Invalid email or password');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new ValidationError('Account is deactivated');
      }

      // Verify password
      const isValidPassword = await user.comparePassword(credentials.password);
      if (!isValidPassword) {
        throw new ValidationError('Invalid email or password');
      }

      // Update last login
      await user.update({ lastLoginAt: new Date() });

      // Generate JWT token
      const token = await this.generateToken(user);

      logger.auth('login', user.id, true);
      
      return {
        token,
        expiresAt: new Date(Date.now() + this.getTokenExpiryMs()),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      logger.auth('login', undefined, false, error as Error);
      throw error;
    }
  }

  /**
   * Verify JWT token and return user data
   */
  public async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const { payload } = await jwtVerify(token, this.jwtSecret);
      
      if (!payload.userId || !payload.email || !payload.role) {
        throw new ValidationError('Invalid token payload');
      }

      // Check if user still exists and is active
      const user = await User.findByPk(payload.userId as number);
      if (!user || !user.isActive) {
        throw new ValidationError('User not found or inactive');
      }

      return payload as JwtPayload;
    } catch (error) {
      logger.auth('token_verification', undefined, false, error as Error);
      throw new ValidationError('Invalid or expired token');
    }
  }

  /**
   * Refresh JWT token
   */
  public async refreshToken(token: string): Promise<AuthToken> {
    try {
      const payload = await this.verifyToken(token);
      
      // Get fresh user data
      const user = await User.findByPk(payload.userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      // Generate new token
      const newToken = await this.generateToken(user);

      return {
        token: newToken,
        expiresAt: new Date(Date.now() + this.getTokenExpiryMs()),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
      };
    } catch (error) {
      logger.auth('token_refresh', undefined, false, error as Error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  public async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new ValidationError('User not found');
      }

      // Verify current password
      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        throw new ValidationError('Current password is incorrect');
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Update password
      await user.update({ password: newPassword });

      logger.auth('password_change', userId, true);
    } catch (error) {
      logger.auth('password_change', userId, false, error as Error);
      throw error;
    }
  }

  /**
   * Reset password (forgot password flow)
   */
  public async resetPassword(email: string): Promise<void> {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal if user exists or not
        logger.auth('password_reset_request', undefined, true);
        return;
      }

      // Generate reset token
      const resetToken = this.generateRandomToken();
      const resetExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      await user.update({
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      });

      // TODO: Send email with reset link
      logger.info('Password reset email sent', { email, resetToken });

      logger.auth('password_reset_request', user.id, true);
    } catch (error) {
      logger.auth('password_reset_request', undefined, false, error as Error);
      throw error;
    }
  }

  /**
   * Complete password reset with token
   */
  public async completePasswordReset(token: string, newPassword: string): Promise<void> {
    try {
      const user = await User.findOne({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { [require('sequelize').Op.gt]: new Date() },
        },
      });

      if (!user) {
        throw new ValidationError('Invalid or expired reset token');
      }

      // Validate new password
      this.validatePassword(newPassword);

      // Update password and clear reset token
      await user.update({
        password: newPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
      });

      logger.auth('password_reset_complete', user.id, true);
    } catch (error) {
      logger.auth('password_reset_complete', undefined, false, error as Error);
      throw error;
    }
  }

  /**
   * Generate JWT token
   */
  private async generateToken(user: User): Promise<string> {
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    return new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.jwtExpiresIn)
      .sign(this.jwtSecret);
  }

  /**
   * Validate password strength
   */
  private validatePassword(password: string): void {
    if (password.length < 8) {
      throw new ValidationError('Password must be at least 8 characters long');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new ValidationError('Password must contain at least one number');
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      throw new ValidationError('Password must contain at least one special character (@$!%*?&)');
    }
  }

  /**
   * Generate random token for password reset
   */
  private generateRandomToken(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }

  /**
   * Get token expiry time in milliseconds
   */
  private getTokenExpiryMs(): number {
    const match = this.jwtExpiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default: 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'h': return value * 60 * 60 * 1000;
      case 'm': return value * 60 * 1000;
      case 's': return value * 1000;
      default: return 7 * 24 * 60 * 60 * 1000;
    }
  }
}

export default AuthService.getInstance();
