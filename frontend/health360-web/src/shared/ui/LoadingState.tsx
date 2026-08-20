import { Skeleton, Stack } from '@mui/material';
import { LogoLoader } from '@/shared/brand/LogoLoader';

interface LoadingStateProps {
  variant?: 'spinner' | 'page' | 'rows';
  rows?: number;
  label?: string;
}

export function LoadingState({ variant = 'spinner', rows = 3, label = 'Loading' }: LoadingStateProps) {
  if (variant === 'spinner') {
    return <LogoLoader label={label} size={56} showWordmark={false} />;
  }

  if (variant === 'page') {
    return (
      <Stack spacing={2} aria-label={label} role="status">
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="rounded" height={200} />
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} aria-label={label} role="status">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={56} />
      ))}
    </Stack>
  );
}
