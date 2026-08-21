import { useEffect, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import {
  useEncounterActions,
  useEncounterNotes,
} from '@/features/clinical/hooks/useClinicalQueries';
import type { ClinicalNote } from '@/features/clinical/api/clinicalApi';
import { parseApiError } from '@/shared/api/errorUtils';

type FormState = {
  chiefComplaint: string;
  hpi: string;
  examination: string;
  assessment: string;
  plan: string;
};

const EMPTY: FormState = {
  chiefComplaint: '',
  hpi: '',
  examination: '',
  assessment: '',
  plan: '',
};

function toForm(note: ClinicalNote | undefined): FormState {
  if (!note) return EMPTY;
  return {
    chiefComplaint: note.chiefComplaint ?? '',
    hpi: note.hpi ?? '',
    examination: note.examination ?? '',
    assessment: note.assessment ?? '',
    plan: note.plan ?? '',
  };
}

function pickActiveDraft(notes: ClinicalNote[]): ClinicalNote | undefined {
  return notes.find((n) => n.noteType === 'CONSULTATION' && n.status === 'DRAFT');
}

function pickLatestConsultation(notes: ClinicalNote[]): ClinicalNote | undefined {
  return notes.find((n) => n.noteType === 'CONSULTATION');
}

type Props = {
  encounterId: string;
  canEdit: boolean;
};

export function StructuredConsultationPanel({ encounterId, canEdit }: Props) {
  const { data: notes = [], isLoading } = useEncounterNotes(encounterId);
  const actions = useEncounterActions(encounterId);
  const draft = pickActiveDraft(notes);
  const latest = pickLatestConsultation(notes);
  const active = draft ?? (latest?.status === 'FINAL' ? latest : undefined);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setForm(toForm(active));
  }, [active?.noteId, active?.status, active?.plan, active?.chiefComplaint, active?.hpi, active?.examination, active?.assessment]);

  const setField = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const payload = () => ({
    chiefComplaint: form.chiefComplaint.trim() || undefined,
    hpi: form.hpi.trim() || undefined,
    examination: form.examination.trim() || undefined,
    assessment: form.assessment.trim() || undefined,
    plan: form.plan.trim() || undefined,
  });

  const hasAnySection = Object.values(payload()).some(Boolean);
  const readOnly = !canEdit || (active?.status === 'FINAL' && !draft);

  const saveDraft = async () => {
    setError(null);
    setSuccess(null);
    if (!hasAnySection) {
      setError('Enter at least one consultation section.');
      return;
    }
    try {
      if (draft) {
        await actions.updateNote.mutateAsync({ noteId: draft.noteId, payload: payload() });
      } else {
        await actions.createNote.mutateAsync(payload());
      }
      setSuccess('Consultation draft saved.');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const finalize = async () => {
    setError(null);
    setSuccess(null);
    try {
      let noteId = draft?.noteId;
      if (!noteId) {
        if (!hasAnySection) {
          setError('Enter at least one consultation section.');
          return;
        }
        const created = await actions.createNote.mutateAsync(payload());
        noteId = created.noteId;
      } else {
        await actions.updateNote.mutateAsync({ noteId, payload: payload() });
      }
      await actions.finalizeNote.mutateAsync(noteId);
      setSuccess('Consultation finalized.');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const pending =
    actions.createNote.isPending || actions.updateNote.isPending || actions.finalizeNote.isPending;

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">Structured consultation</Typography>
        {active ? (
          <Chip
            size="small"
            label={active.status}
            color={active.status === 'FINAL' ? 'success' : 'warning'}
          />
        ) : null}
      </Stack>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Capture chief complaint, HPI, examination, assessment, and plan. Drafts can be edited; finalized notes are locked.
      </Typography>

      {isLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Stack spacing={1.5}>
        <TextField
          label="Chief complaint"
          multiline
          minRows={2}
          fullWidth
          value={form.chiefComplaint}
          onChange={setField('chiefComplaint')}
          disabled={readOnly || pending}
        />
        <TextField
          label="History of present illness (HPI)"
          multiline
          minRows={3}
          fullWidth
          value={form.hpi}
          onChange={setField('hpi')}
          disabled={readOnly || pending}
        />
        <TextField
          label="Examination"
          multiline
          minRows={3}
          fullWidth
          value={form.examination}
          onChange={setField('examination')}
          disabled={readOnly || pending}
        />
        <TextField
          label="Assessment"
          multiline
          minRows={2}
          fullWidth
          value={form.assessment}
          onChange={setField('assessment')}
          disabled={readOnly || pending}
        />
        <TextField
          label="Plan"
          multiline
          minRows={2}
          fullWidth
          value={form.plan}
          onChange={setField('plan')}
          disabled={readOnly || pending}
        />
      </Stack>

      {!readOnly ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Button variant="outlined" disabled={pending} onClick={saveDraft}>
            Save draft
          </Button>
          <Button variant="contained" disabled={pending} onClick={finalize}>
            Finalize
          </Button>
        </Stack>
      ) : active?.status === 'FINAL' ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          This consultation is finalized and cannot be edited.
        </Typography>
      ) : null}
    </Box>
  );
}
