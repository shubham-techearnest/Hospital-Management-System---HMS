import { useQuery } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  listIcuActiveStays,
  listLabPendingWorklist,
  listNursingAdmissions,
  listOtPendingWorklist,
  listPharmacyPendingWorklist,
  listRadiologyPendingWorklist,
  type StaffWorklistRow,
} from '../api/staffWorklistApi';

export type StaffWorklistKind = 'lab' | 'radiology' | 'pharmacy' | 'ot' | 'nursing' | 'icu';

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

async function fetchWorklist(
  kind: StaffWorklistKind,
  hospitalId: string,
  branchId: string,
): Promise<StaffWorklistRow[]> {
  switch (kind) {
    case 'lab':
      return listLabPendingWorklist(hospitalId, branchId);
    case 'radiology':
      return listRadiologyPendingWorklist(hospitalId, branchId);
    case 'pharmacy':
      return listPharmacyPendingWorklist(hospitalId, branchId);
    case 'ot':
      return listOtPendingWorklist(hospitalId, branchId);
    case 'nursing':
      return listNursingAdmissions(hospitalId, branchId);
    case 'icu':
      return listIcuActiveStays(hospitalId, branchId);
    default:
      return [];
  }
}

export function useStaffWorklist(
  kind: StaffWorklistKind,
  hospitalId?: string,
  branchId?: string,
) {
  return useQuery({
    queryKey: ['staff', 'worklist', kind, hospitalId ?? '', branchId ?? ''],
    queryFn: () => fetchWorklist(kind, hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => !isAuthError(error),
    refetchInterval: 30_000,
  });
}
