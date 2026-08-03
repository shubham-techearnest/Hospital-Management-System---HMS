import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  associateDoctor,
  createBranch,
  createDepartment,
  createHospitalProfile,
  deleteBranch,
  deleteDepartment,
  getHospitalProfile,
  listBranches,
  listDepartments,
  listHospitalDoctors,
  removeHospitalDoctor,
  searchDoctors,
  updateEmergencyInfo,
  updateHospitalProfile,
} from '@/features/hospital/api/hospitalApi';

export const hospitalKeys = {
  profile: ['hospital', 'profile'] as const,
  branches: ['hospital', 'branches'] as const,
  departments: ['hospital', 'departments'] as const,
  doctors: ['hospital', 'doctors'] as const,
};

export function useHospitalProfile() {
  return useQuery({
    queryKey: hospitalKeys.profile,
    queryFn: getHospitalProfile,
    retry: (_, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      return status !== 404;
    },
  });
}

export function useCreateHospitalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHospitalProfile,
    onSuccess: (profile) => queryClient.setQueryData(hospitalKeys.profile, profile),
  });
}

export function useUpdateHospitalProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateHospitalProfile,
    onSuccess: (profile) => queryClient.setQueryData(hospitalKeys.profile, profile),
  });
}

export function useUpdateEmergencyInfo() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEmergencyInfo,
    onSuccess: (profile) => queryClient.setQueryData(hospitalKeys.profile, profile),
  });
}

export function useBranches() {
  return useQuery({ queryKey: hospitalKeys.branches, queryFn: listBranches });
}

export function useCreateBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.branches });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useDeleteBranch() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.branches });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useDepartments() {
  return useQuery({ queryKey: hospitalKeys.departments, queryFn: listDepartments });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.departments });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.departments });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useHospitalDoctors() {
  return useQuery({ queryKey: hospitalKeys.doctors, queryFn: listHospitalDoctors });
}

export function useSearchDoctors() {
  return useMutation({ mutationFn: searchDoctors });
}

export function useAssociateDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: associateDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.doctors });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useRemoveHospitalDoctor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeHospitalDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalKeys.doctors });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}
