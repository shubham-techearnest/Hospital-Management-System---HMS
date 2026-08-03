import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveVerification,
  fetchVerificationDocumentBlob,
  getVerificationReview,
  listPendingVerifications,
  rejectVerification,
} from '../api/adminDoctorApi';

export const adminDoctorKeys = {
  verifications: (status: string, page: number) => ['admin', 'doctor-verifications', status, page] as const,
  review: (doctorId: string) => ['admin', 'doctor-verification-review', doctorId] as const,
};

export function usePendingVerifications(status = 'PENDING_VERIFICATION', page = 0) {
  return useQuery({
    queryKey: adminDoctorKeys.verifications(status, page),
    queryFn: () => listPendingVerifications(status, page),
  });
}

export function useVerificationReview(doctorId: string) {
  return useQuery({
    queryKey: adminDoctorKeys.review(doctorId),
    queryFn: () => getVerificationReview(doctorId),
    enabled: !!doctorId,
  });
}

export function useApproveVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: approveVerification,
    onSuccess: (_, doctorId) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctor-verifications'] });
      queryClient.invalidateQueries({ queryKey: adminDoctorKeys.review(doctorId) });
    },
  });
}

export function useRejectVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, reason }: { doctorId: string; reason: string }) =>
      rejectVerification(doctorId, reason),
    onSuccess: (_, { doctorId }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'doctor-verifications'] });
      queryClient.invalidateQueries({ queryKey: adminDoctorKeys.review(doctorId) });
    },
  });
}

export function useFetchVerificationDocument() {
  return useMutation({
    mutationFn: ({ doctorId, documentId }: { doctorId: string; documentId: string }) =>
      fetchVerificationDocumentBlob(doctorId, documentId),
  });
}
