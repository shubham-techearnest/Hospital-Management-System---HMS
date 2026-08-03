import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Snackbar, Switch, Text, TextInput } from 'react-native-paper';
import { SelectField } from '@/features/patient/components/SelectField';
import { ICU_TYPES } from '@/features/hospital/api/hospitalApi';
import { useHospitalProfile, useUpdateEmergencyInfo } from '@/features/hospital/hooks/useHospitalQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function HospitalEmergencyScreen() {
  const { data: profile, isLoading, isError } = useHospitalProfile();
  const updateEmergency = useUpdateEmergencyInfo();
  const [form, setForm] = useState({
    emergencyAvailable24x7: false,
    emergencyPhone: '',
    ambulanceAvailable: false,
    icuAvailable: false,
    icuBedCount: '',
    icuType: 'GENERAL',
  });
  const [snackbar, setSnackbar] = useState({ visible: false, message: '', isError: false });

  useEffect(() => {
    if (!profile?.emergencyInfo) return;
    const e = profile.emergencyInfo;
    setForm({
      emergencyAvailable24x7: e.emergencyAvailable24x7,
      emergencyPhone: e.emergencyPhone ?? '',
      ambulanceAvailable: e.ambulanceAvailable,
      icuAvailable: e.icuAvailable,
      icuBedCount: e.icuBedCount != null ? String(e.icuBedCount) : '',
      icuType: e.icuType ?? 'GENERAL',
    });
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateEmergency.mutateAsync({
        emergencyAvailable24x7: form.emergencyAvailable24x7,
        emergencyPhone: form.emergencyPhone || undefined,
        ambulanceAvailable: form.ambulanceAvailable,
        icuAvailable: form.icuAvailable,
        icuBedCount: form.icuBedCount ? Number(form.icuBedCount) : undefined,
        icuType: form.icuType,
      });
      setSnackbar({ visible: true, message: 'Emergency info saved.', isError: false });
    } catch (error) {
      setSnackbar({ visible: true, message: getApiErrorMessage(error, 'Unable to save.'), isError: true });
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Emergency & ICU</Text>
        {isError ? <Text style={styles.errorText}>Create hospital profile first.</Text> : null}

        <View style={styles.switchRow}>
          <Text>24×7 Emergency Available</Text>
          <Switch value={form.emergencyAvailable24x7} onValueChange={(emergencyAvailable24x7) => setForm({ ...form, emergencyAvailable24x7 })} />
        </View>
        <TextInput label="Emergency Phone" mode="outlined" value={form.emergencyPhone} onChangeText={(emergencyPhone) => setForm({ ...form, emergencyPhone })} style={styles.field} />
        <View style={styles.switchRow}>
          <Text>Ambulance Available</Text>
          <Switch value={form.ambulanceAvailable} onValueChange={(ambulanceAvailable) => setForm({ ...form, ambulanceAvailable })} />
        </View>
        <View style={styles.switchRow}>
          <Text>ICU Available</Text>
          <Switch value={form.icuAvailable} onValueChange={(icuAvailable) => setForm({ ...form, icuAvailable })} />
        </View>
        <TextInput label="ICU Bed Count" mode="outlined" keyboardType="number-pad" value={form.icuBedCount} onChangeText={(icuBedCount) => setForm({ ...form, icuBedCount })} style={styles.field} />
        <SelectField label="ICU Type" value={form.icuType} options={ICU_TYPES} onChange={(icuType) => setForm({ ...form, icuType })} />

        <Button mode="contained" onPress={handleSave} loading={updateEmergency.isPending} style={styles.saveBtn}>
          Save
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
  title: { fontWeight: '700', marginBottom: 16 },
  errorText: { color: '#b00020', marginBottom: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  field: { marginTop: 12 },
  saveBtn: { marginTop: 20 },
  snackbarError: { backgroundColor: '#b00020' },
});
