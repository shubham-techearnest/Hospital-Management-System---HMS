import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  changeAdminHospitalPlan,
  createAdminHospital,
  getAdminHospital,
  getAdminHospitalSubscription,
  getAdminHospitalSubscriptionHistory,
  inviteDoctorAsAdmin,
  searchAdminHospitals,
  updateAdminHospitalStatus,
} from '../api/adminHospitalApi';
import { getAdminPlan, listAdminPlans, updateAdminPlan, updateAdminPlanLimits } from '../api/adminSubscriptionApi';
import { listAdminAuditLogs } from '../api/adminAuditApi';

export const adminHospitalKeys = {
  hospitals: (params: Record<string, string | number | undefined>) => ['admin', 'hospitals', params] as const,
  hospital: (id: string) => ['admin', 'hospitals', id] as const,
  subscription: (id: string) => ['admin', 'hospitals', id, 'subscription'] as const,
  history: (id: string) => ['admin', 'hospitals', id, 'subscription-history'] as const,
  plans: ['admin', 'plans'] as const,
  plan: (id: string) => ['admin', 'plans', id] as const,
  auditLogs: (params: Record<string, string | number | undefined>) => ['admin', 'audit-logs', params] as const,
};

export function useCreateAdminHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAdminHospital,
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['admin', 'hospitals'] }),
  });
}

export function useAdminHospitals(params: {
  name?: string;
  status?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: adminHospitalKeys.hospitals(params),
    queryFn: () => searchAdminHospitals(params),
  });
}

export function useAdminHospital(hospitalId: string) {
  return useQuery({
    queryKey: adminHospitalKeys.hospital(hospitalId),
    queryFn: () => getAdminHospital(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useUpdateAdminHospitalStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ hospitalId, status }: { hospitalId: string; status: string }) =>
      updateAdminHospitalStatus(hospitalId, status),
    onSuccess: (_, { hospitalId }) => {
      void qc.invalidateQueries({ queryKey: ['admin', 'hospitals'] });
      void qc.invalidateQueries({ queryKey: adminHospitalKeys.hospital(hospitalId) });
    },
  });
}

export function useAdminHospitalSubscription(hospitalId: string) {
  return useQuery({
    queryKey: adminHospitalKeys.subscription(hospitalId),
    queryFn: () => getAdminHospitalSubscription(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useAdminHospitalSubscriptionHistory(hospitalId: string) {
  return useQuery({
    queryKey: adminHospitalKeys.history(hospitalId),
    queryFn: () => getAdminHospitalSubscriptionHistory(hospitalId),
    enabled: !!hospitalId,
  });
}

export function useChangeAdminHospitalPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      hospitalId,
      planCode,
      notes,
    }: {
      hospitalId: string;
      planCode: string;
      notes?: string;
    }) => changeAdminHospitalPlan(hospitalId, planCode, notes),
    onSuccess: (_, { hospitalId }) => {
      void qc.invalidateQueries({ queryKey: adminHospitalKeys.subscription(hospitalId) });
      void qc.invalidateQueries({ queryKey: adminHospitalKeys.history(hospitalId) });
      void qc.invalidateQueries({ queryKey: adminHospitalKeys.hospital(hospitalId) });
      void qc.invalidateQueries({ queryKey: ['admin', 'hospitals'] });
    },
  });
}

export function useInviteDoctorAsAdmin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      hospitalId,
      payload,
    }: {
      hospitalId: string;
      payload: Parameters<typeof inviteDoctorAsAdmin>[1];
    }) => inviteDoctorAsAdmin(hospitalId, payload),
    onSuccess: (_, { hospitalId }) => {
      void qc.invalidateQueries({ queryKey: adminHospitalKeys.hospital(hospitalId) });
      void qc.invalidateQueries({ queryKey: ['admin', 'hospitals'] });
    },
  });
}

export function useAdminPlans() {
  return useQuery({
    queryKey: adminHospitalKeys.plans,
    queryFn: listAdminPlans,
  });
}

export function useAdminPlan(planId: string) {
  return useQuery({
    queryKey: adminHospitalKeys.plan(planId),
    queryFn: () => getAdminPlan(planId),
    enabled: !!planId,
  });
}

export function useUpdateAdminPlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      payload,
    }: {
      planId: string;
      payload: Parameters<typeof updateAdminPlan>[1];
    }) => updateAdminPlan(planId, payload),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminHospitalKeys.plans }),
  });
}

export function useUpdateAdminPlanLimits() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      planId,
      limits,
    }: {
      planId: string;
      limits: { limitKey: string; limitValue: number }[];
    }) => updateAdminPlanLimits(planId, limits),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminHospitalKeys.plans }),
  });
}

export function useAdminAuditLogs(params: {
  action?: string;
  entityType?: string;
  entityId?: string;
  page?: number;
  size?: number;
}) {
  return useQuery({
    queryKey: adminHospitalKeys.auditLogs(params),
    queryFn: () => listAdminAuditLogs(params),
  });
}
