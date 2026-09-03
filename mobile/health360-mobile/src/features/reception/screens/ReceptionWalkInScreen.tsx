import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Menu, Snackbar, Text, TextInput } from 'react-native-paper';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StaffScopeBar } from '@/features/opd/components/StaffScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { useOpdDoctors, useRegisterWalkIn } from '@/features/opd/hooks/useOpdStaffQueries';
import {
  extractDuplicateCandidates,
  registerHospitalPatient,
  searchHospitalPatients,
  type HospitalPatientSummary,
  type RegisterHospitalPatientResult,
} from '@/features/reception/api/patientRegistryApi';
import { useHospitalPatient, useLinkExistingPatient } from '@/features/reception/hooks/usePatientRegistryQueries';
import { buildPatientSearchParams, looksLikeEmail, looksLikePhone } from '@/features/reception/utils/patientSearchParams';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { PhoneField } from '@/shared/phone/PhoneField';
import { isValidE164 } from '@/shared/phone/phoneUtils';
import { appColors, layout } from '@/shared/theme';
import type { ReceptionPatientsStackParamList, ReceptionTabParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ReceptionPatientsStackParamList, 'WalkIn'>;
type WalkInNav = CompositeNavigationProp<
  Props['navigation'],
  BottomTabNavigationProp<ReceptionTabParamList>
>;

export function ReceptionWalkInScreen({ navigation, route }: Props) {
  const tabNavigation = navigation as WalkInNav;
  const presetPatientId = route.params?.patientId;
  const scope = useStaffHospitalScope();
  const { data: doctors = [] } = useOpdDoctors(scope.hospitalId, scope.branchId);
  const walkIn = useRegisterWalkIn(scope.hospitalId, scope.branchId);
  const linkPatient = useLinkExistingPatient();
  const preset = useHospitalPatient(presetPatientId);

  const [query, setQuery] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [primaryDoctorId, setPrimaryDoctorId] = useState('');
  const [doctorMenu, setDoctorMenu] = useState(false);
  const [genderMenu, setGenderMenu] = useState(false);
  const [selected, setSelected] = useState<HospitalPatientSummary | null>(null);
  const [matches, setMatches] = useState<HospitalPatientSummary[]>([]);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [newGender, setNewGender] = useState('OTHER');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [searching, setSearching] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<RegisterHospitalPatientResult | null>(null);

  useEffect(() => {
    if (preset.data) {
      setSelected(preset.data);
    }
  }, [preset.data]);

  const runSearch = async () => {
    const params = buildPatientSearchParams(query, { firstName, lastName, dateOfBirth });
    if (!params) {
      setSnack('Enter UHID, mobile, email, or first + last name.');
      return;
    }
    setSearching(true);
    setSelected(null);
    setMatches([]);
    setShowNewPatient(false);
    setCredentials(null);
    try {
      const page = await searchHospitalPatients(params);
      setMatches(page.content);
      if (page.content.length === 1) setSelected(page.content[0]);
      if (page.content.length === 0) {
        setShowNewPatient(true);
        if (query && looksLikePhone(query)) setNewPhone(query);
        else if (query && looksLikeEmail(query)) setNewEmail(query);
        else if (!firstName.trim()) {
          const parts = query.trim().split(/\s+/).filter(Boolean);
          if (parts.length >= 2) {
            setFirstName(parts[0]);
            setLastName(parts.slice(1).join(' '));
          }
        }
      }
    } catch (error) {
      setSnack(getApiErrorMessage(error, 'Search failed'));
    } finally {
      setSearching(false);
    }
  };

  const registerNew = async () => {
    if (!firstName.trim() || !lastName.trim() || !dateOfBirth || !newPhone.trim()) {
      setSnack('New patient needs first name, last name, DOB, and mobile.');
      return;
    }
    if (!isValidE164(newPhone)) {
      setSnack('Enter a valid mobile number.');
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
      setCredentials(created);
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
    } catch (error) {
      const candidates = extractDuplicateCandidates(error);
      if (candidates?.length) {
        setMatches(candidates.map((c) => ({
          patientId: c.patientId,
          uhid: c.uhid,
          legalName: c.legalName,
          primaryPhone: c.primaryPhone,
          dateOfBirth: c.dateOfBirth,
        })));
        setShowNewPatient(false);
        setSnack('Possible existing patient — select one.');
      } else {
        setSnack(getApiErrorMessage(error, 'Unable to register patient'));
      }
    } finally {
      setRegistering(false);
    }
  };

  const submit = async () => {
    if (!selected?.patientId) {
      setSnack('Search and select a patient, or register a new one.');
      return;
    }
    try {
      const result = await walkIn.mutateAsync({
        patientId: selected.patientId,
        visitReason: visitReason.trim() || undefined,
        primaryDoctorId: primaryDoctorId || undefined,
      });
      setSnack(`Queued — token ${result.queueEntry.tokenDisplay}`);
      tabNavigation.navigate('OpdQueue');
    } catch (error) {
      setSnack(getApiErrorMessage(error, 'Walk-in failed'));
    }
  };

  if (scope.isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  if (!scope.hasAssignment) {
    return (
      <ScreenContainer>
        <Text>No hospital assignment. Ask an admin to assign you before walk-in.</Text>
      </ScreenContainer>
    );
  }

  const selectedDoctor = doctors.find((d) => d.doctorId === primaryDoctorId);

  return (
    <ScreenContainer>
      <ScreenIntro description="Find or register the patient, then add them to today's OPD queue." />
      <StaffScopeBar
        scopes={scope.scopes}
        activeScopeIndex={scope.activeScopeIndex}
        onScopeChange={scope.setActiveScopeIndex}
        branches={scope.branches}
        branchId={scope.branchId}
        onBranchChange={scope.setBranchId}
        hospitalName={scope.hospitalName}
      />

      <TextInput
        label="UHID / mobile / email / name"
        value={query}
        onChangeText={setQuery}
        style={styles.field}
      />
      <TextInput label="First name" value={firstName} onChangeText={setFirstName} style={styles.field} />
      <TextInput label="Last name" value={lastName} onChangeText={setLastName} style={styles.field} />
      <TextInput
        label="Date of birth (YYYY-MM-DD, optional)"
        value={dateOfBirth}
        onChangeText={setDateOfBirth}
        style={styles.field}
      />
      <Button mode="outlined" loading={searching} onPress={() => void runSearch()} style={styles.field}>
        Find patient
      </Button>

      {matches.map((patient) => (
        <AppCard key={patient.patientId} style={styles.match}>
          <Text variant="titleSmall">{patient.legalName}</Text>
          <Text style={styles.meta}>{patient.uhid ?? 'UHID pending'} · {patient.primaryPhone ?? '—'}</Text>
          <Button compact onPress={() => setSelected(patient)}>
            {selected?.patientId === patient.patientId ? 'Selected' : 'Select'}
          </Button>
        </AppCard>
      ))}

      {selected ? (
        <AppCard style={styles.match}>
          <Text variant="titleSmall">Selected: {selected.legalName}</Text>
          <Text style={styles.meta}>{selected.uhid ?? 'UHID pending'}</Text>
          <Button compact onPress={() => void linkPatient.mutateAsync(selected.patientId).then((r) => {
            setSelected({ ...selected, uhid: r.uhid });
            setSnack(`Linked — UHID ${r.uhid}`);
          }).catch((error) => {
            const msg = getApiErrorMessage(error, 'Link failed');
            setSnack(msg.toLowerCase().includes('already registered') ? 'Already registered at this hospital.' : msg);
          })}>
            Link to this hospital
          </Button>
        </AppCard>
      ) : null}

      {showNewPatient ? (
        <AppCard style={styles.match}>
          <Text variant="titleSmall">New patient — not found</Text>
          <PhoneField
            label="Mobile"
            required
            value={newPhone}
            onChange={setNewPhone}
            style={styles.field}
          />
          <TextInput label="Email (optional)" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" style={styles.field} />
          <Menu
            visible={genderMenu}
            onDismiss={() => setGenderMenu(false)}
            anchor={<Button mode="outlined" onPress={() => setGenderMenu(true)} style={styles.field}>Gender: {newGender}</Button>}
          >
            {['MALE', 'FEMALE', 'OTHER'].map((gender) => (
              <Menu.Item key={gender} title={gender} onPress={() => { setNewGender(gender); setGenderMenu(false); }} />
            ))}
          </Menu>
          <Button mode="outlined" loading={registering} onPress={() => void registerNew()}>
            Create patient + UHID
          </Button>
        </AppCard>
      ) : null}

      {credentials ? (
        <AppCard style={styles.match}>
          <Text variant="titleSmall">Portal credentials</Text>
          <Text selectable>UHID: {credentials.uhid}</Text>
          <Text selectable>Login: {credentials.temporaryLoginEmail}</Text>
          <Text selectable>Temp password: {credentials.temporaryPassword}</Text>
        </AppCard>
      ) : null}

      <Menu
        visible={doctorMenu}
        onDismiss={() => setDoctorMenu(false)}
        anchor={
          <Button mode="outlined" onPress={() => setDoctorMenu(true)} style={styles.field}>
            Doctor: {selectedDoctor?.doctorName ?? 'Unassigned'}
          </Button>
        }
      >
        <Menu.Item title="Unassigned" onPress={() => { setPrimaryDoctorId(''); setDoctorMenu(false); }} />
        {doctors.map((doctor) => (
          <Menu.Item
            key={doctor.doctorId}
            title={doctor.doctorName}
            onPress={() => {
              setPrimaryDoctorId(doctor.doctorId);
              setDoctorMenu(false);
            }}
          />
        ))}
      </Menu>
      <TextInput
        label="Visit reason"
        value={visitReason}
        onChangeText={setVisitReason}
        multiline
        style={styles.field}
      />
      <Button mode="contained" loading={walkIn.isPending} disabled={!selected} onPress={() => void submit()}>
        Add to OPD queue
      </Button>
      <View style={styles.spacer} />
      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3500}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 8 },
  match: { marginBottom: layout.stackGap },
  meta: { color: appColors.textSecondary, marginTop: 2 },
  spacer: { height: 24 },
});
