import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import type { DayAvailability, SlotAvailability } from '@/features/scheduling/api/schedulingApi';
import { AvailabilityCalendar } from '@/features/scheduling/components/AvailabilityCalendar';
import { CONSULTATION_TYPES } from '@/features/scheduling/api/schedulingApi';
import { formatConsultationType } from '@/features/scheduling/utils/schedulingUtils';

export interface TimeSlotPickerProps {
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

export function TimeSlotPicker({
  days,
  selectedDate,
  selectedSlotId,
  onSelectDate,
  onSelectSlot,
}: TimeSlotPickerProps) {
  const [consultationType, setConsultationType] = useState('');

  const availableDays = days.filter((day) => day.slots.some((s) => s.status === 'AVAILABLE'));

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

  const selectedSlot = slotsForDate.find((s) => s.id === selectedSlotId);

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
    return (
      <Typography color="text.secondary">No available dates for this location.</Typography>
    );
  }

  return (
    <Stack spacing={1.5}>
      <FormControl fullWidth size="small">
        <InputLabel id="consultation-type-label">Appointment type</InputLabel>
        <Select
          labelId="consultation-type-label"
          label="Appointment type"
          value={consultationType}
          onChange={(e) => {
            setConsultationType(e.target.value);
            onSelectSlot('');
          }}
        >
          {availableTypes.map((type) => (
            <MenuItem key={type} value={type}>{formatConsultationType(type)}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box>
        <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>Select a date</Typography>
        <AvailabilityCalendar
          availableDates={availableDates}
          slotCounts={slotCounts}
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            onSelectDate(date);
            onSelectSlot('');
          }}
        />
      </Box>

      {selectedDate ? (
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" mb={0.75}>
            Time slots · {formatDateLabel(selectedDate)}
          </Typography>
          {slotsForDate.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No slots for {formatConsultationType(consultationType)} on this date
            </Typography>
          ) : (
            <Stack direction="row" flexWrap="wrap" gap={0.75}>
              {slotsForDate.map((slot) => (
                <Chip
                  key={slot.id}
                  label={slotLabel(slot)}
                  size="small"
                  color={selectedSlotId === slot.id ? 'primary' : 'default'}
                  variant={selectedSlotId === slot.id ? 'filled' : 'outlined'}
                  onClick={() => onSelectSlot(slot.id)}
                  sx={{ height: 28 }}
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : null}

      {selectedSlot ? (
        <Typography variant="body2" color="success.dark" sx={{ px: 1 }}>
          Selected: {formatDateLabel(selectedDate)} · {slotLabel(selectedSlot)} · {formatConsultationType(selectedSlot.consultationType)}
        </Typography>
      ) : null}
    </Stack>
  );
}
