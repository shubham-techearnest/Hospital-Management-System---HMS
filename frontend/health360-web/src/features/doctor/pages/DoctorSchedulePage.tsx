import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { useHospitalAssociations } from '@/features/doctor/hooks/useDoctorQueries';
import {
  CONSULTATION_TYPES,
  DAYS_OF_WEEK,
  type CreateSchedulePayload,
  type ScheduleBlock,
} from '@/features/scheduling/api/schedulingApi';
import { useCreateSchedule, useMySchedules, useUpdateSchedule, useBlockScheduleSlots, useUnblockScheduleSlots } from '@/features/scheduling/hooks/useSchedulingQueries';

const defaultBlock = (): Omit<ScheduleBlock, 'id'> => ({
  dayOfWeek: 'MONDAY',
  startTime: '09:00',
  endTime: '17:00',
  consultationType: 'IN_PERSON',
  active: true,
});

export function DoctorSchedulePage() {
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
  const [hospitalId, setHospitalId] = useState('');
  const [branchId, setBranchId] = useState('');
  const [slotDurationMinutes, setSlotDurationMinutes] = useState(15);
  const [bufferMinutes, setBufferMinutes] = useState(5);
  const [horizonDays, setHorizonDays] = useState(30);
  const [blocks, setBlocks] = useState<Omit<ScheduleBlock, 'id'>[]>([defaultBlock()]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [blockFromDate, setBlockFromDate] = useState('');
  const [blockToDate, setBlockToDate] = useState('');
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [blockError, setBlockError] = useState<string | null>(null);

  useEffect(() => {
    if (existing && !hospitalId) {
      setHospitalId(existing.hospitalId);
      setBranchId(existing.branchId);
      setSlotDurationMinutes(existing.slotDurationMinutes);
      setBufferMinutes(existing.bufferMinutes);
      setHorizonDays(existing.horizonDays);
      setBlocks(existing.scheduleBlocks.map(({ dayOfWeek, startTime, endTime, consultationType, active }) => ({
        dayOfWeek,
        startTime,
        endTime,
        consultationType,
        active,
      })));
    }
  }, [existing, hospitalId]);

  const payload: CreateSchedulePayload = {
    hospitalId,
    branchId,
    slotDurationMinutes,
    bufferMinutes,
    horizonDays,
    scheduleBlocks: blocks,
  };

  const handleSave = async () => {
    setError(null);
    setMessage(null);
    try {
      if (existing) {
        await updateSchedule.mutateAsync({ scheduleId: existing.id, payload });
        setMessage('Schedule updated and future slots regenerated.');
      } else {
        await createSchedule.mutateAsync(payload);
        setMessage('Schedule created and slots generated for the next 30 days.');
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { message?: string } } } };
      setError(err.response?.data?.error?.message ?? 'Unable to save schedule.');
    }
  };

  const updateBlock = (index: number, patch: Partial<Omit<ScheduleBlock, 'id'>>) => {
    setBlocks((prev) => prev.map((b, i) => (i === index ? { ...b, ...patch } : b)));
  };

  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 1 }}>Weekly Schedule</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Define your weekly availability per hospital branch. The system generates bookable time slots automatically.
      </Typography>

      {isLoading ? <Typography>Loading schedule…</Typography> : null}
      {message ? <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert> : null}
      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              select
              label="Hospital association"
              value={hospitalId && branchId ? `${hospitalId}:${branchId}` : ''}
              onChange={(e) => {
                const [h, b] = e.target.value.split(':');
                setHospitalId(h);
                setBranchId(b);
              }}
              fullWidth
              disabled={Boolean(existing)}
            >
              {activeAssociations.map((a) => (
                <MenuItem key={a.id} value={`${a.hospitalId}:${a.branchId}`}>
                  {a.hospitalName} — {a.branchName ?? a.branchId}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Slot duration (min)"
                type="number"
                value={slotDurationMinutes}
                onChange={(e) => setSlotDurationMinutes(Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Buffer (min)"
                type="number"
                value={bufferMinutes}
                onChange={(e) => setBufferMinutes(Number(e.target.value))}
                fullWidth
              />
              <TextField
                label="Horizon (days)"
                type="number"
                value={horizonDays}
                onChange={(e) => setHorizonDays(Number(e.target.value))}
                fullWidth
              />
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <Typography variant="h6" sx={{ mb: 2 }}>Weekly blocks</Typography>
      <Stack spacing={2} sx={{ mb: 3 }}>
        {blocks.map((block, index) => (
          <Card key={index}>
            <CardContent>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  label="Day"
                  value={block.dayOfWeek}
                  onChange={(e) => updateBlock(index, { dayOfWeek: e.target.value })}
                  fullWidth
                >
                  {DAYS_OF_WEEK.map((d) => (
                    <MenuItem key={d} value={d}>{d}</MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Start"
                  type="time"
                  value={block.startTime}
                  onChange={(e) => updateBlock(index, { startTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  label="End"
                  type="time"
                  value={block.endTime}
                  onChange={(e) => updateBlock(index, { endTime: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
                <TextField
                  select
                  label="Type"
                  value={block.consultationType}
                  onChange={(e) => updateBlock(index, { consultationType: e.target.value })}
                  fullWidth
                >
                  {CONSULTATION_TYPES.map((t) => (
                    <MenuItem key={t} value={t}>{t}</MenuItem>
                  ))}
                </TextField>
              </Stack>
              {blocks.length > 1 ? (
                <Button color="error" sx={{ mt: 2 }} onClick={() => setBlocks((prev) => prev.filter((_, i) => i !== index))}>
                  Remove block
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => setBlocks((prev) => [...prev, defaultBlock()])}>
          Add block
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!hospitalId || !branchId || createSchedule.isPending || updateSchedule.isPending}
        >
          {existing ? 'Update schedule' : 'Create schedule'}
        </Button>
      </Stack>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h6" sx={{ mb: 2 }}>Block dates</Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Temporarily block bookable slots for leave or unavailability. Requires an existing schedule.
      </Typography>
      {blockMessage ? <Alert severity="success" sx={{ mb: 2 }}>{blockMessage}</Alert> : null}
      {blockError ? <Alert severity="error" sx={{ mb: 2 }}>{blockError}</Alert> : null}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="From date"
              type="date"
              value={blockFromDate}
              onChange={(e) => setBlockFromDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="To date"
              type="date"
              value={blockToDate}
              onChange={(e) => setBlockToDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Stack>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="warning"
              disabled={!existing || !blockFromDate || !blockToDate || blockSlots.isPending}
              onClick={async () => {
                setBlockError(null);
                setBlockMessage(null);
                try {
                  const result = await blockSlots.mutateAsync({
                    scheduleId: existing!.id,
                    fromDate: blockFromDate,
                    toDate: blockToDate,
                  });
                  setBlockMessage(`${result?.slotsBlocked ?? 0} slot(s) blocked.`);
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { error?: { message?: string } } } };
                  setBlockError(err.response?.data?.error?.message ?? 'Unable to block slots.');
                }
              }}
            >
              Block
            </Button>
            <Button
              variant="outlined"
              disabled={!existing || !blockFromDate || !blockToDate || unblockSlots.isPending}
              onClick={async () => {
                setBlockError(null);
                setBlockMessage(null);
                try {
                  const result = await unblockSlots.mutateAsync({
                    scheduleId: existing!.id,
                    fromDate: blockFromDate,
                    toDate: blockToDate,
                  });
                  setBlockMessage(`${result?.slotsUnblocked ?? 0} slot(s) unblocked.`);
                } catch (e: unknown) {
                  const err = e as { response?: { data?: { error?: { message?: string } } } };
                  setBlockError(err.response?.data?.error?.message ?? 'Unable to unblock slots.');
                }
              }}
            >
              Unblock
            </Button>
          </Stack>
        </CardContent>
      </Card>

      <Box>
        <Typography variant="subtitle2" color="text.secondary">Existing schedules</Typography>
        {schedules.length === 0 ? (
          <Typography sx={{ mt: 1 }}>No schedules yet.</Typography>
        ) : (
          schedules.map((s) => (
            <Typography key={s.id} sx={{ mt: 1 }}>
              {s.id.slice(0, 8)}… — {s.scheduleBlocks.length} block(s), {s.slotDurationMinutes} min slots
            </Typography>
          ))
        )}
      </Box>
    </AnimatedPage>
  );
}
