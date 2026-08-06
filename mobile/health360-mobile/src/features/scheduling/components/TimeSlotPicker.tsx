import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Chip, Text } from 'react-native-paper';
import type { DayAvailability, SlotAvailability } from '@/features/scheduling/api/schedulingApi';
import { CONSULTATION_TYPES } from '@/features/scheduling/api/schedulingApi';
import { AvailabilityCalendar } from '@/features/scheduling/components/AvailabilityCalendar';
import { formatEnumLabel } from '@/features/patient/utils/patientUtils';
import { appColors, layout } from '@/shared/theme';

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
      <Text variant="labelMedium" style={styles.label}>Appointment type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
        {availableTypes.map((type) => (
          <Chip
            key={type}
            compact
            selected={consultationType === type}
            onPress={() => {
              setConsultationType(type);
              onSelectSlot('');
            }}
            style={styles.chip}
          >
            {consultationLabel(type)}
          </Chip>
        ))}
      </ScrollView>

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
        <>
          <Text variant="labelMedium" style={styles.label}>Time slots · {formatDateLabel(selectedDate)}</Text>
          {slotsForDate.length === 0 ? (
            <Text variant="bodySmall" style={styles.empty}>No slots for this type on the selected date.</Text>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {slotsForDate.map((slot) => (
                <Chip
                  key={slot.id}
                  compact
                  selected={selectedSlotId === slot.id}
                  onPress={() => onSelectSlot(slot.id)}
                  style={styles.chip}
                >
                  {slotLabel(slot)}
                </Chip>
              ))}
            </ScrollView>
          )}
        </>
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
  container: { gap: 8 },
  label: { fontWeight: '600', color: appColors.textPrimary },
  chipRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  chip: { height: 30 },
  empty: { color: appColors.textSecondary },
  selectedHint: { color: appColors.textSecondary, textAlign: 'center', marginTop: layout.stackGap / 2 },
});
