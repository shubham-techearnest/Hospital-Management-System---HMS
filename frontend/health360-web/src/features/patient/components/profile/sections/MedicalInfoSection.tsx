import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Skeleton,
  Tab,
  Tabs,
  TextField,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import {
  useCreateAllergy,
  useCreateChronicCondition,
  useCreateMedication,
  useCreateSurgery,
  useDeleteAllergy,
  useDeleteChronicCondition,
  useDeleteMedication,
  useDeleteSurgery,
  useMedicalRecords,
} from '../../../hooks/usePatientQueries';
import type {
  Allergy,
  ChronicCondition,
  Medication,
  Surgery,
} from '../../../api/patientApi';
import type { ProfileSectionCallbacks } from '../types';

type TabKey = 'allergies' | 'medications' | 'surgeries' | 'conditions';

const allergySeverities = ['MILD', 'MODERATE', 'SEVERE'];
const tabAddLabels: Record<TabKey, string> = {
  allergies: 'allergy',
  medications: 'medication',
  surgeries: 'surgery',
  conditions: 'condition',
};

interface MedicalInfoSectionProps extends ProfileSectionCallbacks {
  active: boolean;
}

export function MedicalInfoSection({ active, onSaveSuccess, onSaveError }: MedicalInfoSectionProps) {
  const [tab, setTab] = useState<TabKey>('allergies');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading, isError } = useMedicalRecords(active);
  const createAllergy = useCreateAllergy();
  const createMedication = useCreateMedication();
  const createSurgery = useCreateSurgery();
  const createCondition = useCreateChronicCondition();
  const deleteAllergy = useDeleteAllergy();
  const deleteMedication = useDeleteMedication();
  const deleteSurgery = useDeleteSurgery();
  const deleteCondition = useDeleteChronicCondition();

  const allergies = data?.allergies ?? [];
  const medications = data?.medications ?? [];
  const surgeries = data?.surgeries ?? [];
  const conditions = data?.conditions ?? [];

  const openAdd = () => {
    setForm({});
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setError(null);
    try {
      if (tab === 'allergies') {
        await createAllergy.mutateAsync({
          name: form.name ?? '',
          severity: form.severity ?? 'MILD',
          reaction: form.reaction,
          diagnosedDate: form.diagnosedDate,
        });
      } else if (tab === 'medications') {
        await createMedication.mutateAsync({
          name: form.name ?? '',
          dosage: form.dosage,
          frequency: form.frequency,
        });
      } else if (tab === 'surgeries') {
        await createSurgery.mutateAsync({
          procedureName: form.procedureName ?? form.name ?? '',
          surgeryDate: form.surgeryDate,
          hospitalName: form.hospitalName,
        });
      } else {
        await createCondition.mutateAsync({
          conditionName: form.conditionName ?? form.name ?? '',
          status: form.status,
          diagnosedDate: form.diagnosedDate,
        });
      }
      setDialogOpen(false);
      onSaveSuccess('Medical record added.');
    } catch {
      setError('Unable to save entry.');
      onSaveError('Unable to save entry.');
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      if (tab === 'allergies') await deleteAllergy.mutateAsync(id);
      else if (tab === 'medications') await deleteMedication.mutateAsync(id);
      else if (tab === 'surgeries') await deleteSurgery.mutateAsync(id);
      else await deleteCondition.mutateAsync(id);
      onSaveSuccess('Medical record removed.');
    } catch {
      setError('Unable to delete entry.');
      onSaveError('Unable to delete entry.');
    }
  };

  const items = tab === 'allergies' ? allergies
    : tab === 'medications' ? medications
    : tab === 'surgeries' ? surgeries
    : conditions;

  const label = (item: Allergy | Medication | Surgery | ChronicCondition) => {
    if ('name' in item && item.name) return item.name;
    if ('procedureName' in item) return item.procedureName;
    if ('conditionName' in item) return item.conditionName;
    return 'Entry';
  };

  if (active && isLoading) {
    return <Skeleton variant="rounded" height={240} />;
  }

  if (isError) {
    return <Alert severity="error">Unable to load medical information.</Alert>;
  }

  return (
    <>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" scrollButtons="auto">
        <Tab label="Allergies" value="allergies" />
        <Tab label="Medications" value="medications" />
        <Tab label="Surgeries" value="surgeries" />
        <Tab label="Conditions" value="conditions" />
      </Tabs>
      <Button startIcon={<AddIcon />} variant="outlined" onClick={openAdd} sx={{ mb: 2 }}>
        Add
      </Button>
      <List disablePadding>
        {items.map((item) => (
          <ListItem
            key={item.id}
            divider
            secondaryAction={
              <IconButton edge="end" aria-label="Delete entry" onClick={() => handleDelete(item.id)}>
                <DeleteIcon />
              </IconButton>
            }
          >
            <ListItemText primary={label(item)} />
          </ListItem>
        ))}
        {items.length === 0 && (
          <ListItem><ListItemText primary="No entries yet." /></ListItem>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {tabAddLabels[tab]}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {(tab === 'allergies' || tab === 'medications') && (
              <TextField label="Name" value={form.name ?? ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            )}
            {tab === 'allergies' && (
              <>
                <TextField select label="Severity" value={form.severity ?? 'MILD'} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
                  {allergySeverities.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                </TextField>
                <TextField label="Reaction" value={form.reaction ?? ''} onChange={(e) => setForm({ ...form, reaction: e.target.value })} />
              </>
            )}
            {tab === 'medications' && (
              <>
                <TextField label="Dosage" value={form.dosage ?? ''} onChange={(e) => setForm({ ...form, dosage: e.target.value })} />
                <TextField label="Frequency" value={form.frequency ?? ''} onChange={(e) => setForm({ ...form, frequency: e.target.value })} />
              </>
            )}
            {tab === 'surgeries' && (
              <>
                <TextField label="Procedure" value={form.procedureName ?? ''} onChange={(e) => setForm({ ...form, procedureName: e.target.value })} />
                <TextField label="Hospital" value={form.hospitalName ?? ''} onChange={(e) => setForm({ ...form, hospitalName: e.target.value })} />
                <TextField label="Date" type="date" InputLabelProps={{ shrink: true }} value={form.surgeryDate ?? ''} onChange={(e) => setForm({ ...form, surgeryDate: e.target.value })} />
              </>
            )}
            {tab === 'conditions' && (
              <>
                <TextField label="Condition" value={form.conditionName ?? ''} onChange={(e) => setForm({ ...form, conditionName: e.target.value })} />
                <TextField label="Status" value={form.status ?? ''} onChange={(e) => setForm({ ...form, status: e.target.value })} />
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
