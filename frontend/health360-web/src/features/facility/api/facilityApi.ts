import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';
import type { SpringPage } from '@/features/patient/api/patientExtendedApi';

export type FacilityWorkType = 'HOUSEKEEPING' | 'LAUNDRY' | 'DIETARY' | 'TRANSPORT';

export interface FacilityWorkOrder {
  workOrderId: string;
  hospitalId: string;
  branchId: string;
  workNumber: string;
  workType: FacilityWorkType | string;
  status: string;
  priority: string;
  title: string;
  description?: string;
  locationLabel?: string;
  bedId?: string;
  patientId?: string;
  openedAt: string;
  startedAt?: string;
  completedAt?: string;
  resolutionNotes?: string;
  sourceEventType?: string;
}

export const FACILITY_WORK_TYPES: FacilityWorkType[] = [
  'HOUSEKEEPING',
  'LAUNDRY',
  'DIETARY',
  'TRANSPORT',
];

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === undefined) {
    throw new Error(envelope.message ?? 'Request failed');
  }
  return envelope.data;
}

export async function listFacilityWorkOrders(params: {
  hospitalId: string;
  branchId: string;
  workType?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<SpringPage<FacilityWorkOrder>> {
  const { data } = await apiClient.get<ApiEnvelope<SpringPage<FacilityWorkOrder>>>(
    '/api/v1/facility/work-orders',
    {
      params: {
        hospitalId: params.hospitalId,
        branchId: params.branchId,
        workType: params.workType,
        status: params.status,
        page: params.page ?? 0,
        size: params.size ?? 50,
      },
    },
  );
  return unwrap(data);
}

export async function createFacilityWorkOrder(payload: {
  hospitalId: string;
  branchId: string;
  workType: string;
  title: string;
  description?: string;
  priority?: string;
  locationLabel?: string;
  bedId?: string;
}): Promise<FacilityWorkOrder> {
  const { data } = await apiClient.post<ApiEnvelope<FacilityWorkOrder>>(
    '/api/v1/facility/work-orders',
    payload,
  );
  return unwrap(data);
}

export async function startFacilityWorkOrder(workOrderId: string): Promise<FacilityWorkOrder> {
  const { data } = await apiClient.post<ApiEnvelope<FacilityWorkOrder>>(
    `/api/v1/facility/work-orders/${workOrderId}/start`,
  );
  return unwrap(data);
}

export async function completeFacilityWorkOrder(
  workOrderId: string,
  payload?: { resolutionNotes?: string; markBedAvailable?: boolean },
): Promise<FacilityWorkOrder> {
  const { data } = await apiClient.post<ApiEnvelope<FacilityWorkOrder>>(
    `/api/v1/facility/work-orders/${workOrderId}/complete`,
    payload ?? {},
  );
  return unwrap(data);
}
