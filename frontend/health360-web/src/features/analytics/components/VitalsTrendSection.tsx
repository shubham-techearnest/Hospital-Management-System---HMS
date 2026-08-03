import { Grid, Paper, Typography } from '@mui/material';
import type { VitalsTrendSeries } from '../api/analyticsApi';
import { SparklineChart } from './SparklineChart';

const SERIES_LABELS: Record<string, string> = {
  SYSTOLIC_BP: 'Blood Pressure (Systolic)',
  BLOOD_GLUCOSE: 'Blood Glucose',
  WEIGHT: 'Weight',
};

interface VitalsTrendSectionProps {
  series: VitalsTrendSeries[];
}

export function VitalsTrendSection({ series }: VitalsTrendSectionProps) {
  if (series.length === 0) {
    return null;
  }

  return (
    <Grid container spacing={2}>
      {series.map((item) => (
        <Grid item xs={12} sm={4} key={item.seriesType}>
          <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
            <Typography variant="subtitle2" fontWeight={600} gutterBottom>
              {SERIES_LABELS[item.seriesType] ?? item.seriesType.replace(/_/g, ' ')}
            </Typography>
            <SparklineChart points={[...item.points].reverse()} />
            {item.points.length > 0 ? (
              <Typography variant="caption" color="text.secondary">
                Latest: {item.points[0].value} {item.unit}
              </Typography>
            ) : null}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
