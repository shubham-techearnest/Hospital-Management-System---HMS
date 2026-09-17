import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeBloodRequest,
  createBloodRequest,
  decideBloodRequest,
  issueBloodRequest,
  listBloodRequests,
  listBloodUnits,
  receiveBloodUnit,
  returnBloodRequest,
} from '@/features/blood/api/bloodApi';

export function useBloodUnits(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: ['blood', 'units', hospitalId, branchId, status],
    queryFn: () => listBloodUnits(hospitalId!, branchId!, status),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useBloodRequests(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: ['blood', 'requests', hospitalId, branchId, status],
    queryFn: () => listBloodRequests(hospitalId!, branchId!, status),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useBloodMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['blood'] });
  };

  return {
    receiveUnit: useMutation({
      mutationFn: receiveBloodUnit,
      onSuccess: invalidate,
    }),
    createRequest: useMutation({
      mutationFn: createBloodRequest,
      onSuccess: invalidate,
    }),
    decide: useMutation({
      mutationFn: ({
        requestId,
        decision,
      }: {
        requestId: string;
        decision: string;
      }) => decideBloodRequest(requestId, { decision }),
      onSuccess: invalidate,
    }),
    issue: useMutation({
      mutationFn: ({ requestId, unitId }: { requestId: string; unitId?: string }) =>
        issueBloodRequest(requestId, unitId),
      onSuccess: invalidate,
    }),
    returnIssued: useMutation({
      mutationFn: (requestId: string) => returnBloodRequest(requestId),
      onSuccess: invalidate,
    }),
    complete: useMutation({
      mutationFn: (requestId: string) => completeBloodRequest(requestId),
      onSuccess: invalidate,
    }),
    hospitalId,
    branchId,
  };
}
