import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFamilyMember,
  deleteFamilyMember,
  deleteHealthDocument,
  downloadHealthDocument,
  getHealthTimeline,
  getLabValuesHistory,
  listFamilyMembers,
  listHealthDocuments,
  recordLabValues,
  updateFamilyMember,
  updateHealthGoals,
  uploadHealthDocument,
  type FamilyMemberPayload,
  type HealthGoalsPayload,
  type RecordLabValuesPayload,
} from '../api/patientExtendedApi';
import { patientKeys } from './usePatientQueries';
import { submitDoctorReview, submitHospitalReview, type SubmitReviewPayload } from '@/features/review/api/reviewApi';

export const extendedKeys = {
  family: ['patient', 'family-members'] as const,
  labs: (page: number) => ['patient', 'lab-values', page] as const,
  documents: (page: number, category?: string) => ['patient', 'documents', page, category] as const,
  timeline: (page: number) => ['patient', 'timeline', page] as const,
};

export function useFamilyMembers(enabled = true) {
  return useQuery({ queryKey: extendedKeys.family, queryFn: listFamilyMembers, enabled });
}

export function useCreateFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFamilyMember,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: extendedKeys.family });
      void qc.invalidateQueries({ queryKey: patientKeys.profile });
    },
  });
}

export function useUpdateFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: FamilyMemberPayload }) => updateFamilyMember(id, payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: extendedKeys.family }),
  });
}

export function useDeleteFamilyMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFamilyMember,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: extendedKeys.family });
      void qc.invalidateQueries({ queryKey: patientKeys.profile });
    },
  });
}

export function useLabValuesHistory(page = 0) {
  return useQuery({ queryKey: extendedKeys.labs(page), queryFn: () => getLabValuesHistory(page) });
}

export function useRecordLabValues() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordLabValuesPayload) => recordLabValues(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patient', 'lab-values'] });
      void qc.invalidateQueries({ queryKey: extendedKeys.timeline(0) });
      void qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useUpdateHealthGoals() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: HealthGoalsPayload) => updateHealthGoals(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: patientKeys.profile });
      void qc.invalidateQueries({ queryKey: ['analytics'] });
    },
  });
}

export function useHealthDocuments(page = 0, category?: string) {
  return useQuery({
    queryKey: extendedKeys.documents(page, category),
    queryFn: () => listHealthDocuments(page, 20, category),
  });
}

export function useUploadHealthDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, category, title, description }: { file: File; category: string; title: string; description?: string }) =>
      uploadHealthDocument(file, category, title, description),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['patient', 'documents'] });
      void qc.invalidateQueries({ queryKey: extendedKeys.timeline(0) });
    },
  });
}

export function useDeleteHealthDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteHealthDocument,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['patient', 'documents'] }),
  });
}

export function useDownloadHealthDocument() {
  return useMutation({
    mutationFn: ({ id, fileName }: { id: string; fileName: string }) => downloadHealthDocument(id, fileName),
  });
}

export function useHealthTimeline(page = 0) {
  return useQuery({ queryKey: extendedKeys.timeline(page), queryFn: () => getHealthTimeline(page) });
}

export function useSubmitDoctorReview() {
  return useMutation({ mutationFn: (payload: SubmitReviewPayload) => submitDoctorReview(payload) });
}

export function useSubmitHospitalReview() {
  return useMutation({ mutationFn: (payload: SubmitReviewPayload) => submitHospitalReview(payload) });
}
