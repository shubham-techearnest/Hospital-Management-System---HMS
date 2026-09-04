import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  checkInEncounter,
  completeEncounter,
  createClinicalNote,
  createPrescription,
  declareNoMedication,
  finalizeClinicalNote,
  getEncounter,
  listDoctorMyEncounters,
  listEncounterDiagnoses,
  listEncounterNotes,
  listEncounterOrders,
  listEncounterPrescriptions,
  listMyEncounters,
  listMyPrescriptions,
  getEncounterWellnessPlan,
  signPrescription,
  startEncounter,
  updateClinicalNote,
  updatePrescription,
  type CreatePrescriptionPayload,
  type StructuredConsultationPayload,
} from '../api/clinicalApi';

export const clinicalKeys = {
  myEncounters: (page: number) => ['clinical', 'encounters', 'me', page] as const,
  doctorEncounters: (page: number, todayOnly: boolean, status?: string) =>
    ['clinical', 'encounters', 'doctor', page, todayOnly, status ?? 'ALL'] as const,
  encounter: (id: string) => ['clinical', 'encounters', id] as const,
  diagnoses: (id: string) => ['clinical', 'encounters', id, 'diagnoses'] as const,
  notes: (id: string) => ['clinical', 'encounters', id, 'notes'] as const,
  orders: (id: string) => ['clinical', 'encounters', id, 'orders'] as const,
  prescriptions: (id: string) => ['clinical', 'encounters', id, 'prescriptions'] as const,
  myPrescriptions: ['clinical', 'prescriptions', 'me'] as const,
  wellnessPlan: (id: string) => ['clinical', 'encounters', id, 'wellness-plan'] as const,
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
    queryFn: () => listDoctorMyEncounters(page, size, todayOnly, status),
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

export function useEncounterPrescriptions(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.prescriptions(encounterId),
    queryFn: () => listEncounterPrescriptions(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useMyPrescriptions() {
  return useQuery({
    queryKey: clinicalKeys.myPrescriptions,
    queryFn: listMyPrescriptions,
    retry: (_, error) => !isAuthError(error),
  });
}

export function useEncounterWellnessPlan(encounterId: string) {
  return useQuery({
    queryKey: clinicalKeys.wellnessPlan(encounterId),
    queryFn: () => getEncounterWellnessPlan(encounterId),
    enabled: Boolean(encounterId),
  });
}

export function useEncounterActions(encounterId: string) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: clinicalKeys.encounter(encounterId) });
    qc.invalidateQueries({ queryKey: ['clinical', 'encounters'] });
  };
  const invalidateClinical = () => {
    invalidate();
    qc.invalidateQueries({ queryKey: clinicalKeys.notes(encounterId) });
    qc.invalidateQueries({ queryKey: clinicalKeys.prescriptions(encounterId) });
    qc.invalidateQueries({ queryKey: clinicalKeys.diagnoses(encounterId) });
  };

  return {
    checkIn: useMutation({ mutationFn: () => checkInEncounter(encounterId), onSuccess: invalidate }),
    start: useMutation({ mutationFn: () => startEncounter(encounterId), onSuccess: invalidate }),
    complete: useMutation({ mutationFn: () => completeEncounter(encounterId), onSuccess: invalidate }),
    createNote: useMutation({
      mutationFn: (payload: StructuredConsultationPayload & { noteType?: string; content?: string }) =>
        createClinicalNote(encounterId, payload),
      onSuccess: invalidateClinical,
    }),
    updateNote: useMutation({
      mutationFn: ({ noteId, payload }: { noteId: string; payload: StructuredConsultationPayload }) =>
        updateClinicalNote(encounterId, noteId, payload),
      onSuccess: invalidateClinical,
    }),
    finalizeNote: useMutation({
      mutationFn: (noteId: string) => finalizeClinicalNote(encounterId, noteId),
      onSuccess: invalidateClinical,
    }),
    createPrescription: useMutation({
      mutationFn: (payload: CreatePrescriptionPayload) => createPrescription(encounterId, payload),
      onSuccess: invalidateClinical,
    }),
    updatePrescription: useMutation({
      mutationFn: ({
        prescriptionId,
        payload,
      }: {
        prescriptionId: string;
        payload: CreatePrescriptionPayload;
      }) => updatePrescription(encounterId, prescriptionId, payload),
      onSuccess: invalidateClinical,
    }),
    signPrescription: useMutation({
      mutationFn: (prescriptionId: string) => signPrescription(encounterId, prescriptionId),
      onSuccess: invalidateClinical,
    }),
    declareNoMedication: useMutation({
      mutationFn: () => declareNoMedication(encounterId),
      onSuccess: invalidateClinical,
    }),
  };
}

export function hasFinalConsultation(notes: { noteType: string; status?: string }[]): boolean {
  return notes.some((note) => note.noteType === 'CONSULTATION' && note.status === 'FINAL');
}

export function hasSignedPrescription(prescriptions: { status: string }[]): boolean {
  return prescriptions.some((p) => p.status === 'SIGNED');
}

export function encounterCompleteBlockers(
  notes: { noteType: string; status?: string }[],
  prescriptions: { status: string }[],
): string[] {
  const missing: string[] = [];
  if (!hasFinalConsultation(notes)) missing.push('finalized consultation');
  if (!hasSignedPrescription(prescriptions)) missing.push('signed e-prescription');
  return missing;
}
