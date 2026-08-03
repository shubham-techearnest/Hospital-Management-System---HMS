import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Dialog, IconButton, Portal, Text, TextInput } from 'react-native-paper';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import {
  useCreateFamilyMember,
  useDeleteFamilyMember,
  useFamilyMembers,
} from '@/features/patient/hooks/usePatientExtendedQueries';

interface FamilyMembersSectionProps extends ProfileSectionCallbacks {
  active: boolean;
}

export function FamilyMembersSection({ active, onSaveSuccess, onSaveError }: FamilyMembersSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    relationship: '',
    dateOfBirth: '',
    gender: '',
    hereditaryConditions: '',
    alive: true,
  });

  const { data: members = [], isLoading, isError } = useFamilyMembers(active);
  const createMember = useCreateFamilyMember();
  const deleteMember = useDeleteFamilyMember();

  const handleSave = async () => {
    try {
      await createMember.mutateAsync({
        name: form.name,
        relationship: form.relationship,
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        hereditaryConditions: form.hereditaryConditions
          ? form.hereditaryConditions.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        alive: form.alive,
      });
      setDialogOpen(false);
      setForm({ name: '', relationship: '', dateOfBirth: '', gender: '', hereditaryConditions: '', alive: true });
      onSaveSuccess('Family member added.');
    } catch {
      onSaveError('Unable to save family member.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMember.mutateAsync(id);
      onSaveSuccess('Family member removed.');
    } catch {
      onSaveError('Delete failed.');
    }
  };

  if (active && isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (isError) {
    return <Text style={styles.error}>Unable to load family members.</Text>;
  }

  return (
    <View style={styles.container}>
      <Button mode="outlined" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
        Add member
      </Button>
      {members.length === 0 ? (
        <Text style={styles.empty}>No family members recorded yet.</Text>
      ) : (
        members.map((m) => (
          <View key={m.id} style={styles.row}>
            <View style={styles.rowText}>
              <Text variant="titleSmall">{m.name} ({m.relationship})</Text>
              <Text variant="bodySmall">
                {[
                  m.dateOfBirth ? `DOB: ${m.dateOfBirth}` : null,
                  m.hereditaryConditions.length > 0 ? `Conditions: ${m.hereditaryConditions.join(', ')}` : null,
                  !m.alive ? 'Deceased' : null,
                ].filter(Boolean).join(' · ')}
              </Text>
            </View>
            <IconButton icon="delete" onPress={() => handleDelete(m.id)} />
          </View>
        ))
      )}

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Add family member</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name *" value={form.name} onChangeText={(name) => setForm({ ...form, name })} style={styles.input} />
            <TextInput label="Relationship *" value={form.relationship} onChangeText={(relationship) => setForm({ ...form, relationship })} style={styles.input} />
            <TextInput label="Date of birth (YYYY-MM-DD)" value={form.dateOfBirth} onChangeText={(dateOfBirth) => setForm({ ...form, dateOfBirth })} style={styles.input} />
            <TextInput label="Gender" value={form.gender} onChangeText={(gender) => setForm({ ...form, gender })} style={styles.input} />
            <TextInput label="Hereditary conditions (comma-separated)" value={form.hereditaryConditions} onChangeText={(hereditaryConditions) => setForm({ ...form, hereditaryConditions })} style={styles.input} />
            <View style={styles.checkboxRow}>
              <Checkbox status={form.alive ? 'checked' : 'unchecked'} onPress={() => setForm({ ...form, alive: !form.alive })} />
              <Text>Living</Text>
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button onPress={handleSave} disabled={!form.name || !form.relationship || createMember.isPending} loading={createMember.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 4 },
  loader: { marginVertical: 16 },
  error: { color: '#b00020' },
  addBtn: { marginBottom: 12 },
  empty: { opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rowText: { flex: 1 },
  input: { marginBottom: 8 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center' },
});
