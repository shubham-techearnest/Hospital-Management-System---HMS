import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { appColors } from '@/shared/theme';

interface AvailabilityCalendarProps {
  availableDates: string[];
  slotCounts?: Record<string, number>;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startOffset = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: Array<{ date: Date } | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day) });
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function AvailabilityCalendar({
  availableDates,
  slotCounts = {},
  selectedDate,
  onSelectDate,
}: AvailabilityCalendarProps) {
  const availableSet = useMemo(() => new Set(availableDates), [availableDates]);

  const initialMonth = useMemo(() => {
    const anchor = selectedDate || availableDates[0];
    return anchor ? parseDateKey(anchor) : new Date();
  }, [availableDates, selectedDate]);

  const [viewMonth, setViewMonth] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));

  useEffect(() => {
    if (!selectedDate) return;
    const d = parseDateKey(selectedDate);
    setViewMonth((prev) => {
      if (prev.getFullYear() === d.getFullYear() && prev.getMonth() === d.getMonth()) return prev;
      return new Date(d.getFullYear(), d.getMonth(), 1);
    });
  }, [selectedDate]);

  const monthLabel = viewMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  const cells = buildMonthGrid(viewMonth.getFullYear(), viewMonth.getMonth());

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          size={20}
          onPress={() => setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
        />
        <Text variant="titleSmall" style={styles.monthLabel}>{monthLabel}</Text>
        <IconButton
          icon="chevron-right"
          size={20}
          onPress={() => setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
        />
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day) => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <View key={`empty-${index}`} style={styles.dayCell} />;
          }

          const dateKey = formatDateKey(cell.date);
          const isAvailable = availableSet.has(dateKey);
          const isSelected = selectedDate === dateKey;
          const slotCount = slotCounts[dateKey];

          return (
            <Pressable
              key={dateKey}
              disabled={!isAvailable}
              onPress={() => onSelectDate(dateKey)}
              style={[
                styles.dayCell,
                isAvailable && styles.dayAvailable,
                isSelected && styles.daySelected,
                !isAvailable && styles.dayDisabled,
              ]}
            >
              <Text style={[styles.dayText, isSelected && styles.dayTextSelected, !isAvailable && styles.dayTextDisabled]}>
                {cell.date.getDate()}
              </Text>
              {isAvailable && slotCount ? (
                <Text style={[styles.slotCount, isSelected && styles.dayTextSelected]}>{slotCount}</Text>
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <Text variant="bodySmall" style={styles.hint}>
        Tap a highlighted date to see available time slots.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: appColors.outline,
    borderRadius: 12,
    padding: 8,
    backgroundColor: appColors.surface,
  },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  monthLabel: { fontWeight: '700', fontSize: 14 },
  weekRow: { flexDirection: 'row', marginBottom: 2 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '600', color: appColors.textSecondary },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: {
    width: `${100 / 7}%`,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  dayAvailable: { backgroundColor: appColors.primaryContainer },
  daySelected: { backgroundColor: appColors.primary },
  dayDisabled: { opacity: 0.35 },
  dayText: { fontWeight: '600', fontSize: 13, color: appColors.primary },
  dayTextSelected: { color: appColors.onPrimary },
  dayTextDisabled: { color: appColors.textSecondary },
  slotCount: { fontSize: 8, color: appColors.primary, lineHeight: 10 },
  hint: { color: appColors.textSecondary, marginTop: 6, textAlign: 'center', fontSize: 11 },
});
