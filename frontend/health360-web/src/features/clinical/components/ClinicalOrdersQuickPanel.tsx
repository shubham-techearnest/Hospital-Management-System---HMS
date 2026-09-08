import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ClinicalOrder } from '@/features/clinical/api/clinicalApi';
import type { LabTest } from '@/features/lab/api/labApi';
import type { ImagingModality } from '@/features/radiology/api/radiologyApi';
import { useEncounterActions } from '@/features/clinical/hooks/useClinicalQueries';
import { parseApiError } from '@/shared/api/errorUtils';

const LAB_PANELS: Array<{ label: string; match: RegExp }> = [
  { label: 'CBC', match: /cbc|complete blood|hemoglobin|hb|wbc|platelet/i },
  { label: 'LFT', match: /lft|liver|sgpt|sgot|bilirubin|alkaline/i },
  { label: 'RFT', match: /rft|renal|creatinine|urea|kidney/i },
  { label: 'Sugar', match: /glucose|sugar|hba1c|fasting/i },
  { label: 'Lipid', match: /lipid|cholesterol|triglyceride|hdl|ldl/i },
  { label: 'Thyroid', match: /thyroid|tsh|t3|t4/i },
  { label: 'Urine', match: /urine|urinalysis/i },
];

function testsForPanel(tests: LabTest[], pattern: RegExp): LabTest[] {
  return tests.filter((t) => pattern.test(`${t.name} ${t.code}`));
}

type Props = {
  encounterId: string;
  orders: ClinicalOrder[];
  labTests: LabTest[];
  modalities: ImagingModality[];
  canOrder: boolean;
  onOrdered?: () => void;
  /** Hospital IPD service flags — gates diet/physio OTHER orders */
  enabledServices?: Record<string, boolean>;
  onOpenMedsTab?: () => void;
};

export function ClinicalOrdersQuickPanel({
  encounterId,
  orders,
  labTests,
  modalities,
  canOrder,
  onOrdered,
  enabledServices,
  onOpenMedsTab,
}: Props) {
  const actions = useEncounterActions(encounterId);
  const [selectedLabIds, setSelectedLabIds] = useState<string[]>([]);
  const [labInstructions, setLabInstructions] = useState('');
  const [selectedModalityId, setSelectedModalityId] = useState('');
  const [imagingInstructions, setImagingInstructions] = useState('');
  const [procedureName, setProcedureName] = useState('');
  const [procedureInstructions, setProcedureInstructions] = useState('');
  const [careType, setCareType] = useState('NURSING');
  const [careName, setCareName] = useState('');
  const [careInstructions, setCareInstructions] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const dietEnabled = enabledServices?.IPD_DIET !== false;
  const physioEnabled = enabledServices?.IPD_PHYSIO !== false;
  const otEnabled = enabledServices?.IPD_OT_INTEGRATION !== false;

  const toggleLab = (id: string) => {
    setSelectedLabIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const runOrder = async (label: string, fn: () => Promise<unknown>) => {
    setError(null);
    setSuccess(null);
    try {
      await fn();
      setSuccess(`${label} placed.`);
      onOrdered?.();
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const orderLabs = async () => {
    const tests = labTests.filter((t) => selectedLabIds.includes(t.labTestId));
    if (tests.length === 0) return;
    await runOrder('Lab order', () => actions.createOrder.mutateAsync({
      orderType: 'LAB',
      instructions: labInstructions.trim() || undefined,
      items: tests.map((t) => ({
        itemCode: t.code,
        itemName: t.name,
        itemReferenceId: t.labTestId,
      })),
    }));
    setSelectedLabIds([]);
    setLabInstructions('');
  };

  const selectPanel = (pattern: RegExp) => {
    const ids = testsForPanel(labTests, pattern).map((t) => t.labTestId);
    setSelectedLabIds((prev) => [...new Set([...prev, ...ids])]);
  };

  const selectedModality = modalities.find((m) => m.modalityId === selectedModalityId);

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>Orders</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select multiple lab tests in one tap. Imaging and procedures are one order each.
      </Typography>

      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {canOrder && labTests.length > 0 ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Lab tests</Typography>
          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
            {LAB_PANELS.map((panel) => {
              const count = testsForPanel(labTests, panel.match).length;
              if (count === 0) return null;
              return (
                <Chip
                  key={panel.label}
                  label={panel.label}
                  size="small"
                  variant="outlined"
                  onClick={() => selectPanel(panel.match)}
                />
              );
            })}
            {selectedLabIds.length > 0 ? (
              <Chip label="Clear" size="small" onClick={() => setSelectedLabIds([])} />
            ) : null}
          </Stack>
          <Stack spacing={0.5} sx={{ maxHeight: 220, overflow: 'auto', mb: 1 }}>
            {labTests.map((test) => (
              <FormControlLabel
                key={test.labTestId}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedLabIds.includes(test.labTestId)}
                    onChange={() => toggleLab(test.labTestId)}
                  />
                }
                label={`${test.name} (${test.code})`}
              />
            ))}
          </Stack>
          <TextField
            label="Lab instructions (optional)"
            size="small"
            fullWidth
            value={labInstructions}
            onChange={(e) => setLabInstructions(e.target.value)}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            disabled={selectedLabIds.length === 0 || actions.createOrder.isPending}
            onClick={() => void orderLabs()}
          >
            Order {selectedLabIds.length || ''} lab test{selectedLabIds.length === 1 ? '' : 's'}
          </Button>
        </Box>
      ) : null}

      {canOrder && modalities.length > 0 ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <TextField select label="Imaging" size="small" sx={{ minWidth: 200 }}
            value={selectedModalityId} onChange={(e) => setSelectedModalityId(e.target.value)}>
            <MenuItem value="">Select…</MenuItem>
            {modalities.map((m) => (
              <MenuItem key={m.modalityId} value={m.modalityId}>{m.name}</MenuItem>
            ))}
          </TextField>
          <TextField label="Instructions" size="small" fullWidth value={imagingInstructions}
            onChange={(e) => setImagingInstructions(e.target.value)} />
          <Button variant="outlined" disabled={!selectedModalityId || actions.createOrder.isPending}
            onClick={() => void runOrder('Imaging order', () => actions.createOrder.mutateAsync({
              orderType: 'IMAGING',
              instructions: imagingInstructions || undefined,
              items: [{
                itemCode: selectedModality?.code,
                itemName: selectedModality?.name ?? 'Imaging',
                itemReferenceId: selectedModalityId,
              }],
            }))}>
            Order
          </Button>
        </Stack>
      ) : null}

      {canOrder && otEnabled ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <TextField label="Procedure" size="small" sx={{ minWidth: 200 }}
            value={procedureName} onChange={(e) => setProcedureName(e.target.value)} />
          <TextField label="Instructions" size="small" fullWidth value={procedureInstructions}
            onChange={(e) => setProcedureInstructions(e.target.value)} />
          <Button variant="outlined" disabled={!procedureName.trim() || actions.createOrder.isPending}
            onClick={() => void runOrder('Procedure order', () => actions.createOrder.mutateAsync({
              orderType: 'PROCEDURE',
              instructions: procedureInstructions || undefined,
              items: [{ itemName: procedureName.trim() }],
            }))}>
            Order
          </Button>
        </Stack>
      ) : null}

      {canOrder ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1 }}>Nursing / diet / physio</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              select
              label="Type"
              size="small"
              sx={{ minWidth: 160 }}
              value={careType}
              onChange={(e) => setCareType(e.target.value)}
            >
              <MenuItem value="NURSING">Nursing</MenuItem>
              {dietEnabled ? <MenuItem value="DIET">Diet</MenuItem> : null}
              {physioEnabled ? <MenuItem value="PHYSIO">Physio</MenuItem> : null}
            </TextField>
            <TextField
              label="Order"
              size="small"
              sx={{ minWidth: 200 }}
              value={careName}
              onChange={(e) => setCareName(e.target.value)}
              placeholder={careType === 'DIET' ? 'Soft diet / diabetic…' : 'Order name'}
            />
            <TextField
              label="Instructions"
              size="small"
              fullWidth
              value={careInstructions}
              onChange={(e) => setCareInstructions(e.target.value)}
            />
            <Button
              variant="outlined"
              disabled={!careName.trim() || actions.createOrder.isPending}
              onClick={() => void runOrder(`${careType} order`, () => actions.createOrder.mutateAsync({
                orderType: 'OTHER',
                instructions: careInstructions || undefined,
                items: [{
                  itemCode: careType,
                  itemName: `${careType}: ${careName.trim()}`,
                }],
              }))}
            >
              Order
            </Button>
          </Stack>
          {onOpenMedsTab ? (
            <Button size="small" sx={{ mt: 1 }} onClick={onOpenMedsTab}>
              Medications → use Meds tab (e-Rx / recon)
            </Button>
          ) : null}
        </Box>
      ) : null}

      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>Placed orders</Typography>
      {orders.length === 0 ? (
        <Typography variant="body2" color="text.secondary">None yet.</Typography>
      ) : (
        <List dense disablePadding>
          {orders.map((order) => (
            <ListItem key={order.orderId} disableGutters>
              <ListItemText
                primary={`${order.orderType} — ${order.status}`}
                secondary={order.items.map((i) => i.itemName).join(', ') || order.instructions}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
