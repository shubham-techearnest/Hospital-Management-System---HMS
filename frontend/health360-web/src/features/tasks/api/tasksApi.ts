import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export interface WorkItem {
  id: string;
  hospitalId: string;
  branchId?: string;
  taskType: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  patientId?: string;
  encounterId?: string;
  assignedUserId?: string;
  assignedRole?: string;
  sourceEventType?: string;
  sourceEntityType?: string;
  sourceEntityId?: string;
  dueAt?: string;
  startedAt?: string;
  completedAt?: string;
  createdAt?: string;
}

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export interface MyWorkSummary {
  urgent: number;
  today: number;
  overdue: number;
  pending: number;
  openTotal: number;
}

export async function listMyWork(params: {
  hospitalId: string;
  status?: string;
  queue?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<WorkItem>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<WorkItem>>>('/api/v1/tasks/my-work', {
    params: {
      hospitalId: params.hospitalId,
      status: params.status || undefined,
      queue: params.queue || undefined,
      page: params.page ?? 0,
      size: params.size ?? 20,
    },
  });
  return unwrap(data);
}

export async function getMyWorkSummary(hospitalId: string): Promise<MyWorkSummary> {
  const { data } = await apiClient.get<ApiEnvelope<MyWorkSummary>>('/api/v1/tasks/my-work/summary', {
    params: { hospitalId },
  });
  return unwrap(data);
}

export async function updateWorkItemStatus(taskId: string, status: string): Promise<WorkItem> {
  const { data } = await apiClient.patch<ApiEnvelope<WorkItem>>(`/api/v1/tasks/${taskId}/status`, {
    status,
  });
  return unwrap(data);
}
