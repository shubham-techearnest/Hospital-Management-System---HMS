import { Grid } from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { StatCard } from '@/shared/dashboard/StatCard';
import { usePrefersReducedMotion } from '@/shared/motion/usePrefersReducedMotion';
import { motionEase } from '@/shared/motion/transitions';
import { CardSkeleton } from '@/shared/ui/skeletons';

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
  const reduceMotion = usePrefersReducedMotion();

  if (loading) {
    return (
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
        {items.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <CardSkeleton height={112} />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: 3 }}>
      {items.map((item, index) => (
        <Grid item xs={12} sm={6} md={3} key={item.label}>
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : Math.min(index, 5) * 0.04, ease: motionEase }}
          >
            <StatCard
              label={item.label}
              value={item.value}
              hint={item.hint}
              icon={item.icon}
              to={item.to}
              accent={item.accent}
            />
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}
