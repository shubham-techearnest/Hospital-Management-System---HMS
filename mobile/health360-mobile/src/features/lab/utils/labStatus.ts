import { appColors } from '@/shared/theme';

const LAB_ORDER_LABELS: Record<string, string> = {
  ORDERED: 'Ordered',
  RECEIVED: 'Received',
  SAMPLE_COLLECTED: 'Sample collected',
  RESULTS_DRAFT: 'Results pending',
  VERIFIED: 'Verified',
  RELEASED: 'Released',
  CANCELLED: 'Cancelled',
};

export function labOrderStatusLabel(status?: string): string {
  return status ? (LAB_ORDER_LABELS[status] ?? status.replace(/_/g, ' ')) : '—';
}

export function labOrderStatusColor(status?: string): string {
  switch (status) {
    case 'ORDERED':
      return appColors.warning;
    case 'RECEIVED':
    case 'SAMPLE_COLLECTED':
    case 'RESULTS_DRAFT':
    case 'VERIFIED':
      return appColors.primary;
    case 'RELEASED':
      return appColors.success;
    case 'CANCELLED':
      return appColors.error;
    default:
      return appColors.textSecondary;
  }
}
