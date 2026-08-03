import { isAxiosError } from 'axios';

export type UserFacingErrorKind =
  | 'network'
  | 'session'
  | 'not_found'
  | 'validation'
  | 'forbidden'
  | 'empty'
  | 'unknown';

export interface ParsedApiError {
  kind: UserFacingErrorKind;
  message: string;
}

export function parseApiError(error: unknown): ParsedApiError {
  if (!error) {
    return { kind: 'unknown', message: 'Something went wrong. Please try again.' };
  }

  if (isAxiosError(error)) {
    if (!error.response) {
      return { kind: 'network', message: 'Unable to connect. Check your network and try again.' };
    }

    const status = error.response.status;
    const serverMessage = error.response.data?.error?.message as string | undefined;

    if (status === 401) {
      return { kind: 'session', message: 'Session expired. Please sign in again.' };
    }
    if (status === 403) {
      return { kind: 'forbidden', message: serverMessage ?? 'You do not have permission to view this.' };
    }
    if (status === 404) {
      return { kind: 'not_found', message: serverMessage ?? 'The requested resource was not found.' };
    }
    if (status === 400) {
      return { kind: 'validation', message: serverMessage ?? 'Invalid request. Please check your input.' };
    }

    return {
      kind: 'unknown',
      message: serverMessage ?? 'Something went wrong. Please try again.',
    };
  }

  return { kind: 'unknown', message: 'Something went wrong. Please try again.' };
}

export function emptyStateMessage(filter?: string): string {
  switch (filter) {
    case 'upcoming':
      return 'No upcoming appointments scheduled.';
    case 'past':
      return 'No past appointments yet.';
    case 'cancelled':
      return 'No cancelled appointments.';
    default:
      return 'No appointments scheduled yet.';
  }
}
