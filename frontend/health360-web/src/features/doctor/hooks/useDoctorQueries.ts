import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDoctorProfile,
  listSpecializations,
  updateProfessionalDetails,
  createQualification,
  deleteQualification,
  createExperience,
  deleteExperience,
  updateSpecialization,
  updateConsultationDefaults,
  addLanguage,
  removeLanguage,
  uploadVerificationDocument,
  deleteVerificationDocument,
  submitForVerification,
  listHospitalAssociations,
  createHospitalAssociation,
  deleteHospitalAssociation,
  updateBiography,
  listAwards,
  createAward,
  updateAward,
  deleteAward,
  listMemberships,
  createMembership,
  updateMembership,
  deleteMembership,
  type DoctorProfile,
} from '../api/doctorApi';

export const doctorKeys = {
  profile: ['doctor', 'profile'] as const,
  specializations: ['doctor', 'specializations'] as const,
  awards: ['doctor', 'awards'] as const,
  memberships: ['doctor', 'memberships'] as const,
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
    mutationFn: ({ documentType, file }: { documentType: string; file: File }) =>
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

export function useUpdateBiography() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBiography,
    onSuccess: (profile) => updateProfileCache(queryClient, profile),
  });
}

export function useAwards() {
  return useQuery({
    queryKey: doctorKeys.awards,
    queryFn: listAwards,
  });
}

export function useCreateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAward,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.awards }),
  });
}

export function useUpdateAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateAward>[1] }) =>
      updateAward(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.awards }),
  });
}

export function useDeleteAward() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAward,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.awards }),
  });
}

export function useMemberships() {
  return useQuery({
    queryKey: doctorKeys.memberships,
    queryFn: listMemberships,
  });
}

export function useCreateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMembership,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.memberships }),
  });
}

export function useUpdateMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateMembership>[1] }) =>
      updateMembership(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.memberships }),
  });
}

export function useDeleteMembership() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMembership,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: doctorKeys.memberships }),
  });
}
