import { useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Dialog,
  HelperText,
  Menu,
  Portal,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { EmptyState } from '@/shared/components/EmptyState';
import { FilterChipRow } from '@/shared/components/FilterChipRow';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { PhoneField } from '@/shared/phone/PhoneField';
import { isValidE164 } from '@/shared/phone/phoneUtils';
import { appColors, layout } from '@/shared/theme';
import { AdminHospitalCard } from '../components/AdminHospitalCard';
import { HOSPITAL_STATUSES, HOSPITAL_TYPES } from '../api/adminHospitalApi';
import { useAdminHospitals, useCreateAdminHospital } from '../hooks/useAdminHospitalQueries';
import type { AdminStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'HospitalsList'>;

const STATUS_OPTIONS = [
  { value: '', label: 'All status' },
  ...HOSPITAL_STATUSES.map((status) => ({ value: status, label: status })),
];

const emptyForm = {
  name: '',
  registrationNumber: '',
  hospitalType: 'PRIVATE',
  adminEmail: '',
  adminFirstName: '',
  adminLastName: '',
  adminPhone: '',
  planCode: 'FREE',
};

export function AdminHospitalsScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(0);
  const [createOpen, setCreateOpen] = useState(false);
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [phoneError, setPhoneError] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [snack, setSnack] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useAdminHospitals({
    name: name || undefined,
    status: status || undefined,
    page,
    size: 10,
  });
  const createHospital = useCreateAdminHospital();

  const hospitals = data?.content ?? [];

  const handleCreate = async () => {
    setFormError(null);
    setPhoneError('');
    if (!form.name.trim() || !form.registrationNumber.trim() || !form.adminEmail.trim()
      || !form.adminFirstName.trim() || !form.adminLastName.trim() || !form.adminPhone.trim()) {
      setFormError('Fill in hospital name, registration, and admin account fields including phone.');
      return;
    }
    if (!isValidE164(form.adminPhone)) {
      setPhoneError('Enter a valid phone number with country code.');
      return;
    }
    try {
      await createHospital.mutateAsync({
        ...form,
        name: form.name.trim(),
        registrationNumber: form.registrationNumber.trim(),
        adminEmail: form.adminEmail.trim(),
        adminFirstName: form.adminFirstName.trim(),
        adminLastName: form.adminLastName.trim(),
        adminPhone: form.adminPhone.trim(),
        planCode: form.planCode.trim() || 'FREE',
      });
      setCreateOpen(false);
      setForm(emptyForm);
      setSnack('Hospital created and admin invitation sent.');
    } catch {
      setFormError('Unable to create hospital. Check details and try again.');
    }
  };

  const listHeader = (
    <View style={styles.headerBlock}>
      <ScreenIntro description="Search hospitals, create accounts, and open a facility for status changes." />
      <Button
        mode="contained"
        icon="hospital-building"
        onPress={() => {
          setFormError(null);
          setPhoneError('');
          setCreateOpen(true);
        }}
        style={styles.createButton}
      >
        Create hospital
      </Button>
      <View style={styles.filters}>
        <TextInput
          label="Hospital name"
          mode="outlined"
          value={name}
          onChangeText={(value) => {
            setName(value);
            setPage(0);
          }}
          dense
          style={styles.input}
          left={<TextInput.Icon icon="magnify" />}
        />
        <FilterChipRow
          value={status}
          options={STATUS_OPTIONS}
          onChange={(value) => {
            setStatus(value);
            setPage(0);
          }}
        />
      </View>
      {isError ? <Text style={styles.error}>Unable to load hospitals.</Text> : null}
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  const listFooter = data && data.totalPages > 1 ? (
    <View style={styles.pagination}>
      <Button disabled={page <= 0} onPress={() => setPage((current) => current - 1)}>
        Previous
      </Button>
      <Text variant="bodySmall" style={styles.pageLabel}>
        Page {page + 1} of {data.totalPages}
      </Text>
      <Button disabled={page + 1 >= data.totalPages} onPress={() => setPage((current) => current + 1)}>
        Next
      </Button>
    </View>
  ) : (
    <View style={styles.footerSpacer} />
  );

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : hospitals}
        keyExtractor={(item) => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
        ListHeaderComponent={listHeader}
        ListFooterComponent={listFooter}
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="hospital-building"
              title="No hospitals found"
              message="Try adjusting your name or status filters."
            />
          ) : null
        }
        renderItem={({ item }) => (
          <AdminHospitalCard
            hospital={item}
            onPress={() => navigation.navigate('HospitalDetail', { hospitalId: item.id })}
          />
        )}
      />

      <Portal>
        <Dialog visible={createOpen} onDismiss={() => setCreateOpen(false)} style={styles.dialog}>
          <Dialog.Title>Create hospital</Dialog.Title>
          <Dialog.ScrollArea style={styles.dialogScroll}>
            <ScrollView keyboardShouldPersistTaps="handled">
              <View style={styles.form}>
                <TextInput
                  label="Hospital name"
                  mode="outlined"
                  value={form.name}
                  onChangeText={(value) => setForm((current) => ({ ...current, name: value }))}
                  dense
                  style={styles.input}
                />
                <TextInput
                  label="Registration number"
                  mode="outlined"
                  value={form.registrationNumber}
                  onChangeText={(value) => setForm((current) => ({ ...current, registrationNumber: value }))}
                  dense
                  style={styles.input}
                />
                <Menu
                  visible={typeMenuOpen}
                  onDismiss={() => setTypeMenuOpen(false)}
                  anchor={
                    <TextInput
                      label="Hospital type"
                      mode="outlined"
                      value={form.hospitalType}
                      editable={false}
                      dense
                      style={styles.input}
                      right={<TextInput.Icon icon="menu-down" onPress={() => setTypeMenuOpen(true)} />}
                      onPressIn={() => setTypeMenuOpen(true)}
                    />
                  }
                >
                  {HOSPITAL_TYPES.map((type) => (
                    <Menu.Item
                      key={type}
                      title={type}
                      onPress={() => {
                        setForm((current) => ({ ...current, hospitalType: type }));
                        setTypeMenuOpen(false);
                      }}
                    />
                  ))}
                </Menu>
                <TextInput
                  label="Plan code"
                  mode="outlined"
                  value={form.planCode}
                  onChangeText={(value) => setForm((current) => ({ ...current, planCode: value }))}
                  dense
                  style={styles.input}
                />
                <HelperText type="info">Default plan is FREE.</HelperText>

                <Text variant="titleSmall" style={styles.sectionLabel}>Hospital admin</Text>
                <TextInput
                  label="Admin email"
                  mode="outlined"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={form.adminEmail}
                  onChangeText={(value) => setForm((current) => ({ ...current, adminEmail: value }))}
                  dense
                  style={styles.input}
                />
                <TextInput
                  label="Admin first name"
                  mode="outlined"
                  value={form.adminFirstName}
                  onChangeText={(value) => setForm((current) => ({ ...current, adminFirstName: value }))}
                  dense
                  style={styles.input}
                />
                <TextInput
                  label="Admin last name"
                  mode="outlined"
                  value={form.adminLastName}
                  onChangeText={(value) => setForm((current) => ({ ...current, adminLastName: value }))}
                  dense
                  style={styles.input}
                />
                <PhoneField
                  label="Admin phone"
                  value={form.adminPhone}
                  onChange={(adminPhone) => {
                    setForm((current) => ({ ...current, adminPhone }));
                    setPhoneError('');
                  }}
                  required
                  error={Boolean(phoneError)}
                  helperText={phoneError || undefined}
                />
                {formError ? <HelperText type="error">{formError}</HelperText> : null}
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => setCreateOpen(false)}>Cancel</Button>
            <Button loading={createHospital.isPending} onPress={handleCreate}>
              Create
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
  headerBlock: {
    marginBottom: layout.stackGap,
  },
  createButton: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginBottom: layout.stackGap,
  },
  filters: {
    gap: layout.stackGap,
  },
  input: {
    backgroundColor: appColors.surface,
  },
  error: {
    color: appColors.error,
    marginTop: layout.stackGap,
  },
  loader: {
    marginTop: layout.sectionGap,
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: layout.sectionGap,
    gap: layout.stackGap,
  },
  pageLabel: {
    color: appColors.textSecondary,
  },
  footerSpacer: {
    height: layout.stackGap,
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
  sectionLabel: {
    fontWeight: '600',
    color: appColors.textPrimary,
    marginTop: 4,
  },
});
