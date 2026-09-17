import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export interface CommandCenterSnapshot {
  bedsAvailable: number;
  bedsOccupied: number;
  bedsCleaning: number;
  edActiveVisits: number;
  openTasks: number;
  overdueTasks: number;
  pendingApprovals: number;
  openFacilityWorkOrders: number;
  openBloodRequests: number;
  pendingLeaveRequests: number;
  lowStockItems: number;
  activePredictiveInsights: number;
  criticalPredictiveInsights: number;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function getCommandCenterSnapshot(
  hospitalId: string,
  branchId: string,
): Promise<CommandCenterSnapshot> {
  const { data } = await apiClient.get<ApiEnvelope<CommandCenterSnapshot>>(
    '/api/v1/command-center/snapshot',
    { params: { hospitalId, branchId } },
  );
  return unwrap(data);
}
