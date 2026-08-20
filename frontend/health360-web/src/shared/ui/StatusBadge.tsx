import { Chip, type ChipProps } from '@mui/material';

type StatusTone = 'success' | 'warning' | 'error' | 'default' | 'primary';

const TONE_COLOR: Record<StatusTone, ChipProps['color']> = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  default: 'default',
  primary: 'primary',
};

export function statusTone(status: string): StatusTone {
  const value = status.toUpperCase().replace(/\s+/g, '_');
  if (['ACTIVE', 'COMPLETED', 'RELEASED', 'VERIFIED', 'NORMAL', 'CONFIRMED', 'SUCCESS'].includes(value)) {
    return 'success';
  }
  if (['PENDING', 'WAITING', 'SAMPLE_COLLECTED', 'RESULTS_DRAFT', 'WARNING', 'POSTPONED'].includes(value)) {
    return 'warning';
  }
  if (['CANCELLED', 'CRITICAL', 'REJECTED', 'FAILED', 'LOCKED', 'DEACTIVATED'].includes(value)) {
    return 'error';
  }
  if (['IN_PROGRESS', 'RECEIVED', 'SCHEDULED'].includes(value)) {
    return 'primary';
  }
  return 'default';
}

interface StatusBadgeProps {
  label: string;
  tone?: StatusTone;
}

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <Chip
      size="small"
      label={label.replace(/_/g, ' ')}
      color={TONE_COLOR[tone ?? statusTone(label)]}
      sx={{ textTransform: 'capitalize' }}
    />
  );
}
