import type { AppointmentFilter } from '@/features/scheduling/api/schedulingApi';

export function formatAppointmentDate(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function statusColor(status: string): 'default' | 'success' | 'warning' | 'error' | 'info' {
  switch (status) {
    case 'CONFIRMED':
      return 'success';
    case 'PENDING':
      return 'info';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
    case 'RESCHEDULED':
      return 'error';
    case 'POSTPONED':
    case 'NO_SHOW':
      return 'warning';
    default:
      return 'default';
  }
}

export const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  IN_PERSON: 'In Person',
  TELECONSULTATION: 'Teleconsultation',
  FOLLOW_UP: 'Follow Up',
};

export function formatConsultationType(type: string) {
  return CONSULTATION_TYPE_LABELS[type] ?? type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
}

export const APPOINTMENT_FILTERS: { label: string; value: AppointmentFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Past', value: 'past' },
  { label: 'Cancelled', value: 'cancelled' },
];
