import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import type { DayAvailability, SlotAvailability } from '@/features/scheduling/api/schedulingApi';
import { CONSULTATION_TYPES } from '@/features/scheduling/api/schedulingApi';
import { AvailabilityCalendar } from '@/features/scheduling/components/AvailabilityCalendar';
import { SelectField } from '@/features/patient/components/SelectField';
import { formatEnumLabel } from '@/features/patient/utils/patientUtils';

interface TimeSlotPickerProps {
  days: DayAvailability[];
  selectedDate: string;
  selectedSlotId: string;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slotId: string) => void;
}

function formatDateLabel(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

function slotLabel(slot: SlotAvailability) {
  return `${formatTime(slot.startTime)} – ${formatTime(slot.endTime)}`;
}

function consultationLabel(type: string) {
  return formatEnumLabel(type);
}

export function TimeSlotPicker({
  days,
  selectedDate,
  selectedSlotId,
  onSelectDate,
  onSelectSlot,
}: TimeSlotPickerProps) {
  const [consultationType, setConsultationType] = useState('');

  const availableDays = days.filter((d) => d.slots.some((s) => s.status === 'AVAILABLE'));

  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    availableDays.forEach((day) => {
      day.slots
        .filter((s) => s.status === 'AVAILABLE')
        .forEach((s) => types.add(s.consultationType));
    });
    return CONSULTATION_TYPES.filter((type) => types.has(type));
  }, [availableDays]);

  useEffect(() => {
    if (availableTypes.length === 0) {
      setConsultationType('');
      return;
    }
    if (!consultationType || !availableTypes.includes(consultationType as typeof CONSULTATION_TYPES[number])) {
      setConsultationType(availableTypes[0]);
    }
  }, [availableTypes, consultationType]);

  const { availableDates, slotCounts } = useMemo(() => {
    const counts: Record<string, number> = {};
    const dates: string[] = [];
    availableDays.forEach((day) => {
      const count = day.slots.filter(
        (s) => s.status === 'AVAILABLE' && (!consultationType || s.consultationType === consultationType),
      ).length;
      if (count > 0) {
        counts[day.date] = count;
        dates.push(day.date);
      }
    });
    return { availableDates: dates, slotCounts: counts };
  }, [availableDays, consultationType]);

  const slotsForDate = useMemo(() => {
    const day = availableDays.find((d) => d.date === selectedDate);
    return day?.slots
      .filter((s) => s.status === 'AVAILABLE' && (!consultationType || s.consultationType === consultationType))
      .sort((a, b) => a.startTime.localeCompare(b.startTime)) ?? [];
  }, [availableDays, selectedDate, consultationType]);

  useEffect(() => {
    if (selectedDate && !availableDates.includes(selectedDate) && availableDates.length > 0) {
      onSelectDate(availableDates[0]);
      onSelectSlot('');
    }
  }, [availableDates, selectedDate, onSelectDate, onSelectSlot]);

  useEffect(() => {
    if (selectedSlotId && !slotsForDate.some((s) => s.id === selectedSlotId)) {
      onSelectSlot('');
    }
  }, [selectedSlotId, slotsForDate, onSelectSlot]);

  if (availableDays.length === 0) {
    return <Text style={styles.empty}>No available dates for this location.</Text>;
  }

  return (
    <View style={styles.container}>
      <SelectField
        label="Appointment type"
        value={consultationType}
        options={availableTypes.map((type) => ({
          value: type,
          label: consultationLabel(type),
        }))}
        onChange={(value) => {
          setConsultationType(value);
          onSelectSlot('');
        }}
      />

      <Text variant="labelLarge" style={styles.heading}>Select a date from the calendar</Text>
      <AvailabilityCalendar
        availableDates={availableDates}
        slotCounts={slotCounts}
        selectedDate={selectedDate}
        onSelectDate={(date) => {
          onSelectDate(date);
          onSelectSlot('');
        }}
      />

      {selectedDate ? (
        <SelectField
          label="Time slot"
          value={selectedSlotId}
          options={slotsForDate.map((slot) => ({
            value: slot.id,
            label: slotLabel(slot),
          }))}
          onChange={onSelectSlot}
        />
      ) : null}

      {selectedSlotId ? (
        <Text variant="bodySmall" style={styles.selectedHint}>
          {formatDateLabel(selectedDate)} · {consultationLabel(consultationType)}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  heading: { fontWeight: '600' },
  empty: { opacity: 0.7 },
  selectedHint: { opacity: 0.7, textAlign: 'center' },
});
