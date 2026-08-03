import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ActivityIndicator, Button, Chip, ProgressBar, Text } from 'react-native-paper';

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppCard } from '@/shared/components/AppCard';

import { useHealthDashboard } from '@/features/analytics/hooks/useAnalyticsQueries';

import type { MetricType } from '@/features/analytics/api/analyticsApi';

import { appColors } from '@/shared/theme';

import type { HomeStackParamList } from '@/navigation/types';



type Props = NativeStackScreenProps<HomeStackParamList, 'HealthAnalytics'>;



const GRID_METRICS: MetricType[] = [

  'BMI',

  'BMR',

  'BP_CLASSIFICATION',

  'BLOOD_SUGAR_CLASSIFICATION',

  'DAILY_CALORIES',

  'WATER_INTAKE',

  'DAILY_STEP_GOAL',

  'SLEEP_RECOMMENDATION',

];



function classificationColor(classification: string) {

  if (classification === 'NORMAL') return appColors.success;

  if (classification === 'WARNING') return appColors.warning;

  if (classification === 'CRITICAL') return appColors.error;

  return appColors.textSecondary;

}



export function HealthAnalyticsScreen({ navigation }: Props) {

  const { data: dashboard, isLoading } = useHealthDashboard();



  const gridMetrics = GRID_METRICS

    .map((type) => dashboard?.metrics.find((m) => m.metricType === type))

    .filter((m): m is NonNullable<typeof m> => m != null);



  return (

    <ScrollView contentContainerStyle={styles.container} style={styles.screen}>

      <Text variant="headlineSmall" style={styles.title}>Health Analytics</Text>

      {dashboard?.disclaimer ? (

        <Text variant="bodySmall" style={styles.disclaimer}>{dashboard.disclaimer}</Text>

      ) : null}



      {isLoading ? (

        <ActivityIndicator />

      ) : (

        <>

          <View style={styles.scoresRow}>

            <AppCard style={styles.scoreCard}>

              <Text variant="labelMedium">Wellness</Text>

              <Text variant="headlineMedium" style={styles.scoreValue}>

                {dashboard?.wellnessScore?.score ?? '—'}

              </Text>

            </AppCard>

            <AppCard style={styles.scoreCard}>

              <Text variant="labelMedium">Risk</Text>

              <Text variant="headlineMedium" style={styles.scoreValue}>

                {dashboard?.healthRiskScore?.score ?? '—'}

              </Text>

            </AppCard>

          </View>



          <Text variant="titleMedium" style={styles.sectionTitle}>Key Metrics</Text>

          {gridMetrics.map((metric) => (
            <Pressable
              key={metric.metricType}
              onPress={() => navigation.navigate('MetricDetail', { metricType: metric.metricType })}
            >
              <AppCard style={styles.metricCard}>
                <Text variant="titleSmall">{metric.metricType.replace(/_/g, ' ')}</Text>
                <Text variant="bodyLarge" style={styles.metricValue}>
                  {metric.displayValue ?? (metric.value != null ? `${metric.value}${metric.unit ? ` ${metric.unit}` : ''}` : '—')}
                </Text>
                <Chip
                  compact
                  style={{ alignSelf: 'flex-start', backgroundColor: classificationColor(metric.classification) }}
                >
                  {metric.classification.replace(/_/g, ' ')}
                </Chip>
              </AppCard>
            </Pressable>
          ))}



          {(dashboard?.goalsProgress?.length ?? 0) > 0 ? (

            <>

              <Text variant="titleMedium" style={styles.sectionTitle}>Goals</Text>

              {dashboard?.goalsProgress.map((goal) => (

                <AppCard key={goal.goalType} style={styles.goalCard}>

                  <Text variant="titleSmall">{goal.label}</Text>

                  <Text variant="bodySmall">

                    {goal.currentValue ?? '—'} / {goal.targetValue ?? '—'} {goal.unit}

                  </Text>

                  <ProgressBar progress={(goal.progressPercent ?? 0) / 100} style={styles.progress} />

                </AppCard>

              ))}

            </>

          ) : null}



          {(dashboard?.recentTimeline?.length ?? 0) > 0 ? (

            <>

              <Text variant="titleMedium" style={styles.sectionTitle}>Recent Activity</Text>

              {dashboard?.recentTimeline.map((event) => (

                <AppCard key={`${event.eventType}-${event.referenceId ?? event.occurredAt}`} style={styles.timelineCard}>

                  <Text variant="titleSmall">{event.title}</Text>

                  <Text variant="bodySmall">{event.description}</Text>

                  <Text variant="labelSmall" style={styles.timelineDate}>

                    {new Date(event.occurredAt).toLocaleString()}

                  </Text>

                </AppCard>

              ))}

            </>

          ) : null}

        </>

      )}

    </ScrollView>

  );

}



const styles = StyleSheet.create({

  screen: { backgroundColor: appColors.background },

  container: { padding: 16, paddingBottom: 32 },

  title: { fontWeight: '700', marginBottom: 8, color: appColors.textPrimary },

  disclaimer: { opacity: 0.75, marginBottom: 16 },

  scoresRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },

  scoreCard: { flex: 1, paddingVertical: 8 },

  scoreValue: { fontWeight: '700' },

  sectionTitle: { fontWeight: '600', marginBottom: 12, marginTop: 8 },

  metricCard: { marginBottom: 8, gap: 6 },

  metricValue: { fontWeight: '600' },

  goalCard: { marginBottom: 8, gap: 6 },

  progress: { height: 8, borderRadius: 4, marginTop: 4 },

  timelineCard: { marginBottom: 8, gap: 4 },

  timelineDate: { opacity: 0.6 },

});

