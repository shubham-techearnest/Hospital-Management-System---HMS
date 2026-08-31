import { useEffect, useState, type ChangeEvent } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  useEncounterActions,
  useEncounterPrescriptions,
} from '@/features/clinical/hooks/useClinicalQueries';
import type { Prescription, PrescriptionItemPayload } from '@/features/clinical/api/clinicalApi';
import { useMedicines } from '@/features/pharmacy/hooks/usePharmacyQueries';
import { useDosageTemplates } from '@/features/hospital/hooks/useClinicalCatalogQueries';
import { parseApiError } from '@/shared/api/errorUtils';

const ROUTE_OPTIONS = ['ORAL', 'TOPICAL', 'IV', 'IM', 'SC', 'INHALATION', 'NASAL', 'OPHTHALMIC', 'OTIC'];
const FREQUENCY_OPTIONS = [
  'OD (once daily)',
  'BD (twice daily)',
  'TDS (three times daily)',
  'QID (four times daily)',
  'HS (at bedtime)',
  'SOS (as needed)',
  'STAT (immediately)',
];

type LineForm = PrescriptionItemPayload & { key: string };

const emptyLine = (): LineForm => ({
  key: crypto.randomUUID(),
  medicineId: undefined,
  medicineName: '',
  doseText: '',
  route: 'ORAL',
  frequency: '',
  durationDays: undefined,
  quantity: 1,
  instructions: '',
});

type Props = {
  encounterId: string;
  hospitalId?: string;
  branchId?: string;
  canEdit: boolean;
  compact?: boolean;
  onSigned?: () => void;
};

export function EPrescriptionPanel({
  encounterId,
  hospitalId,
  branchId,
  canEdit,
  compact = false,
  onSigned,
}: Props) {
  const { data: prescriptions = [], isLoading } = useEncounterPrescriptions(encounterId);
  const { data: medicines = [] } = useMedicines(hospitalId, branchId);
  const { data: dosageTemplates = [] } = useDosageTemplates(hospitalId, branchId);
  const actions = useEncounterActions(encounterId);

  const draft = prescriptions.find((p) => p.status === 'DRAFT');
  const signed = prescriptions.filter((p) => p.status === 'SIGNED');

  const [notes, setNotes] = useState('');
  const [lines, setLines] = useState<LineForm[]>([emptyLine()]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (draft) {
      setNotes(draft.notes ?? '');
      setLines(
        draft.items.map((item) => ({
          key: item.itemId,
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          doseText: item.doseText ?? '',
          route: item.route ?? 'ORAL',
          frequency: item.frequency ?? '',
          durationDays: item.durationDays,
          quantity: item.quantity,
          instructions: item.instructions ?? '',
        })),
      );
    } else if (canEdit) {
      setNotes('');
      setLines([emptyLine()]);
    }
  }, [draft?.prescriptionId, draft?.status, canEdit]);

  const pending =
    actions.createPrescription.isPending
    || actions.updatePrescription.isPending
    || actions.signPrescription.isPending
    || actions.declareNoMedication.isPending;

  const declareNoMed = async () => {
    setError(null);
    setSuccess(null);
    try {
      await actions.declareNoMedication.mutateAsync();
      setSuccess('No medication declared and signed for this visit.');
      onSigned?.();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const updateLine = (key: string, patch: Partial<LineForm>) => {
    setLines((prev) => prev.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  };

  const onMedicineSelect = (key: string, medicineId: string) => {
    const med = medicines.find((m) => m.medicineId === medicineId);
    updateLine(key, {
      medicineId: medicineId || undefined,
      medicineName: med?.name ?? '',
      route: med?.defaultRoute ?? 'ORAL',
    });
  };

  const toPayload = (): PrescriptionItemPayload[] =>
    lines
      .filter((l) => l.medicineName?.trim() || l.medicineId)
      .map(({ key: _k, ...rest }) => ({
        ...rest,
        medicineName: rest.medicineName?.trim() || undefined,
        doseText: rest.doseText?.trim() || undefined,
        frequency: rest.frequency?.trim() || undefined,
        instructions: rest.instructions?.trim() || undefined,
        quantity: rest.quantity && rest.quantity > 0 ? rest.quantity : 1,
      }));

  const saveDraft = async () => {
    setError(null);
    setSuccess(null);
    const items = toPayload();
    if (items.length === 0) {
      setError('Add at least one medicine line.');
      return;
    }
    try {
      if (draft) {
        await actions.updatePrescription.mutateAsync({
          prescriptionId: draft.prescriptionId,
          payload: { notes: notes.trim() || undefined, items },
        });
      } else {
        await actions.createPrescription.mutateAsync({ notes: notes.trim() || undefined, items });
      }
      setSuccess('Prescription draft saved.');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const sign = async () => {
    setError(null);
    setSuccess(null);
    try {
      const items = toPayload();
      let prescriptionId = draft?.prescriptionId;
      if (!prescriptionId) {
        if (items.length === 0) {
          setError('Add at least one medicine line.');
          return;
        }
        const created = await actions.createPrescription.mutateAsync({
          notes: notes.trim() || undefined,
          items,
        });
        prescriptionId = created.prescriptionId;
      } else {
        await actions.updatePrescription.mutateAsync({
          prescriptionId,
          payload: { notes: notes.trim() || undefined, items },
        });
      }
      await actions.signPrescription.mutateAsync(prescriptionId);
      setSuccess('Prescription signed.');
      onSigned?.();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <Box>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        {!compact ? <Typography variant="h6">E-prescription</Typography> : null}
        {draft ? <Chip size="small" label="DRAFT" color="warning" /> : null}
      </Stack>
      {!compact ? (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Clinical prescription (signed Rx). Separate from ward medication orders / pharmacy MAR.
        </Typography>
      ) : null}

      {canEdit && compact && signed.length === 0 ? (
        <Button
          variant="outlined"
          color="secondary"
          fullWidth
          disabled={pending}
          onClick={declareNoMed}
          sx={{ mb: 2 }}
        >
          No medication required
        </Button>
      ) : null}

      {isLoading ? <Typography color="text.secondary">Loading…</Typography> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {canEdit ? (
        <Stack spacing={2}>
          <TextField
            label="Prescription notes"
            fullWidth
            multiline
            minRows={1}
            value={notes}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setNotes(e.target.value)}
            disabled={pending}
          />
          {lines.map((line) => (
            <Box key={line.key} sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1 }}>
              <Stack spacing={1.5}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems="flex-start">
                  <TextField
                    select
                    label="Medicine"
                    size="small"
                    sx={{ minWidth: 220, flex: 1 }}
                    value={line.medicineId ?? ''}
                    onChange={(e) => onMedicineSelect(line.key, e.target.value)}
                    disabled={pending || medicines.length === 0}
                  >
                    <MenuItem value="">Free-text / other</MenuItem>
                    {medicines.map((m) => (
                      <MenuItem key={m.medicineId} value={m.medicineId}>
                        {m.name} ({m.code})
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    label="Medicine name"
                    size="small"
                    fullWidth
                    value={line.medicineName ?? ''}
                    onChange={(e) => updateLine(line.key, { medicineName: e.target.value, medicineId: undefined })}
                    disabled={pending || Boolean(line.medicineId)}
                  />
                  {dosageTemplates.length > 0 ? (
                    <TextField
                      select
                      label="Dosage template"
                      size="small"
                      sx={{ minWidth: 180 }}
                      value=""
                      onChange={(e) => {
                        const t = dosageTemplates.find((d) => d.dosageTemplateId === e.target.value);
                        if (!t) return;
                        updateLine(line.key, {
                          doseText: t.doseText ?? line.doseText,
                          route: t.route ?? line.route,
                          frequency: t.frequency ?? line.frequency,
                          durationDays: t.durationDays ?? line.durationDays,
                        });
                      }}
                      disabled={pending}
                    >
                      <MenuItem value="">Apply template…</MenuItem>
                      {dosageTemplates.map((d) => (
                        <MenuItem key={d.dosageTemplateId} value={d.dosageTemplateId}>
                          {d.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  ) : null}
                  <IconButton
                    aria-label="Remove line"
                    disabled={pending || lines.length <= 1}
                    onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                  >
                    <DeleteOutlineIcon />
                  </IconButton>
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                  <TextField label="Dose" size="small" value={line.doseText ?? ''}
                    onChange={(e) => updateLine(line.key, { doseText: e.target.value })} disabled={pending} />
                  <TextField select label="Route" size="small" sx={{ minWidth: 120 }}
                    value={line.route ?? 'ORAL'}
                    onChange={(e) => updateLine(line.key, { route: e.target.value })} disabled={pending}>
                    {ROUTE_OPTIONS.map((route) => (
                      <MenuItem key={route} value={route}>{route}</MenuItem>
                    ))}
                  </TextField>
                  <TextField select label="Frequency" size="small" sx={{ minWidth: 180 }}
                    value={line.frequency ?? ''}
                    onChange={(e) => updateLine(line.key, { frequency: e.target.value })} disabled={pending}>
                    <MenuItem value="">Custom / other</MenuItem>
                    {FREQUENCY_OPTIONS.map((freq) => (
                      <MenuItem key={freq} value={freq}>{freq}</MenuItem>
                    ))}
                  </TextField>
                  <TextField label="Days" size="small" type="number" sx={{ width: 100 }}
                    value={line.durationDays ?? ''}
                    onChange={(e) => updateLine(line.key, {
                      durationDays: e.target.value ? Number(e.target.value) : undefined,
                    })} disabled={pending} />
                  <TextField label="Qty" size="small" type="number" sx={{ width: 90 }}
                    value={line.quantity ?? 1}
                    onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) || 1 })}
                    disabled={pending} />
                </Stack>
                <TextField label="Line instructions" size="small" fullWidth
                  value={line.instructions ?? ''}
                  onChange={(e) => updateLine(line.key, { instructions: e.target.value })}
                  disabled={pending} />
              </Stack>
            </Box>
          ))}
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button variant="text" disabled={pending || lines.length >= 20}
              onClick={() => setLines((prev) => [...prev, emptyLine()])}>
              Add line
            </Button>
            {!compact ? (
              <Button variant="outlined" disabled={pending} onClick={saveDraft}>Save draft</Button>
            ) : null}
            {!compact ? (
              <Button variant="outlined" disabled={pending || signed.length > 0} onClick={declareNoMed}>
                No medication required
              </Button>
            ) : null}
            <Button variant="contained" disabled={pending || signed.length > 0} onClick={sign}>
              {compact ? 'Sign Rx' : 'Sign prescription'}
            </Button>
          </Stack>
        </Stack>
      ) : null}

      {signed.length > 0 ? (
        <Box sx={{ mt: 3 }}>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Signed prescriptions</Typography>
          <Stack spacing={1.5}>
            {signed.map((rx) => (
              <SignedRxCard key={rx.prescriptionId} rx={rx} />
            ))}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
}

function SignedRxCard({ rx }: { rx: Prescription }) {
  const noMed = rx.notes?.includes('No medication required');
  return (
    <Box sx={{ p: 1.5, border: 1, borderColor: 'success.light', borderRadius: 1 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <Typography fontWeight={600}>{rx.prescriptionNumber}</Typography>
        <Chip size="small" color="success" label="SIGNED" />
      </Stack>
      {noMed ? (
        <Typography variant="body2" color="text.secondary">{rx.notes}</Typography>
      ) : (
        rx.items.map((item) => (
          <Typography key={item.itemId} variant="body2">
            {item.medicineName}
            {' — '}
            {[item.doseText, item.frequency, item.durationDays != null ? `${item.durationDays}d` : null]
              .filter(Boolean)
              .join(' · ')}
          </Typography>
        ))
      )}
    </Box>
  );
}
