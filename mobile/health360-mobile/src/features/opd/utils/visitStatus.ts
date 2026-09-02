const QUEUE_LABELS: Record<string, string> = {
  WAITING: 'Waiting',
  CALLED: 'Called — proceed now',
  IN_SERVICE: 'In consultation',
  COMPLETED: 'Completed',
  SKIPPED: 'Skipped',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
};

const QUEUE_COLORS: Record<string, string> = {
  WAITING: '#714fff',
  CALLED: '#ff754c',
  IN_SERVICE: '#8852cc',
  COMPLETED: '#2e7d32',
  SKIPPED: '#585969',
  CANCELLED: '#97144d',
};

export function queueStatusLabel(status?: string): string {
  return status ? (QUEUE_LABELS[status] ?? status) : '—';
}

export function queueStatusColor(status?: string): string {
  return status ? (QUEUE_COLORS[status] ?? '#585969') : '#585969';
}

export function queuePositionLabel(position: number): string {
  return position === 1 ? 'You are next' : `Position ${position}`;
}

const ENCOUNTER_LABELS: Record<string, string> = {
  SCHEDULED: 'Scheduled',
  CHECKED_IN: 'Checked in',
  IN_PROGRESS: 'In progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
};

export function visitEncounterStatusLabel(status?: string): string {
  return status ? (ENCOUNTER_LABELS[status] ?? status) : '—';
}

const INVOICE_LABELS: Record<string, string> = {
  DRAFT: 'Bill draft',
  ISSUED: 'Payment pending',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

const INVOICE_COLORS: Record<string, string> = {
  DRAFT: '#585969',
  ISSUED: '#ff754c',
  PARTIALLY_PAID: '#ff754c',
  PAID: '#2e7d32',
  CANCELLED: '#97144d',
};

export function invoiceStatusLabel(status?: string | null): string {
  if (!status) return 'No bill yet';
  return INVOICE_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function invoiceStatusColor(status?: string | null): string {
  if (!status) return '#585969';
  return INVOICE_COLORS[status] ?? '#585969';
}
