import { Box, Typography } from '@mui/material';
import type { PropsWithChildren } from 'react';
import { AnimatedPage } from './AnimatedPage';

interface ProfileSectionLayoutProps extends PropsWithChildren {
  title: string;
  description?: string;
}

export function ProfileSectionLayout({ title, description, children }: ProfileSectionLayoutProps) {
  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {title}
      </Typography>
      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          {description}
        </Typography>
      )}
      <Box>{children}</Box>
    </AnimatedPage>
  );
}
