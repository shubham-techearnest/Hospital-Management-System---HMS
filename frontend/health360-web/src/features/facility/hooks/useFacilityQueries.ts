import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  completeFacilityWorkOrder,
  createFacilityWorkOrder,
  listFacilityWorkOrders,
  startFacilityWorkOrder,
} from '@/features/facility/api/facilityApi';

export function useFacilityWorkOrders(
  hospitalId?: string,
  branchId?: string,
  workType?: string,
  status?: string,
) {
  return useQuery({
    queryKey: ['facility', 'work-orders', hospitalId, branchId, workType, status],
    queryFn: () =>
      listFacilityWorkOrders({
        hospitalId: hospitalId!,
        branchId: branchId!,
        workType,
        status,
      }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useFacilityMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    void qc.invalidateQueries({ queryKey: ['facility', 'work-orders', hospitalId, branchId] });
  };

  return {
    create: useMutation({
      mutationFn: createFacilityWorkOrder,
      onSuccess: invalidate,
    }),
    start: useMutation({
      mutationFn: startFacilityWorkOrder,
      onSuccess: invalidate,
    }),
    complete: useMutation({
      mutationFn: ({
        workOrderId,
        notes,
      }: {
        workOrderId: string;
        notes?: string;
      }) => completeFacilityWorkOrder(workOrderId, { resolutionNotes: notes, markBedAvailable: true }),
      onSuccess: invalidate,
    }),
  };
}
