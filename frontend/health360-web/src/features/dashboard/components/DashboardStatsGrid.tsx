import { Grid, Skeleton } from '@mui/material';
import type { ReactNode } from 'react';
import { StatCard } from '@/shared/dashboard/StatCard';

export interface DashboardStatItem {
  label: string;
  value: number | string;
  hint?: string;
  icon?: ReactNode;
  to?: string;
  accent?: string;
}

interface DashboardStatsGridProps {
  items: DashboardStatItem[];
  loading?: boolean;
}

export function DashboardStatsGrid({ items, loading }: DashboardStatsGridProps) {
  if (loading) {
    return (
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Skeleton variant="rounded" height={96} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={3} key={item.label}>
          <StatCard
            label={item.label}
            value={item.value}
            hint={item.hint}
            icon={item.icon}
            to={item.to}
            accent={item.accent}
          />
        </Grid>
      ))}
    </Grid>
  );
}
