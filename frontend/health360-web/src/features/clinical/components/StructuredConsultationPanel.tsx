import { useEffect, useState, type ChangeEvent } from 'react';
import { Alert, Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';
import {
  useEncounterActions,
  useEncounterDiagnoses,
  useEncounterNotes,
} from '@/features/clinical/hooks/useClinicalQueries';
import type { ClinicalNote } from '@/features/clinical/api/clinicalApi';
import type { DiagnosisCatalogItem } from '@/features/hospital/api/clinicalCatalogApi';
import { useSymptoms } from '@/features/hospital/hooks/useClinicalCatalogQueries';
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

function toQuickForm(note: ClinicalNote | undefined, visitReason?: string): { findings: string; plan: string } {
  if (!note) {
    return { findings: visitReason?.trim() ?? '', plan: '' };
  }
  const findings = [note.chiefComplaint, note.hpi, note.examination].filter(Boolean).join('\n');
  const plan = [note.assessment, note.plan].filter(Boolean).join('\n');
  return { findings, plan };
}

function fromQuickForm(findings: string, plan: string): FormState {
  return {
    chiefComplaint: findings.trim(),
    hpi: '',
    examination: '',
    assessment: plan.trim(),
    plan: '',
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
  hospitalId?: string;
  branchId?: string;
  visitReason?: string;
  diagnosisCatalog?: DiagnosisCatalogItem[];
  canEdit: boolean;
  compact?: boolean;
  onFinalized?: () => void;
};

export function StructuredConsultationPanel({
  encounterId,
  hospitalId,
  branchId,
  visitReason,
  diagnosisCatalog = [],
  canEdit,
  compact = false,
  onFinalized,
}: Props) {
  const { data: notes = [], isLoading } = useEncounterNotes(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: symptoms = [] } = useSymptoms(hospitalId, branchId);
  const actions = useEncounterActions(encounterId);
  const draft = pickActiveDraft(notes);
  const latest = pickLatestConsultation(notes);
  const active = draft ?? (latest?.status === 'FINAL' ? latest : undefined);

  const [form, setForm] = useState<FormState>(EMPTY);
  const [quickFindings, setQuickFindings] = useState('');
  const [quickPlan, setQuickPlan] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (compact) {
      const q = toQuickForm(active, visitReason);
      setQuickFindings(q.findings);
      setQuickPlan(q.plan);
    } else {
      setForm(toForm(active));
      if (!active && visitReason?.trim()) {
        setForm((prev) => ({ ...prev, chiefComplaint: visitReason.trim() }));
      }
    }
  }, [active?.noteId, active?.status, compact, visitReason, active?.chiefComplaint, active?.hpi, active?.examination, active?.assessment, active?.plan]);

  const setField = (key: keyof FormState) => (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
  };

  const resolvedForm = (): FormState => {
    if (compact) return fromQuickForm(quickFindings, quickPlan);
    return form;
  };

  const payload = () => {
    const f = resolvedForm();
    return {
      chiefComplaint: f.chiefComplaint.trim() || undefined,
      hpi: f.hpi.trim() || undefined,
      examination: f.examination.trim() || undefined,
      assessment: f.assessment.trim() || undefined,
      plan: f.plan.trim() || undefined,
    };
  };

  const hasAnySection = Object.values(payload()).some(Boolean);
  const readOnly = !canEdit || (active?.status === 'FINAL' && !draft);

  const appendSymptom = (name: string) => {
    if (compact) {
      setQuickFindings((prev) => (prev ? `${prev}; ${name}` : name));
    } else {
      setForm((prev) => ({
        ...prev,
        chiefComplaint: prev.chiefComplaint ? `${prev.chiefComplaint}; ${name}` : name,
      }));
    }
  };

  const addDiagnosisChip = async (item: DiagnosisCatalogItem) => {
    if (diagnoses.some((d) => d.diagnosisCode === item.icdCode)) return;
    setError(null);
    try {
      await actions.addDiagnosis.mutateAsync({
        diagnosisText: item.name,
        diagnosisCode: item.icdCode,
        diagnosisType: diagnoses.length === 0 ? 'PRIMARY' : 'SECONDARY',
      });
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const saveDraft = async () => {
    setError(null);
    setSuccess(null);
    if (!hasAnySection) {
      setError('Enter complaint/findings or plan.');
      return;
    }
    try {
      if (draft) {
        await actions.updateNote.mutateAsync({ noteId: draft.noteId, payload: payload() });
      } else {
        await actions.createNote.mutateAsync(payload());
      }
      setSuccess('Draft saved.');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const finalize = async () => {
    setError(null);
    setSuccess(null);
    try {
      if (!hasAnySection) {
        setError('Enter complaint/findings or plan.');
        return;
      }
      let noteId = draft?.noteId;
      if (!noteId) {
        const created = await actions.createNote.mutateAsync(payload());
        noteId = created.noteId;
      } else {
        await actions.updateNote.mutateAsync({ noteId, payload: payload() });
      }
      await actions.finalizeNote.mutateAsync(noteId);
      setSuccess('Consultation saved.');
      onFinalized?.();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const pending =
    actions.createNote.isPending || actions.updateNote.isPending || actions.finalizeNote.isPending;

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {!compact ? <Typography variant="h6">Consultation</Typography> : null}
        {active ? (
          <Chip size="small" label={active.status} color={active.status === 'FINAL' ? 'success' : 'warning'} />
        ) : null}
      </Stack>

      {isLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
      {success ? <Alert severity="success" sx={{ mb: 1 }} onClose={() => setSuccess(null)}>{success}</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 1 }} onClose={() => setError(null)}>{error}</Alert> : null}

      {!readOnly && symptoms.length > 0 ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', mr: 0.5 }}>
            Symptoms:
          </Typography>
          {symptoms.slice(0, 12).map((s) => (
            <Chip
              key={s.symptomId}
              label={s.name}
              size="small"
              variant="outlined"
              onClick={() => appendSymptom(s.name)}
              disabled={pending}
            />
          ))}
        </Stack>
      ) : null}

      <Stack spacing={1.5}>
        {compact ? (
          <>
            <TextField
              label="Complaint & examination"
              placeholder="e.g. Fever 2 days, throat congestion, chest clear"
              multiline
              minRows={2}
              fullWidth
              value={quickFindings}
              onChange={(e) => setQuickFindings(e.target.value)}
              disabled={readOnly || pending}
            />
            <TextField
              label="Assessment & plan"
              placeholder="e.g. Viral URTI — rest, fluids, symptomatic Rx"
              multiline
              minRows={2}
              fullWidth
              value={quickPlan}
              onChange={(e) => setQuickPlan(e.target.value)}
              disabled={readOnly || pending}
            />
          </>
        ) : (
          <>
            <TextField label="Chief complaint" multiline minRows={2} fullWidth
              value={form.chiefComplaint} onChange={setField('chiefComplaint')} disabled={readOnly || pending} />
            <TextField label="HPI" multiline minRows={2} fullWidth
              value={form.hpi} onChange={setField('hpi')} disabled={readOnly || pending} />
            <TextField label="Examination" multiline minRows={2} fullWidth
              value={form.examination} onChange={setField('examination')} disabled={readOnly || pending} />
            <TextField label="Assessment" multiline minRows={2} fullWidth
              value={form.assessment} onChange={setField('assessment')} disabled={readOnly || pending} />
            <TextField label="Plan" multiline minRows={2} fullWidth
              value={form.plan} onChange={setField('plan')} disabled={readOnly || pending} />
          </>
        )}
      </Stack>

      {!readOnly && diagnosisCatalog.length > 0 ? (
        <Box sx={{ mt: 1.5 }}>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
            Tap to add diagnosis:
          </Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
            {diagnosisCatalog.slice(0, 10).map((dx) => {
              const added = diagnoses.some((d) => d.diagnosisCode === dx.icdCode);
              return (
                <Chip
                  key={dx.diagnosisCatalogId}
                  label={dx.name}
                  size="small"
                  color={added ? 'success' : 'default'}
                  variant={added ? 'filled' : 'outlined'}
                  onClick={() => !added && void addDiagnosisChip(dx)}
                  disabled={pending || added || actions.addDiagnosis.isPending}
                />
              );
            })}
          </Stack>
        </Box>
      ) : null}

      {diagnoses.length > 0 ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
          {diagnoses.map((dx) => (
            <Chip key={dx.diagnosisId} size="small" label={dx.diagnosisText} color="primary" variant="outlined" />
          ))}
        </Stack>
      ) : null}

      {!readOnly ? (
        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          {!compact ? (
            <Button variant="outlined" disabled={pending} onClick={saveDraft}>Save draft</Button>
          ) : null}
          <Button variant="contained" disabled={pending} onClick={finalize}>
            {compact ? 'Save & Rx →' : 'Finalize'}
          </Button>
        </Stack>
      ) : active?.status === 'FINAL' ? (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Finalized — proceed to prescription.
        </Typography>
      ) : null}
    </Box>
  );
}
