import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Card, Snackbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SelectField } from '@/features/patient/components/SelectField';
import { TimeSlotPicker } from '@/features/scheduling/components/TimeSlotPicker';
import {
  useBookAppointment,
  useDoctorAvailability,
  useDoctorBookingLocations,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import { AppCard } from '@/shared/components/AppCard';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { isValidUuid } from '@/shared/utils/uuid';
import type { CareStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'BookAppointment'>;

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
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select a hospital, pick a date and time, then add visit details.
        </Text>
        {locations.length === 0 ? (
          <Text>No active hospital locations for this doctor.</Text>
        ) : (
          <AppCard>
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

        {selectedSlot ? (
          <Card style={styles.summaryCard} mode="outlined">
            <Card.Content>
              <Text variant="labelLarge">Selected slot</Text>
              <Text>{selectedDate} · {selectedSlot.startTime.slice(0, 5)} – {selectedSlot.endTime.slice(0, 5)}</Text>
              <Text variant="bodySmall" style={styles.muted}>
                {selectedSlot.consultationType.replace(/_/g, ' ')} · Pending doctor confirmation after booking
              </Text>
            </Card.Content>
          </Card>
        ) : null}

        <TextInput
          label="Symptoms or chief complaint"
          mode="outlined"
          value={symptoms}
          onChangeText={setSymptoms}
          multiline
          style={styles.input}
        />
        <TextInput
          label="Contact phone for this visit"
          mode="outlined"
          value={contactPhone}
          onChangeText={setContactPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />
        <TextInput
          label="Additional notes (optional)"
          mode="outlined"
          value={reasonForVisit}
          onChangeText={setReasonForVisit}
          multiline
          style={styles.input}
        />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          mode="contained"
          onPress={handleBook}
          disabled={!selectedSlotId || bookMutation.isPending}
          loading={bookMutation.isPending}
        >
          Submit booking request
        </Button>
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={5000}>{snack}</Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  loader: { marginVertical: 24 },
  subtitle: { opacity: 0.7, marginBottom: 12 },
  card: { marginBottom: 12 },
  summaryCard: { marginBottom: 12 },
  muted: { opacity: 0.7, marginTop: 4 },
  input: { marginBottom: 12 },
  error: { color: '#b00020', marginBottom: 8 },
});
