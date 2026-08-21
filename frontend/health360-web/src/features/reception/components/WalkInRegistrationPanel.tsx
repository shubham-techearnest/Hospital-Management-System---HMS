import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import {
  extractDuplicateCandidates,
  registerHospitalPatient,
  searchHospitalPatients,
  type HospitalPatientSummary,
  type RegisterHospitalPatientResult,
} from '@/features/reception/api/patientRegistryApi';
import { useOpdDoctors } from '@/features/opd/hooks/useOpdQueries';
import { parseApiError } from '@/shared/api/errorUtils';

type Props = {
  hospitalId: string;
  branchId: string;
  desks: Array<{ id: string; label: string }>;
  onSubmit: (payload: {
    patientId: string;
    visitReason?: string;
    deskId?: string;
    primaryDoctorId?: string;
  }) => Promise<void>;
  pending?: boolean;
};

function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

function looksLikeUhid(value: string): boolean {
  return /^H360-\d{4}-\d+$/i.test(value.trim());
}

export function WalkInRegistrationPanel({ hospitalId, branchId, desks, onSubmit, pending }: Props) {
  const { data: doctors = [] } = useOpdDoctors(hospitalId, branchId);

  const [query, setQuery] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [deskId, setDeskId] = useState('');
  const [primaryDoctorId, setPrimaryDoctorId] = useState('');
  const [selected, setSelected] = useState<HospitalPatientSummary | null>(null);
  const [matches, setMatches] = useState<HospitalPatientSummary[]>([]);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newGender, setNewGender] = useState('OTHER');
  const [newPhone, setNewPhone] = useState('');
  const [searching, setSearching] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentialsNotice, setCredentialsNotice] = useState<RegisterHospitalPatientResult | null>(null);

  const runSearch = async () => {
    setError(null);
    setSelected(null);
    setMatches([]);
    setShowNewPatient(false);
    setCredentialsNotice(null);

    const q = query.trim();
    const hasNameDob = firstName.trim() && lastName.trim() && dateOfBirth;

    if (!q && !hasNameDob) {
      setError('Enter UHID, mobile, patient UUID, or name + DOB.');
      return;
    }

    setSearching(true);
    try {
      if (q && looksLikeUuid(q)) {
        setSelected({
          patientId: q,
          legalName: 'Selected by UUID',
          uhid: undefined,
        });
        return;
      }

      let params: {
        uhid?: string;
        mobile?: string;
        firstName?: string;
        lastName?: string;
        dateOfBirth?: string;
      };

      if (q && looksLikeUhid(q)) {
        params = { uhid: q.toUpperCase() };
      } else if (q && !hasNameDob) {
        params = { mobile: q };
      } else {
        params = {
          firstName: firstName.trim() || undefined,
          lastName: lastName.trim() || undefined,
          dateOfBirth: dateOfBirth || undefined,
          ...(q && !looksLikeUhid(q) ? { mobile: q } : {}),
        };
        // Prefer name+DOB when provided (API requires first+last+dob together)
        if (hasNameDob) {
          params = {
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            dateOfBirth,
          };
        }
      }

      const page = await searchHospitalPatients(params);
      setMatches(page.content);
      if (page.content.length === 1) {
        setSelected(page.content[0]);
      } else if (page.content.length === 0) {
        setShowNewPatient(true);
        if (q && !looksLikeUhid(q) && !looksLikeUuid(q)) {
          setNewPhone(q);
        }
        setError(null);
      }
    } catch (e) {
      setError(parseApiError(e).message);
    } finally {
      setSearching(false);
    }
  };

  const registerNewThenSelect = async () => {
    setError(null);
    setCredentialsNotice(null);
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth || !newPhone.trim()) {
      setError('New patient needs first name, last name, DOB, and mobile.');
      return;
    }
    setRegistering(true);
    try {
      const created = await registerHospitalPatient({
        legalFirstName: firstName.trim(),
        legalLastName: lastName.trim(),
        dateOfBirth,
        gender: newGender,
        primaryPhone: newPhone.trim(),
      });
      setCredentialsNotice(created);
      setSelected({
        patientId: created.patientId,
        uhid: created.uhid,
        legalName: `${firstName.trim()} ${lastName.trim()}`,
        primaryPhone: newPhone.trim(),
        dateOfBirth,
        gender: newGender,
        portalAccountStatus: 'ACTIVE',
      });
      setShowNewPatient(false);
      setMatches([]);
    } catch (e) {
      const candidates = extractDuplicateCandidates(e);
      if (candidates?.length) {
        setMatches(candidates.map((c) => ({
          patientId: c.patientId,
          uhid: c.uhid,
          legalName: c.legalName,
          primaryPhone: c.primaryPhone,
          dateOfBirth: c.dateOfBirth,
        })));
        setShowNewPatient(false);
        setError('Possible existing patient(s) found — select one, or adjust details.');
      } else {
        setError(parseApiError(e).message);
      }
    } finally {
      setRegistering(false);
    }
  };

  const submit = async () => {
    setError(null);
    if (!selected?.patientId) {
      setError('Search and select a patient, or register a new one.');
      return;
    }
    if (!hospitalId || !branchId) {
      setError('Hospital/branch scope is required.');
      return;
    }
    try {
      await onSubmit({
        patientId: selected.patientId,
        visitReason: visitReason.trim() || undefined,
        deskId: deskId || undefined,
        primaryDoctorId: primaryDoctorId || undefined,
      });
      setQuery('');
      setVisitReason('');
      setDeskId('');
      setPrimaryDoctorId('');
      setSelected(null);
      setMatches([]);
      setShowNewPatient(false);
      // Keep credentialsNotice so staff can copy before leaving tab
    } catch (e) {
      setError(parseApiError(e).message);
    }
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, maxWidth: 640 }}>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Walk-in registration</Typography>
        <Typography variant="body2" color="text.secondary">
          Find by UHID, mobile, UUID, or name + DOB. If the patient is new, register here —
          UHID and portal login are created automatically (credentials appear in the API terminal log and below).
        </Typography>
        {error ? <Alert severity="error">{error}</Alert> : null}
        {credentialsNotice ? (
          <Alert severity="info">
            <Typography variant="body2" fontWeight={600}>New patient portal credentials (also in server log)</Typography>
            <Typography variant="body2">UHID: {credentialsNotice.uhid}</Typography>
            <Typography variant="body2">Login: {credentialsNotice.temporaryLoginEmail}</Typography>
            <Typography variant="body2">Temp password: {credentialsNotice.temporaryPassword}</Typography>
            {credentialsNotice.portalInviteLink ? (
              <Typography variant="body2" sx={{ wordBreak: 'break-all', mt: 0.5 }}>
                Secure account link: {credentialsNotice.portalInviteLink}
              </Typography>
            ) : null}
            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
              Share with the patient. They can change the password after login. SMS is deferred — use the terminal log for manual verification.
            </Typography>
          </Alert>
        ) : null}

        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField
            label="UHID / mobile / patient UUID"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Button variant="outlined" onClick={runSearch} disabled={searching}>
            Find
          </Button>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField label="First name" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last name" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <TextField
            label="Date of birth"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </Stack>

        {matches.length > 1 ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>Multiple matches — pick the correct person:</Typography>
            <Stack spacing={1}>
              {matches.map((p) => (
                <Button
                  key={p.patientId}
                  variant={selected?.patientId === p.patientId ? 'contained' : 'outlined'}
                  onClick={() => setSelected(p)}
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  {p.legalName} · {p.uhid ?? 'no UHID'} · DOB {p.dateOfBirth ?? '—'} · {p.primaryPhone ?? ''}
                </Button>
              ))}
            </Stack>
          </Box>
        ) : null}

        {selected ? (
          <Alert severity="success">
            Selected: {selected.legalName}
            {selected.uhid ? ` · ${selected.uhid}` : ''}
          </Alert>
        ) : null}

        {showNewPatient ? (
          <>
            <Divider />
            <Typography variant="subtitle2">New patient — not found in system</Typography>
            <Typography variant="body2" color="text.secondary">
              Creates UHID, ACTIVE portal login (username + temp password logged), and optional secure-account invite.
            </Typography>
            <TextField
              label="Mobile (required)"
              fullWidth
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <TextField
              select
              label="Gender"
              fullWidth
              value={newGender}
              onChange={(e) => setNewGender(e.target.value)}
            >
              <MenuItem value="MALE">Male</MenuItem>
              <MenuItem value="FEMALE">Female</MenuItem>
              <MenuItem value="OTHER">Other</MenuItem>
            </TextField>
            <Button variant="outlined" onClick={registerNewThenSelect} disabled={registering}>
              {registering ? 'Creating…' : 'Create patient + UHID'}
            </Button>
          </>
        ) : null}

        <Divider />
        <TextField
          select
          label="Doctor for this OPD visit"
          fullWidth
          value={primaryDoctorId}
          onChange={(e) => setPrimaryDoctorId(e.target.value)}
          helperText="Patient or staff choice — assign before queueing"
        >
          <MenuItem value="">Unassigned (assign later)</MenuItem>
          {doctors.map((d) => (
            <MenuItem key={d.doctorId} value={d.doctorId}>
              {d.doctorName}{d.specialization ? ` · ${d.specialization}` : ''}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Visit reason"
          fullWidth
          multiline
          minRows={2}
          value={visitReason}
          onChange={(e) => setVisitReason(e.target.value)}
        />
        <TextField
          select
          label="Desk (optional)"
          fullWidth
          value={deskId}
          onChange={(e) => setDeskId(e.target.value)}
        >
          <MenuItem value="">None</MenuItem>
          {desks.map((d) => (
            <MenuItem key={d.id} value={d.id}>{d.label}</MenuItem>
          ))}
        </TextField>
        <Button variant="contained" onClick={submit} disabled={pending || !selected}>
          Register walk-in
        </Button>
      </Stack>
    </Paper>
  );
}
