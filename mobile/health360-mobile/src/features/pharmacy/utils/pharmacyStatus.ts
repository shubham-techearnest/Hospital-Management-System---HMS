const PHARMACY_REQUEST_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  RECEIVED: 'Received',
  UNDER_REVIEW: 'Under review',
  READY: 'Ready for pickup',
  DISPENSED: 'Dispensed',
  CANCELLED: 'Cancelled',
};

export function pharmacyRequestStatusLabel(status?: string): string {
  return status ? (PHARMACY_REQUEST_LABELS[status] ?? status) : '—';
}
