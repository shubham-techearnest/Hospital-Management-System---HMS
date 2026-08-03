import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import type { ProfileSectionCallbacks } from '@/features/doctor/components/profile/types';
import {
  useCreateQualification,
  useDeleteQualification,
  useDoctorProfile,
} from '@/features/doctor/hooks/useDoctorQueries';

export function QualificationsSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = useDoctorProfile();
  const createQualification = useCreateQualification();
  const deleteQualification = useDeleteQualification();
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    degree: '',
    institution: '',
    yearOfCompletion: new Date().getFullYear(),
    country: 'IN',
  });

  const qualifications = profile?.qualifications ?? [];

  const handleSave = async () => {
    setError(null);
    try {
      await createQualification.mutateAsync(form);
      setDialogOpen(false);
      setForm({ degree: '', institution: '', yearOfCompletion: new Date().getFullYear(), country: 'IN' });
      onSaveSuccess('Qualification added.');
    } catch {
      const msg = 'Unable to add qualification.';
      setError(msg);
      onSaveError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteQualification.mutateAsync(id);
      onSaveSuccess('Qualification removed.');
    } catch {
      const msg = 'Unable to delete qualification.';
      setError(msg);
      onSaveError(msg);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="outlined" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
        Add qualification
      </Button>
      {qualifications.map((q) => (
        <View key={q.id} style={styles.row}>
          <View style={styles.rowText}>
            <Text variant="titleSmall">{q.degree}</Text>
            <Text variant="bodySmall">{q.institution} · {q.yearOfCompletion}</Text>
          </View>
          <IconButton icon="delete" onPress={() => handleDelete(q.id)} />
        </View>
      ))}
      {qualifications.length === 0 && <Text style={styles.empty}>No qualifications added yet.</Text>}

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Add Qualification</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 360 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput label="Degree" mode="outlined" value={form.degree} onChangeText={(degree) => setForm({ ...form, degree })} />
              <TextInput label="Institution" mode="outlined" value={form.institution} onChangeText={(institution) => setForm({ ...form, institution })} />
              <TextInput
                label="Year"
                mode="outlined"
                keyboardType="number-pad"
                value={String(form.yearOfCompletion)}
                onChangeText={(t) => setForm({ ...form, yearOfCompletion: Number(t) || new Date().getFullYear() })}
              />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} disabled={!form.degree || !form.institution || createQualification.isPending}>
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
