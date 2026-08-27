import {
  visitEncounterStatusColor,
  visitEncounterStatusLabel,
} from '@/shared/status/visitStatus';

export const ENCOUNTER_STATUS_LABELS: Record<string, string> = {
  REGISTERED: 'Registered',
  WAITING: 'Waiting',
  IN_PROGRESS: 'In consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function encounterStatusLabel(status: string): string {
  return visitEncounterStatusLabel(status);
}

export function encounterStatusColor(
  status: string,
): 'default' | 'warning' | 'info' | 'success' | 'error' {
  return visitEncounterStatusColor(status);
}

export function formatEncounterDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
