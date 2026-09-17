import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInsuranceClaim,
  createInsurancePayer,
  createInsurancePolicy,
  decideInsuranceClaim,
  decidePreAuthorization,
  listInsuranceClaims,
  listInsurancePayers,
  listInsurancePolicies,
  listPreAuthorizations,
  requestPreAuthorization,
  submitInsuranceClaim,
} from '@/features/insurance/api/insuranceApi';

export function useInsurancePayers(hospitalId?: string) {
  return useQuery({
    queryKey: ['insurance', 'payers', hospitalId],
    queryFn: () => listInsurancePayers(hospitalId!),
    enabled: Boolean(hospitalId),
  });
}

export function useInsurancePolicies(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['insurance', 'policies', hospitalId, branchId],
    queryFn: () => listInsurancePolicies({ hospitalId: hospitalId!, branchId: branchId! }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function usePreAuthorizations(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: ['insurance', 'pre-auths', hospitalId, branchId, status],
    queryFn: () =>
      listPreAuthorizations({ hospitalId: hospitalId!, branchId: branchId!, status }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useInsuranceClaims(hospitalId?: string, branchId?: string, status?: string) {
  return useQuery({
    queryKey: ['insurance', 'claims', hospitalId, branchId, status],
    queryFn: () => listInsuranceClaims({ hospitalId: hospitalId!, branchId: branchId!, status }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useInsuranceMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['insurance'] });
  };

  return {
    createPayer: useMutation({ mutationFn: createInsurancePayer, onSuccess: invalidate }),
    createPolicy: useMutation({ mutationFn: createInsurancePolicy, onSuccess: invalidate }),
    requestPreAuth: useMutation({ mutationFn: requestPreAuthorization, onSuccess: invalidate }),
    decidePreAuth: useMutation({
      mutationFn: ({
        authId,
        decision,
        approvedAmount,
      }: {
        authId: string;
        decision: string;
        approvedAmount?: number;
      }) => decidePreAuthorization(authId, { decision, approvedAmount }),
      onSuccess: invalidate,
    }),
    createClaim: useMutation({ mutationFn: createInsuranceClaim, onSuccess: invalidate }),
    submitClaim: useMutation({ mutationFn: submitInsuranceClaim, onSuccess: invalidate }),
    decideClaim: useMutation({
      mutationFn: ({
        claimId,
        decision,
        settledAmount,
      }: {
        claimId: string;
        decision: string;
        settledAmount?: number;
      }) => decideInsuranceClaim(claimId, { decision, settledAmount }),
      onSuccess: invalidate,
    }),
  };
}
