import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  addIpdRound,
  admitPatient,
  approveAdmissionRequest as approveAdmissionRequestApi,
  cancelAdmissionRequest as cancelAdmissionRequestApi,
  createAdmissionRequest as createAdmissionRequestApi,
  createIpdBed,
  createIpdRoom,
  createIpdWard,
  dischargePatient,
  getAdmissionRequestCatalogs,
  getIpdAdmission,
  listAdmissionRequests,
  listIpdAdmissions,
  listIpdBeds,
  listIpdRooms,
  listIpdRounds,
  listIpdWards,
  rejectAdmissionRequest as rejectAdmissionRequestApi,
  reserveAdmissionBed as reserveAdmissionBedApi,
  scheduleAdmissionRequest as scheduleAdmissionRequestApi,
  startReviewAdmissionRequest as startReviewAdmissionRequestApi,
  transferIpdBed,
  updateIpdBedStatus,
  listMedicationReconciliations,
  createMedicationReconciliation as createMedicationReconciliationApi,
  escalateAdmissionToIcu,
  stepDownAdmissionFromIcu,
  updateIpdIsolation,
  listIpdBloodRequests,
  createIpdBloodRequest,
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
  admissionRequests: (hospitalId: string, branchId: string, page: number, status?: string) =>
    ['ipd', 'admission-requests', hospitalId, branchId, page, status ?? 'ALL'] as const,
  admissionRequestCatalogs: ['ipd', 'admission-request-catalogs'] as const,
  medReconciliations: (admissionId: string) => ['ipd', 'med-reconciliations', admissionId] as const,
  bloodRequests: (admissionId: string) => ['ipd', 'blood-requests', admissionId] as const,
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

export function useAdmissionRequestCatalogs(enabled = true) {
  return useQuery({
    queryKey: ipdKeys.admissionRequestCatalogs,
    queryFn: getAdmissionRequestCatalogs,
    enabled,
    staleTime: 60_000,
  });
}

export function useAdmissionRequests(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
) {
  return useQuery({
    queryKey: ipdKeys.admissionRequests(hospitalId ?? '', branchId ?? '', page, status),
    queryFn: () => listAdmissionRequests(hospitalId!, branchId!, page, 20, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useMedicationReconciliations(admissionId?: string) {
  return useQuery({
    queryKey: ipdKeys.medReconciliations(admissionId ?? ''),
    queryFn: () => listMedicationReconciliations(admissionId!),
    enabled: Boolean(admissionId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIpdBloodRequests(admissionId?: string, enabled = true) {
  return useQuery({
    queryKey: ipdKeys.bloodRequests(admissionId ?? ''),
    queryFn: () => listIpdBloodRequests(admissionId!),
    enabled: Boolean(admissionId) && enabled,
    retry: (_, error) => isRetryableError(error),
  });
}

export function useIpdMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidateAll = () => {
    qc.invalidateQueries({ queryKey: ['ipd', 'wards', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['ipd', 'beds', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['ipd', 'admissions', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['ipd', 'admission-requests', hospitalId, branchId] });
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
    updateBedStatus: useMutation({
      mutationFn: ({ bedId, status, reason }: { bedId: string; status: string; reason?: string }) =>
        updateIpdBedStatus(bedId, { status, reason }),
      onSuccess: invalidateAll,
    }),
    admit: useMutation({
      mutationFn: admitPatient,
      onSuccess: invalidateAll,
    }),
    createAdmissionRequest: useMutation({
      mutationFn: createAdmissionRequestApi,
      onSuccess: invalidateAll,
    }),
    approveAdmissionRequest: useMutation({
      mutationFn: ({ requestId, reviewNotes }: { requestId: string; reviewNotes?: string }) =>
        approveAdmissionRequestApi(requestId, { reviewNotes }),
      onSuccess: invalidateAll,
    }),
    rejectAdmissionRequest: useMutation({
      mutationFn: ({ requestId, rejectionReason }: { requestId: string; rejectionReason: string }) =>
        rejectAdmissionRequestApi(requestId, { rejectionReason }),
      onSuccess: invalidateAll,
    }),
    scheduleAdmissionRequest: useMutation({
      mutationFn: ({
        requestId,
        scheduledAdmitAt,
      }: {
        requestId: string;
        scheduledAdmitAt: string;
      }) => scheduleAdmissionRequestApi(requestId, { scheduledAdmitAt }),
      onSuccess: invalidateAll,
    }),
    cancelAdmissionRequest: useMutation({
      mutationFn: (requestId: string) => cancelAdmissionRequestApi(requestId),
      onSuccess: invalidateAll,
    }),
    startReviewAdmissionRequest: useMutation({
      mutationFn: (requestId: string) => startReviewAdmissionRequestApi(requestId),
      onSuccess: invalidateAll,
    }),
    reserveAdmissionBed: useMutation({
      mutationFn: ({ requestId, bedId }: { requestId: string; bedId: string }) =>
        reserveAdmissionBedApi(requestId, { bedId }),
      onSuccess: invalidateAll,
    }),
    createMedicationReconciliation: useMutation({
      mutationFn: ({
        admissionId,
        ...payload
      }: {
        admissionId: string;
        reconType: string;
        summaryText?: string;
        decisions: Array<{
          medicationName: string;
          action: string;
          notes?: string;
          dose?: string;
          frequency?: string;
        }>;
      }) => createMedicationReconciliationApi(admissionId, payload),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: ipdKeys.medReconciliations(vars.admissionId) });
      },
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
    escalateToIcu: useMutation({
      mutationFn: ({
        admissionId,
        icuBedId,
        primaryDoctorId,
        reason,
      }: {
        admissionId: string;
        icuBedId: string;
        primaryDoctorId?: string;
        reason?: string;
      }) => escalateAdmissionToIcu(admissionId, { icuBedId, primaryDoctorId, reason }),
      onSuccess: (_data, vars) => {
        invalidateAll();
        qc.invalidateQueries({ queryKey: ipdKeys.admission(vars.admissionId) });
        qc.invalidateQueries({ queryKey: ['icu'] });
      },
    }),
    stepDownFromIcu: useMutation({
      mutationFn: ({
        admissionId,
        wardBedId,
        reason,
      }: {
        admissionId: string;
        wardBedId: string;
        reason?: string;
      }) => stepDownAdmissionFromIcu(admissionId, { wardBedId, reason }),
      onSuccess: (_data, vars) => {
        invalidateAll();
        qc.invalidateQueries({ queryKey: ipdKeys.admission(vars.admissionId) });
        qc.invalidateQueries({ queryKey: ['icu'] });
      },
    }),
    updateIsolation: useMutation({
      mutationFn: ({
        admissionId,
        isolationRequired,
        careLevel,
      }: {
        admissionId: string;
        isolationRequired?: boolean;
        careLevel?: string;
      }) => updateIpdIsolation(admissionId, { isolationRequired, careLevel }),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: ipdKeys.admission(vars.admissionId) });
      },
    }),
    createBloodRequest: useMutation({
      mutationFn: ({
        admissionId,
        ...payload
      }: {
        admissionId: string;
        productType: string;
        units?: number;
        urgency?: string;
        indication?: string;
        notes?: string;
      }) => createIpdBloodRequest(admissionId, payload),
      onSuccess: (_data, vars) => {
        qc.invalidateQueries({ queryKey: ipdKeys.bloodRequests(vars.admissionId) });
      },
    }),
  };
}
