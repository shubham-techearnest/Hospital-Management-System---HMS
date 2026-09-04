import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  addIpdRound,
  admitPatient,
  createIpdBed,
  createIpdRoom,
  createIpdWard,
  dischargePatient,
  getIpdAdmission,
  listIpdAdmissions,
  listIpdBeds,
  listIpdRooms,
  listIpdRounds,
  listIpdWards,
  transferIpdBed,
} from '../api/ipdApi';

export const ipdKeys = {
  wards: (hospitalId: string, branchId: string) => ['ipd', 'wards', hospitalId, branchId] as const,
  rooms: (wardId: string) => ['ipd', 'rooms', wardId] as const,
  beds: (hospitalId: string, branchId: string, status?: string) =>
    ['ipd', 'beds', hospitalId, branchId, status ?? 'ALL'] as const,
  admissions: (hospitalId: string, branchId: string, page: number, status?: string, size = 20) =>
    ['ipd', 'admissions', hospitalId, branchId, page, status ?? 'ALL', size] as const,
  admission: (admissionId: string) => ['ipd', 'admission', admissionId] as const,
  rounds: (admissionId: string) => ['ipd', 'rounds', admissionId] as const,
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
  size = 20,
) {
  return useQuery({
    queryKey: ipdKeys.admissions(hospitalId ?? '', branchId ?? '', page, status, size),
    queryFn: () => listIpdAdmissions(hospitalId!, branchId!, page, size, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIpdAdmission(admissionId?: string) {
  return useQuery({
    queryKey: ipdKeys.admission(admissionId ?? ''),
    queryFn: () => getIpdAdmission(admissionId!),
    enabled: Boolean(admissionId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIpdRounds(admissionId?: string) {
  return useQuery({
    queryKey: ipdKeys.rounds(admissionId ?? ''),
    queryFn: () => listIpdRounds(admissionId!),
    enabled: Boolean(admissionId),
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
    transferBed: useMutation({
      mutationFn: ({ admissionId, bedId, reason }: {
        admissionId: string;
        bedId: string;
        reason?: string;
      }) => transferIpdBed(admissionId, { bedId, reason }),
      onSuccess: (_data, vars) => {
        invalidateAll();
        qc.invalidateQueries({ queryKey: ipdKeys.admission(vars.admissionId) });
      },
    }),
    addRound: useMutation({
      mutationFn: ({ admissionId, roundType, notes }: {
        admissionId: string;
        roundType: string;
        notes: string;
      }) => addIpdRound(admissionId, { roundType, notes }),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: ipdKeys.rounds(vars.admissionId) });
        qc.invalidateQueries({ queryKey: ipdKeys.admission(vars.admissionId) });
      },
    }),
  };
}
