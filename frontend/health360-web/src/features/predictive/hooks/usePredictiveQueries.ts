import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  acknowledgePredictiveInsight,
  listPredictiveInsights,
  refreshPredictiveInsights,
} from '@/features/predictive/api/predictiveApi';

export function usePredictiveInsights(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['predictive', 'insights', hospitalId, branchId],
    queryFn: () => listPredictiveInsights(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function usePredictiveMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['predictive'] });
    void qc.invalidateQueries({ queryKey: ['command-center'] });
  };
  return {
    refresh: useMutation({
      mutationFn: () => refreshPredictiveInsights(hospitalId, branchId),
      onSuccess: invalidate,
    }),
    acknowledge: useMutation({
      mutationFn: (insightId: string) => acknowledgePredictiveInsight(insightId),
      onSuccess: invalidate,
    }),
  };
}
