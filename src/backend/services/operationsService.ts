import { operationsRepository } from '../repositories/operationsRepository';
import { activityLogRepository } from '../repositories/activityLogRepository';
import { ActionItemEntity, FleetTelemetryEntity } from '../models';
import { NotFoundError } from '../utils/errors';

class OperationsService {
  async getTelemetry(status?: string): Promise<FleetTelemetryEntity[]> {
    return operationsRepository.getFleetTelemetry(status);
  }

  async executeRemoteCommand(vehicleId: string, command: string, staffName: string = 'Operations Staff'): Promise<{ success: boolean; message: string; vehicle: FleetTelemetryEntity | null }> {
    const vehicle = await operationsRepository.findFleetVehicleById(vehicleId);
    if (!vehicle) {
      throw new NotFoundError(`Fleet vehicle with ID '${vehicleId}' not found in telematics network.`);
    }

    let message = '';
    switch (command) {
      case 'lock':
        message = `Doors securely locked on ${vehicle.name} (${vehicle.plate}).`;
        break;
      case 'unlock':
        message = `Doors unlocked remotely on ${vehicle.name} (${vehicle.plate}).`;
        break;
      case 'honk':
        message = `Horn & light locator triggered on ${vehicle.name}.`;
        break;
      case 'immobilize':
        message = `Remote ignition cutoff activated for ${vehicle.name}. Vehicle cannot be started until cleared.`;
        break;
      default:
        message = `Command '${command}' executed on ${vehicle.name}.`;
    }

    await activityLogRepository.addLog(
      'status_change',
      `Telemetry Command: ${command.toUpperCase()}`,
      `${staffName} executed remote '${command}' on ${vehicle.name} (${vehicle.plate}).`,
      staffName
    );

    return {
      success: true,
      message,
      vehicle,
    };
  }

  async getActionItems(status?: string): Promise<ActionItemEntity[]> {
    return operationsRepository.getActionItems(status);
  }

  async updateActionItem(id: string, status: ActionItemEntity['status'], staffName: string = 'Staff'): Promise<ActionItemEntity> {
    const updated = await operationsRepository.updateActionItemStatus(id, status);
    if (!updated) {
      throw new NotFoundError(`Action item with ID '${id}' not found.`);
    }

    await activityLogRepository.addLog(
      'update',
      `Action Item ${status.toUpperCase()}`,
      `Item '${updated.title}' (${updated.userOrVehicle}) marked as ${status} by ${staffName}.`,
      staffName
    );

    return updated;
  }
}

export const operationsService = new OperationsService();
