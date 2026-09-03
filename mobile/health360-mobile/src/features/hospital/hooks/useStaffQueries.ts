import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  deactivateStaff,
  getMyStaffScope,
  inviteStaff,
  listStaff,
  type InviteStaffPayload,
} from '@/features/hospital/api/staffApi';

export const staffKeys = {
  list: (hospitalId: string) => ['hospital', 'staff', hospitalId] as const,
  myScope: ['staff', 'me', 'scope'] as const,
};

export function useMyStaffScope() {
  return useQuery({
    queryKey: staffKeys.myScope,
    queryFn: getMyStaffScope,
    staleTime: 60_000,
  });
}

export function useStaffList(hospitalId?: string) {
  return useQuery({
    queryKey: staffKeys.list(hospitalId ?? ''),
    queryFn: () => listStaff(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

export function useInviteStaff(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<InviteStaffPayload, 'hospitalId'>) =>
      inviteStaff({ ...payload, hospitalId }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.list(hospitalId) });
      void queryClient.invalidateQueries({ queryKey: ['hospital', 'dashboard'] });
    },
  });
}

export function useDeactivateStaff(hospitalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deactivateStaff,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: staffKeys.list(hospitalId) });
      void queryClient.invalidateQueries({ queryKey: ['hospital', 'dashboard'] });
    },
  });
}
