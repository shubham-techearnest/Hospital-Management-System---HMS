import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getMyTodayOpdVisits,
  registerOpdRequest,
  type OpdRequestPayload,
} from '@/features/opd/api/opdApi';

export function useMyTodayOpd(enabled = true) {
  return useQuery({
    queryKey: ['opd', 'me', 'today'],
    queryFn: getMyTodayOpdVisits,
    enabled,
    refetchInterval: 15_000,
  });
}

export function useRegisterOpdRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OpdRequestPayload) => registerOpdRequest(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['opd', 'me', 'today'] });
    },
  });
}
