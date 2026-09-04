import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from './adminApi';

export interface AuditLogEntry {
  id: string;
  tenantId: string;
  userId?: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress?: string;
  occurredAt: string;
}

export async function listAdminAuditLogs(params: {
  action?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<AuditLogEntry>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<AuditLogEntry>>>('/admin/audit-logs', {
    params,
  });
  return data.data ?? { content: [], totalElements: 0, totalPages: 0, number: 0, size: 20 };
}
