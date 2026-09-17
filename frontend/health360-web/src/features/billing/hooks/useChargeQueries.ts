import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isAxiosError } from 'axios';
import {
  listChargeExceptions,
  resolveChargeException,
  type ChargeException,
} from '../api/chargesApi';

const chargeKeys = {
  exceptions: (hospitalId: string, status: string, page: number) =>
    ['billing', 'charges', 'exceptions', hospitalId, status, page] as const,
};

function isAuthError(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  const status = error.response?.status;
  return status === 401 || status === 403;
}

export function useChargeExceptions(hospitalId?: string, status = 'OPEN', page = 0) {
  return useQuery({
    queryKey: chargeKeys.exceptions(hospitalId ?? '', status, page),
    queryFn: () => listChargeExceptions(hospitalId!, status || undefined, page),
    enabled: Boolean(hospitalId),
    retry: (_, error) => !isAuthError(error),
  });
}

export function useChargeExceptionMutations(hospitalId?: string) {
  const qc = useQueryClient();
  return {
    resolve: useMutation({
      mutationFn: ({
        exceptionId,
        decision,
        note,
      }: {
        exceptionId: string;
        decision: 'RESOLVED' | 'IGNORED';
        note?: string;
      }) => resolveChargeException(exceptionId, decision, note),
      onSuccess: (_: ChargeException) => {
        if (hospitalId) {
          void qc.invalidateQueries({ queryKey: ['billing', 'charges', 'exceptions', hospitalId] });
        }
      },
    }),
  };
}
