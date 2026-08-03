import { Box, Typography } from '@mui/material';
import type { TrendPoint } from '../api/analyticsApi';

interface SparklineChartProps {
  points: TrendPoint[];
  width?: number;
  height?: number;
  color?: string;
}

export function SparklineChart({
  points,
  width = 160,
  height = 48,
  color = '#1976d2',
}: SparklineChartProps) {
  if (points.length < 2) {
    return (
      <Typography variant="caption" color="text.secondary">
        Need 2+ readings for trend
      </Typography>
    );
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 4;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const coords = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * innerW;
    const y = padding + innerH - ((value - min) / range) * innerH;
    return `${x},${y}`;
  });

  return (
    <Box component="svg" width={width} height={height} aria-hidden>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
        points={coords.join(' ')}
      />
    </Box>
  );
}
