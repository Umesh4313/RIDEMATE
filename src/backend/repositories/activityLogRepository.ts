import { ActivityLogEntity } from '../models';
import { INITIAL_ADMIN_ACTIVITY } from '../../data/adminMockData';

class ActivityLogRepository {
  private logs: ActivityLogEntity[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed(): void {
    this.logs = JSON.parse(JSON.stringify(INITIAL_ADMIN_ACTIVITY));
  }

  async getRecent(limit: number = 50): Promise<ActivityLogEntity[]> {
    return this.logs.slice(0, limit);
  }

  async addLog(
    action: ActivityLogEntity['action'],
    title: string,
    details: string,
    user: string = 'Super Admin',
    car?: { id?: string; name?: string }
  ): Promise<ActivityLogEntity> {
    const newLog: ActivityLogEntity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      action,
      title,
      details,
      carId: car?.id,
      carName: car?.name,
      user,
      timestamp: new Date().toISOString(),
    };
    this.logs = [newLog, ...this.logs.slice(0, 99)]; // Keep latest 100
    return newLog;
  }

  async clear(): Promise<void> {
    this.logs = [];
  }
}

export const activityLogRepository = new ActivityLogRepository();
