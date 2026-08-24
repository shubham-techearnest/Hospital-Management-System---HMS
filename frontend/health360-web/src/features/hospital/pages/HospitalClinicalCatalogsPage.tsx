import { useState } from 'react';
import {
  Alert,
  Button,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DashboardPageHeader } from '@/shared/dashboard/DashboardPageHeader';
import { useHospitalProfile, useBranches } from '@/features/hospital/hooks/useHospitalQueries';
import {
  useCreateDosageTemplate,
  useCreateSymptom,
  useDosageTemplates,
  useSymptoms,
} from '@/features/hospital/hooks/useClinicalCatalogQueries';
import { parseApiError } from '@/shared/api/errorUtils';

export function HospitalClinicalCatalogsPage() {
  const { data: profile } = useHospitalProfile();
  const { data: branches = [] } = useBranches();
  const hospitalId = profile?.id ?? '';
  const branchId = branches.find((b) => b.primary)?.id ?? branches[0]?.id;

  const [tab, setTab] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const { data: symptoms = [] } = useSymptoms(hospitalId, branchId);
  const { data: dosages = [] } = useDosageTemplates(hospitalId, branchId);
  const createSymptom = useCreateSymptom(hospitalId, branchId);
  const createDosage = useCreateDosageTemplate(hospitalId, branchId);

  const [symptomForm, setSymptomForm] = useState({ code: '', name: '', category: '' });
  const [dosageForm, setDosageForm] = useState({
    label: '',
    doseText: '',
    route: 'ORAL',
    frequency: '',
    durationDays: '',
  });

  const addSymptom = async () => {
    setError(null);
    setSuccess(null);
    try {
      await createSymptom.mutateAsync({
        hospitalId,
        branchId,
        code: symptomForm.code || undefined,
        name: symptomForm.name,
        category: symptomForm.category || undefined,
      });
      setSymptomForm({ code: '', name: '', category: '' });
      setSuccess('Symptom added.');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  const addDosage = async () => {
    setError(null);
    setSuccess(null);
    try {
      await createDosage.mutateAsync({
        hospitalId,
        branchId,
        label: dosageForm.label,
        doseText: dosageForm.doseText || undefined,
        route: dosageForm.route || undefined,
        frequency: dosageForm.frequency || undefined,
        durationDays: dosageForm.durationDays ? Number(dosageForm.durationDays) : undefined,
      });
      setDosageForm({ label: '', doseText: '', route: 'ORAL', frequency: '', durationDays: '' });
      setSuccess('Dosage template added.');
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  if (!hospitalId) {
    return <Alert severity="warning">Complete hospital profile first.</Alert>;
  }

  return (
    <AnimatedPage>
      <DashboardPageHeader
        title="Clinical catalogs"
        subtitle="Symptoms and dosage templates used as doctor dropdowns. Medicines and lab tests are managed under Pharmacy / Laboratory."
      />
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}
      {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Symptoms" />
        <Tab label="Dosage templates" />
      </Tabs>

      {tab === 0 && (
        <Stack spacing={2} maxWidth={720}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Add symptom</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField label="Code" value={symptomForm.code} onChange={(e) => setSymptomForm((f) => ({ ...f, code: e.target.value }))} />
                <TextField label="Name" required fullWidth value={symptomForm.name} onChange={(e) => setSymptomForm((f) => ({ ...f, name: e.target.value }))} />
                <TextField label="Category" value={symptomForm.category} onChange={(e) => setSymptomForm((f) => ({ ...f, category: e.target.value }))} />
                <Button variant="contained" onClick={addSymptom} disabled={!symptomForm.name.trim()}>Add</Button>
              </Stack>
            </Stack>
          </Paper>
          {symptoms.map((s) => (
            <Typography key={s.symptomId} variant="body2">
              {s.name}{s.code ? ` (${s.code})` : ''}{s.category ? ` · ${s.category}` : ''}
            </Typography>
          ))}
        </Stack>
      )}

      {tab === 1 && (
        <Stack spacing={2} maxWidth={720}>
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Add dosage template</Typography>
              <TextField label="Label" fullWidth value={dosageForm.label} onChange={(e) => setDosageForm((f) => ({ ...f, label: e.target.value }))} />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <TextField label="Dose" fullWidth value={dosageForm.doseText} onChange={(e) => setDosageForm((f) => ({ ...f, doseText: e.target.value }))} />
                <TextField select label="Route" sx={{ minWidth: 120 }} value={dosageForm.route} onChange={(e) => setDosageForm((f) => ({ ...f, route: e.target.value }))}>
                  <MenuItem value="ORAL">ORAL</MenuItem>
                  <MenuItem value="IV">IV</MenuItem>
                  <MenuItem value="IM">IM</MenuItem>
                  <MenuItem value="TOPICAL">TOPICAL</MenuItem>
                </TextField>
                <TextField label="Frequency" fullWidth value={dosageForm.frequency} onChange={(e) => setDosageForm((f) => ({ ...f, frequency: e.target.value }))} />
                <TextField label="Days" sx={{ width: 100 }} value={dosageForm.durationDays} onChange={(e) => setDosageForm((f) => ({ ...f, durationDays: e.target.value }))} />
              </Stack>
              <Button variant="contained" onClick={addDosage} disabled={!dosageForm.label.trim()}>Add</Button>
            </Stack>
          </Paper>
          {dosages.map((d) => (
            <Typography key={d.dosageTemplateId} variant="body2">
              {d.label} — {d.doseText ?? ''} {d.route ?? ''} {d.frequency ?? ''}
              {d.durationDays != null ? ` × ${d.durationDays}d` : ''}
            </Typography>
          ))}
        </Stack>
      )}
    </AnimatedPage>
  );
}
