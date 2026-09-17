import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Container, Link, Paper, Stack, Typography } from '@mui/material';
import { Health360Logo } from '@/shared/brand/Health360Logo';
import { brand } from '@/shared/brand/brand';
import { AppLayout } from '@/shared/layout/AppLayout';

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md';
}

export function AuthPageShell({
  title,
  subtitle,
  children,
  footer,
  maxWidth = 'sm',
}: AuthPageShellProps) {
  return (
    <AppLayout>
      <Box
        sx={{
          minHeight: { xs: 'calc(100vh - 64px)', md: 'auto' },
          background: `
            radial-gradient(ellipse 70% 50% at 100% 0%, rgba(113, 79, 255, 0.12) 0%, transparent 55%),
            radial-gradient(ellipse 50% 40% at 0% 100%, rgba(136, 82, 204, 0.08) 0%, transparent 50%),
            linear-gradient(180deg, #f7f6ff 0%, #ffffff 45%, #ffffff 100%)
          `,
          py: { xs: 3, md: 6 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Container maxWidth={maxWidth}>
          <Paper
            variant="outlined"
            sx={{
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              borderColor: 'divider',
              boxShadow: '0 16px 48px rgba(15, 11, 40, 0.06)',
              bgcolor: 'background.paper',
            }}
          >
            <Stack spacing={0.5} sx={{ mb: 2.5 }}>
              <Box
                component={RouterLink}
                to="/"
                aria-label={`${brand.name} home`}
                sx={{ display: 'inline-flex', width: 'fit-content', textDecoration: 'none', mb: 0.5 }}
              >
                <Health360Logo size={40} withWordmark compact />
              </Box>
              <Typography variant="h4" fontWeight={800} sx={{ letterSpacing: '-0.02em', fontSize: { xs: '1.5rem', sm: '1.75rem' } }}>
                {title}
              </Typography>
              <Typography color="text.secondary" sx={{ lineHeight: 1.65 }}>
                {subtitle}
              </Typography>
            </Stack>
            {children}
            {footer ? <Box sx={{ mt: 3 }}>{footer}</Box> : null}
          </Paper>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2.5 }}>
            Patients self-register. Hospitals &amp; doctors request access. Staff are invited by their hospital.
          </Typography>
        </Container>
      </Box>
    </AppLayout>
  );
}

export function AuthFooterLink({ to, prompt, label }: { to: string; prompt: string; label: string }) {
  return (
    <Typography textAlign="center" variant="body2" color="text.secondary">
      {prompt}{' '}
      <Link component={RouterLink} to={to} fontWeight={700} underline="hover">
        {label}
      </Link>
    </Typography>
  );
}
