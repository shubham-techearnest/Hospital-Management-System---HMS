import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Polyline } from 'react-native-svg';
import { AppCard } from '@/shared/components/AppCard';
import { appColors } from '@/shared/theme';
import type { TrendPoint } from '../api/analyticsApi';

const SERIES_LABELS: Record<string, string> = {
  SYSTOLIC_BP: 'Blood Pressure (Systolic)',
  BLOOD_GLUCOSE: 'Blood Glucose',
  WEIGHT: 'Weight',
};

const CHART_WIDTH = 200;
const CHART_HEIGHT = 48;

function Sparkline({ points }: { points: TrendPoint[] }) {
  if (points.length < 2) {
    return <View style={styles.emptyChart} />;
  }

  const values = points.map((p) => p.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const coords = points.map((p, i) => {
    const x = (i / (points.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((p.value - min) / range) * (CHART_HEIGHT - 4) - 2;
    return `${x},${y}`;
  });

  return (
    <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
      <Polyline
        points={coords.join(' ')}
        fill="none"
        stroke={appColors.primary}
        strokeWidth={2}
      />
    </Svg>
  );
}

interface VitalsTrendSectionProps {
  series: { seriesType: string; unit: string; points: TrendPoint[] }[];
}

export function VitalsTrendSection({ series }: VitalsTrendSectionProps) {
  if (series.length === 0) {
    return null;
  }

  return (
    <View style={styles.row}>
      {series.map((item) => {
        const orderedPoints = [...item.points].reverse();
        const latest = item.points[0];
        return (
          <AppCard key={item.seriesType} style={styles.card}>
            <Text variant="titleSmall" style={styles.label}>
              {SERIES_LABELS[item.seriesType] ?? item.seriesType.replace(/_/g, ' ')}
            </Text>
            <Sparkline points={orderedPoints} />
            {latest ? (
              <Text variant="bodySmall" style={styles.caption}>
                Latest: {latest.value} {item.unit}
              </Text>
            ) : null}
          </AppCard>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: 12 },
  card: { marginBottom: 8 },
  label: { fontWeight: '600', marginBottom: 8 },
  caption: { opacity: 0.7, marginTop: 4 },
  emptyChart: { height: CHART_HEIGHT },
});
