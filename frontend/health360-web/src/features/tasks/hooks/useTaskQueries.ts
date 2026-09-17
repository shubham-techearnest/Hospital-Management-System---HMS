import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMyWorkSummary, listMyWork, updateWorkItemStatus } from '../api/tasksApi';

export const taskKeys = {
  myWork: (hospitalId: string, status?: string, queue?: string) =>
    ['tasks', 'my-work', hospitalId, status ?? '', queue ?? ''] as const,
  summary: (hospitalId: string) => ['tasks', 'my-work-summary', hospitalId] as const,
};

export function useMyWork(hospitalId?: string, status?: string, queue?: string) {
  return useQuery({
    queryKey: taskKeys.myWork(hospitalId ?? '', status, queue),
    queryFn: () => listMyWork({ hospitalId: hospitalId!, status, queue, size: 50 }),
    enabled: Boolean(hospitalId),
  });
}

export function useMyWorkSummary(hospitalId?: string) {
  return useQuery({
    queryKey: taskKeys.summary(hospitalId ?? ''),
    queryFn: () => getMyWorkSummary(hospitalId!),
    enabled: Boolean(hospitalId),
    refetchInterval: 60_000,
  });
}

export function useUpdateWorkItemStatus(hospitalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, status }: { taskId: string; status: string }) =>
      updateWorkItemStatus(taskId, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['tasks', 'my-work', hospitalId] });
      void qc.invalidateQueries({ queryKey: ['tasks', 'my-work-summary', hospitalId] });
    },
  });
}
