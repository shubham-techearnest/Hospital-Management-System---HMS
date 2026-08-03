import { useEffect, useMemo, useState } from 'react';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { Box, IconButton, Paper, Typography } from '@mui/material';

export interface AvailabilityCalendarProps {
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
  const cells: Array<{ date: Date; inMonth: boolean } | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
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

  const goPrev = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goNext = () => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, maxWidth: 360 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1.5}>
        <IconButton size="small" aria-label="Previous month" onClick={goPrev}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography fontWeight={600}>{monthLabel}</Typography>
        <IconButton size="small" aria-label="Next month" onClick={goNext}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.5} mb={0.5}>
        {WEEKDAYS.map((day) => (
          <Typography key={day} variant="caption" color="text.secondary" textAlign="center" fontWeight={600}>
            {day}
          </Typography>
        ))}
      </Box>

      <Box display="grid" gridTemplateColumns="repeat(7, 1fr)" gap={0.5}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <Box key={`empty-${index}`} sx={{ height: 40 }} />;
          }

          const dateKey = formatDateKey(cell.date);
          const isAvailable = availableSet.has(dateKey);
          const isSelected = selectedDate === dateKey;
          const slotCount = slotCounts[dateKey];

          return (
            <Box
              key={dateKey}
              component="button"
              type="button"
              disabled={!isAvailable}
              onClick={() => isAvailable && onSelectDate(dateKey)}
              aria-label={
                isAvailable
                  ? `${cell.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}${slotCount ? `, ${slotCount} slots` : ''}`
                  : `${cell.date.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} unavailable`
              }
              aria-pressed={isSelected}
              sx={{
                height: 40,
                border: 'none',
                borderRadius: 1,
                cursor: isAvailable ? 'pointer' : 'default',
                bgcolor: isSelected ? 'primary.main' : isAvailable ? 'primary.50' : 'transparent',
                color: isSelected ? 'primary.contrastText' : isAvailable ? 'primary.dark' : 'text.disabled',
                fontWeight: isSelected ? 700 : 500,
                fontSize: '0.875rem',
                opacity: isAvailable ? 1 : 0.35,
                transition: 'background-color 0.15s',
                '&:hover': isAvailable && !isSelected ? { bgcolor: 'primary.100' } : undefined,
                '&:disabled': { cursor: 'default' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0,
              }}
            >
              <span>{cell.date.getDate()}</span>
              {isAvailable && slotCount ? (
                <Typography component="span" variant="caption" sx={{ fontSize: '0.6rem', lineHeight: 1, opacity: 0.85 }}>
                  {slotCount}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
        Highlighted dates have available slots. Numbers show slot count.
      </Typography>
    </Paper>
  );
}
