import { useQuery } from '@tanstack/react-query';
import { getCommandCenterSnapshot } from '@/features/commandcenter/api/commandCenterApi';

export function useCommandCenterSnapshot(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: ['command-center', 'snapshot', hospitalId, branchId],
    queryFn: () => getCommandCenterSnapshot(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    refetchInterval: 60_000,
  });
}
