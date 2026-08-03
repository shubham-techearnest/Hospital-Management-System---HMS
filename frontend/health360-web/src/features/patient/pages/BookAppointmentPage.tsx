import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { TimeSlotPicker } from '@/features/scheduling/components/TimeSlotPicker';
import {
  useBookAppointment,
  useDoctorAvailability,
  useDoctorBookingLocations,
} from '@/features/scheduling/hooks/useSchedulingQueries';
import { isValidUuid } from '@/shared/utils/uuid';

const STEPS = ['Select Hospital', 'Pick Date & Time', 'Confirm', 'Success'];

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

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function buildReasonForVisit(symptoms: string, contactPhone: string, notes: string) {
  const parts: string[] = [];
  if (symptoms.trim()) parts.push(`Symptoms: ${symptoms.trim()}`);
  if (contactPhone.trim()) parts.push(`Contact phone: ${contactPhone.trim()}`);
  if (notes.trim()) parts.push(`Notes: ${notes.trim()}`);
  const combined = parts.join('\n');
  return combined.slice(0, 500) || undefined;
}

export function BookAppointmentPage() {
  const { doctorId = '' } = useParams<{ doctorId: string }>();
  const validDoctorId = isValidUuid(doctorId);
  const { data: locations = [], isLoading: locationsLoading } = useDoctorBookingLocations(doctorId, validDoctorId);
  const bookMutation = useBookAppointment();

  const [activeStep, setActiveStep] = useState(0);
  const [locationKey, setLocationKey] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [bookingResult, setBookingResult] = useState<Awaited<ReturnType<typeof bookMutation.mutateAsync>> | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedLocation = useMemo(() => {
    const [hospitalId, branchId] = locationKey.split(':');
    return locations.find((l) => l.hospitalId === hospitalId && l.branchId === branchId);
  }, [locationKey, locations]);

  const { data: availability, isLoading: availabilityLoading } = useDoctorAvailability(
    doctorId,
    selectedLocation?.hospitalId ?? '',
    selectedLocation?.branchId ?? '',
    Boolean(selectedLocation) && activeStep >= 1,
  );

  useEffect(() => {
    if (locations.length === 1 && !locationKey) {
      const l = locations[0];
      setLocationKey(`${l.hospitalId}:${l.branchId}`);
    }
  }, [locations, locationKey]);

  const availableDays = useMemo(
    () =>
      availability?.days.filter((day) =>
        day.slots.some((slot) => slot.status === 'AVAILABLE'),
      ) ?? [],
    [availability],
  );

  useEffect(() => {
    if (availableDays.length > 0 && !selectedDate) {
      setSelectedDate(availableDays[0].date);
    }
  }, [availableDays, selectedDate]);

  const slotsForSelectedDate = useMemo(
    () =>
      availableDays
        .find((day) => day.date === selectedDate)
        ?.slots.filter((slot) => slot.status === 'AVAILABLE') ?? [],
    [availableDays, selectedDate],
  );

  const selectedSlot = slotsForSelectedDate.find((slot) => slot.id === selectedSlotId);

  const resetTimeSelection = () => {
    setSelectedDate('');
    setSelectedSlotId('');
  };

  const handleNext = () => {
    setError(null);
    if (activeStep === 0 && !locationKey) {
      setError('Select a hospital location to continue.');
      return;
    }
    if (activeStep === 1 && (!selectedDate || !selectedSlotId)) {
      setError('Select a date and time slot to continue.');
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleBook = async () => {
    if (!selectedLocation || !selectedSlot) return;
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
      setBookingResult(result);
      setActiveStep(3);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { error?: { code?: string; message?: string } } } };
      const code = err.response?.data?.error?.code;
      const message = err.response?.data?.error?.message ?? 'Booking failed.';
      if (code === 'SLOT_UNAVAILABLE') {
        setError(`${message} Please choose another time slot.`);
        setSelectedSlotId('');
        setActiveStep(1);
        return;
      }
      setError(message);
    }
  };

  if (!validDoctorId) {
    return (
      <AnimatedPage>
        <Alert severity="warning" sx={{ mb: 2 }}>
          Invalid doctor link. Open a doctor from search to book an appointment.
        </Alert>
        <Button component={RouterLink} to="/patient/book" variant="contained">
          Search doctors
        </Button>
      </AnimatedPage>
    );
  }

  if (locationsLoading) {
    return (
      <AnimatedPage>
        <Stack alignItems="center" sx={{ py: 6 }}>
          <CircularProgress />
          <Typography sx={{ mt: 2 }}>Loading hospital locations…</Typography>
        </Stack>
      </AnimatedPage>
    );
  }

  if (locations.length === 0) {
    return (
      <AnimatedPage>
        <Alert severity="info">
          This doctor has no active hospital locations available for booking.
        </Alert>
        <Button component={RouterLink} to="/patient/book" sx={{ mt: 2 }}>
          Find another doctor
        </Button>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Typography variant="h4" sx={{ mb: 1 }}>Book Appointment</Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Complete each step to schedule your consultation.
      </Typography>

      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {STEPS.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {error ? <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> : null}

      {activeStep === 0 ? (
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 2 }}>Where would you like to visit?</Typography>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={locationKey}
              onChange={(e) => {
                setLocationKey(e.target.value);
                resetTimeSelection();
              }}
            >
              {locations.map((location) => (
                <Card key={`${location.hospitalId}:${location.branchId}`} variant="outlined" sx={{ mb: 1.5 }}>
                  <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <FormControlLabel
                      value={`${location.hospitalId}:${location.branchId}`}
                      control={<Radio />}
                      label={
                        <Box>
                          <Typography fontWeight={600}>{location.hospitalName}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {location.branchName} · {location.city}
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: 'flex-start', m: 0, width: '100%' }}
                    />
                  </CardContent>
                </Card>
              ))}
            </RadioGroup>
          </FormControl>
        </Box>
      ) : null}

      {activeStep === 1 ? (
        <Box>
          {availabilityLoading ? (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <CircularProgress size={20} />
              <Typography>Loading availability…</Typography>
            </Stack>
          ) : null}
          {!availabilityLoading ? (
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
          ) : null}
        </Box>
      ) : null}

      {activeStep === 2 && selectedLocation && selectedSlot ? (
        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">Appointment summary</Typography>
              <Typography sx={{ mt: 1 }}><strong>Hospital:</strong> {selectedLocation.hospitalName}</Typography>
              <Typography><strong>Branch:</strong> {selectedLocation.branchName}, {selectedLocation.city}</Typography>
              <Typography><strong>Date:</strong> {formatDateLabel(selectedDate)}</Typography>
              <Typography>
                <strong>Time:</strong> {formatTime(selectedSlot.startTime)} – {formatTime(selectedSlot.endTime)}
              </Typography>
              <Typography><strong>Type:</strong> {selectedSlot.consultationType.replace(/_/g, ' ')}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Your request will be sent to the doctor for confirmation.
              </Typography>
            </CardContent>
          </Card>
          <TextField
            label="Symptoms or chief complaint"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            multiline
            minRows={2}
            placeholder="e.g. Persistent headache for 3 days, mild fever"
            inputProps={{ maxLength: 200 }}
            fullWidth
          />
          <TextField
            label="Contact phone for this visit"
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="10-digit mobile number"
            inputProps={{ maxLength: 15 }}
            fullWidth
          />
          <TextField
            label="Additional notes (optional)"
            value={reasonForVisit}
            onChange={(e) => setReasonForVisit(e.target.value)}
            multiline
            minRows={2}
            inputProps={{ maxLength: 200 }}
            fullWidth
          />
        </Stack>
      ) : null}

      {activeStep === 3 && bookingResult ? (
        <Card sx={{ bgcolor: 'success.50', borderColor: 'success.light' }} variant="outlined">
          <CardContent>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <CheckCircleOutlineIcon color="success" />
              <Typography variant="h6">Booking request submitted</Typography>
            </Stack>
            <Typography sx={{ mb: 1 }}>
              Your appointment with <strong>{bookingResult.doctor.name}</strong> is pending doctor confirmation.
            </Typography>
            <Typography sx={{ mb: 1 }}>
              {formatDateTime(bookingResult.scheduledAt)} at {bookingResult.hospital.name} ({bookingResult.hospital.branchName})
            </Typography>
            <Typography color="text.secondary">
              Appointment ID: {bookingResult.appointmentId}
            </Typography>
            <Typography sx={{ mt: 1 }}>
              Fee: {bookingResult.consultationFee.currency} {bookingResult.consultationFee.amount}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button component={RouterLink} to="/patient/appointments" variant="contained">
                View my appointments
              </Button>
              <Button component={RouterLink} to="/patient/book" variant="outlined">
                Book another
              </Button>
            </Stack>
          </CardContent>
        </Card>
      ) : null}

      {activeStep < 3 ? (
        <Stack direction="row" justifyContent="space-between" sx={{ mt: 4 }}>
          <Button disabled={activeStep === 0 || bookMutation.isPending} onClick={handleBack}>
            Back
          </Button>
          {activeStep < 2 ? (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button
              variant="contained"
              disabled={bookMutation.isPending}
              onClick={handleBook}
            >
              {bookMutation.isPending ? 'Submitting…' : 'Submit booking request'}
            </Button>
          )}
        </Stack>
      ) : null}
    </AnimatedPage>
  );
}
