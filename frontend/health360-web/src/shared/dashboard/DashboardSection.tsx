import { Box, Paper, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  noPadding?: boolean;
}

export function DashboardSection({ title, action, children, noPadding }: DashboardSectionProps) {
  return (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        height: '100%',
        minWidth: 0,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={1}
        sx={{
          px: { xs: 2, sm: 2.5, md: 3 },
          py: { xs: 1.5, md: 2 },
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" fontWeight={600} sx={{ lineHeight: 1.4 }}>
          {title}
        </Typography>
        {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
      </Stack>
      <Box
        sx={{
          p: noPadding ? 0 : { xs: 2, sm: 2.5, md: 3 },
          minWidth: 0,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Paper>
  );
}
