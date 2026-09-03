import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  assignQueueDoctor,
  callQueuePatient,
  cancelQueueEntry,
  completeQueueService,
  listOpdDoctors,
  listOpdQueue,
  recallQueueEntry,
  registerWalkIn,
  skipQueueEntry,
  startQueueService,
  type WalkInRegistrationPayload,
} from '@/features/opd/api/opdApi';

export type QueueActionOpts = { deskId?: string; primaryDoctorId?: string; reason?: string };

export const opdStaffKeys = {
  queue: (hospitalId: string, branchId: string, status?: string) =>
    ['opd', 'queue', hospitalId, branchId, status ?? 'ALL'] as const,
  doctors: (hospitalId: string, branchId: string) => ['opd', 'doctors', hospitalId, branchId] as const,
};

export function useOpdQueue(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: opdStaffKeys.queue(hospitalId ?? '', branchId ?? '', status),
    queryFn: () =>
      listOpdQueue({
        hospitalId: hospitalId!,
        branchId: branchId!,
        status,
        page: 0,
        size: 50,
      }),
    enabled: Boolean(hospitalId && branchId),
    refetchInterval: 8_000,
  });
}

export function useOpdDoctors(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: opdStaffKeys.doctors(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listOpdDoctors(hospitalId!, branchId),
    enabled: Boolean(hospitalId),
  });
}

export function useOpdQueueActions(hospitalId: string, branchId: string) {
  const queryClient = useQueryClient();
  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ['opd', 'queue', hospitalId, branchId] });
    void queryClient.invalidateQueries({ queryKey: ['opd', 'me', 'today'] });
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
    complete: useMutation({
      mutationFn: (queueEntryId: string) => completeQueueService(queueEntryId),
      onSuccess: invalidate,
    }),
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
    cancel: useMutation({
      mutationFn: (queueEntryId: string) => cancelQueueEntry(queueEntryId),
      onSuccess: invalidate,
    }),
  };
}

export function useRegisterWalkIn(hospitalId: string, branchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<WalkInRegistrationPayload, 'hospitalId' | 'branchId'>) =>
      registerWalkIn({ ...payload, hospitalId, branchId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['opd', 'queue', hospitalId, branchId] });
      void queryClient.invalidateQueries({ queryKey: ['hospital', 'dashboard'] });
    },
  });
}
