import { apiClient } from '@/shared/api/client';
import type { ApiEnvelope } from '@/features/auth/api/authApi';

export type ClassificationLevel = 'NORMAL' | 'WARNING' | 'CRITICAL' | 'INSUFFICIENT_DATA';

export type MetricType =
  | 'BMI'
  | 'BMR'
  | 'IDEAL_WEIGHT'
  | 'LEAN_BODY_MASS'
  | 'BODY_FAT_PERCENT'
  | 'BODY_SURFACE_AREA'
  | 'HEALTHY_WEIGHT_RANGE'
  | 'PROTEIN_REQUIREMENT'
  | 'WATER_INTAKE'
  | 'DAILY_CALORIES'
  | 'SLEEP_RECOMMENDATION'
  | 'DAILY_STEP_GOAL'
  | 'HEART_RATE_ZONES'
  | 'BP_CLASSIFICATION'
  | 'BLOOD_SUGAR_CLASSIFICATION'
  | 'WAIST_HIP_RATIO'
  | 'WAIST_HEIGHT_RATIO'
  | 'WELLNESS_SCORE'
  | 'HEALTH_RISK_SCORE'
  | 'PROFILE_COMPLETION';

export interface MetricDto {
  metricType: MetricType;
  value: number | null;
  unit: string | null;
  classification: ClassificationLevel;
  interpretation: string | null;
  missingFields: string[];
  displayValue: string | null;
  disclaimer: string | null;
}

export interface ScoreSummary {
  score: number | null;
  label: string | null;
}

export interface GoalProgress {
  goalType: string;
  label: string;
  currentValue: number | null;
  targetValue: number | null;
  unit: string;
  progressPercent: number | null;
}

export interface TrendPoint {
  recordedAt: string;
  value: number;
}

export interface VitalsTrendSeries {
  seriesType: string;
  unit: string;
  points: TrendPoint[];
}

export interface TimelineEvent {
  eventType: string;
  title: string;
  description: string;
  occurredAt: string;
  referenceId: string | null;
}

export interface HealthDashboard {
  completionScore: number;
  wellnessScore: ScoreSummary | null;
  healthRiskScore: ScoreSummary | null;
  metrics: MetricDto[];
  goalsProgress: GoalProgress[];
  recentVitalsTrend: VitalsTrendSeries[];
  recentTimeline: TimelineEvent[];
  disclaimer: string;
  calculatedAt: string;
}

export interface MetricHistoryPoint {
  recordedAt: string;
  value: number;
  unit: string;
  displayValue: string | null;
}

export interface PagedHistory {
  content: MetricHistoryPoint[];
  totalElements: number;
}

export async function getHealthDashboard() {
  const { data } = await apiClient.get<ApiEnvelope<HealthDashboard>>('/analytics/patients/me/dashboard');
  return data.data;
}

export async function getAllMetrics() {
  const { data } = await apiClient.get<ApiEnvelope<MetricDto[]>>('/analytics/patients/me/metrics');
  return data.data;
}

export async function getMetric(metricType: MetricType) {
  const { data } = await apiClient.get<ApiEnvelope<MetricDto>>(`/analytics/patients/me/metrics/${metricType}`);
  return data.data;
}

export async function getMetricHistory(metricType: MetricType, page = 0, size = 20) {
  const { data } = await apiClient.get<ApiEnvelope<PagedHistory>>(
    `/analytics/patients/me/metrics/${metricType}/history`,
    { params: { page, size } },
  );
  return data.data;
}

export async function downloadHealthReportPdf(): Promise<ArrayBuffer> {
  const { data } = await apiClient.get<ArrayBuffer>('/analytics/patients/me/report/pdf', {
    responseType: 'arraybuffer',
  });
  return data;
}
