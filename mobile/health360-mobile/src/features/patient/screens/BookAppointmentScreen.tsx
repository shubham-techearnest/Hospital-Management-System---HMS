import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Snackbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectField } from '@/features/patient/components/SelectField';
import { TimeSlotPicker } from '@/features/scheduling/components/TimeSlotPicker';
import {
  useBookAppointment,
  useDoctorAvailability,
  useDoctorBookingLocations,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { isValidUuid } from '@/shared/utils/uuid';
import { appColors, layout } from '@/shared/theme';
import type { CareStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'BookAppointment'>;

const STEPS = ['Schedule', 'Details', 'Confirm'] as const;

function buildReasonForVisit(symptoms: string, contactPhone: string, notes: string) {
  const parts: string[] = [];
  if (symptoms.trim()) parts.push(`Symptoms: ${symptoms.trim()}`);
  if (contactPhone.trim()) parts.push(`Contact phone: ${contactPhone.trim()}`);
  if (notes.trim()) parts.push(`Notes: ${notes.trim()}`);
  return parts.join('\n').slice(0, 500) || undefined;
}

export function BookAppointmentScreen({ route, navigation }: Props) {
  const { doctorId } = route.params;
  const validDoctorId = isValidUuid(doctorId);
  const { data: locations = [], isLoading: locationsLoading } = useDoctorBookingLocations(doctorId, validDoctorId);
  const bookMutation = useBookAppointment();

  const [step, setStep] = useState(0);
  const [locationKey, setLocationKey] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [snack, setSnack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedLocation = useMemo(() => {
    const [hospitalId, branchId] = locationKey.split(':');
    return locations.find((l) => l.hospitalId === hospitalId && l.branchId === branchId);
  }, [locationKey, locations]);

  const { data: availability, isLoading: availabilityLoading } = useDoctorAvailability(
    doctorId,
    selectedLocation?.hospitalId ?? '',
    selectedLocation?.branchId ?? '',
    Boolean(selectedLocation),
  );

  useEffect(() => {
    if (locations.length === 1 && !locationKey) {
      const l = locations[0];
      setLocationKey(`${l.hospitalId}:${l.branchId}`);
    }
  }, [locations, locationKey]);

  const availableDays = useMemo(
    () => availability?.days.filter((d) => d.slots.some((s) => s.status === 'AVAILABLE')) ?? [],
    [availability],
  );

  useEffect(() => {
    if (availableDays.length > 0 && !selectedDate) {
      setSelectedDate(availableDays[0].date);
    }
  }, [availableDays, selectedDate]);

  const selectedSlot = useMemo(() => {
    const day = availableDays.find((d) => d.date === selectedDate);
    return day?.slots.find((s) => s.id === selectedSlotId && s.status === 'AVAILABLE');
  }, [availableDays, selectedDate, selectedSlotId]);

  const canNextFromSchedule = Boolean(selectedLocation && selectedSlotId);
  const canSubmit = canNextFromSchedule;

  const handleBook = async () => {
    if (!selectedLocation || !selectedSlot) {
      setError('Select a hospital location, date, and time slot.');
      return;
    }
    setError(null);
    try {
      const result = await bookMutation.mutateAsync({
        doctorId,
        hospitalId: selectedLocation.hospitalId,
        branchId: selectedLocation.branchId,
        slotId: selectedSlot.id,
        consultationType: selectedSlot.consultationType,
        reasonForVisit: buildReasonForVisit(symptoms, contactPhone, reasonForVisit),
      });
      setSnack(`Booking request submitted for ${result.doctor.name}. Pending doctor confirmation.`);
      setSelectedSlotId('');
      setSymptoms('');
      setContactPhone('');
      setReasonForVisit('');
      setStep(0);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Booking failed.'));
    }
  };

  if (!validDoctorId) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.error}>Invalid doctor link. Search for a doctor from Find Doctor tab.</Text>
        <Button mode="contained" onPress={() => navigation.navigate('DoctorSearch')}>Find a doctor</Button>
      </ScrollView>
    );
  }

  if (locationsLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <PageHero compact subtitle="Pick a slot, add visit details, and submit your request." />

        <View style={styles.steps}>
          {STEPS.map((label, index) => (
            <Chip
              key={label}
              compact
              selected={step === index}
              onPress={() => {
                if (index === 1 && !canNextFromSchedule) return;
                if (index === 2 && !canNextFromSchedule) return;
                setStep(index);
              }}
              style={styles.stepChip}
            >
              {index + 1}. {label}
            </Chip>
          ))}
        </View>

        {step === 0 ? (
          <>
            {locations.length === 0 ? (
              <Text>No active hospital locations for this doctor.</Text>
            ) : (
              <AppCard style={styles.card}>
                <SelectField
                  label="Hospital location"
                  value={locationKey}
                  options={locations.map((l) => ({
                    value: `${l.hospitalId}:${l.branchId}`,
                    label: `${l.hospitalName} — ${l.branchName} (${l.city})`,
                  }))}
                  onChange={(v) => {
                    setLocationKey(v);
                    setSelectedDate('');
                    setSelectedSlotId('');
                  }}
                />
              </AppCard>
            )}
            {availabilityLoading ? <ActivityIndicator style={styles.loader} /> : null}
            {selectedLocation && !availabilityLoading ? (
              <AppCard style={styles.card}>
                <TimeSlotPicker
                  days={availableDays}
                  selectedDate={selectedDate}
                  selectedSlotId={selectedSlotId}
                  onSelectDate={(date) => {
                    setSelectedDate(date);
                    setSelectedSlotId('');
                  }}
                  onSelectSlot={setSelectedSlotId}
                />
              </AppCard>
            ) : null}
            <Button mode="contained" disabled={!canNextFromSchedule} onPress={() => setStep(1)}>
              Continue to details
            </Button>
          </>
        ) : null}

        {step === 1 ? (
          <>
            <TextInput label="Symptoms or chief complaint" mode="outlined" dense value={symptoms} onChangeText={setSymptoms} multiline style={styles.input} />
            <TextInput label="Contact phone for this visit" mode="outlined" dense value={contactPhone} onChangeText={setContactPhone} keyboardType="phone-pad" style={styles.input} />
            <TextInput label="Additional notes (optional)" mode="outlined" dense value={reasonForVisit} onChangeText={setReasonForVisit} multiline style={styles.input} />
            <View style={styles.navRow}>
              <Button mode="outlined" onPress={() => setStep(0)}>Back</Button>
              <Button mode="contained" onPress={() => setStep(2)}>Review</Button>
            </View>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <AppCard style={styles.card}>
              <Text variant="labelLarge" style={styles.summaryTitle}>Booking summary</Text>
              {selectedLocation ? (
                <Text variant="bodySmall" style={styles.summaryLine}>
                  {selectedLocation.hospitalName} — {selectedLocation.branchName}
                </Text>
              ) : null}
              {selectedSlot ? (
                <Text variant="bodySmall" style={styles.summaryLine}>
                  {selectedDate} · {selectedSlot.startTime.slice(0, 5)} – {selectedSlot.endTime.slice(0, 5)} · {selectedSlot.consultationType.replace(/_/g, ' ')}
                </Text>
              ) : null}
              {symptoms.trim() ? <Text variant="bodySmall" style={styles.summaryLine}>Symptoms: {symptoms.trim()}</Text> : null}
            </AppCard>
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <View style={styles.navRow}>
              <Button mode="outlined" onPress={() => setStep(1)}>Back</Button>
              <Button mode="contained" onPress={handleBook} disabled={!canSubmit || bookMutation.isPending} loading={bookMutation.isPending}>
                Submit request
              </Button>
            </View>
          </>
        ) : null}
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={5000}>{snack}</Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: layout.screenPaddingX, paddingBottom: layout.screenPaddingBottom },
  loader: { marginVertical: 16 },
  card: { marginBottom: layout.stackGap },
  steps: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: layout.stackGap },
  stepChip: { height: 30 },
  input: { marginBottom: 8 },
  navRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 8, marginTop: layout.stackGap },
  summaryTitle: { fontWeight: '600', marginBottom: 4 },
  summaryLine: { color: appColors.textSecondary, marginTop: 2 },
  error: { color: appColors.error, marginBottom: 8 },
});
