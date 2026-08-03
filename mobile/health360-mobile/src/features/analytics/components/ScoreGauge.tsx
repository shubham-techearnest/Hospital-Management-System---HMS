import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import type { ClassificationLevel } from '../api/analyticsApi';

import { appColors } from '@/shared/theme';

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
}

const SIZE = 96;
const STROKE = 8;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreGauge({ title, score, label, loading }: ScoreGaugeProps) {
  const value = score ?? 0;
  const color = label ? (SCORE_COLORS[label] ?? appColors.primary) : appColors.primary;
  const progress = Math.min(Math.max(value, 0), 100);
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="small" />
      </View>
    );
  }

  if (score == null) {
    return (
      <View style={styles.center}>
        <Text variant="labelMedium" style={styles.title}>{title}</Text>
        <Text variant="bodySmall" style={styles.muted}>Complete more profile sections to unlock</Text>
      </View>
    );
  }

  return (
    <View style={styles.center}>
      <Text variant="labelMedium" style={styles.title}>{title}</Text>
      <View style={styles.gaugeWrap}>
        <Svg width={SIZE} height={SIZE}>
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={appColors.outline}
            strokeWidth={STROKE}
            fill="none"
          />
          <Circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            stroke={color}
            strokeWidth={STROKE}
            fill="none"
            strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${SIZE / 2}, ${SIZE / 2}`}
          />
        </Svg>
        <View style={styles.scoreOverlay}>
          <Text variant="headlineSmall" style={styles.scoreText}>{value}</Text>
        </View>
      </View>
      {label ? (
        <Text variant="bodySmall" style={[styles.label, { color }]}>
          {label.replace(/_/g, ' ')}
        </Text>
      ) : null}
    </View>
  );
}

export function classificationColor(level: ClassificationLevel): 'normal' | 'warning' | 'critical' | 'default' {
  switch (level) {
    case 'NORMAL': return 'normal';
    case 'WARNING': return 'warning';
    case 'CRITICAL': return 'critical';
    default: return 'default';
  }
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 8, minHeight: 140, justifyContent: 'center' },
  title: { opacity: 0.7, marginBottom: 4, textAlign: 'center' },
  muted: { opacity: 0.6, textAlign: 'center', paddingHorizontal: 8 },
  gaugeWrap: { position: 'relative', marginVertical: 8, alignItems: 'center' },
  scoreOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: { fontWeight: '700', textAlign: 'center' },
  label: { fontWeight: '600', marginTop: 4, textAlign: 'center', paddingHorizontal: 4 },
});
