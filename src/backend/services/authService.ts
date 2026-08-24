import { userRepository } from '../repositories/userRepository';
import { UserEntity } from '../models';
import { hashPassword, comparePassword, generateToken } from '../utils/crypto';
import { UnauthorizedError, ConflictError, NotFoundError, ValidationError } from '../utils/errors';
import { activityLogRepository } from '../repositories/activityLogRepository';

export interface AuthResult {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    phone?: string;
    driverLicenseNumber?: string;
  };
  token: string;
}

class AuthService {
  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    driverLicenseNumber?: string;
    role?: 'admin' | 'operations' | 'customer';
  }): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError(`An account with email '${data.email}' already exists.`);
    }

    const passwordHash = hashPassword(data.password);
    const userRole = data.role || 'customer';

    const newUser = await userRepository.create({
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      passwordHash,
      role: userRole,
      phone: data.phone?.trim(),
      driverLicenseNumber: data.driverLicenseNumber?.trim(),
    });

    await activityLogRepository.addLog(
      'create',
      'New User Registration',
      `Registered user '${newUser.name}' (${newUser.email}) with role '${newUser.role}'.`,
      newUser.name
    );

    const token = generateToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
        driverLicenseNumber: newUser.driverLicenseNumber,
      },
      token,
    };
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const isValid = comparePassword(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password.');
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        driverLicenseNumber: user.driverLicenseNumber,
      },
      token,
    };
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Return success message to prevent user enumeration
      return { message: 'If an account exists, a 6-digit verification code has been dispatched.' };
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    await userRepository.setResetCode(email, resetCode, 15);

    await activityLogRepository.addLog(
      'update',
      'Password Reset Requested',
      `Password reset code issued for ${user.email}.`,
      user.name
    );

    return { message: `A 6-digit security reset code has been dispatched to ${email}` };
  }

  async resetPassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.resetCode) {
      throw new ValidationError('Invalid or expired reset code.');
    }

    if (user.resetCode !== code.trim()) {
      throw new ValidationError('Invalid verification code.');
    }

    if (user.resetCodeExpiresAt && new Date(user.resetCodeExpiresAt).getTime() < Date.now()) {
      throw new ValidationError('Reset code has expired. Please request a new one.');
    }

    const newHash = hashPassword(newPassword);
    await userRepository.update(user.id, {
      passwordHash: newHash,
      resetCode: undefined,
      resetCodeExpiresAt: undefined,
    });

    await activityLogRepository.addLog(
      'update',
      'Password Reset Completed',
      `Password successfully reset for account ${user.email}.`,
      user.name
    );

    return { message: 'Password has been reset successfully. You can now log in.' };
  }

  async getProfile(userId: string): Promise<UserEntity> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User account not found.');
    }
    return user;
  }
}

export const authService = new AuthService();
