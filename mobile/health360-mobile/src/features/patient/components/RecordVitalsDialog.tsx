import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, TextInput } from 'react-native-paper';
import { SelectField } from '@/features/patient/components/SelectField';
import type { RecordVitalsPayload } from '@/features/patient/api/patientApi';
import { useRecordVitals } from '@/features/patient/hooks/usePatientQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

const GLUCOSE_TYPES = ['FASTING', 'RANDOM', 'POST_PRANDIAL'] as const;

const EMPTY_FORM = {
  systolicBp: '',
  diastolicBp: '',
  heartRate: '',
  temperature: '',
  spo2: '',
  bloodGlucose: '',
  glucoseReadingType: 'FASTING',
};

function parseOptionalInt(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseOptionalFloat(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildVitalsPayload(form: typeof EMPTY_FORM): RecordVitalsPayload | string {
  const systolicBp = parseOptionalInt(form.systolicBp);
  const diastolicBp = parseOptionalInt(form.diastolicBp);
  const heartRate = parseOptionalInt(form.heartRate);
  const temperature = parseOptionalFloat(form.temperature);
  const spo2 = parseOptionalInt(form.spo2);
  const bloodGlucose = parseOptionalFloat(form.bloodGlucose);

  const hasValue =
    systolicBp != null ||
    diastolicBp != null ||
    heartRate != null ||
    temperature != null ||
    spo2 != null ||
    bloodGlucose != null;

  if (!hasValue) {
    return 'Enter at least one vital sign value before saving.';
  }

  if (systolicBp != null && diastolicBp != null && systolicBp <= diastolicBp) {
    return 'Systolic blood pressure must be greater than diastolic.';
  }

  if (temperature != null && (temperature < 30 || temperature > 45)) {
    return 'Temperature must be between 30 and 45 °C.';
  }

  if (spo2 != null && (spo2 < 50 || spo2 > 100)) {
    return 'SpO2 must be between 50 and 100%.';
  }

  if (bloodGlucose != null && (bloodGlucose < 20 || bloodGlucose > 600)) {
    return 'Blood glucose must be between 20 and 600 mg/dL.';
  }

  return {
    systolicBp,
    diastolicBp,
    heartRate,
    temperature,
    spo2,
    bloodGlucose,
    glucoseReadingType: bloodGlucose != null ? form.glucoseReadingType : undefined,
    recordedAt: new Date().toISOString(),
  };
}

interface RecordVitalsDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onSuccess?: () => void;
}

export function RecordVitalsDialog({ visible, onDismiss, onSuccess }: RecordVitalsDialogProps) {
  const recordMutation = useRecordVitals();
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const payload = buildVitalsPayload(form);
    if (typeof payload === 'string') {
      setError(payload);
      return;
    }

    try {
      await recordMutation.mutateAsync(payload);
      setForm(EMPTY_FORM);
      onDismiss();
      onSuccess?.();
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Unable to record vitals.'));
    }
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Record Vital Signs</Dialog.Title>
        <Dialog.ScrollArea style={{ maxHeight: 420 }}>
          <ScrollView contentContainerStyle={styles.form}>
            <TextInput label="Systolic BP" mode="outlined" keyboardType="number-pad" value={form.systolicBp} onChangeText={(systolicBp) => setForm({ ...form, systolicBp })} />
            <TextInput label="Diastolic BP" mode="outlined" keyboardType="number-pad" value={form.diastolicBp} onChangeText={(diastolicBp) => setForm({ ...form, diastolicBp })} />
            <TextInput label="Heart Rate (bpm)" mode="outlined" keyboardType="number-pad" value={form.heartRate} onChangeText={(heartRate) => setForm({ ...form, heartRate })} />
            <TextInput label="Temperature (°C)" mode="outlined" keyboardType="decimal-pad" value={form.temperature} onChangeText={(temperature) => setForm({ ...form, temperature })} />
            <TextInput label="SpO2 (%)" mode="outlined" keyboardType="number-pad" value={form.spo2} onChangeText={(spo2) => setForm({ ...form, spo2 })} />
            <TextInput label="Blood Glucose (mg/dL)" mode="outlined" keyboardType="number-pad" value={form.bloodGlucose} onChangeText={(bloodGlucose) => setForm({ ...form, bloodGlucose })} />
            <SelectField
              label="Glucose Reading Type"
              value={form.glucoseReadingType}
              options={GLUCOSE_TYPES}
              onChange={(glucoseReadingType) => setForm({ ...form, glucoseReadingType })}
            />
            {error ? <Text style={{ color: '#b00020' }}>{error}</Text> : null}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" onPress={handleSave} loading={recordMutation.isPending} disabled={recordMutation.isPending}>
            Save
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16, gap: 8 },
});
