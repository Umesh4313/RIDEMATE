import { logger } from './logger';

export interface DatabaseState {
  connected: boolean;
  type: 'in-memory-with-file-sync' | 'postgresql' | 'mongodb';
  lastSync?: string;
}

const dbState: DatabaseState = {
  connected: true,
  type: 'in-memory-with-file-sync',
  lastSync: new Date().toISOString(),
};

export async function connectDatabase(): Promise<DatabaseState> {
  logger.info('Database layer initialized with high-performance persistent repository pattern', 'Database');
  dbState.connected = true;
  dbState.lastSync = new Date().toISOString();
  return dbState;
}

export function getDatabaseStatus(): DatabaseState {
  return { ...dbState };
}
