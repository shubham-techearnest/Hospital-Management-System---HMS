export const ENCOUNTER_STATUS_LABELS: Record<string, string> = {
  REGISTERED: 'Registered',
  WAITING: 'Waiting',
  IN_PROGRESS: 'In consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export function encounterStatusLabel(status: string): string {
  return ENCOUNTER_STATUS_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function encounterStatusColor(
  status: string,
): 'default' | 'warning' | 'info' | 'success' | 'error' {
  switch (status) {
    case 'REGISTERED':
      return 'default';
    case 'WAITING':
      return 'warning';
    case 'IN_PROGRESS':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}

export function formatEncounterDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
