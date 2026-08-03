import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listAdminReviews,
  moderateReview,
  searchAdminUsers,
  updateUserStatus,
} from '../api/adminUserApi';

export const adminExtendedKeys = {
  users: (params: Record<string, string | number | undefined>) => ['admin', 'users', params] as const,
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
    queryKey: adminExtendedKeys.users(params),
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

export function useAdminReviews(status = 'visible', page = 0) {
  return useQuery({
    queryKey: adminExtendedKeys.reviews(status, page),
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
