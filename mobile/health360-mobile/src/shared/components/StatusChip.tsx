import { Chip } from 'react-native-paper';
import { appColors } from '@/shared/theme';

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
  ACTIVE: { bg: appColors.successContainer, text: appColors.success },
  DEACTIVATED: { bg: appColors.errorContainer, text: appColors.error },
  LOCKED: { bg: appColors.warningContainer, text: appColors.warning },
};

interface StatusChipProps {
  status: string;
}

export function StatusChip({ status }: StatusChipProps) {
  const palette = STATUS_STYLES[status] ?? { bg: appColors.surfaceVariant, text: appColors.textSecondary };

  return (
    <Chip
      compact
      style={{ backgroundColor: palette.bg }}
      textStyle={{ color: palette.text, fontWeight: '600' }}
    >
      {status.replace(/_/g, ' ')}
    </Chip>
  );
}
