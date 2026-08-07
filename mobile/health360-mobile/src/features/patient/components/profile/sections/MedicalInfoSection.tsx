import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { SelectField } from '@/features/patient/components/SelectField';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import { ALLERGY_SEVERITIES } from '@/features/patient/constants/enums';
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
} from '@/features/patient/hooks/usePatientQueries';

type TabKey = 'allergies' | 'medications' | 'surgeries' | 'conditions';

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

  const items =
    tab === 'allergies' ? data?.allergies ?? []
    : tab === 'medications' ? data?.medications ?? []
    : tab === 'surgeries' ? data?.surgeries ?? []
    : data?.conditions ?? [];

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
      setForm({});
      onSaveSuccess('Medical record added.');
    } catch {
      const msg = 'Unable to save entry.';
      setError(msg);
      onSaveError(msg);
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
      const msg = 'Unable to delete entry.';
      setError(msg);
      onSaveError(msg);
    }
  };

  if (active && isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (isError) {
    return <Text style={styles.error}>Unable to load medical records.</Text>;
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <SegmentedButtons
        value={tab}
        onValueChange={(v) => setTab(v as TabKey)}
        buttons={[
          { value: 'allergies', label: 'Allergies' },
          { value: 'medications', label: 'Meds' },
          { value: 'surgeries', label: 'Surgery' },
          { value: 'conditions', label: 'Conditions' },
        ]}
      />
      <Button mode="outlined" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
        Add entry
      </Button>
      {items.map((item) => {
        const label =
          'name' in item ? item.name
          : 'procedureName' in item ? item.procedureName
          : item.conditionName;
        return (
          <View key={item.id} style={styles.row}>
            <Text style={styles.rowText}>{label}</Text>
            <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
          </View>
        );
      })}
      {items.length === 0 && <Text style={styles.empty}>No records yet.</Text>}

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Add {tabAddLabels[tab]}</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 360 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              {tab === 'allergies' && (
                <>
                  <TextInput label="Name" mode="outlined" value={form.name ?? ''} onChangeText={(name) => setForm({ ...form, name })} />
                  <SelectField label="Severity" value={form.severity ?? 'MILD'} options={ALLERGY_SEVERITIES} onChange={(severity) => setForm({ ...form, severity })} />
                  <TextInput label="Reaction" mode="outlined" value={form.reaction ?? ''} onChangeText={(reaction) => setForm({ ...form, reaction })} />
                </>
              )}
              {tab === 'medications' && (
                <>
                  <TextInput label="Name" mode="outlined" value={form.name ?? ''} onChangeText={(name) => setForm({ ...form, name })} />
                  <TextInput label="Dosage" mode="outlined" value={form.dosage ?? ''} onChangeText={(dosage) => setForm({ ...form, dosage })} />
                  <TextInput label="Frequency" mode="outlined" value={form.frequency ?? ''} onChangeText={(frequency) => setForm({ ...form, frequency })} />
                </>
              )}
              {tab === 'surgeries' && (
                <>
                  <TextInput label="Procedure" mode="outlined" value={form.procedureName ?? ''} onChangeText={(procedureName) => setForm({ ...form, procedureName })} />
                  <TextInput label="Hospital" mode="outlined" value={form.hospitalName ?? ''} onChangeText={(hospitalName) => setForm({ ...form, hospitalName })} />
                  <TextInput label="Date (YYYY-MM-DD)" mode="outlined" value={form.surgeryDate ?? ''} onChangeText={(surgeryDate) => setForm({ ...form, surgeryDate })} />
                </>
              )}
              {tab === 'conditions' && (
                <>
                  <TextInput label="Condition" mode="outlined" value={form.conditionName ?? ''} onChangeText={(conditionName) => setForm({ ...form, conditionName })} />
                  <TextInput label="Status" mode="outlined" value={form.status ?? ''} onChangeText={(status) => setForm({ ...form, status })} />
                  <TextInput label="Diagnosed (YYYY-MM-DD)" mode="outlined" value={form.diagnosedDate ?? ''} onChangeText={(diagnosedDate) => setForm({ ...form, diagnosedDate })} />
                </>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  loader: { padding: 16 },
  error: { color: '#b00020' },
  addBtn: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowText: { flex: 1 },
  empty: { opacity: 0.6, fontStyle: 'italic' },
  dialogContent: { padding: 16, gap: 8 },
});
