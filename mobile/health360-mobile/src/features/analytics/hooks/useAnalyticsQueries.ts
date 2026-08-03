import { useMutation, useQuery } from '@tanstack/react-query';
import {
  downloadHealthReportPdf,
  getAllMetrics,
  getHealthDashboard,
  getMetric,
  getMetricHistory,
  type MetricType,
} from '../api/analyticsApi';

export const analyticsKeys = {
  dashboard: ['analytics', 'dashboard'] as const,
  metrics: ['analytics', 'metrics'] as const,
  metric: (type: MetricType) => ['analytics', 'metric', type] as const,
  metricHistory: (type: MetricType) => ['analytics', 'metric-history', type] as const,
};

export function useHealthDashboard(enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.dashboard,
    queryFn: getHealthDashboard,
    enabled,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAllMetrics(enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.metrics,
    queryFn: getAllMetrics,
    enabled,
    retry: 1,
  });
}

export function useMetric(metricType: MetricType, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.metric(metricType),
    queryFn: () => getMetric(metricType),
    enabled,
    retry: 1,
  });
}

export function useMetricHistory(metricType: MetricType, enabled = true) {
  return useQuery({
    queryKey: analyticsKeys.metricHistory(metricType),
    queryFn: () => getMetricHistory(metricType),
    enabled,
    retry: 1,
  });
}

export function useDownloadHealthReportPdf() {
  return useMutation({
    mutationFn: downloadHealthReportPdf,
  });
}
