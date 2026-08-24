import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDosageTemplate,
  createSymptom,
  listDosageTemplates,
  listSymptoms,
} from '../api/clinicalCatalogApi';

export const catalogKeys = {
  symptoms: (hospitalId: string, branchId?: string) =>
    ['hospital', 'catalog', 'symptoms', hospitalId, branchId ?? ''] as const,
  dosages: (hospitalId: string, branchId?: string) =>
    ['hospital', 'catalog', 'dosages', hospitalId, branchId ?? ''] as const,
};

export function useSymptoms(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: catalogKeys.symptoms(hospitalId ?? '', branchId),
    queryFn: () => listSymptoms(hospitalId!, branchId),
    enabled: Boolean(hospitalId),
  });
}

export function useDosageTemplates(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: catalogKeys.dosages(hospitalId ?? '', branchId),
    queryFn: () => listDosageTemplates(hospitalId!, branchId),
    enabled: Boolean(hospitalId),
  });
}

export function useCreateSymptom(hospitalId: string, branchId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createSymptom,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.symptoms(hospitalId, branchId) }),
  });
}

export function useCreateDosageTemplate(hospitalId: string, branchId?: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDosageTemplate,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.dosages(hospitalId, branchId) }),
  });
}
