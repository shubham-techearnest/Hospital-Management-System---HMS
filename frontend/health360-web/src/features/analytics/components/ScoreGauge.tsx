import { Box, CircularProgress, Typography } from '@mui/material';
import type { ClassificationLevel } from '../api/analyticsApi';

const SCORE_COLORS: Record<string, string> = {
  EXCELLENT: '#4CAF50',
  GOOD: '#66BB6A',
  FAIR: '#FF9800',
  NEEDS_ATTENTION: '#F44336',
  LOW_RISK: '#4CAF50',
  MODERATE_RISK: '#FF9800',
  HIGH_RISK: '#F44336',
  VERY_HIGH_RISK: '#B71C1C',
};

interface ScoreGaugeProps {
  title: string;
  score: number | null | undefined;
  label?: string | null;
  loading?: boolean;
  invertColors?: boolean;
}

export function ScoreGauge({ title, score, label, loading }: ScoreGaugeProps) {
  const value = score ?? 0;
  const color = label ? (SCORE_COLORS[label] ?? '#1976d2') : '#1976d2';

  if (loading) {
    return (
      <Box textAlign="center" py={2}>
        <CircularProgress size={48} />
      </Box>
    );
  }

  if (score == null) {
    return (
      <Box textAlign="center">
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>{title}</Typography>
        <Typography variant="body2" color="text.secondary">Complete more profile sections to unlock</Typography>
      </Box>
    );
  }

  return (
    <Box textAlign="center">
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>{title}</Typography>
      <Box position="relative" display="inline-flex" my={1}>
        <CircularProgress
          variant="determinate"
          value={value}
          size={96}
          thickness={5}
          sx={{ color }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          display="flex"
          alignItems="center"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography variant="h5" fontWeight={700}>{value}</Typography>
        </Box>
      </Box>
      {label ? (
        <Typography variant="body2" fontWeight={600} sx={{ color }}>
          {label.replace(/_/g, ' ')}
        </Typography>
      ) : null}
    </Box>
  );
}

export function classificationColor(level: ClassificationLevel): 'success' | 'warning' | 'error' | 'default' {
  switch (level) {
    case 'NORMAL': return 'success';
    case 'WARNING': return 'warning';
    case 'CRITICAL': return 'error';
    default: return 'default';
  }
}
