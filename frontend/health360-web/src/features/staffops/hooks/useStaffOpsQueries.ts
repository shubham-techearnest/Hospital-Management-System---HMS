import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createLeaveRequest,
  createRosterEntry,
  createStaffShift,
  decideLeaveRequest,
  listAttendance,
  listLeave,
  listRoster,
  listStaffShifts,
  recordAttendance,
} from '@/features/staffops/api/staffOpsApi';

export function useStaffShifts(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['staffops', 'shifts', hospitalId, branchId],
    queryFn: () => listStaffShifts(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useStaffRoster(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['staffops', 'roster', hospitalId, branchId],
    queryFn: () => listRoster(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useStaffAttendance(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['staffops', 'attendance', hospitalId, branchId],
    queryFn: () => listAttendance(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useStaffLeave(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['staffops', 'leave', hospitalId, branchId],
    queryFn: () => listLeave(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useStaffOpsMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['staffops'] });
  };

  return {
    createShift: useMutation({ mutationFn: createStaffShift, onSuccess: invalidate }),
    createRoster: useMutation({ mutationFn: createRosterEntry, onSuccess: invalidate }),
    recordAttendance: useMutation({ mutationFn: recordAttendance, onSuccess: invalidate }),
    createLeave: useMutation({ mutationFn: createLeaveRequest, onSuccess: invalidate }),
    decideLeave: useMutation({
      mutationFn: ({
        leaveRequestId,
        decision,
      }: {
        leaveRequestId: string;
        decision: string;
      }) => decideLeaveRequest(leaveRequestId, { decision }),
      onSuccess: invalidate,
    }),
  };
}
