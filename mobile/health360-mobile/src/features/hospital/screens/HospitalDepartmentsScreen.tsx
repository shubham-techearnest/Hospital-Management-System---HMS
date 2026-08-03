import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import { useCreateDepartment, useDeleteDepartment, useDepartments } from '@/features/hospital/hooks/useHospitalQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function HospitalDepartmentsScreen() {
  const { data: departments = [], isError } = useDepartments();
  const createDept = useCreateDepartment();
  const deleteDept = useDeleteDepartment();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', floor: '' });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  const handleSave = async () => {
    try {
      await createDept.mutateAsync({ name: form.name, description: form.description, floor: form.floor, active: true });
      setDialogOpen(false);
      setForm({ name: '', description: '', floor: '' });
      setSnackbar({ visible: true, message: 'Department added.', isError: false });
    } catch (error) {
      setSnackbar({ visible: true, message: getApiErrorMessage(error, 'Unable to add department.'), isError: true });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Departments</Text>
        {isError ? <Text style={styles.errorText}>Create hospital profile first.</Text> : null}
        <Button mode="contained" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
          Add Department
        </Button>
        <FlatList
          data={departments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No departments yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">{item.name}</Text>
                <IconButton icon="delete" onPress={() => deleteDept.mutate(item.id)} />
              </View>
              {item.floor ? <Text variant="bodySmall">Floor: {item.floor}</Text> : null}
              {item.description ? <Text variant="bodySmall">{item.description}</Text> : null}
            </View>
          )}
        />
      </View>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Add Department</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 360 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput label="Name" mode="outlined" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
              <TextInput label="Floor" mode="outlined" value={form.floor} onChangeText={(floor) => setForm({ ...form, floor })} />
              <TextInput label="Description" mode="outlined" multiline value={form.description} onChangeText={(description) => setForm({ ...form, description })} />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button onPress={handleSave} disabled={!form.name} loading={createDept.isPending}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={snackbar.visible} onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))} duration={4000} style={snackbar.isError ? styles.snackbarError : undefined}>
        {snackbar.message}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: '700', marginBottom: 8 },
  errorText: { color: '#b00020', marginBottom: 8 },
  addBtn: { alignSelf: 'flex-start', marginBottom: 12 },
  list: { paddingBottom: 24 },
  empty: { opacity: 0.6, marginTop: 16 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dialogContent: { padding: 16, gap: 12 },
  snackbarError: { backgroundColor: '#b00020' },
});
