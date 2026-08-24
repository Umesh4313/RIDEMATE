import { ActionItemEntity, FleetTelemetryEntity } from '../models';
import { INITIAL_ACTION_ITEMS, INITIAL_FLEET } from '../../data/mockData';

class OperationsRepository {
  private actionItems: ActionItemEntity[] = [];
  private fleet: FleetTelemetryEntity[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed(): void {
    this.actionItems = JSON.parse(JSON.stringify(INITIAL_ACTION_ITEMS));
    this.fleet = JSON.parse(JSON.stringify(INITIAL_FLEET));
  }

  // Action Items
  async getActionItems(status?: string): Promise<ActionItemEntity[]> {
    if (status && status !== 'all') {
      return this.actionItems.filter((item) => item.status === status);
    }
    return [...this.actionItems];
  }

  async findActionItemById(id: string): Promise<ActionItemEntity | null> {
    const item = this.actionItems.find((a) => a.id === id);
    return item ? { ...item } : null;
  }

  async updateActionItemStatus(id: string, status: ActionItemEntity['status']): Promise<ActionItemEntity | null> {
    const index = this.actionItems.findIndex((a) => a.id === id);
    if (index === -1) return null;
    this.actionItems[index] = { ...this.actionItems[index], status };
    return { ...this.actionItems[index] };
  }

  // Fleet Telemetry
  async getFleetTelemetry(status?: string): Promise<FleetTelemetryEntity[]> {
    if (status && status !== 'all') {
      return this.fleet.filter((f) => f.status === status);
    }
    return [...this.fleet];
  }

  async findFleetVehicleById(id: string): Promise<FleetTelemetryEntity | null> {
    const q = id.toLowerCase().trim();
    const vehicle = this.fleet.find(
      (f) =>
        f.id.toLowerCase() === q ||
        f.code.toLowerCase() === q ||
        f.plate.toLowerCase() === q ||
        f.name.toLowerCase().includes(q)
    );
    return vehicle ? { ...vehicle } : null;
  }

  async updateFleetTelemetry(id: string, updates: Partial<FleetTelemetryEntity>): Promise<FleetTelemetryEntity | null> {
    const q = id.toLowerCase().trim();
    const index = this.fleet.findIndex(
      (f) =>
        f.id.toLowerCase() === q ||
        f.code.toLowerCase() === q ||
        f.plate.toLowerCase() === q
    );
    if (index === -1) return null;
    this.fleet[index] = { ...this.fleet[index], ...updates };
    return { ...this.fleet[index] };
  }
}

export const operationsRepository = new OperationsRepository();
