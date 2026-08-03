import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPatientProfile,
  getProfileCompletion,
  updateBasicInfo,
  updateContactInfo,
  updatePhysicalMeasurements,
  updateLifestyle,
  listAllergies,
  listMedications,
  listSurgeries,
  listChronicConditions,
  createAllergy,
  createMedication,
  createSurgery,
  createChronicCondition,
  deleteAllergy,
  deleteMedication,
  deleteSurgery,
  deleteChronicCondition,
  listEmergencyContacts,
  createEmergencyContact,
  deleteEmergencyContact,
  getLatestVitals,
  getVitalsHistory,
  recordVitals,
  type PatientProfile,
  type Allergy,
  type Medication,
  type Surgery,
  type ChronicCondition,
  type EmergencyContact,
  type RecordVitalsPayload,
} from '@/features/patient/api/patientApi';

export const patientKeys = {
  profile: ['patient', 'profile'] as const,
  completion: ['patient', 'completion'] as const,
  medical: ['patient', 'medical'] as const,
  emergencyContacts: ['patient', 'emergency-contacts'] as const,
  vitalsLatest: ['patient', 'vitals', 'latest'] as const,
  vitalsHistory: ['patient', 'vitals', 'history'] as const,
};

export function isProfileNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function usePatientProfile() {
  return useQuery({
    queryKey: patientKeys.profile,
    queryFn: getPatientProfile,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      if (isProfileNotFound(error)) return false;
      return failureCount < 1;
    },
  });
}

export function useProfileCompletion() {
  return useQuery({
    queryKey: patientKeys.completion,
    queryFn: getProfileCompletion,
    staleTime: 2 * 60 * 1000,
    enabled: false,
  });
}

export function useProfileCompletionEnabled(enabled: boolean) {
  return useQuery({
    queryKey: patientKeys.completion,
    queryFn: getProfileCompletion,
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

export function useMedicalRecords(enabled: boolean) {
  return useQuery({
    queryKey: patientKeys.medical,
    queryFn: async () => {
      const [allergies, medications, surgeries, conditions] = await Promise.all([
        listAllergies(),
        listMedications(),
        listSurgeries(),
        listChronicConditions(),
      ]);
      return { allergies, medications, surgeries, conditions };
    },
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useEmergencyContacts(enabled: boolean) {
  return useQuery({
    queryKey: patientKeys.emergencyContacts,
    queryFn: listEmergencyContacts,
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useLatestVitals() {
  return useQuery({
    queryKey: patientKeys.vitalsLatest,
    queryFn: async () => {
      try {
        return await getLatestVitals();
      } catch (error) {
        if (axios.isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 404)) {
          return null;
        }
        throw error;
      }
    },
    staleTime: 60 * 1000,
  });
}

export function useVitalsHistory() {
  return useQuery({
    queryKey: patientKeys.vitalsHistory,
    queryFn: () => getVitalsHistory(),
    staleTime: 60 * 1000,
  });
}

export function useRecordVitals() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RecordVitalsPayload) => recordVitals(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.vitalsLatest });
      queryClient.invalidateQueries({ queryKey: patientKeys.vitalsHistory });
      refreshCompletion(queryClient);
    },
  });
}

function refreshCompletion(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: patientKeys.completion });
  queryClient.invalidateQueries({ queryKey: ['analytics', 'dashboard'] });
  queryClient.invalidateQueries({ queryKey: ['analytics', 'metrics'] });
}

function updateProfileCache(
  queryClient: ReturnType<typeof useQueryClient>,
  updatedProfile: PatientProfile,
) {
  queryClient.setQueryData(patientKeys.profile, updatedProfile);
  refreshCompletion(queryClient);
}

export function useUpdateBasicInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: PatientProfile['basicInfo']) => updateBasicInfo(payload),
    onSuccess: (updatedProfile) => updateProfileCache(queryClient, updatedProfile),
  });
}

export function useUpdateContactInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateContactInfo,
    onSuccess: (updatedProfile) => updateProfileCache(queryClient, updatedProfile),
  });
}

export function useUpdatePhysicalMeasurements() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePhysicalMeasurements,
    onSuccess: (updatedProfile) => updateProfileCache(queryClient, updatedProfile),
  });
}

export function useUpdateLifestyle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateLifestyle,
    onSuccess: (updatedProfile) => updateProfileCache(queryClient, updatedProfile),
  });
}

function invalidateMedical(queryClient: ReturnType<typeof useQueryClient>) {
  queryClient.invalidateQueries({ queryKey: patientKeys.medical });
  refreshCompletion(queryClient);
}

export function useCreateAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Allergy, 'id'>) => createAllergy(payload),
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useCreateMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Medication, 'id'>) => createMedication(payload),
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useCreateSurgery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Surgery, 'id'>) => createSurgery(payload),
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useCreateChronicCondition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<ChronicCondition, 'id'>) => createChronicCondition(payload),
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useDeleteAllergy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAllergy,
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useDeleteMedication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMedication,
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useDeleteSurgery() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSurgery,
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useDeleteChronicCondition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteChronicCondition,
    onSuccess: () => invalidateMedical(queryClient),
  });
}

export function useCreateEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<EmergencyContact, 'id'>) => createEmergencyContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.emergencyContacts });
      refreshCompletion(queryClient);
    },
  });
}

export function useDeleteEmergencyContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEmergencyContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.emergencyContacts });
      refreshCompletion(queryClient);
    },
  });
}
