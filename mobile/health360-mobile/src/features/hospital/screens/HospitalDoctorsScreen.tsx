import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, List, Menu, Portal, Snackbar, Text, TextInput } from 'react-native-paper';
import type { DoctorSearchResult } from '@/features/hospital/api/hospitalApi';
import {
  useAssociateDoctor,
  useBranches,
  useDepartments,
  useHospitalDoctors,
  useRemoveHospitalDoctor,
  useSearchDoctors,
} from '@/features/hospital/hooks/useHospitalQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors } from '@/shared/theme';

export function HospitalDoctorsScreen() {
  const { data: doctors = [], isError } = useHospitalDoctors();
  const { data: branches = [] } = useBranches();
  const { data: departments = [] } = useDepartments();
  const searchDoctors = useSearchDoctors();
  const associateDoctor = useAssociateDoctor();
  const removeDoctor = useRemoveHospitalDoctor();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<DoctorSearchResult[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [branchMenuOpen, setBranchMenuOpen] = useState(false);
  const [deptMenuOpen, setDeptMenuOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  const selectedBranchName = branches.find((b) => b.id === branchId)?.name ?? 'None';
  const selectedDeptName = departments.find((d) => d.id === departmentId)?.name ?? 'None';

  const handleSearch = async () => {
    if (!query.trim()) return;
    try {
      const res = await searchDoctors.mutateAsync(query.trim());
      setResults(res);
    } catch (error) {
      setSnackbar({ visible: true, message: getApiErrorMessage(error, 'Search failed.'), isError: true });
    }
  };

  const handleAssociate = async () => {
    try {
      await associateDoctor.mutateAsync({
        doctorId: selectedDoctorId,
        branchId: branchId || undefined,
        departmentId: departmentId || undefined,
      });
      setDialogOpen(false);
      setQuery('');
      setResults([]);
      setSelectedDoctorId('');
      setBranchId('');
      setDepartmentId('');
      setSnackbar({ visible: true, message: 'Doctor associated.', isError: false });
    } catch (error) {
      setSnackbar({ visible: true, message: getApiErrorMessage(error, 'Unable to associate doctor.'), isError: true });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Doctor Roster</Text>
        {isError ? <Text style={styles.errorText}>Create hospital profile first.</Text> : null}
        <Button mode="contained" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
          Associate Doctor
        </Button>
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.associationId}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No doctors associated yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">{item.doctorName}</Text>
                <IconButton icon="delete" onPress={() => removeDoctor.mutate(item.associationId)} />
              </View>
              <Text variant="bodySmall">{item.medicalRegistrationNumber ?? '—'}</Text>
              <Text variant="bodySmall">{item.specialization ?? '—'}</Text>
              <Text variant="bodySmall">Branch: {item.branchName ?? '—'}</Text>
              <Text variant="labelSmall">Status: {item.status}</Text>
            </View>
          )}
        />
      </View>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Associate Doctor</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 480 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              <View style={styles.searchRow}>
                <TextInput label="Search by registration #" mode="outlined" value={query} onChangeText={setQuery} style={styles.searchInput} />
                <Button mode="outlined" onPress={handleSearch} loading={searchDoctors.isPending}>Search</Button>
              </View>
              {results.map((r) => (
                <List.Item
                  key={r.doctorId}
                  title={r.doctorName}
                  description={`${r.medicalRegistrationNumber ?? ''} · ${r.primarySpecialization ?? ''}`}
                  onPress={() => setSelectedDoctorId(r.doctorId)}
                  style={selectedDoctorId === r.doctorId ? styles.selectedItem : undefined}
                />
              ))}
              <Menu
                visible={branchMenuOpen}
                onDismiss={() => setBranchMenuOpen(false)}
                anchor={<Button mode="outlined" onPress={() => setBranchMenuOpen(true)}>Branch: {selectedBranchName}</Button>}
              >
                <Menu.Item title="None" onPress={() => { setBranchId(''); setBranchMenuOpen(false); }} />
                {branches.map((b) => (
                  <Menu.Item key={b.id} title={b.name} onPress={() => { setBranchId(b.id); setBranchMenuOpen(false); }} />
                ))}
              </Menu>
              <Menu
                visible={deptMenuOpen}
                onDismiss={() => setDeptMenuOpen(false)}
                anchor={<Button mode="outlined" onPress={() => setDeptMenuOpen(true)}>Department: {selectedDeptName}</Button>}
              >
                <Menu.Item title="None" onPress={() => { setDepartmentId(''); setDeptMenuOpen(false); }} />
                {departments.map((d) => (
                  <Menu.Item key={d.id} title={d.name} onPress={() => { setDepartmentId(d.id); setDeptMenuOpen(false); }} />
                ))}
              </Menu>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button onPress={handleAssociate} disabled={!selectedDoctorId} loading={associateDoctor.isPending}>Associate</Button>
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
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchInput: { flex: 1 },
  selectedItem: { backgroundColor: appColors.primaryContainer },
  snackbarError: { backgroundColor: '#b00020' },
});
