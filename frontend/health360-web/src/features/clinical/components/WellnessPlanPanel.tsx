import { useEffect, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, Stack, TextField, Typography } from '@mui/material';
import {
  useEncounterActions,
  useEncounterWellnessPlan,
} from '@/features/clinical/hooks/useClinicalQueries';
import { parseApiError } from '@/shared/api/errorUtils';

type FormState = {
  diet: string;
  restGuidance: string;
  exercise: string;
  lifestyle: string;
  notes: string;
  followUpDate: string;
  followUpReason: string;
};

const EMPTY: FormState = {
  diet: '',
  restGuidance: '',
  exercise: '',
  lifestyle: '',
  notes: '',
  followUpDate: '',
  followUpReason: '',
};

type Props = {
  encounterId: string;
  canEdit: boolean;
};

export function WellnessPlanPanel({ encounterId, canEdit }: Props) {
  const { data: plan, isLoading } = useEncounterWellnessPlan(encounterId);
  const actions = useEncounterActions(encounterId);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!plan) return;
    setForm({
      diet: plan.diet ?? '',
      restGuidance: plan.restGuidance ?? '',
      exercise: plan.exercise ?? '',
      lifestyle: plan.lifestyle ?? '',
      notes: plan.notes ?? '',
      followUpDate: plan.followUpDate ?? '',
      followUpReason: plan.followUpReason ?? '',
    });
  }, [
    plan?.wellnessPlanId,
    plan?.diet,
    plan?.restGuidance,
    plan?.exercise,
    plan?.lifestyle,
    plan?.notes,
    plan?.followUpDate,
    plan?.followUpReason,
  ]);

  const setField = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const save = async () => {
    setError(null);
    setSuccess(null);
    try {
      await actions.upsertWellnessPlan.mutateAsync({
        diet: form.diet.trim() || undefined,
        restGuidance: form.restGuidance.trim() || undefined,
        exercise: form.exercise.trim() || undefined,
        lifestyle: form.lifestyle.trim() || undefined,
        notes: form.notes.trim() || undefined,
        followUpDate: form.followUpDate.trim() || null,
        followUpReason: form.followUpReason.trim() || undefined,
      });
      setSuccess('Wellness plan saved.');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const hasContent =
    Boolean(form.diet.trim()) ||
    Boolean(form.restGuidance.trim()) ||
    Boolean(form.exercise.trim()) ||
    Boolean(form.lifestyle.trim()) ||
    Boolean(form.notes.trim()) ||
    Boolean(form.followUpDate.trim());

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Wellness & follow-up
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Diet, rest, exercise, lifestyle guidance and a structured follow-up date for the patient visit package.
      </Typography>

      {isLoading ? (
        <Typography variant="body2" color="text.secondary">
          Loading wellness plan…
        </Typography>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {success ? (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      ) : null}

      {!canEdit && !hasContent ? (
        <Typography variant="body2" color="text.secondary">
          No wellness plan recorded yet.
        </Typography>
      ) : (
        <Stack spacing={2}>
          <TextField
            label="Diet guidance"
            value={form.diet}
            onChange={setField('diet')}
            fullWidth
            multiline
            minRows={2}
            disabled={!canEdit}
          />
          <TextField
            label="Rest guidance"
            value={form.restGuidance}
            onChange={setField('restGuidance')}
            fullWidth
            multiline
            minRows={2}
            disabled={!canEdit}
          />
          <TextField
            label="Exercise"
            value={form.exercise}
            onChange={setField('exercise')}
            fullWidth
            multiline
            minRows={2}
            disabled={!canEdit}
          />
          <TextField
            label="Lifestyle"
            value={form.lifestyle}
            onChange={setField('lifestyle')}
            fullWidth
            multiline
            minRows={2}
            disabled={!canEdit}
          />
          <TextField
            label="Additional notes"
            value={form.notes}
            onChange={setField('notes')}
            fullWidth
            multiline
            minRows={2}
            disabled={!canEdit}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label="Follow-up date"
              type="date"
              value={form.followUpDate}
              onChange={setField('followUpDate')}
              InputLabelProps={{ shrink: true }}
              disabled={!canEdit}
              sx={{ minWidth: 200 }}
            />
            <TextField
              label="Follow-up reason"
              value={form.followUpReason}
              onChange={setField('followUpReason')}
              fullWidth
              disabled={!canEdit}
            />
          </Stack>
          {plan?.followUpStatus ? (
            <Typography variant="caption" color="text.secondary">
              Follow-up status: {plan.followUpStatus}
            </Typography>
          ) : null}
          {canEdit ? (
            <Box>
              <Button
                variant="contained"
                onClick={save}
                disabled={actions.upsertWellnessPlan.isPending}
              >
                Save wellness plan
              </Button>
            </Box>
          ) : null}
        </Stack>
      )}
    </Box>
  );
}
