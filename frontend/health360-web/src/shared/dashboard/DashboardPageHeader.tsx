import { Box, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function DashboardPageHeader({ title, subtitle, actions }: DashboardPageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', lg: 'row' }}
      alignItems={{ xs: 'flex-start', lg: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ mb: { xs: 2, md: 3 }, minWidth: 0 }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom={Boolean(subtitle)} sx={{ lineHeight: 1.25, wordBreak: 'break-word' }}>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, maxWidth: 720 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {actions ? (
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ width: { xs: '100%', lg: 'auto' }, flexShrink: 0 }}
        >
          {actions}
        </Stack>
      ) : null}
    </Stack>
  );
}
