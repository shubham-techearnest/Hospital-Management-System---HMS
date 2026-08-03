import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Snackbar, Text, TextInput } from 'react-native-paper';
import { SelectField } from '@/features/patient/components/SelectField';
import { useHospitalAssociations } from '@/features/doctor/hooks/useDoctorQueries';
import {
  CONSULTATION_TYPES,
  DAYS_OF_WEEK,
  type CreateSchedulePayload,
} from '@/features/scheduling/api/schedulingApi';
import { useCreateSchedule, useMySchedules, useUpdateSchedule, useBlockScheduleSlots, useUnblockScheduleSlots } from '@/features/scheduling/hooks/useSchedulingQueries';
import { AppCard } from '@/shared/components/AppCard';
import { getApiErrorMessage } from '@/shared/utils/helpers';

const defaultBlock = () => ({
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '17:00',
  consultationType: 'IN_PERSON',
  active: true,
});

export function DoctorScheduleScreen() {
  const { data: schedules = [], isLoading } = useMySchedules();
  const { data: associations = [] } = useHospitalAssociations();
  const createSchedule = useCreateSchedule();
  const updateSchedule = useUpdateSchedule();
  const blockSlots = useBlockScheduleSlots();
  const unblockSlots = useUnblockScheduleSlots();

  const activeAssociations = useMemo(
    () => associations.filter((a) => a.status === 'ACTIVE' && a.branchId),
    [associations],
  );

  const existing = schedules[0];
  const [locationKey, setLocationKey] = useState('');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState('15');
  const [bufferMinutes, setBufferMinutes] = useState('5');
  const [horizonDays, setHorizonDays] = useState('30');
  const [blocks, setBlocks] = useState([defaultBlock()]);
  const [blockFromDate, setBlockFromDate] = useState('');
  const [blockToDate, setBlockToDate] = useState('');
  const [snack, setSnack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (existing && !locationKey) {
      setLocationKey(`${existing.hospitalId}:${existing.branchId}`);
      setSlotDurationMinutes(String(existing.slotDurationMinutes));
      setBufferMinutes(String(existing.bufferMinutes));
      setHorizonDays(String(existing.horizonDays));
      setBlocks(existing.scheduleBlocks.map(({ dayOfWeek, startTime, endTime, consultationType, active }) => ({
        dayOfWeek, startTime, endTime, consultationType, active,
      })));
    }
  }, [existing, locationKey]);

  const locationOptions = activeAssociations.map((a) => ({
    label: `${a.hospitalName ?? a.hospitalId} — ${a.branchName ?? a.branchId}`,
    value: `${a.hospitalId}:${a.branchId}`,
  }));

  const handleSave = async () => {
    setError(null);
    const [hospitalId, branchId] = locationKey.split(':');
    if (!hospitalId || !branchId) {
      setError('Select a hospital location.');
      return;
    }
    const payload: CreateSchedulePayload = {
      hospitalId,
      branchId,
      slotDurationMinutes: Number(slotDurationMinutes),
      bufferMinutes: Number(bufferMinutes),
      horizonDays: Number(horizonDays),
      scheduleBlocks: blocks,
    };
    try {
      if (existing) {
        await updateSchedule.mutateAsync({ scheduleId: existing.id, payload });
        setSnack('Schedule updated.');
      } else {
        await createSchedule.mutateAsync(payload);
        setSnack('Schedule created.');
      }
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Unable to save schedule.'));
    }
  };

  const handleBlockSlots = async (unblock = false) => {
    if (!existing) {
      setError('Save a schedule first before blocking slots.');
      return;
    }
    if (!blockFromDate || !blockToDate) {
      setError('Enter from and to dates (YYYY-MM-DD).');
      return;
    }
    setError(null);
    try {
      const payload = { scheduleId: existing.id, fromDate: blockFromDate, toDate: blockToDate };
      const result = unblock
        ? await unblockSlots.mutateAsync(payload)
        : await blockSlots.mutateAsync(payload);
      setSnack(unblock
        ? `${result.slotsUnblocked} slots unblocked.`
        : `${result.slotsBlocked} slots blocked.`);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, unblock ? 'Unable to unblock slots.' : 'Unable to block slots.'));
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>Weekly Schedule</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Set weekly availability per hospital branch. Slots are generated for the next 30 days.
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <AppCard style={styles.card}>
          <SelectField
            label="Hospital location"
            value={locationKey}
            options={locationOptions.map((o) => o.value)}
            onChange={setLocationKey}
          />
          <TextInput label="Slot duration (min)" mode="outlined" keyboardType="number-pad" value={slotDurationMinutes} onChangeText={setSlotDurationMinutes} style={styles.input} />
          <TextInput label="Buffer (min)" mode="outlined" keyboardType="number-pad" value={bufferMinutes} onChangeText={setBufferMinutes} style={styles.input} />
          <TextInput label="Horizon (days)" mode="outlined" keyboardType="number-pad" value={horizonDays} onChangeText={setHorizonDays} style={styles.input} />
        </AppCard>

        {blocks.map((block, index) => (
          <AppCard key={index} style={styles.card}>
            <SelectField label="Day" value={block.dayOfWeek} options={DAYS_OF_WEEK} onChange={(dayOfWeek) => setBlocks((prev) => prev.map((b, i) => i === index ? { ...b, dayOfWeek } : b))} />
            <TextInput label="Start (HH:mm)" mode="outlined" value={block.startTime} onChangeText={(startTime) => setBlocks((prev) => prev.map((b, i) => i === index ? { ...b, startTime } : b))} style={styles.input} />
            <TextInput label="End (HH:mm)" mode="outlined" value={block.endTime} onChangeText={(endTime) => setBlocks((prev) => prev.map((b, i) => i === index ? { ...b, endTime } : b))} style={styles.input} />
            <SelectField label="Type" value={block.consultationType} options={CONSULTATION_TYPES} onChange={(consultationType) => setBlocks((prev) => prev.map((b, i) => i === index ? { ...b, consultationType } : b))} />
          </AppCard>
        ))}

        <View style={styles.actions}>
          <Button mode="outlined" onPress={() => setBlocks((prev) => [...prev, defaultBlock()])}>Add block</Button>
          <Button mode="contained" onPress={handleSave} loading={createSchedule.isPending || updateSchedule.isPending}>
            {existing ? 'Update schedule' : 'Create schedule'}
          </Button>
        </View>

        {existing ? (
          <AppCard style={styles.card}>
            <Text variant="titleMedium" style={styles.blockTitle}>Block / Unblock Slots</Text>
            <Text variant="bodySmall" style={styles.subtitle}>
              Block a date range to prevent bookings (e.g. leave or holidays).
            </Text>
            <TextInput label="From date (YYYY-MM-DD)" mode="outlined" value={blockFromDate} onChangeText={setBlockFromDate} style={styles.input} />
            <TextInput label="To date (YYYY-MM-DD)" mode="outlined" value={blockToDate} onChangeText={setBlockToDate} style={styles.input} />
            <View style={styles.actions}>
              <Button mode="contained" onPress={() => handleBlockSlots(false)} loading={blockSlots.isPending}>
                Block slots
              </Button>
              <Button mode="outlined" onPress={() => handleBlockSlots(true)} loading={unblockSlots.isPending}>
                Unblock slots
              </Button>
            </View>
          </AppCard>
        ) : null}
      </ScrollView>
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={4000}>{snack}</Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  loader: { marginTop: 32 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  card: { marginBottom: 12 },
  input: { marginTop: 8 },
  actions: { gap: 8, marginTop: 8 },
  error: { color: '#b00020', marginBottom: 12 },
  blockTitle: { fontWeight: '600', marginBottom: 4 },
});
