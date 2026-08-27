import { Chip, LinearProgress, Stack, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  opdChecklistProgress,
  type OpdChecklistStep,
  type OpdChecklistStepId,
} from '../utils/opdVisitChecklist';

const SECTION_IDS: Record<OpdChecklistStepId, string> = {
  vitals: 'opd-step-vitals',
  consult: 'opd-step-consult',
  diagnosis: 'opd-step-diagnosis',
  rx: 'opd-step-rx',
  labs: 'opd-step-labs',
  billing: 'opd-step-billing',
};

export function opdStepSectionId(id: OpdChecklistStepId): string {
  return SECTION_IDS[id];
}

type Props = {
  steps: OpdChecklistStep[];
  scrollToSections?: boolean;
};

export function OpdVisitChecklist({ steps, scrollToSections = true }: Props) {
  const { done, total } = opdChecklistProgress(steps);
  const requiredOpen = steps.filter((s) => s.required && !s.done);

  return (
    <Stack spacing={1} sx={{ mb: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="baseline">
        <Typography variant="subtitle2">Visit checklist</Typography>
        <Typography variant="caption" color="text.secondary">
          {done}/{total} · {requiredOpen.length === 0 ? 'Required steps done' : `${requiredOpen.length} required remaining`}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={total === 0 ? 0 : (done / total) * 100}
        sx={{ height: 6, borderRadius: 1 }}
      />
      <Stack direction="row" flexWrap="wrap" gap={0.75}>
        {steps.map((step) => (
          <Chip
            key={step.id}
            size="small"
            icon={step.done ? <CheckCircleOutlineIcon /> : <RadioButtonUncheckedIcon />}
            color={step.done ? 'success' : 'default'}
            variant={step.done ? 'filled' : 'outlined'}
            label={step.label}
            title={step.hint}
            onClick={
              scrollToSections
                ? () => document.getElementById(opdStepSectionId(step.id))?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                : undefined
            }
          />
        ))}
      </Stack>
    </Stack>
  );
}
