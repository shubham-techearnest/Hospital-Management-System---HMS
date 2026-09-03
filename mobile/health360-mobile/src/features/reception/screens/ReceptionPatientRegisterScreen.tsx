import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Dialog, Menu, Portal, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import {
  extractDuplicateCandidates,
  type DuplicateCandidate,
} from '@/features/reception/api/patientRegistryApi';
import { useRegisterHospitalPatient } from '@/features/reception/hooks/usePatientRegistryQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { PhoneField } from '@/shared/phone/PhoneField';
import { isValidE164 } from '@/shared/phone/phoneUtils';
import { appColors, layout } from '@/shared/theme';
import type { ReceptionPatientsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ReceptionPatientsStackParamList, 'PatientRegister'>;

const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;

export function ReceptionPatientRegisterScreen({ navigation }: Props) {
  const register = useRegisterHospitalPatient();
  const [genderMenu, setGenderMenu] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [duplicates, setDuplicates] = useState<DuplicateCandidate[] | null>(null);
  const [form, setForm] = useState({
    legalFirstName: '',
    legalLastName: '',
    dateOfBirth: '',
    gender: 'MALE',
    primaryPhone: '',
    email: '',
    permanentCity: '',
    permanentState: '',
    permanentPincode: '',
  });

  const submit = async () => {
    setErrorMessage('');
    setPhoneError('');
    if (!isValidE164(form.primaryPhone)) {
      setPhoneError('Enter a valid mobile number.');
      return;
    }
    try {
      const result = await register.mutateAsync(form);
      navigation.replace('PatientReceipt', { patientId: result.patientId });
    } catch (error) {
      const candidates = extractDuplicateCandidates(error);
      if (candidates) {
        setDuplicates(candidates);
        return;
      }
      setErrorMessage(getApiErrorMessage(error, 'Registration failed'));
    }
  };

  const canSubmit = Boolean(
    form.legalFirstName.trim()
    && form.legalLastName.trim()
    && form.dateOfBirth.trim()
    && form.primaryPhone.trim(),
  );

  return (
    <ScreenContainer>
      <ScreenIntro description="Create a hospital patient record and assign a UHID." />
      <AppCard>
        <TextInput
          label="First name"
          value={form.legalFirstName}
          onChangeText={(legalFirstName) => setForm((f) => ({ ...f, legalFirstName }))}
          style={styles.field}
        />
        <TextInput
          label="Last name"
          value={form.legalLastName}
          onChangeText={(legalLastName) => setForm((f) => ({ ...f, legalLastName }))}
          style={styles.field}
        />
        <TextInput
          label="Date of birth (YYYY-MM-DD)"
          value={form.dateOfBirth}
          onChangeText={(dateOfBirth) => setForm((f) => ({ ...f, dateOfBirth }))}
          style={styles.field}
        />
        <Menu
          visible={genderMenu}
          onDismiss={() => setGenderMenu(false)}
          anchor={
            <Button mode="outlined" onPress={() => setGenderMenu(true)} style={styles.field}>
              Gender: {form.gender}
            </Button>
          }
        >
          {GENDERS.map((gender) => (
            <Menu.Item
              key={gender}
              title={gender}
              onPress={() => {
                setForm((f) => ({ ...f, gender }));
                setGenderMenu(false);
              }}
            />
          ))}
        </Menu>
        <PhoneField
          label="Primary mobile"
          required
          value={form.primaryPhone}
          onChange={(primaryPhone) => {
            setForm((f) => ({ ...f, primaryPhone }));
            setPhoneError('');
          }}
          error={!!phoneError}
          helperText={phoneError || undefined}
          style={styles.field}
        />
        <TextInput
          label="Email (optional)"
          autoCapitalize="none"
          keyboardType="email-address"
          value={form.email}
          onChangeText={(email) => setForm((f) => ({ ...f, email }))}
          style={styles.field}
        />
        <TextInput
          label="City"
          value={form.permanentCity}
          onChangeText={(permanentCity) => setForm((f) => ({ ...f, permanentCity }))}
          style={styles.field}
        />
        <TextInput
          label="State"
          value={form.permanentState}
          onChangeText={(permanentState) => setForm((f) => ({ ...f, permanentState }))}
          style={styles.field}
        />
        <TextInput
          label="Pincode"
          keyboardType="number-pad"
          value={form.permanentPincode}
          onChangeText={(permanentPincode) => setForm((f) => ({ ...f, permanentPincode }))}
          style={styles.field}
        />
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <View style={styles.row}>
          <Button onPress={() => navigation.goBack()}>Cancel</Button>
          <Button mode="contained" onPress={() => void submit()} loading={register.isPending} disabled={!canSubmit}>
            Register
          </Button>
        </View>
      </AppCard>

      <Portal>
        <Dialog visible={Boolean(duplicates?.length)} onDismiss={() => setDuplicates(null)}>
          <Dialog.Title>Possible duplicate</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.meta}>Open the existing record — do not create a second identity.</Text>
            {duplicates?.map((candidate) => (
              <AppCard key={candidate.patientId} style={styles.dupCard}>
                <Text variant="titleSmall">{candidate.legalName}</Text>
                <Text style={styles.meta}>UHID: {candidate.uhid ?? '—'}</Text>
                <Text style={styles.meta}>{candidate.primaryPhone ?? '—'}</Text>
                <Button
                  mode="contained"
                  onPress={() => {
                    setDuplicates(null);
                    navigation.replace('PatientDetail', { patientId: candidate.patientId });
                  }}
                >
                  Open existing
                </Button>
              </AppCard>
            ))}
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDuplicates(null)}>Close</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
  error: { color: appColors.error, marginBottom: 8 },
  meta: { color: appColors.textSecondary, marginBottom: 8 },
  dupCard: { marginTop: layout.stackGap },
});
