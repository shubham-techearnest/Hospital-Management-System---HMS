import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  associateDoctor,
  approveHospitalDoctorAssociation,
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
  updateBranch,
  updateDepartment,
  updateEmergencyInfo,
  updateHospitalProfile,
  listFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
  listGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
  getHospitalSubscription,
  inviteHospitalDoctor,
} from '../api/hospitalApi';

export const hospitalKeys = {
  profile: ['hospital', 'profile'] as const,
  branches: ['hospital', 'branches'] as const,
  departments: ['hospital', 'departments'] as const,
  doctors: ['hospital', 'doctors'] as const,
  facilities: ['hospital', 'facilities'] as const,
  gallery: ['hospital', 'gallery'] as const,
  subscription: ['hospital', 'subscription'] as const,
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createHospitalProfile,
    onSuccess: (p) => qc.setQueryData(hospitalKeys.profile, p),
  });
}

export function useUpdateHospitalProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateHospitalProfile,
    onSuccess: (p) => qc.setQueryData(hospitalKeys.profile, p),
  });
}

export function useUpdateEmergencyInfo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateEmergencyInfo,
    onSuccess: (p) => qc.setQueryData(hospitalKeys.profile, p),
  });
}

export function useBranches() {
  return useQuery({ queryKey: hospitalKeys.branches, queryFn: listBranches });
}

export function useCreateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createBranch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalKeys.branches });
      qc.invalidateQueries({ queryKey: hospitalKeys.profile });
      qc.invalidateQueries({ queryKey: hospitalKeys.subscription });
    },
  });
}

export function useUpdateBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateBranch>[1] }) =>
      updateBranch(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: hospitalKeys.branches }),
  });
}

export function useDeleteBranch() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteBranch,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalKeys.branches });
      qc.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useDepartments() {
  return useQuery({ queryKey: hospitalKeys.departments, queryFn: listDepartments });
}

export function useCreateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalKeys.departments });
      qc.invalidateQueries({ queryKey: hospitalKeys.profile });
      qc.invalidateQueries({ queryKey: hospitalKeys.subscription });
    },
  });
}

export function useUpdateDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateDepartment>[1] }) =>
      updateDepartment(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: hospitalKeys.departments }),
  });
}

export function useDeleteDepartment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDepartment,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalKeys.departments });
      qc.invalidateQueries({ queryKey: hospitalKeys.profile });
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
  const qc = useQueryClient();
  return useMutation({
    mutationFn: associateDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalKeys.doctors });
      qc.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useRemoveHospitalDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: removeHospitalDoctor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalKeys.doctors });
      qc.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useApproveHospitalDoctorAssociation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveHospitalDoctorAssociation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hospitalKeys.doctors });
      qc.invalidateQueries({ queryKey: hospitalKeys.profile });
    },
  });
}

export function useFacilities() {
  return useQuery({ queryKey: hospitalKeys.facilities, queryFn: listFacilities });
}

export function useCreateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createFacility,
    onSuccess: () => qc.invalidateQueries({ queryKey: hospitalKeys.facilities }),
  });
}

export function useUpdateFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateFacility>[1] }) =>
      updateFacility(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: hospitalKeys.facilities }),
  });
}

export function useDeleteFacility() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteFacility,
    onSuccess: () => qc.invalidateQueries({ queryKey: hospitalKeys.facilities }),
  });
}

export function useGalleryImages() {
  return useQuery({ queryKey: hospitalKeys.gallery, queryFn: listGalleryImages });
}

export function useUploadGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, caption, displayOrder }: { file: File; caption?: string; displayOrder?: number }) =>
      uploadGalleryImage(file, caption, displayOrder),
    onSuccess: () => qc.invalidateQueries({ queryKey: hospitalKeys.gallery }),
  });
}

export function useDeleteGalleryImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteGalleryImage,
    onSuccess: () => qc.invalidateQueries({ queryKey: hospitalKeys.gallery }),
  });
}

export function useHospitalSubscription() {
  return useQuery({
    queryKey: hospitalKeys.subscription,
    queryFn: getHospitalSubscription,
    retry: (_, error) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      return status !== 404;
    },
  });
}

export function useInviteHospitalDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inviteHospitalDoctor,
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: hospitalKeys.doctors });
      void qc.invalidateQueries({ queryKey: hospitalKeys.profile });
      void qc.invalidateQueries({ queryKey: hospitalKeys.subscription });
    },
  });
}
