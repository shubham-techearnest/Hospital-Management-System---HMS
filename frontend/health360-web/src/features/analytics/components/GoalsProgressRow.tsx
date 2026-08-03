import { Box, LinearProgress, Paper, Typography } from '@mui/material';
import type { GoalProgress } from '../api/analyticsApi';

interface GoalsProgressRowProps {
  goals: GoalProgress[];
}

export function GoalsProgressRow({ goals }: GoalsProgressRowProps) {
  if (goals.length === 0) {
    return null;
  }

  return (
    <Box display="flex" gap={2} flexWrap="wrap">
      {goals.map((goal) => (
        <Paper
          key={goal.goalType}
          variant="outlined"
          sx={{ p: 2, minWidth: 200, flex: '1 1 200px' }}
        >
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {goal.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {goal.currentValue ?? '—'} / {goal.targetValue ?? '—'} {goal.unit}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={goal.progressPercent ?? 0}
            sx={{ height: 8, borderRadius: 4 }}
          />
        </Paper>
      ))}
    </Box>
  );
}
