import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { SelectField } from '@/features/patient/components/SelectField';
import {
  ACCREDITATION_OPTIONS,
  HOSPITAL_TYPES,
  isHospitalProfileNotFound,
} from '@/features/hospital/api/hospitalApi';
import {
  useCreateHospitalProfile,
  useHospitalProfile,
  useUpdateHospitalProfile,
} from '@/features/hospital/hooks/useHospitalQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function HospitalProfileScreen() {
  const { data: profile, isLoading, isError, error, refetch } = useHospitalProfile();
  const createProfile = useCreateHospitalProfile();
  const updateProfile = useUpdateHospitalProfile();
  const is404 = isError && isHospitalProfileNotFound(error);

  const [form, setForm] = useState({
    name: '',
    registrationNumber: '',
    hospitalType: 'PRIVATE',
    establishedYear: '',
    totalBedCount: '',
    accreditation: 'NONE',
    description: '',
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  useEffect(() => {
    if (!profile) return;
    setForm({
      name: profile.name,
      registrationNumber: profile.registrationNumber,
      hospitalType: profile.hospitalType,
      establishedYear: profile.establishedYear != null ? String(profile.establishedYear) : '',
      totalBedCount: profile.totalBedCount != null ? String(profile.totalBedCount) : '',
      accreditation: profile.accreditation ?? 'NONE',
      description: profile.description ?? '',
    });
  }, [profile]);

  const handleSave = async () => {
    const payload = {
      name: form.name,
      hospitalType: form.hospitalType,
      establishedYear: form.establishedYear ? Number(form.establishedYear) : undefined,
      totalBedCount: form.totalBedCount ? Number(form.totalBedCount) : undefined,
      accreditation: form.accreditation || undefined,
      description: form.description || undefined,
    };
    try {
      if (is404 || !profile) {
        await createProfile.mutateAsync({ ...payload, registrationNumber: form.registrationNumber });
        setSnackbar({ visible: true, message: 'Hospital profile created.', isError: false });
        refetch();
      } else {
        await updateProfile.mutateAsync(payload);
        setSnackbar({ visible: true, message: 'Profile saved.', isError: false });
      }
    } catch (err) {
      setSnackbar({
        visible: true,
        message: getApiErrorMessage(err, 'Unable to save profile.'),
        isError: true,
      });
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Hospital Profile</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          {profile ? 'Update your facility information.' : 'Create your hospital profile to get started.'}
        </Text>

        {isError && !is404 ? (
          <Text style={styles.errorText}>Unable to load profile.</Text>
        ) : null}

        {profile ? (
          <View style={styles.statsRow}>
            <Text variant="bodySmall">Branches: {profile.branchCount}</Text>
            <Text variant="bodySmall">Departments: {profile.departmentCount}</Text>
            <Text variant="bodySmall">Doctors: {profile.doctorCount}</Text>
          </View>
        ) : null}

        <TextInput label="Hospital Name *" mode="outlined" value={form.name} onChangeText={(name) => setForm({ ...form, name })} style={styles.field} />
        <TextInput label="Registration Number *" mode="outlined" value={form.registrationNumber} onChangeText={(registrationNumber) => setForm({ ...form, registrationNumber })} disabled={!!profile} style={styles.field} />
        <SelectField label="Hospital Type" value={form.hospitalType} options={HOSPITAL_TYPES} onChange={(hospitalType) => setForm({ ...form, hospitalType })} />
        <TextInput label="Established Year" mode="outlined" keyboardType="number-pad" value={form.establishedYear} onChangeText={(establishedYear) => setForm({ ...form, establishedYear })} style={styles.field} />
        <TextInput label="Total Bed Count" mode="outlined" keyboardType="number-pad" value={form.totalBedCount} onChangeText={(totalBedCount) => setForm({ ...form, totalBedCount })} style={styles.field} />
        <SelectField label="Accreditation" value={form.accreditation} options={ACCREDITATION_OPTIONS} onChange={(accreditation) => setForm({ ...form, accreditation })} />
        <TextInput label="Description" mode="outlined" multiline numberOfLines={4} value={form.description} onChangeText={(description) => setForm({ ...form, description })} style={styles.field} />

        <Button mode="contained" onPress={handleSave} loading={createProfile.isPending || updateProfile.isPending} style={styles.saveBtn}>
          {profile ? 'Save Profile' : 'Create Profile'}
        </Button>
      </ScrollView>

      <Snackbar visible={snackbar.visible} onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))} duration={4000} style={snackbar.isError ? styles.snackbarError : undefined}>
        {snackbar.message}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  loader: { flex: 1, marginTop: 48 },
  title: { fontWeight: '700' },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  errorText: { color: '#b00020', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 16, marginBottom: 16, padding: 12, backgroundColor: '#f5f5f5', borderRadius: 8 },
  field: { marginTop: 12 },
  saveBtn: { marginTop: 20 },
  snackbarError: { backgroundColor: '#b00020' },
});
