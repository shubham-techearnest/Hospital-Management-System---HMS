import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import type { ProfileSectionCallbacks } from '@/features/doctor/components/profile/types';
import {
  useCreateExperience,
  useDeleteExperience,
  useDoctorProfile,
} from '@/features/doctor/hooks/useDoctorQueries';

export function ExperienceSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = useDoctorProfile();
  const createExperience = useCreateExperience();
  const deleteExperience = useDeleteExperience();
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    institution: '',
    position: '',
    startYear: new Date().getFullYear(),
    endYear: '' as number | '',
  });

  const experience = profile?.experience ?? [];

  const handleSave = async () => {
    setError(null);
    try {
      await createExperience.mutateAsync({
        institution: form.institution,
        position: form.position,
        startYear: form.startYear,
        endYear: form.endYear === '' ? undefined : form.endYear,
      });
      setDialogOpen(false);
      setForm({ institution: '', position: '', startYear: new Date().getFullYear(), endYear: '' });
      onSaveSuccess('Experience added.');
    } catch {
      const msg = 'Unable to add experience.';
      setError(msg);
      onSaveError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteExperience.mutateAsync(id);
      onSaveSuccess('Experience entry removed.');
    } catch {
      const msg = 'Unable to delete experience.';
      setError(msg);
      onSaveError(msg);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="outlined" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
        Add experience
      </Button>
      {experience.map((e) => (
        <View key={e.id} style={styles.row}>
          <View style={styles.rowText}>
            <Text variant="titleSmall">{e.position} at {e.institution}</Text>
            <Text variant="bodySmall">
              {e.startYear}{e.endYear ? ` – ${e.endYear}` : ' – Present'}
            </Text>
          </View>
          <IconButton icon="delete" onPress={() => handleDelete(e.id)} />
        </View>
      ))}
      {experience.length === 0 && <Text style={styles.empty}>No experience entries yet.</Text>}

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Add Experience</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 400 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput label="Institution" mode="outlined" value={form.institution} onChangeText={(institution) => setForm({ ...form, institution })} />
              <TextInput label="Position" mode="outlined" value={form.position} onChangeText={(position) => setForm({ ...form, position })} />
              <TextInput
                label="Start Year"
                mode="outlined"
                keyboardType="number-pad"
                value={String(form.startYear)}
                onChangeText={(t) => setForm({ ...form, startYear: Number(t) || new Date().getFullYear() })}
              />
              <TextInput
                label="End Year (leave empty if current)"
                mode="outlined"
                keyboardType="number-pad"
                value={form.endYear === '' ? '' : String(form.endYear)}
                onChangeText={(t) => setForm({ ...form, endYear: t ? Number(t) : '' })}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} disabled={!form.institution || !form.position || createExperience.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  error: { color: '#b00020' },
  addBtn: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 4 },
  rowText: { flex: 1 },
  empty: { opacity: 0.6, fontStyle: 'italic' },
  dialogContent: { padding: 16, gap: 8 },
});
