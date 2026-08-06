import { useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, IconButton, Portal, Dialog, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { appColors, layout } from '@/shared/theme';
import { FACILITY_CATEGORIES, type Facility } from '../api/hospitalApi';
import {
  useBranches,
  useCreateFacility,
  useDeleteFacility,
  useFacilities,
  useUpdateFacility,
} from '../hooks/useHospitalQueries';
import type { HospitalManageStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HospitalManageStackParamList, 'Facilities'>;

const emptyForm = { name: '', category: 'OTHER', description: '', branchId: '', available: true };

export function HospitalFacilitiesScreen(_props: Props) {
  const { data: facilities = [], isLoading, isError, refetch, isFetching } = useFacilities();
  const { data: branches = [] } = useBranches();
  const createFacility = useCreateFacility();
  const updateFacility = useUpdateFacility();
  const deleteFacility = useDeleteFacility();

  const [open, setOpen] = useState(false);
  const [editItem, setEditItem] = useState<Facility | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [snack, setSnack] = useState<string | null>(null);

  const openCreate = () => {
    setEditItem(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (facility: Facility) => {
    setEditItem(facility);
    setForm({
      name: facility.name,
      category: facility.category,
      description: facility.description ?? '',
      branchId: facility.branchId ?? '',
      available: facility.available,
    });
    setOpen(true);
  };

  const handleSave = async () => {
    const payload = {
      name: form.name.trim(),
      category: form.category,
      description: form.description || undefined,
      branchId: form.branchId || undefined,
      available: form.available,
    };
    try {
      if (editItem) {
        await updateFacility.mutateAsync({ id: editItem.id, payload });
      } else {
        await createFacility.mutateAsync(payload);
      }
      setOpen(false);
      setSnack(editItem ? 'Facility updated.' : 'Facility added.');
    } catch {
      setSnack('Unable to save facility.');
    }
  };

  const listHeader = (
    <View style={styles.header}>
      <ScreenIntro description="Manage diagnostic, surgical, emergency, and other facilities shown on your public profile." />
      {isError ? <Text style={styles.error}>Create hospital profile first.</Text> : null}
      <Button mode="contained" onPress={openCreate} style={styles.addBtn}>Add facility</Button>
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : facilities}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={!isLoading ? <EmptyState icon="hospital-box" title="No facilities yet" /> : null}
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.cardTop}>
              <Text variant="titleSmall" style={styles.name}>{item.name}</Text>
              <View style={styles.actions}>
                <IconButton icon="pencil" size={20} onPress={() => openEdit(item)} />
                <IconButton
                  icon="delete"
                  size={20}
                  onPress={() => deleteFacility.mutate(item.id, { onError: () => setSnack('Unable to delete.') })}
                />
              </View>
            </View>
            <Text variant="bodySmall" style={styles.meta}>{item.category}</Text>
            <Text variant="bodySmall" style={styles.meta}>{item.available ? 'Available' : 'Unavailable'}</Text>
          </AppCard>
        )}
      />

      <Portal>
        <Dialog visible={open} onDismiss={() => setOpen(false)}>
          <Dialog.Title>{editItem ? 'Edit facility' : 'Add facility'}</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Name" mode="outlined" value={form.name} onChangeText={(v) => setForm({ ...form, name: v })} style={styles.input} />
            <TextInput
              label="Category"
              mode="outlined"
              value={form.category}
              onChangeText={(v) => setForm({ ...form, category: v })}
              placeholder={FACILITY_CATEGORIES.join(', ')}
              style={styles.input}
            />
            <TextInput
              label="Description"
              mode="outlined"
              multiline
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              style={styles.input}
            />
            {branches.length > 0 ? (
              <TextInput
                label="Branch ID (optional)"
                mode="outlined"
                value={form.branchId}
                onChangeText={(v) => setForm({ ...form, branchId: v })}
                placeholder={branches.map((b) => b.name).join(', ')}
                style={styles.input}
              />
            ) : null}
            <View style={styles.switchRow}>
              <Text>Available</Text>
              <Switch value={form.available} onValueChange={(v) => setForm({ ...form, available: v })} />
            </View>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setOpen(false)}>Cancel</Button>
            <Button onPress={handleSave} disabled={!form.name.trim()} loading={createFacility.isPending || updateFacility.isPending}>
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={4000}>{snack}</Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: layout.stackGap },
  addBtn: { alignSelf: 'flex-start', marginBottom: layout.stackGap },
  list: { paddingBottom: layout.sectionGap, gap: layout.stackGap },
  card: { gap: 4 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  name: { fontWeight: '600', color: appColors.textPrimary, flex: 1 },
  meta: { color: appColors.textSecondary },
  actions: { flexDirection: 'row' },
  input: { marginBottom: layout.stackGap },
  switchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  error: { color: appColors.error, marginBottom: layout.stackGap },
  loader: { marginVertical: layout.stackGap },
});
