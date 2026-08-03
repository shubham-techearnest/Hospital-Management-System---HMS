import { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Dialog, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import {
  useCreateEmergencyContact,
  useDeleteEmergencyContact,
  useEmergencyContacts,
} from '@/features/patient/hooks/usePatientQueries';

interface EmergencyContactsSectionProps extends ProfileSectionCallbacks {
  active: boolean;
}

export function EmergencyContactsSection({ active, onSaveSuccess, onSaveError }: EmergencyContactsSectionProps) {
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', relationship: '', phone: '', email: '', primary: false });

  const { data: contacts = [], isLoading, isError } = useEmergencyContacts(active);
  const createContact = useCreateEmergencyContact();
  const deleteContact = useDeleteEmergencyContact();

  const handleSave = async () => {
    setError(null);
    try {
      await createContact.mutateAsync({
        name: form.name,
        relationship: form.relationship,
        phone: form.phone,
        email: form.email || undefined,
        primary: form.primary,
      });
      setDialogOpen(false);
      setForm({ name: '', relationship: '', phone: '', email: '', primary: false });
      onSaveSuccess('Emergency contact added.');
    } catch {
      const msg = 'Unable to save contact. Maximum 5 contacts allowed.';
      setError(msg);
      onSaveError(msg);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    try {
      await deleteContact.mutateAsync(id);
      onSaveSuccess('Emergency contact removed.');
    } catch {
      const msg = 'Unable to delete contact.';
      setError(msg);
      onSaveError(msg);
    }
  };

  if (active && isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (isError) {
    return <Text style={styles.error}>Unable to load emergency contacts.</Text>;
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button mode="outlined" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
        Add contact
      </Button>
      {contacts.map((c) => (
        <View key={c.id} style={styles.row}>
          <View style={styles.rowText}>
            <Text variant="titleSmall">{c.name}{c.primary ? ' (Primary)' : ''}</Text>
            <Text variant="bodySmall">{c.relationship} · {c.phone}{c.email ? ` · ${c.email}` : ''}</Text>
          </View>
          <IconButton icon="delete" onPress={() => handleDelete(c.id)} />
        </View>
      ))}
      {contacts.length === 0 && <Text style={styles.empty}>No emergency contacts yet.</Text>}

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Add Emergency Contact</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 360 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput label="Name" mode="outlined" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
              <TextInput label="Relationship" mode="outlined" value={form.relationship} onChangeText={(relationship) => setForm({ ...form, relationship })} />
              <TextInput label="Phone" mode="outlined" keyboardType="phone-pad" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
              <TextInput label="Email" mode="outlined" keyboardType="email-address" value={form.email} onChangeText={(email) => setForm({ ...form, email })} />
              <Checkbox.Item label="Primary contact" status={form.primary ? 'checked' : 'unchecked'} onPress={() => setForm({ ...form, primary: !form.primary })} />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button mode="contained" onPress={handleSave} disabled={!form.name || !form.relationship || !form.phone}>
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
  loader: { padding: 16 },
  error: { color: '#b00020' },
  addBtn: { alignSelf: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#eee', paddingVertical: 4 },
  rowText: { flex: 1 },
  empty: { opacity: 0.6, fontStyle: 'italic' },
  dialogContent: { padding: 16, gap: 8 },
});
