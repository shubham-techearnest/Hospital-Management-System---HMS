import { Box, Button, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  to?: string;
}

export function EmptyState({ icon, title, description, actionLabel, onAction, to }: EmptyStateProps) {
  return (
    <Stack alignItems="flex-start" spacing={1.5} sx={{ py: 1 }}>
      {icon ? (
        <Box
          aria-hidden
          sx={{
            width: 44,
            height: 44,
            borderRadius: 2,
            bgcolor: 'primary.light',
            color: 'primary.dark',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Typography variant="subtitle1" fontWeight={600}>
        {title}
      </Typography>
      {description ? (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 520, lineHeight: 1.7 }}>
          {description}
        </Typography>
      ) : null}
      {actionLabel && to ? (
        <Button variant="outlined" size="small" component={RouterLink} to={to} sx={{ mt: 0.5 }}>
          {actionLabel}
        </Button>
      ) : null}
      {actionLabel && onAction && !to ? (
        <Button variant="outlined" size="small" onClick={onAction} sx={{ mt: 0.5 }}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  );
}
