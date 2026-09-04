import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  HelperText,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { FilterChipRow } from '@/shared/components/FilterChipRow';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StatusChip } from '@/shared/components/StatusChip';
import { appColors, layout } from '@/shared/theme';
import type { SubscriptionPlan } from '../api/adminHospitalApi';
import {
  useAdminPlans,
  useUpdateAdminPlan,
  useUpdateAdminPlanLimits,
} from '../hooks/useAdminHospitalQueries';

const PLAN_STATUSES = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export function AdminPlansScreen() {
  const { data: plans = [], isLoading, isError, refetch, isFetching } = useAdminPlans();
  const updatePlan = useUpdateAdminPlan();
  const updateLimits = useUpdateAdminPlanLimits();

  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', status: 'ACTIVE' });
  const [limitForm, setLimitForm] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const editing = plans.find((plan) => plan.id === editId);

  const openEdit = (plan: SubscriptionPlan) => {
    setEditId(plan.id);
    setFormError(null);
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      price: String(plan.price),
      status: plan.status,
    });
    const limits: Record<string, string> = {};
    (plan.limits ?? []).forEach((limit) => {
      limits[limit.limitKey] = String(limit.limitValue);
    });
    setLimitForm(limits);
  };

  const handleSave = async () => {
    if (!editId) return;
    setFormError(null);
    if (!form.name.trim()) {
      setFormError('Plan name is required.');
      return;
    }
    const price = Number(form.price);
    if (Number.isNaN(price) || price < 0) {
      setFormError('Enter a valid price.');
      return;
    }
    try {
      await updatePlan.mutateAsync({
        planId: editId,
        payload: {
          name: form.name.trim(),
          description: form.description.trim(),
          price,
          status: form.status,
        },
      });
      if (Object.keys(limitForm).length > 0) {
        await updateLimits.mutateAsync({
          planId: editId,
          limits: Object.entries(limitForm).map(([limitKey, limitValue]) => ({
            limitKey,
            limitValue: Number(limitValue),
          })),
        });
      }
      setEditId(null);
      setSnack('Plan updated.');
    } catch {
      setFormError('Unable to save plan. Check values and try again.');
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : plans}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={
          <View style={styles.header}>
            <ScreenIntro description="View and update hospital subscription plan names, prices, status, and limits." />
            {isError ? <Text style={styles.error}>Unable to load plans.</Text> : null}
            {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState icon="clipboard-list-outline" title="No plans found" />
          ) : null
        }
        renderItem={({ item }) => {
          const maxDoctors = item.limits?.find((limit) => limit.limitKey === 'MAX_DOCTORS')?.limitValue;
          return (
            <AppCard style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.identity}>
                  <Text variant="titleMedium" style={styles.name}>{item.name}</Text>
                  <Text variant="bodySmall" style={styles.meta}>{item.code}</Text>
                </View>
                <StatusChip status={item.status} />
              </View>
              <Text variant="bodyMedium" style={styles.body}>
                {item.currency} {item.price} / {item.billingCycle.toLowerCase()}
              </Text>
              <Text variant="bodySmall" style={styles.meta}>
                Max doctors: {maxDoctors ?? '—'}
              </Text>
              <Button mode="outlined" onPress={() => openEdit(item)} style={styles.editButton}>
                Edit
              </Button>
            </AppCard>
          );
        }}
      />

      <Portal>
        <Dialog visible={Boolean(editId)} onDismiss={() => setEditId(null)} style={styles.dialog}>
          <Dialog.Title>Edit plan — {editing?.code}</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.form}>
                <TextInput
                  label="Name"
                  mode="outlined"
                  value={form.name}
                  onChangeText={(name) => setForm((current) => ({ ...current, name }))}
                  dense
                  style={styles.input}
                />
                <TextInput
                  label="Description"
                  mode="outlined"
                  multiline
                  value={form.description}
                  onChangeText={(description) => setForm((current) => ({ ...current, description }))}
                  dense
                  style={styles.input}
                />
                <TextInput
                  label="Price"
                  mode="outlined"
                  keyboardType="numeric"
                  value={form.price}
                  onChangeText={(price) => setForm((current) => ({ ...current, price }))}
                  dense
                  style={styles.input}
                />
                <FilterChipRow
                  value={form.status}
                  options={[...PLAN_STATUSES]}
                  onChange={(status) => setForm((current) => ({ ...current, status }))}
                />
                {(editing?.limits?.length ?? 0) > 0 ? (
                  <>
                    <Text variant="titleSmall" style={styles.sectionLabel}>Plan limits</Text>
                    {editing?.limits.map((limit) => (
                      <TextInput
                        key={limit.limitKey}
                        label={limit.limitKey.replace(/_/g, ' ')}
                        mode="outlined"
                        keyboardType="numeric"
                        value={limitForm[limit.limitKey] ?? String(limit.limitValue)}
                        onChangeText={(value) =>
                          setLimitForm((current) => ({ ...current, [limit.limitKey]: value }))
                        }
                        dense
                        style={styles.input}
                      />
                    ))}
                  </>
                ) : null}
                {formError ? <HelperText type="error">{formError}</HelperText> : null}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setEditId(null)}>Cancel</Button>
            <Button
              loading={updatePlan.isPending || updateLimits.isPending}
              onPress={handleSave}
            >
              Save
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: layout.screenPaddingX,
    paddingTop: layout.screenPaddingY,
    paddingBottom: layout.screenPaddingBottom,
  },
  header: {
    marginBottom: layout.stackGap,
  },
  card: {
    marginBottom: layout.listItemGap,
    gap: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: layout.stackGap,
  },
  identity: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    fontWeight: '600',
    color: appColors.textPrimary,
  },
  meta: {
    color: appColors.textSecondary,
  },
  body: {
    color: appColors.textPrimary,
  },
  editButton: {
    alignSelf: 'flex-start',
    marginTop: layout.stackGap,
    borderRadius: 10,
  },
  dialog: {
    maxHeight: '90%',
  },
  dialogScroll: {
    maxHeight: 420,
    paddingHorizontal: 0,
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 8,
    gap: layout.stackGap,
  },
  input: {
    backgroundColor: appColors.surface,
  },
  sectionLabel: {
    fontWeight: '600',
    color: appColors.textPrimary,
    marginTop: 4,
  },
  error: {
    color: appColors.error,
  },
  loader: {
    marginTop: layout.stackGap,
  },
});
