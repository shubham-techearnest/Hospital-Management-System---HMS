import { Box, CircularProgress, Typography } from '@mui/material';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { SECTION_LABELS, SECTION_ROUTES, completionLabel } from '../utils/patientUtils';
import type { ProfileCompletion } from '../api/patientApi';

interface ProfileCompletionWidgetProps {
  completion?: ProfileCompletion;
  loading?: boolean;
  compact?: boolean;
}

function AnimatedRing({ score }: { score: number }) {
  const progress = useMotionValue(0);
  const display = useTransform(progress, (v) => Math.round(v));
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = useTransform(progress, (v) => circumference - (v / 100) * circumference);

  useEffect(() => {
    animate(progress, score, { duration: 1, ease: 'easeOut' });
  }, [score, progress]);

  return (
    <Box sx={{ position: 'relative', width: 140, height: 140, mx: 'auto' }}>
      <svg width="140" height="140" viewBox="0 0 120 120" aria-hidden>
        <circle cx="60" cy="60" r="54" fill="none" stroke="#e3edf7" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r="54"
          fill="none"
          stroke="#1565c0"
          strokeWidth="10"
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ strokeDasharray: circumference, strokeDashoffset }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <motion.span style={{ fontSize: 28, fontWeight: 700, color: '#1565c0' }}>
          {display}
        </motion.span>
        <Typography variant="caption" color="text.secondary">
          %
        </Typography>
      </Box>
    </Box>
  );
}

export function ProfileCompletionWidget({ completion, loading, compact }: ProfileCompletionWidgetProps) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4} aria-label="Loading profile completion">
        <CircularProgress size={32} />
      </Box>
    );
  }

  if (!completion) return null;

  const incomplete = completion.sections.filter((s) => !s.completed);
  const next = incomplete[0];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} gutterBottom>
        Profile Completion
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {completionLabel(completion.completionScore)}
      </Typography>
      <AnimatedRing score={completion.completionScore} />

      {!compact && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            {completion.sections.filter((s) => s.completed).length} of {completion.sections.length} sections complete
          </Typography>
          {next && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Next: complete {SECTION_LABELS[next.name] ?? next.name}
            </Typography>
          )}
          <Box component="ul" sx={{ pl: 2, m: 0 }}>
            {incomplete.map((section) => (
              <Box component="li" key={section.name} sx={{ mb: 0.5 }}>
                <Typography
                  component={RouterLink}
                  to={SECTION_ROUTES[section.name] ?? '/patient/profile'}
                  variant="body2"
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' },
                    '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main' },
                  }}
                >
                  {SECTION_LABELS[section.name] ?? section.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
