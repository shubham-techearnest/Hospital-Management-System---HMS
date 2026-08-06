import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  approveVerification,
  fetchVerificationDocumentBlob,
  getVerificationReview,
  listAdminReviews,
  listPendingVerifications,
  moderateReview,
  rejectVerification,
  searchAdminUsers,
  updateUserStatus,
} from '../api/adminApi';

export const adminKeys = {
  users: (params: Record<string, string | number | undefined>) => ['admin', 'users', params] as const,
  verifications: (status: string, page: number) => ['admin', 'doctor-verifications', status, page] as const,
  review: (doctorId: string) => ['admin', 'doctor-verification-review', doctorId] as const,
  reviews: (status: string, page: number) => ['admin', 'reviews', status, page] as const,
};

export function useAdminUsers(params: {
  email?: string;
  name?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () => searchAdminUsers(params),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) => updateUserStatus(userId, status),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function usePendingVerifications(status = 'PENDING_VERIFICATION', page = 0) {
  return useQuery({
    queryKey: adminKeys.verifications(status, page),
    queryFn: () => listPendingVerifications(status, page),
  });
}

export function useVerificationReview(doctorId: string) {
  return useQuery({
    queryKey: adminKeys.review(doctorId),
    queryFn: () => getVerificationReview(doctorId),
    enabled: !!doctorId,
  });
}

export function useApproveVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveVerification,
    onSuccess: (_, doctorId) => {
      qc.invalidateQueries({ queryKey: ['admin', 'doctor-verifications'] });
      qc.invalidateQueries({ queryKey: adminKeys.review(doctorId) });
    },
  });
}

export function useRejectVerification() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ doctorId, reason }: { doctorId: string; reason: string }) =>
      rejectVerification(doctorId, reason),
    onSuccess: (_, { doctorId }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'doctor-verifications'] });
      qc.invalidateQueries({ queryKey: adminKeys.review(doctorId) });
    },
  });
}

export function useFetchVerificationDocument() {
  return useMutation({
    mutationFn: ({ doctorId, documentId }: { doctorId: string; documentId: string }) =>
      fetchVerificationDocumentBlob(doctorId, documentId),
  });
}

export function useAdminReviews(status = 'visible', page = 0) {
  return useQuery({
    queryKey: adminKeys.reviews(status, page),
    queryFn: () => listAdminReviews(status, page),
  });
}

export function useModerateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reviewId, action, reason }: { reviewId: string; action: 'HIDE' | 'REMOVE'; reason: string }) =>
      moderateReview(reviewId, action, reason),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'reviews'] }),
  });
}
