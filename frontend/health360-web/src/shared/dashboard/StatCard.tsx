import { Link as RouterLink } from 'react-router-dom';
import { Box, Card, CardActionArea, CardContent, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  hint?: string;
  icon?: ReactNode;
  to?: string;
  accent?: string;
}

export function StatCard({ label, value, hint, icon, to, accent = 'primary.main' }: StatCardProps) {
  const content = (
    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
      <StackRow icon={icon} accent={accent}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="overline" color="text.secondary" sx={{ lineHeight: 1.4 }}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} sx={{ mt: 0.5, wordBreak: 'break-word', fontVariantNumeric: 'tabular-nums' }}>
            {value}
          </Typography>
          {hint ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              {hint}
            </Typography>
          ) : null}
        </Box>
      </StackRow>
    </CardContent>
  );

  return (
    <Card
      variant="outlined"
      sx={{
        height: '100%',
        boxShadow: 'var(--h360-shadow-xs)',
        transition: 'box-shadow var(--h360-duration) var(--h360-ease), transform var(--h360-duration) var(--h360-ease), border-color var(--h360-duration) var(--h360-ease)',
        ...(to
          ? {
              '&:hover': {
                boxShadow: 'var(--h360-shadow-sm)',
                transform: 'translateY(-1px)',
                borderColor: 'primary.light',
              },
            }
          : null),
      }}
    >
      {to ? (
        <CardActionArea component={RouterLink} to={to} sx={{ height: '100%' }}>
          {content}
        </CardActionArea>
      ) : (
        content
      )}
    </Card>
  );
}

function StackRow({ icon, accent, children }: { icon?: ReactNode; accent: string; children: ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
      {icon ? (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: `${accent}14`,
            color: accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      ) : null}
      {children}
    </Box>
  );
}
