import { Box, Typography } from '@mui/material';
import type { MetricHistoryPoint } from '../api/analyticsApi';

interface LineChartProps {
  points: MetricHistoryPoint[];
  width?: number;
  height?: number;
  color?: string;
  singlePointMessage?: string;
}

export function LineChart({
  points,
  width = 400,
  height = 120,
  color = '#1976d2',
  singlePointMessage = 'Add more recordings',
}: LineChartProps) {
  const sorted = [...points].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
  );

  if (sorted.length === 0) {
    return (
      <Typography variant="caption" color="text.secondary">
        No data yet
      </Typography>
    );
  }

  if (sorted.length === 1) {
    return (
      <Typography variant="caption" color="text.secondary">
        {singlePointMessage}
      </Typography>
    );
  }

  const values = sorted.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const padding = 8;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const coords = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * innerW;
    const y = padding + innerH - ((value - min) / range) * innerH;
    return `${x},${y}`;
  });

  return (
    <Box component="svg" width={width} height={height} aria-hidden sx={{ maxWidth: '100%' }}>
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
