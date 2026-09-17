import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  listOnboardingRequests,
  updateOnboardingRequestStatus,
  type OnboardingRequestStatus,
} from '@/features/auth/api/onboardingRequestApi';

export function useOnboardingRequests(params: {
  status?: string;
  requestType?: string;
  page?: number;
}) {
  return useQuery({
    queryKey: ['admin', 'onboarding-requests', params],
    queryFn: () => listOnboardingRequests(params),
  });
}

export function useUpdateOnboardingRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status: OnboardingRequestStatus;
      adminNotes?: string;
    }) => updateOnboardingRequestStatus(id, { status, adminNotes }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'onboarding-requests'] });
    },
  });
}
