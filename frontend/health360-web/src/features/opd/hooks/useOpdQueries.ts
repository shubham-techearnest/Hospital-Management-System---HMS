import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  assignQueueDoctor,
  callQueuePatient,
  cancelQueueEntry,
  arriveAppointment,
  completeQueueService,
  createOpdDesk,
  getMyTodayOpdVisits,
  listOpdDesks,
  listOpdDoctors,
  listOpdQueue,
  registerWalkIn,
  registerOpdRequest,
  recallQueueEntry,
  skipQueueEntry,
  startQueueService,
  type CheckInAppointmentPayload,
  type CreateOpdDeskPayload,
  type WalkInRegistrationPayload,
  type OpdRequestPayload,
} from '../api/opdApi';

export type QueueActionOpts = { deskId?: string; primaryDoctorId?: string; reason?: string };

export const opdKeys = {
  desks: (hospitalId: string, branchId: string) => ['opd', 'desks', hospitalId, branchId] as const,
  queue: (hospitalId: string, branchId: string, status?: string, page = 0) =>
    ['opd', 'queue', hospitalId, branchId, status ?? 'ALL', page] as const,
  doctors: (hospitalId: string, branchId: string) => ['opd', 'doctors', hospitalId, branchId] as const,
  myToday: ['opd', 'me', 'today'] as const,
};

export function useOpdDesks(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: opdKeys.desks(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listOpdDesks(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useOpdDoctors(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: opdKeys.doctors(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listOpdDoctors(hospitalId!, branchId),
    enabled: Boolean(hospitalId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useMyTodayOpd(enabled = true) {
  return useQuery({
    queryKey: opdKeys.myToday,
    queryFn: getMyTodayOpdVisits,
    enabled,
    refetchInterval: 10_000,
  });
}

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useOpdQueue(hospitalId?: string, branchId?: string, status?: string, page = 0, size = 50) {
  return useQuery({
    queryKey: opdKeys.queue(hospitalId ?? '', branchId ?? '', status, page),
    queryFn: () => listOpdQueue({ hospitalId: hospitalId!, branchId: branchId!, status, page, size }),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
    refetchInterval: (query) => (query.state.error ? false : 8_000),
  });
}

export function useCreateOpdDesk(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOpdDeskPayload) => createOpdDesk(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: opdKeys.desks(hospitalId, branchId) }),
  });
}

export function useRegisterWalkIn(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: WalkInRegistrationPayload) => registerWalkIn(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opd', 'queue', hospitalId, branchId] });
    },
  });
}

export function useRegisterOpdRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpdRequestPayload) => registerOpdRequest(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: opdKeys.myToday });
    },
  });
}

export function useCheckInAppointment(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckInAppointmentPayload) => arriveAppointment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opd', 'queue', hospitalId, branchId] });
    },
  });
}

export function useOpdQueueActions(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['opd', 'queue', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: opdKeys.myToday });
  };

  return {
    call: useMutation({
      mutationFn: ({ queueEntryId, ...opts }: { queueEntryId: string } & QueueActionOpts) =>
        callQueuePatient(queueEntryId, opts),
      onSuccess: invalidate,
    }),
    start: useMutation({
      mutationFn: ({ queueEntryId, ...opts }: { queueEntryId: string } & QueueActionOpts) =>
        startQueueService(queueEntryId, opts),
      onSuccess: invalidate,
    }),
    complete: useMutation({ mutationFn: (queueEntryId: string) => completeQueueService(queueEntryId), onSuccess: invalidate }),
    cancel: useMutation({ mutationFn: cancelQueueEntry, onSuccess: invalidate }),
    skip: useMutation({
      mutationFn: ({ queueEntryId, ...opts }: { queueEntryId: string } & QueueActionOpts) =>
        skipQueueEntry(queueEntryId, opts),
      onSuccess: invalidate,
    }),
    recall: useMutation({
      mutationFn: ({ queueEntryId, ...opts }: { queueEntryId: string } & QueueActionOpts) =>
        recallQueueEntry(queueEntryId, opts),
      onSuccess: invalidate,
    }),
    assignDoctor: useMutation({
      mutationFn: ({ queueEntryId, primaryDoctorId }: { queueEntryId: string; primaryDoctorId: string }) =>
        assignQueueDoctor(queueEntryId, primaryDoctorId),
      onSuccess: invalidate,
    }),
  };
}
