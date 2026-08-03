import { Link as RouterLink } from 'react-router-dom';
import { Card, CardActionArea, CardContent, Chip, Typography } from '@mui/material';
import type { MetricDto } from '../api/analyticsApi';
import { classificationColor } from './ScoreGauge';

const METRIC_LABELS: Partial<Record<MetricDto['metricType'], string>> = {
  BMI: 'Body Mass Index',
  BMR: 'Basal Metabolic Rate',
  BP_CLASSIFICATION: 'Blood Pressure',
  BLOOD_SUGAR_CLASSIFICATION: 'Blood Sugar',
  DAILY_CALORIES: 'Daily Calories',
  WATER_INTAKE: 'Water Intake',
  PROTEIN_REQUIREMENT: 'Protein Target',
  WAIST_HIP_RATIO: 'Waist-Hip Ratio',
  WAIST_HEIGHT_RATIO: 'Waist-Height Ratio',
};

interface MetricCardProps {
  metric: MetricDto;
  to?: string;
}

export function MetricCard({ metric, to }: MetricCardProps) {
  const title = METRIC_LABELS[metric.metricType] ?? metric.metricType.replace(/_/g, ' ');
  const display = metric.displayValue
    ?? (metric.value != null ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}` : '—');

  const content = (
    <CardContent>
      <Typography variant="overline" color="text.secondary">{title}</Typography>
      <Typography variant="h5" fontWeight={700} sx={{ my: 0.5 }}>{display}</Typography>
      <Chip
        size="small"
        label={metric.classification.replace(/_/g, ' ')}
        color={classificationColor(metric.classification)}
        sx={{ mb: 1 }}
      />
      {metric.interpretation ? (
        <Typography variant="body2" color="text.secondary">{metric.interpretation}</Typography>
      ) : null}
    </CardContent>
  );

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      {to ? (
        <CardActionArea component={RouterLink} to={to} sx={{ height: '100%' }}>
          {content}
        </CardActionArea>
      ) : content}
    </Card>
  );
}
