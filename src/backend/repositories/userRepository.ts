import { UserEntity } from '../models';
import { hashPassword } from '../utils/crypto';

class UserRepository {
  private users: UserEntity[] = [];

  constructor() {
    this.seedDefaultUsers();
  }

  private seedDefaultUsers(): void {
    const adminPasswordHash = hashPassword('password123');
    const customerPasswordHash = hashPassword('password123');

    this.users = [
      {
        id: 'usr-admin-1',
        name: 'Ganesh J.',
        email: 'ganesh@ridemate.io',
        passwordHash: adminPasswordHash,
        role: 'admin',
        phone: '+1 (415) 555-0199',
        driverLicenseNumber: 'CA-D8829104',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr-admin-met',
        name: 'Ganesh J. (MET)',
        email: 'ganeshj.bca_iom@bkc.met.edu',
        passwordHash: adminPasswordHash,
        role: 'admin',
        phone: '+1 (415) 555-0199',
        driverLicenseNumber: 'CA-D8829104',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr-ops-1',
        name: 'Marcus Vance',
        email: 'ops@ridemate.io',
        passwordHash: adminPasswordHash,
        role: 'operations',
        phone: '+1 (415) 555-0144',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'usr-customer-1',
        name: 'Sophia Laurent',
        email: 'sophia@example.com',
        passwordHash: customerPasswordHash,
        role: 'customer',
        phone: '+1 (415) 555-0182',
        driverLicenseNumber: 'CA-L994821',
        createdAt: '2026-02-10T12:00:00.000Z',
        updatedAt: '2026-02-10T12:00:00.000Z',
      },
    ];
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const normalized = email.toLowerCase().trim();
    const user = this.users.find((u) => u.email.toLowerCase() === normalized);
    return user ? { ...user } : null;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.find((u) => u.id === id);
    return user ? { ...user } : null;
  }

  async create(user: Omit<UserEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserEntity> {
    const newUser: UserEntity = {
      ...user,
      id: `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.users.push(newUser);
    return { ...newUser };
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const index = this.users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    const updated: UserEntity = {
      ...this.users[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.users[index] = updated;
    return { ...updated };
  }

  async setResetCode(email: string, code: string, expiresInMinutes: number = 15): Promise<boolean> {
    const user = await this.findByEmail(email);
    if (!user) return false;
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000).toISOString();
    await this.update(user.id, {
      resetCode: code,
      resetCodeExpiresAt: expiresAt,
    });
    return true;
  }
}

export const userRepository = new UserRepository();
