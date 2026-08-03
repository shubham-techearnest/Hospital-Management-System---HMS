import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Fab,
  Grid,
  MenuItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import HeightIcon from '@mui/icons-material/Height';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ThermostatIcon from '@mui/icons-material/Thermostat';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import AirIcon from '@mui/icons-material/Air';
import BloodtypeIcon from '@mui/icons-material/Bloodtype';
import { motion } from 'framer-motion';
import { AnimatedPage, staggerContainer } from '../components/AnimatedPage';
import { VitalCard } from '../components/VitalCard';
import {
  usePatientProfile,
  useLatestVitals,
  useRecordVitals,
} from '../hooks/usePatientQueries';
import { computeBmi } from '../utils/patientUtils';
import { Link as RouterLink } from 'react-router-dom';

function formatDate(iso?: string) {
  if (!iso) return 'Not recorded';
  return new Date(iso).toLocaleString();
}

export function VitalsPage() {
  const { data: profile } = usePatientProfile();
  const { data: latest, isLoading } = useLatestVitals();
  const recordMutation = useRecordVitals();
  const [open, setOpen] = useState(false);
  const [snack, setSnack] = useState(false);
  const [form, setForm] = useState({
    systolicBp: '',
    diastolicBp: '',
    heartRate: '',
    temperature: '',
    spo2: '',
    bloodGlucose: '',
    glucoseReadingType: 'FASTING',
  });

  const bmi = computeBmi(
    profile?.physicalMeasurements?.heightCm,
    profile?.physicalMeasurements?.weightKg,
  );

  const bpStatus = latest?.bpClassification === 'NORMAL'
    ? 'normal'
    : latest?.bpClassification === 'WARNING'
      ? 'warning'
      : latest?.bpClassification === 'CRITICAL'
        ? 'critical'
        : undefined;

  const handleSave = async () => {
    await recordMutation.mutateAsync({
      systolicBp: form.systolicBp ? Number(form.systolicBp) : undefined,
      diastolicBp: form.diastolicBp ? Number(form.diastolicBp) : undefined,
      heartRate: form.heartRate ? Number(form.heartRate) : undefined,
      temperature: form.temperature ? Number(form.temperature) : undefined,
      spo2: form.spo2 ? Number(form.spo2) : undefined,
      bloodGlucose: form.bloodGlucose ? Number(form.bloodGlucose) : undefined,
      glucoseReadingType: form.glucoseReadingType || undefined,
      recordedAt: new Date().toISOString(),
    });
    setOpen(false);
    setSnack(true);
    setForm({
      systolicBp: '',
      diastolicBp: '',
      heartRate: '',
      temperature: '',
      spo2: '',
      bloodGlucose: '',
      glucoseReadingType: 'FASTING',
    });
  };

  const cards = [
    {
      title: 'Height',
      value: profile?.physicalMeasurements?.heightCm?.toString() ?? '—',
      unit: 'cm',
      subtitle: `Updated ${formatDate(profile?.physicalMeasurements?.measuredAt)}`,
      icon: <HeightIcon />,
      onEdit: undefined,
    },
    {
      title: 'Weight',
      value: profile?.physicalMeasurements?.weightKg?.toString() ?? '—',
      unit: 'kg',
      subtitle: `Updated ${formatDate(profile?.physicalMeasurements?.measuredAt)}`,
      icon: <MonitorWeightIcon />,
      onEdit: undefined,
    },
    {
      title: 'BMI',
      value: bmi?.toString() ?? '—',
      unit: '',
      subtitle: 'From height & weight',
      icon: <MonitorWeightIcon />,
    },
    {
      title: 'Blood Pressure',
      value: latest?.systolicBp != null ? `${latest.systolicBp}/${latest.diastolicBp}` : '—',
      unit: 'mmHg',
      subtitle: formatDate(latest?.recordedAt),
      icon: <BloodtypeIcon />,
      status: bpStatus as 'normal' | 'warning' | 'critical' | undefined,
      onEdit: () => setOpen(true),
    },
    {
      title: 'Pulse',
      value: latest?.heartRate?.toString() ?? '—',
      unit: 'bpm',
      subtitle: formatDate(latest?.recordedAt),
      icon: <FavoriteIcon />,
      onEdit: () => setOpen(true),
    },
    {
      title: 'Temperature',
      value: latest?.temperature?.toString() ?? '—',
      unit: '°C',
      subtitle: formatDate(latest?.recordedAt),
      icon: <ThermostatIcon />,
      onEdit: () => setOpen(true),
    },
    {
      title: 'Blood Sugar',
      value: latest?.bloodGlucose?.toString() ?? '—',
      unit: 'mg/dL',
      subtitle: formatDate(latest?.recordedAt),
      icon: <WaterDropIcon />,
      onEdit: () => setOpen(true),
    },
    {
      title: 'SpO2',
      value: latest?.spo2?.toString() ?? '—',
      unit: '%',
      subtitle: formatDate(latest?.recordedAt),
      icon: <AirIcon />,
      onEdit: () => setOpen(true),
    },
  ];

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Vital Signs
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
        Track your health metrics over time. Vitals are append-only for clinical accuracy.
      </Typography>
      <Button component={RouterLink} to="/patient/profile/measurements" size="small" sx={{ mb: 3 }}>
        Update height & weight in Physical Measurements
      </Button>

      {isLoading ? (
        <Typography color="text.secondary">Loading vitals…</Typography>
      ) : (
        <motion.div variants={staggerContainer} initial="initial" animate="animate">
          <Grid container spacing={2}>
            {cards.map((card, index) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={card.title}>
                <VitalCard {...card} index={index} />
              </Grid>
            ))}
          </Grid>
        </motion.div>
      )}

      {latest?.bpInterpretation && (
        <Alert severity={bpStatus === 'critical' ? 'error' : bpStatus === 'warning' ? 'warning' : 'success'} sx={{ mt: 3 }}>
          {latest.bpInterpretation}
        </Alert>
      )}

      <Fab
        color="primary"
        aria-label="Record vital signs"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        onClick={() => setOpen(true)}
      >
        <AddIcon />
      </Fab>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Record Vital Signs</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Systolic BP" type="number" value={form.systolicBp} onChange={(e) => setForm({ ...form, systolicBp: e.target.value })} />
            <TextField label="Diastolic BP" type="number" value={form.diastolicBp} onChange={(e) => setForm({ ...form, diastolicBp: e.target.value })} />
            <TextField label="Heart Rate (bpm)" type="number" value={form.heartRate} onChange={(e) => setForm({ ...form, heartRate: e.target.value })} />
            <TextField label="Temperature (°C)" type="number" value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} />
            <TextField label="SpO2 (%)" type="number" value={form.spo2} onChange={(e) => setForm({ ...form, spo2: e.target.value })} />
            <TextField label="Blood Glucose (mg/dL)" type="number" value={form.bloodGlucose} onChange={(e) => setForm({ ...form, bloodGlucose: e.target.value })} />
            <TextField select label="Glucose Reading Type" value={form.glucoseReadingType} onChange={(e) => setForm({ ...form, glucoseReadingType: e.target.value })}>
              <MenuItem value="FASTING">Fasting</MenuItem>
              <MenuItem value="RANDOM">Random</MenuItem>
              <MenuItem value="POST_PRANDIAL">Post Prandial</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={recordMutation.isPending}>
            {recordMutation.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack}
        autoHideDuration={4000}
        onClose={() => setSnack(false)}
        message="Vital signs recorded successfully"
      />
    </AnimatedPage>
  );
}
