import { useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Menu, Portal, Snackbar, Text } from 'react-native-paper';
import { useQuery } from '@tanstack/react-query';
import { listHospitalCatalog } from '@/features/hospital/api/hospitalApi';
import {
  useCreateHospitalAssociation,
  useDeleteHospitalAssociation,
  useHospitalAssociations,
} from '@/features/doctor/hooks/useDoctorQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function DoctorHospitalAssociationsScreen() {
  const { data: associations = [] } = useHospitalAssociations();
  const createAssoc = useCreateHospitalAssociation();
  const deleteAssoc = useDeleteHospitalAssociation();
  const { data: hospitals = [] } = useQuery({
    queryKey: ['hospital', 'catalog'],
    queryFn: listHospitalCatalog,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [hospitalId, setHospitalId] = useState('');
  const [hospitalMenuOpen, setHospitalMenuOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  const selectedHospitalName = hospitals.find((h) => h.id === hospitalId)?.name ?? 'Select hospital';

  const handleSave = async () => {
    try {
      await createAssoc.mutateAsync({ hospitalId });
      setDialogOpen(false);
      setHospitalId('');
      setSnackbar({ visible: true, message: 'Association request submitted.', isError: false });
    } catch (error) {
      setSnackbar({ visible: true, message: getApiErrorMessage(error, 'Unable to create association.'), isError: true });
    }
  };

  return (
    <>
      <View style={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Hospital Associations</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Link your profile to hospitals where you practice.
        </Text>
        <Button mode="contained" icon="plus" onPress={() => setDialogOpen(true)} style={styles.addBtn}>
          Request Association
        </Button>
        <FlatList
          data={associations}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>No hospital associations yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">{item.hospitalName ?? item.hospitalId}</Text>
                <IconButton icon="delete" onPress={() => deleteAssoc.mutate(item.id)} />
              </View>
              <Text variant="bodySmall">Branch: {item.branchName ?? '—'}</Text>
              <Text variant="bodySmall">Department: {item.departmentName ?? '—'}</Text>
              <Text variant="labelSmall">Status: {item.status}</Text>
            </View>
          )}
        />
      </View>

      <Portal>
        <Dialog visible={dialogOpen} onDismiss={() => setDialogOpen(false)}>
          <Dialog.Title>Request Hospital Association</Dialog.Title>
          <Dialog.ScrollArea style={{ maxHeight: 240 }}>
            <ScrollView contentContainerStyle={styles.dialogContent}>
              {hospitals.length === 0 ? (
                <Text>No hospitals registered on the platform yet.</Text>
              ) : (
                <Menu
                  visible={hospitalMenuOpen}
                  onDismiss={() => setHospitalMenuOpen(false)}
                  anchor={
                    <Button mode="outlined" onPress={() => setHospitalMenuOpen(true)}>
                      {selectedHospitalName}
                    </Button>
                  }
                >
                  {hospitals.map((h) => (
                    <Menu.Item
                      key={h.id}
                      title={h.name}
                      onPress={() => {
                        setHospitalId(h.id);
                        setHospitalMenuOpen(false);
                      }}
                    />
                  ))}
                </Menu>
              )}
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setDialogOpen(false)}>Cancel</Button>
            <Button onPress={handleSave} disabled={!hospitalId} loading={createAssoc.isPending}>Submit</Button>
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
  title: { fontWeight: '700' },
  subtitle: { opacity: 0.7, marginBottom: 12 },
  addBtn: { alignSelf: 'flex-start', marginBottom: 12 },
  list: { paddingBottom: 24 },
  empty: { opacity: 0.6, marginTop: 16 },
  card: { borderWidth: StyleSheet.hairlineWidth, borderColor: '#e0e0e0', borderRadius: 8, padding: 12, marginBottom: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dialogContent: { padding: 16 },
  snackbarError: { backgroundColor: '#b00020' },
});
