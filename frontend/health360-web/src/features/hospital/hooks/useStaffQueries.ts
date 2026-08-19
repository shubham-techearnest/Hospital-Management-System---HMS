import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deactivateStaff, inviteStaff, listStaff, type InviteStaffPayload } from '../api/staffApi';

export const staffKeys = {
  list: (hospitalId: string) => ['hospital', 'staff', hospitalId] as const,
};

export function useStaffList(hospitalId?: string) {
  return useQuery({
    queryKey: staffKeys.list(hospitalId ?? ''),
    queryFn: () => listStaff(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

export function useInviteStaff(hospitalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<InviteStaffPayload, 'hospitalId'>) =>
      inviteStaff({ ...payload, hospitalId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: staffKeys.list(hospitalId) }),
  });
}

export function useDeactivateStaff(hospitalId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deactivateStaff,
    onSuccess: () => qc.invalidateQueries({ queryKey: staffKeys.list(hospitalId) }),
  });
}
