export function encounterStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    REGISTERED: 'Registered',
    WAITING: 'Waiting',
    IN_PROGRESS: 'In consultation',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
  };
  return labels[status] ?? status.replace(/_/g, ' ');
}

export function formatEncounterDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
