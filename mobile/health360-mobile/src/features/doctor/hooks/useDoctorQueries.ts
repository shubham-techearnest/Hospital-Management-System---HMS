import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addLanguage,
  createExperience,
  createQualification,
  createHospitalAssociation,
  deleteExperience,
  deleteQualification,
  deleteVerificationDocument,
  deleteHospitalAssociation,
  getDoctorProfile,
  listSpecializations,
  listHospitalAssociations,
  removeLanguage,
  submitForVerification,
  updateConsultationDefaults,
  updateProfessionalDetails,
  updateSpecialization,
  uploadVerificationDocument,
  type DoctorProfile,
} from '@/features/doctor/api/doctorApi';

export const doctorKeys = {
  profile: ['doctor', 'profile'] as const,
  specializations: ['doctor', 'specializations'] as const,
};

export function useDoctorProfile() {
  return useQuery({
    queryKey: doctorKeys.profile,
    queryFn: getDoctorProfile,
    staleTime: 5 * 60 * 1000,
  });
}

export function useSpecializations() {
  return useQuery({
    queryKey: doctorKeys.specializations,
    queryFn: listSpecializations,
    staleTime: 30 * 60 * 1000,
  });
}

function updateProfileCache(
  queryClient: ReturnType<typeof useQueryClient>,
  profile: DoctorProfile,
) {
  queryClient.setQueryData(doctorKeys.profile, profile);
}

export function useUpdateProfessionalDetails() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfessionalDetails,
    onSuccess: (profile) => updateProfileCache(queryClient, profile),
  });
}

export function useCreateQualification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createQualification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.profile }),
  });
}

export function useDeleteQualification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteQualification,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.profile }),
  });
}

export function useCreateExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExperience,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.profile }),
  });
}

export function useDeleteExperience() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExperience,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.profile }),
  });
}

export function useUpdateSpecialization() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateSpecialization,
    onSuccess: (profile) => updateProfileCache(queryClient, profile),
  });
}

export function useUpdateConsultationDefaults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateConsultationDefaults,
    onSuccess: (profile) => updateProfileCache(queryClient, profile),
  });
}

export function useAddLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addLanguage,
    onSuccess: (profile) => updateProfileCache(queryClient, profile),
  });
}

export function useRemoveLanguage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeLanguage,
    onSuccess: (profile) => updateProfileCache(queryClient, profile),
  });
}

export function useUploadVerificationDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ documentType, file }: { documentType: string; file: Parameters<typeof uploadVerificationDocument>[1] }) =>
      uploadVerificationDocument(documentType, file),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.profile }),
  });
}

export function useDeleteVerificationDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteVerificationDocument,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.profile }),
  });
}

export function useSubmitForVerification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitForVerification,
    onSuccess: (profile) => updateProfileCache(queryClient, profile),
  });
}

export function useHospitalAssociations() {
  return useQuery({
    queryKey: ['doctor', 'hospital-associations'] as const,
    queryFn: listHospitalAssociations,
  });
}

export function useCreateHospitalAssociation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHospitalAssociation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctor', 'hospital-associations'] }),
  });
}

export function useDeleteHospitalAssociation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHospitalAssociation,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['doctor', 'hospital-associations'] }),
  });
}
