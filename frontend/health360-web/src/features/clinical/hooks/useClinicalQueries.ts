import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  checkInEncounter,
  completeEncounter,
  createClinicalNote,
  createClinicalOrder,
  createPrescription,
  finalizeClinicalNote,
  getEncounter,
  getMyClinicalTimeline,
  getPatientClinicalTimeline,
  listDoctorMyEncounters,
  listEncounterDiagnoses,
  listEncounterNotes,
  listEncounterOrders,
  listEncounterPrescriptions,
  listEncounterVitals,
  listMyEncounters,
  listMyPrescriptions,
  recordEncounterVitals,
  signPrescription,
  startEncounter,
  updateClinicalNote,
  updatePrescription,
  type CreatePrescriptionPayload,
  type RecordClinicalVitalsPayload,
  type StructuredConsultationPayload,
} from '../api/clinicalApi';

export const clinicalKeys = {
  myEncounters: (page: number) => ['clinical', 'encounters', 'me', page] as const,
  doctorEncounters: (page: number, todayOnly: boolean, status?: string) =>
    ['clinical', 'encounters', 'doctor', page, todayOnly, status ?? 'ALL'] as const,
  encounter: (id: string) => ['clinical', 'encounters', id] as const,
  diagnoses: (id: string) => ['clinical', 'encounters', id, 'diagnoses'] as const,
  notes: (id: string) => ['clinical', 'encounters', id, 'notes'] as const,
  prescriptions: (id: string) => ['clinical', 'encounters', id, 'prescriptions'] as const,
  myPrescriptions: ['clinical', 'prescriptions', 'me'] as const,
  orders: (id: string) => ['clinical', 'encounters', id, 'orders'] as const,
  vitals: (id: string) => ['clinical', 'encounters', id, 'vitals'] as const,
  patientTimeline: (patientId: string, page: number) =>
    ['clinical', 'patients', patientId, 'timeline', page] as const,
  myClinicalTimeline: (page: number) => ['clinical', 'me', 'timeline', page] as const,
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

export function useEncounterPrescriptions(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.prescriptions(encounterId),
    queryFn: () => listEncounterPrescriptions(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useMyPrescriptions() {
  return useQuery({
    queryKey: clinicalKeys.myPrescriptions,
    queryFn: listMyPrescriptions,
    retry: (_, error) => !isAuthError(error),
  });
}

export function useEncounterOrders(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.orders(encounterId),
    queryFn: () => listEncounterOrders(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useEncounterVitals(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.vitals(encounterId),
    queryFn: () => listEncounterVitals(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => !isAuthError(error),
  });
}

export function usePatientClinicalTimeline(patientId: string, page = 0, size = 20) {
  return useQuery({
    queryKey: clinicalKeys.patientTimeline(patientId, page),
    queryFn: () => getPatientClinicalTimeline(patientId, page, size),
    enabled: Boolean(patientId),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useMyClinicalTimeline(page = 0, size = 20) {
  return useQuery({
    queryKey: clinicalKeys.myClinicalTimeline(page),
    queryFn: () => getMyClinicalTimeline(page, size),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useEncounterActions(encounterId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: clinicalKeys.encounter(encounterId) });
    qc.invalidateQueries({ queryKey: ['clinical', 'encounters'] });
  };
  const invalidateOrders = () => {
    invalidate();
    qc.invalidateQueries({ queryKey: clinicalKeys.orders(encounterId) });
    qc.invalidateQueries({ queryKey: ['lab', 'worklist'] });
  };
  const invalidateVitals = () => {
    qc.invalidateQueries({ queryKey: clinicalKeys.vitals(encounterId) });
  };
  const invalidateNotes = () => {
    qc.invalidateQueries({ queryKey: clinicalKeys.notes(encounterId) });
  };
  const invalidatePrescriptions = () => {
    qc.invalidateQueries({ queryKey: clinicalKeys.prescriptions(encounterId) });
    qc.invalidateQueries({ queryKey: clinicalKeys.myPrescriptions });
  };

  return {
    checkIn: useMutation({ mutationFn: () => checkInEncounter(encounterId), onSuccess: invalidate }),
    start: useMutation({ mutationFn: () => startEncounter(encounterId), onSuccess: invalidate }),
    complete: useMutation({ mutationFn: () => completeEncounter(encounterId), onSuccess: invalidate }),
    createOrder: useMutation({
      mutationFn: (payload: Parameters<typeof createClinicalOrder>[1]) =>
        createClinicalOrder(encounterId, payload),
      onSuccess: invalidateOrders,
    }),
    recordVitals: useMutation({
      mutationFn: (payload: RecordClinicalVitalsPayload) => recordEncounterVitals(encounterId, payload),
      onSuccess: invalidateVitals,
    }),
    createNote: useMutation({
      mutationFn: (payload: StructuredConsultationPayload & { noteType?: string; content?: string }) =>
        createClinicalNote(encounterId, payload),
      onSuccess: invalidateNotes,
    }),
    updateNote: useMutation({
      mutationFn: ({ noteId, payload }: { noteId: string; payload: StructuredConsultationPayload }) =>
        updateClinicalNote(encounterId, noteId, payload),
      onSuccess: invalidateNotes,
    }),
    finalizeNote: useMutation({
      mutationFn: (noteId: string) => finalizeClinicalNote(encounterId, noteId),
      onSuccess: invalidateNotes,
    }),
    createPrescription: useMutation({
      mutationFn: (payload: CreatePrescriptionPayload) => createPrescription(encounterId, payload),
      onSuccess: invalidatePrescriptions,
    }),
    updatePrescription: useMutation({
      mutationFn: ({
        prescriptionId,
        payload,
      }: {
        prescriptionId: string;
        payload: CreatePrescriptionPayload;
      }) => updatePrescription(encounterId, prescriptionId, payload),
      onSuccess: invalidatePrescriptions,
    }),
    signPrescription: useMutation({
      mutationFn: (prescriptionId: string) => signPrescription(encounterId, prescriptionId),
      onSuccess: invalidatePrescriptions,
    }),
  };
}
