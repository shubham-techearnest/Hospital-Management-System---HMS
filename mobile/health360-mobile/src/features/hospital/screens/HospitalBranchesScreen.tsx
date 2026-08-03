import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import { useBranches, useCreateBranch, useDeleteBranch } from '@/features/hospital/hooks/useHospitalQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

const EMPTY_FORM = {
  name: '',
  addressLine1: '',
  city: '',
  state: '',
  pincode: '',
  latitude: '19.0760',
  longitude: '72.8777',
  phone: '',
};

export function HospitalBranchesScreen() {
  const { data: branches = [], isError } = useBranches();
  const createBranch = useCreateBranch();
  const deleteBranch = useDeleteBranch();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  const handleSave = async () => {
    try {
      await createBranch.mutateAsync({
        ...form,
        country: 'IN',
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        primary: branches.length === 0,
        workingHours: [],
      });
      setDialogOpen(false);
      setForm(EMPTY_FORM);
      setSnackbar({ visible: true, message: 'Branch added.', isError: false });
    } catch (error) {
      setSnackbar({ visible: true, message: getApiErrorMessage(error, 'Unable to add branch.'), isError: true });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Branches</Text>
        {isError ? <Text style={styles.errorText}>Create hospital profile first.</Text> : null}
        <Button mode="contained" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
          Add Branch
        </Button>
        <FlatList
          data={branches}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No branches yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">{item.name}</Text>
                <IconButton icon="delete" onPress={() => deleteBranch.mutate(item.id)} />
              </View>
              <Text variant="bodySmall">{item.city}, {item.state}</Text>
              <Text variant="bodySmall">{item.phone}</Text>
              {item.primary ? <Text variant="labelSmall">Primary branch</Text> : null}
            </View>
          )}
        />
      </View>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Add Branch</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 420 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <TextInput label="Name" mode="outlined" value={form.name} onChangeText={(name) => setForm({ ...form, name })} />
              <TextInput label="Address Line 1" mode="outlined" value={form.addressLine1} onChangeText={(addressLine1) => setForm({ ...form, addressLine1 })} />
              <TextInput label="City" mode="outlined" value={form.city} onChangeText={(city) => setForm({ ...form, city })} />
              <TextInput label="State" mode="outlined" value={form.state} onChangeText={(state) => setForm({ ...form, state })} />
              <TextInput label="Pincode" mode="outlined" value={form.pincode} onChangeText={(pincode) => setForm({ ...form, pincode })} />
              <TextInput label="Latitude" mode="outlined" value={form.latitude} onChangeText={(latitude) => setForm({ ...form, latitude })} />
              <TextInput label="Longitude" mode="outlined" value={form.longitude} onChangeText={(longitude) => setForm({ ...form, longitude })} />
              <TextInput label="Phone" mode="outlined" value={form.phone} onChangeText={(phone) => setForm({ ...form, phone })} />
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button onPress={handleSave} disabled={!form.name || !form.addressLine1} loading={createBranch.isPending}>Save</Button>
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
