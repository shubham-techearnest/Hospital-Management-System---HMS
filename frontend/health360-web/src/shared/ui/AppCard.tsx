import type { PropsWithChildren } from 'react';
import { Box, Card, type CardProps } from '@mui/material';

type AppCardProps = CardProps & {
  interactive?: boolean;
};

export function AppCard({ interactive = false, sx, ...props }: AppCardProps) {
  return (
    <Card
      variant="outlined"
      elevation={0}
      sx={{
        height: '100%',
        borderColor: 'divider',
        boxShadow: 'var(--h360-shadow-xs)',
        transition: 'box-shadow var(--h360-duration) var(--h360-ease), transform var(--h360-duration) var(--h360-ease), border-color var(--h360-duration) var(--h360-ease)',
        ...(interactive
          ? {
              '&:hover': {
                boxShadow: 'var(--h360-shadow-sm)',
                transform: 'translateY(-1px)',
                borderColor: 'primary.light',
              },
              '&:focus-within': {
                boxShadow: 'var(--h360-shadow-focus)',
              },
            }
          : null),
        ...sx,
      }}
      {...props}
    />
  );
}

export function AppCardIconWell({ children }: PropsWithChildren) {
  return (
    <Box
      aria-hidden
      sx={{
        width: 48,
        height: 48,
        borderRadius: 2,
        bgcolor: 'primary.light',
        color: 'primary.dark',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        transition: 'transform var(--h360-duration) var(--h360-ease)',
        '.MuiCard-root:hover &': { transform: 'scale(1.04)' },
      }}
    >
      {children}
    </Box>
  );
}
