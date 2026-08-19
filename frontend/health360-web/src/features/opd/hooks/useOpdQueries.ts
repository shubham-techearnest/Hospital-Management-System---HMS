import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  callQueuePatient,
  cancelQueueEntry,
  checkInAppointment,
  completeQueueService,
  createOpdDesk,
  listOpdDesks,
  listOpdQueue,
  registerWalkIn,
  startQueueService,
  type CheckInAppointmentPayload,
  type CreateOpdDeskPayload,
  type WalkInRegistrationPayload,
} from '../api/opdApi';

export const opdKeys = {
  desks: (hospitalId: string, branchId: string) => ['opd', 'desks', hospitalId, branchId] as const,
  queue: (hospitalId: string, branchId: string, status?: string, page = 0) =>
    ['opd', 'queue', hospitalId, branchId, status ?? 'ALL', page] as const,
};

export function useOpdDesks(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: opdKeys.desks(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listOpdDesks(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
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
    refetchInterval: (query) => (query.state.error ? false : 15_000),
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

export function useCheckInAppointment(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CheckInAppointmentPayload) => checkInAppointment(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['opd', 'queue', hospitalId, branchId] });
    },
  });
}

export function useOpdQueueActions(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: ['opd', 'queue', hospitalId, branchId] });

  return {
    call: useMutation({ mutationFn: (queueEntryId: string) => callQueuePatient(queueEntryId), onSuccess: invalidate }),
    start: useMutation({ mutationFn: startQueueService, onSuccess: invalidate }),
    complete: useMutation({ mutationFn: completeQueueService, onSuccess: invalidate }),
    cancel: useMutation({ mutationFn: cancelQueueEntry, onSuccess: invalidate }),
  };
}
