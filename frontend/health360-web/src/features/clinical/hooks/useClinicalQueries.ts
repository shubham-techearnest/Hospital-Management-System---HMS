import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  checkInEncounter,
  completeEncounter,
  getEncounter,
  listDoctorMyEncounters,
  listEncounterDiagnoses,
  listEncounterNotes,
  listEncounterOrders,
  listMyEncounters,
  startEncounter,
} from '../api/clinicalApi';

export const clinicalKeys = {
  myEncounters: (page: number) => ['clinical', 'encounters', 'me', page] as const,
  doctorEncounters: (page: number, todayOnly: boolean, status?: string) =>
    ['clinical', 'encounters', 'doctor', page, todayOnly, status ?? 'ALL'] as const,
  encounter: (id: string) => ['clinical', 'encounters', id] as const,
  diagnoses: (id: string) => ['clinical', 'encounters', id, 'diagnoses'] as const,
  notes: (id: string) => ['clinical', 'encounters', id, 'notes'] as const,
  orders: (id: string) => ['clinical', 'encounters', id, 'orders'] as const,
};

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function useMyEncounters(page = 0, size = 20) {
  return useQuery({
    queryKey: clinicalKeys.myEncounters(page),
    queryFn: () => listMyEncounters(page, size),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useDoctorEncounters(page = 0, size = 20, todayOnly = false, status?: string) {
  return useQuery({
    queryKey: clinicalKeys.doctorEncounters(page, todayOnly, status),
    queryFn: () => listDoctorMyEncounters(page, size, { todayOnly, status }),
    retry: (_, error) => !isAuthError(error),
    refetchInterval: todayOnly ? 30_000 : false,
  });
}

export function useEncounter(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.encounter(encounterId),
    queryFn: () => getEncounter(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useEncounterDiagnoses(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.diagnoses(encounterId),
    queryFn: () => listEncounterDiagnoses(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useEncounterNotes(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.notes(encounterId),
    queryFn: () => listEncounterNotes(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useEncounterOrders(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.orders(encounterId),
    queryFn: () => listEncounterOrders(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useEncounterActions(encounterId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: clinicalKeys.encounter(encounterId) });
    qc.invalidateQueries({ queryKey: ['clinical', 'encounters'] });
  };

  return {
    checkIn: useMutation({ mutationFn: () => checkInEncounter(encounterId), onSuccess: invalidate }),
    start: useMutation({ mutationFn: () => startEncounter(encounterId), onSuccess: invalidate }),
    complete: useMutation({ mutationFn: () => completeEncounter(encounterId), onSuccess: invalidate }),
  };
}
