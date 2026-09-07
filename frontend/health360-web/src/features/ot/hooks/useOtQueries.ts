import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  addOtAnesthesiaEvent,
  addOtImplant,
  addOtNote,
  addOtTeamMember,
  completeOtProcedure,
  createOtProcedure,
  createTheatre,
  getOtProcedure,
  listEncounterProcedures,
  listOtProcedures,
  listPendingOtWorklist,
  listTheatres,
  scheduleOtProcedure,
  startOtProcedure,
  upsertOtAnesthesiaChart,
} from '../api/otApi';

export const otKeys = {
  theatres: (hospitalId: string, branchId: string) =>
    ['ot', 'theatres', hospitalId, branchId] as const,
  worklist: (hospitalId: string, branchId: string) =>
    ['ot', 'worklist', hospitalId, branchId] as const,
  procedures: (hospitalId: string, branchId: string, page: number, status?: string) =>
    ['ot', 'procedures', hospitalId, branchId, page, status ?? 'ALL'] as const,
  procedure: (procedureId: string) => ['ot', 'procedures', procedureId] as const,
  encounterProcedures: (encounterId: string) =>
    ['ot', 'encounters', encounterId, 'procedures'] as const,
};

function isRetryableError(error: unknown): boolean {
  if (!isAxiosError(error)) return true;
  const status = error.response?.status;
  return status !== 401 && status !== 403 && status !== 404;
}

export function useTheatres(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: otKeys.theatres(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listTheatres(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function usePendingOtWorklist(hospitalId?: string, branchId?: string) {
  return useQuery({
    queryKey: otKeys.worklist(hospitalId ?? '', branchId ?? ''),
    queryFn: () => listPendingOtWorklist(hospitalId!, branchId!),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
    refetchInterval: 30_000,
  });
}

export function useOtProcedures(
  hospitalId?: string,
  branchId?: string,
  page = 0,
  status?: string,
) {
  return useQuery({
    queryKey: otKeys.procedures(hospitalId ?? '', branchId ?? '', page, status),
    queryFn: () => listOtProcedures(hospitalId!, branchId!, page, 20, status),
    enabled: Boolean(hospitalId && branchId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useOtProcedure(procedureId?: string) {
  return useQuery({
    queryKey: otKeys.procedure(procedureId ?? ''),
    queryFn: () => getOtProcedure(procedureId!),
    enabled: Boolean(procedureId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useEncounterProcedures(encounterId: string) {
  return useQuery({
    queryKey: otKeys.encounterProcedures(encounterId),
    queryFn: () => listEncounterProcedures(encounterId),
    enabled: Boolean(encounterId),
    retry: (_, error) => isRetryableError(error),
  });
}

export function useOtMutations(hospitalId: string, branchId: string) {
  const qc = useQueryClient();

  const invalidateScope = () => {
    qc.invalidateQueries({ queryKey: ['ot', 'theatres', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['ot', 'worklist', hospitalId, branchId] });
    qc.invalidateQueries({ queryKey: ['ot', 'procedures', hospitalId, branchId] });
  };

  return {
    createTheatre: useMutation({
      mutationFn: createTheatre,
      onSuccess: invalidateScope,
    }),
    receiveProcedure: useMutation({
      mutationFn: createOtProcedure,
      onSuccess: invalidateScope,
    }),
    scheduleProcedure: useMutation({
      mutationFn: ({
        procedureId,
        ...payload
      }: {
        procedureId: string;
        theatreId: string;
        scheduledStart: string;
        scheduledEnd: string;
        notes?: string;
      }) => scheduleOtProcedure(procedureId, payload),
      onSuccess: (procedure) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: otKeys.procedure(procedure.procedureId) });
      },
    }),
    addTeamMember: useMutation({
      mutationFn: ({
        procedureId,
        ...payload
      }: {
        procedureId: string;
        memberRole: string;
        userId: string;
        memberName?: string;
      }) => addOtTeamMember(procedureId, payload),
      onSuccess: (_, vars) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: otKeys.procedure(vars.procedureId) });
      },
    }),
    addNote: useMutation({
      mutationFn: ({
        procedureId,
        noteType,
        content,
      }: {
        procedureId: string;
        noteType: string;
        content: string;
      }) => addOtNote(procedureId, { noteType, content }),
      onSuccess: (_, vars) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: otKeys.procedure(vars.procedureId) });
      },
    }),
    addImplant: useMutation({
      mutationFn: ({
        procedureId,
        ...payload
      }: {
        procedureId: string;
        implantName: string;
        implantType?: string;
        manufacturer?: string;
        lotNumber?: string;
        serialNumber?: string;
        quantity?: number;
        notes?: string;
      }) => addOtImplant(procedureId, payload),
      onSuccess: (_, vars) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: otKeys.procedure(vars.procedureId) });
      },
    }),
    upsertAnesthesiaChart: useMutation({
      mutationFn: ({
        procedureId,
        ...payload
      }: {
        procedureId: string;
        asaClass?: string;
        anesthesiaType: string;
        inductionAgent?: string;
        airwayDevice?: string;
        startedAt?: string;
        endedAt?: string;
        complications?: string;
        notes?: string;
      }) => upsertOtAnesthesiaChart(procedureId, payload),
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: otKeys.procedure(vars.procedureId) });
      },
    }),
    addAnesthesiaEvent: useMutation({
      mutationFn: ({
        procedureId,
        ...payload
      }: {
        procedureId: string;
        eventType: string;
        systolicBp?: number;
        diastolicBp?: number;
        pulse?: number;
        spo2?: number;
        notes?: string;
      }) => addOtAnesthesiaEvent(procedureId, payload),
      onSuccess: (_, vars) => {
        qc.invalidateQueries({ queryKey: otKeys.procedure(vars.procedureId) });
      },
    }),
    startProcedure: useMutation({
      mutationFn: startOtProcedure,
      onSuccess: (procedure) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: otKeys.procedure(procedure.procedureId) });
      },
    }),
    completeProcedure: useMutation({
      mutationFn: ({
        procedureId,
        completionSummary,
      }: {
        procedureId: string;
        completionSummary?: string;
      }) => completeOtProcedure(procedureId, { summaryText: completionSummary }),
      onSuccess: (procedure) => {
        invalidateScope();
        qc.invalidateQueries({ queryKey: otKeys.procedure(procedure.procedureId) });
        qc.invalidateQueries({ queryKey: otKeys.encounterProcedures(procedure.encounterId) });
      },
    }),
  };
}
