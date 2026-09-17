import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  disposeEdVisit,
  listEdVisits,
  registerEdArrival,
  triageEdVisit,
} from '../api/emergencyApi';

export const emergencyKeys = {
  board: (hospitalId: string, branchId: string, activeOnly: boolean) =>
    ['emergency', 'board', hospitalId, branchId, activeOnly] as const,
};

export function useEdBoard(hospitalId?: string, branchId?: string, activeOnly = true) {
  return useQuery({
    queryKey: emergencyKeys.board(hospitalId ?? '', branchId ?? '', activeOnly),
    queryFn: () => listEdVisits({ hospitalId: hospitalId!, branchId: branchId!, activeOnly }),
    enabled: Boolean(hospitalId && branchId),
  });
}

export function useRegisterEdArrival(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: registerEdArrival,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['emergency', 'board', hospitalId, branchId] });
    },
  });
}

export function useTriageEdVisit(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ visitId, triageAcuity, triageNotes }: {
      visitId: string;
      triageAcuity: number;
      triageNotes?: string;
    }) => triageEdVisit(visitId, { triageAcuity, triageNotes }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['emergency', 'board', hospitalId, branchId] });
    },
  });
}

export function useDisposeEdVisit(hospitalId: string, branchId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      visitId,
      disposition,
      dispositionNotes,
      bedId,
      primaryDoctorId,
    }: {
      visitId: string;
      disposition: string;
      dispositionNotes?: string;
      bedId?: string;
      primaryDoctorId?: string;
    }) => disposeEdVisit(visitId, { disposition, dispositionNotes, bedId, primaryDoctorId }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['emergency', 'board', hospitalId, branchId] });
    },
  });
}
