import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  admitPatient,
  createIpdBed,
  createIpdRoom,
  createIpdWard,
  dischargePatient,
  listIpdAdmissions,
  listIpdBeds,
  listIpdRooms,
  listIpdWards,
} from '../api/ipdApi';

export const ipdKeys = {
  wards: (hospitalId: string, branchId: string) => ['ipd', 'wards', hospitalId, branchId] as const,
  rooms: (wardId: string) => ['ipd', 'rooms', wardId] as const,
  beds: (hospitalId: string, branchId: string, status?: string) =>
    ['ipd', 'beds', hospitalId, branchId, status ?? 'ALL'] as const,
  admissions: (hospitalId: string, branchId: string, page: number, status?: string) =>
    ['ipd', 'admissions', hospitalId, branchId, page, status ?? 'ALL'] as const,
};

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useIpdWards(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ipdKeys.wards(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listIpdWards(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIpdRooms(wardId?: string) {
  return useQuery({
    queryKey: ipdKeys.rooms(wardId ?? ''),
    queryFn: () => listIpdRooms(wardId!),
    enabled: Boolean(wardId),
  });
}

export function useIpdBeds(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: ipdKeys.beds(hospitalId ?? '', branchId ?? '', status),
    queryFn: () => listIpdBeds(hospitalId!, branchId!, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIpdAdmissions(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
) {
  return useQuery({
    queryKey: ipdKeys.admissions(hospitalId ?? '', branchId ?? '', page, status),
    queryFn: () => listIpdAdmissions(hospitalId!, branchId!, page, 20, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIpdMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['ipd', 'wards', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['ipd', 'beds', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['ipd', 'admissions', hospitalId, branchId] });
  };

  return {
    createWard: useMutation({
      mutationFn: createIpdWard,
      onSuccess: invalidateAll,
    }),
    createRoom: useMutation({
      mutationFn: createIpdRoom,
      onSuccess: () => qc.invalidateQueries({ queryKey: ['ipd', 'rooms'] }),
    }),
    createBed: useMutation({
      mutationFn: createIpdBed,
      onSuccess: invalidateAll,
    }),
    admit: useMutation({
      mutationFn: admitPatient,
      onSuccess: invalidateAll,
    }),
    discharge: useMutation({
      mutationFn: ({ admissionId, summaryText, followUpPlan }: {
        admissionId: string;
        summaryText: string;
        followUpPlan?: string;
      }) => dischargePatient(admissionId, { summaryText, followUpPlan }),
      onSuccess: invalidateAll,
    }),
  };
}
