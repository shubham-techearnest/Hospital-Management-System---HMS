import { useState } from 'react';
import {
  Alert,
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
import { useLinkExistingPatient, useRegistrationReceipt } from '@/features/reception/hooks/usePatientRegistryQueries';
import { buildPatientSearchParams, looksLikeEmail, looksLikePhone } from '@/features/reception/utils/patientSearchParams';
import { PatientSearchMatchList, PatientSelectedSummary } from '@/features/reception/components/PatientSearchMatchList';
import { VISIT_FLOW } from '@/features/opd/utils/visitFlowCopy';
import { useOpdDoctors } from '@/features/opd/hooks/useOpdQueries';
import { parseApiError } from '@/shared/api/errorUtils';
import { PhoneField } from '@/shared/phone/PhoneField';
import { isValidE164 } from '@/shared/phone/phoneUtils';

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

export function WalkInRegistrationPanel({ hospitalId, branchId, desks, onSubmit, pending }: Props) {
  const linkPatient = useLinkExistingPatient();
  const {
    data: doctors = [],
    isLoading: doctorsLoading,
    isError: doctorsError,
    error: doctorsLoadError,
  } = useOpdDoctors(hospitalId, branchId);

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
  const [newEmail, setNewEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [credentialsNotice, setCredentialsNotice] = useState<RegisterHospitalPatientResult | null>(null);
  const [linkedNotice, setLinkedNotice] = useState<string | null>(null);

  const { isError: notLinkedAtHospital } = useRegistrationReceipt(selected?.patientId);

  const runSearch = async () => {
    setError(null);
    setSelected(null);
    setMatches([]);
    setShowNewPatient(false);
    setCredentialsNotice(null);

    const q = query.trim();
    const hasNameDob = firstName.trim() && lastName.trim();

    if (!q && !hasNameDob) {
      setError('Enter UHID, mobile, email, patient name, or first + last name (DOB optional).');
      return;
    }

    setSearching(true);
    try {
      const params = buildPatientSearchParams(q, {
        firstName,
        lastName,
        dateOfBirth,
      });
      if (!params) {
        setError('Enter UHID, mobile, email, full name (e.g. Rahul Sharma), or first + last name.');
        return;
      }

      const page = await searchHospitalPatients(params);
      setMatches(page.content);
      if (page.content.length === 1) {
        setSelected(page.content[0]);
      } else {
        setSelected(null);
      }
      if (page.content.length === 0) {
        setShowNewPatient(true);
        if (q && looksLikePhone(q)) {
          setNewPhone(q);
        } else if (q && looksLikeEmail(q)) {
          setNewEmail(q);
        } else if (firstName.trim()) {
          // keep name fields as entered
        } else {
          const parts = q.split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(' '));
          }
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
    if (!isValidE164(newPhone)) {
      setError('Enter a valid mobile number.');
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
        email: newEmail.trim() || undefined,
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

  const linkToHospital = async () => {
    if (!selected?.patientId) return;
    setError(null);
    setLinkedNotice(null);
    try {
      const result = await linkPatient.mutateAsync(selected.patientId);
      setLinkedNotice(`Linked to hospital — UHID ${result.uhid}`);
      if (!selected.uhid) {
        setSelected({ ...selected, uhid: result.uhid });
      }
    } catch (e) {
      const parsed = parseApiError(e);
      if (parsed.message.toLowerCase().includes('already registered')) {
        setLinkedNotice('Patient is already registered at this hospital.');
      } else {
        setError(parsed.message);
      }
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
        <Typography variant="subtitle1">{VISIT_FLOW.walkIn.deskTab}</Typography>
        <Typography variant="body2" color="text.secondary">
          {VISIT_FLOW.walkIn.hint}
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
            label="UHID / mobile / email / name"
            fullWidth
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            helperText="Search by UHID, 10-digit mobile, email, or full name (e.g. Rahul Sharma). Add DOB below to narrow name matches."
          />
          <Button variant="outlined" onClick={runSearch} disabled={searching}>
            {searching ? 'Searching…' : 'Find'}
          </Button>
        </Stack>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
          <TextField label="First name" fullWidth value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          <TextField label="Last name" fullWidth value={lastName} onChange={(e) => setLastName(e.target.value)} />
          <TextField
            label="Date of birth (optional)"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
          />
        </Stack>

        {matches.length > 0 ? (
          <PatientSearchMatchList
            patients={matches}
            selectedPatientId={selected?.patientId}
            onSelect={setSelected}
          />
        ) : null}

        {selected ? <PatientSelectedSummary patient={selected} /> : null}

        {selected && notLinkedAtHospital ? (
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              Platform member not yet on this hospital&apos;s register. Link now, or proceed — walk-in links automatically.
            </Typography>
            <Button variant="outlined" size="small" onClick={() => void linkToHospital()} disabled={linkPatient.isPending}>
              {linkPatient.isPending ? 'Linking…' : 'Link to this hospital'}
            </Button>
          </Stack>
        ) : null}
        {linkedNotice ? <Alert severity="info">{linkedNotice}</Alert> : null}

        {showNewPatient ? (
          <>
            <Divider />
            <Typography variant="subtitle2">New patient — not found on Health360</Typography>
            <Typography variant="body2" color="text.secondary">
              Creates a platform account with UHID and portal login (credentials in server log and below).
              Patient can complete profile details after login.
            </Typography>
            <PhoneField
              label="Mobile"
              required
              value={newPhone}
              onChange={setNewPhone}
            />
            <TextField
              label="Email (optional — used for portal login)"
              type="email"
              fullWidth
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
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
        {doctorsError && (
          <Alert severity="warning">
            {parseApiError(doctorsLoadError).kind === 'forbidden'
              ? 'Cannot load doctors for this location. Confirm your staff assignment or hospital permissions.'
              : parseApiError(doctorsLoadError).message}
          </Alert>
        )}
        {!doctorsError && !doctorsLoading && doctors.length === 0 && hospitalId && (
          <Alert severity="info">
            No doctors are linked to this hospital/branch yet. You can still queue the visit as unassigned.
          </Alert>
        )}
        <TextField
          select
          label="Doctor for this OPD visit"
          fullWidth
          value={primaryDoctorId}
          onChange={(e) => setPrimaryDoctorId(e.target.value)}
          disabled={doctorsLoading}
          helperText={
            doctorsLoading
              ? 'Loading doctors…'
              : 'Patient or staff choice — assign before queueing'
          }
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
          {VISIT_FLOW.walkIn.deskAction}
        </Button>
      </Stack>
    </Paper>
  );
}
