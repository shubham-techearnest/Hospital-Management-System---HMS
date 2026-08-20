import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
} from '@mui/material';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { fadeInUp } from './AnimatedPage';

interface VitalCardProps {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: ReactNode;
  status?: 'normal' | 'warning' | 'critical';
  onEdit?: () => void;
  index?: number;
}

const statusColor = {
  normal: 'success',
  warning: 'warning',
  critical: 'error',
} as const;

export function VitalCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  status,
  onEdit,
  index = 0,
}: VitalCardProps) {
  return (
    <motion.div variants={fadeInUp} custom={index}>
      <Card
        elevation={0}
        sx={{
          height: '100%',
          border: '1px solid',
          borderColor: 'divider',
          transition: 'box-shadow var(--h360-duration) var(--h360-ease), transform var(--h360-duration) var(--h360-ease)',
          '&:hover': { boxShadow: 'var(--h360-shadow-sm)', transform: 'translateY(-1px)' },
        }}
      >
        <CardContent>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={1}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-hidden
            >
              {icon}
            </Box>
            {status && (
              <Chip
                label={status}
                size="small"
                color={statusColor[status]}
                sx={{ textTransform: 'capitalize' }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {title}
          </Typography>
          <Typography variant="h4" fontWeight={700} component="p">
            {value}
            {unit && (
              <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 0.5 }}>
                {unit}
              </Typography>
            )}
          </Typography>
          {subtitle && (
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              {subtitle}
            </Typography>
          )}
        </CardContent>
        {onEdit && (
          <CardActions sx={{ px: 2, pb: 2 }}>
            <Button size="small" onClick={onEdit} aria-label={`Edit ${title}`}>
              Record
            </Button>
          </CardActions>
        )}
      </Card>
    </motion.div>
  );
}
