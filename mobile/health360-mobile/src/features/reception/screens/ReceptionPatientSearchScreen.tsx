import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, SegmentedButtons, Snackbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { usePatientSearch } from '@/features/reception/hooks/usePatientRegistryQueries';
import type { HospitalPatientSummary } from '@/features/reception/api/patientRegistryApi';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { PhoneField } from '@/shared/phone/PhoneField';
import { appColors, layout } from '@/shared/theme';
import type { ReceptionPatientsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ReceptionPatientsStackParamList, 'PatientSearch'>;
type SearchTab = 'uhid' | 'mobile' | 'email' | 'name';

export function ReceptionPatientSearchScreen({ navigation }: Props) {
  const [tab, setTab] = useState<SearchTab>('uhid');
  const [uhid, setUhid] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const searchParams =
    tab === 'uhid'
      ? { uhid: submitted ? uhid : undefined }
      : tab === 'mobile'
        ? { mobile: submitted ? mobile : undefined }
        : tab === 'email'
          ? { email: submitted ? email : undefined }
          : {
              firstName: submitted ? firstName : undefined,
              lastName: submitted ? lastName : undefined,
              dateOfBirth: submitted && dateOfBirth ? dateOfBirth : undefined,
            };

  const { data, isFetching, isError, error, refetch } = usePatientSearch({
    ...searchParams,
    enabled: submitted,
  });

  const patients = data?.content ?? [];

  const openPatient = (patient: HospitalPatientSummary) => {
    navigation.navigate('PatientDetail', { patientId: patient.patientId });
  };

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={patients}
        keyExtractor={(item) => item.patientId}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            <ScreenIntro description="Search first. Open an existing record — do not register a second identity." />
            <View style={styles.actions}>
              <Button mode="contained" icon="account-plus" onPress={() => navigation.navigate('PatientRegister')}>
                Register new
              </Button>
              <Button mode="outlined" icon="walk" onPress={() => navigation.navigate('WalkIn')}>
                Walk-in
              </Button>
            </View>
            <SegmentedButtons
              value={tab}
              onValueChange={(value) => {
                setTab(value as SearchTab);
                setSubmitted(false);
              }}
              buttons={[
                { value: 'uhid', label: 'UHID' },
                { value: 'mobile', label: 'Mobile' },
                { value: 'email', label: 'Email' },
                { value: 'name', label: 'Name' },
              ]}
              style={styles.segment}
            />
            {tab === 'uhid' ? (
              <TextInput label="UHID" value={uhid} onChangeText={setUhid} autoCapitalize="characters" style={styles.field} />
            ) : null}
            {tab === 'mobile' ? (
              <PhoneField
                label="Mobile number"
                value={mobile}
                onChange={setMobile}
                optional
                style={styles.field}
              />
            ) : null}
            {tab === 'email' ? (
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.field}
              />
            ) : null}
            {tab === 'name' ? (
              <>
                <TextInput label="First name" value={firstName} onChangeText={setFirstName} style={styles.field} />
                <TextInput label="Last name" value={lastName} onChangeText={setLastName} style={styles.field} />
                <TextInput
                  label="Date of birth (YYYY-MM-DD, optional)"
                  value={dateOfBirth}
                  onChangeText={setDateOfBirth}
                  style={styles.field}
                />
              </>
            ) : null}
            <Button
              mode="contained"
              icon="magnify"
              loading={isFetching}
              onPress={() => {
                setSubmitted(true);
                void refetch();
              }}
              style={styles.searchBtn}
            >
              Search
            </Button>
            {isFetching ? <ActivityIndicator style={styles.loader} /> : null}
          </View>
        }
        ListEmptyComponent={
          !isFetching && submitted ? (
            <EmptyState icon="account-search" title="No matching patients" message="Register a new patient if this is a first visit." />
          ) : null
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => openPatient(item)}>
            <AppCard style={styles.card}>
              <Text variant="titleMedium">{item.legalName}</Text>
              <Text style={styles.meta}>{item.uhid ?? 'UHID pending'}</Text>
              <Text style={styles.meta}>{item.primaryPhone ?? item.email ?? '—'}</Text>
            </AppCard>
          </Pressable>
        )}
      />
      <Snackbar visible={isError} onDismiss={() => undefined} duration={4000}>
        {isError ? getApiErrorMessage(error, 'Search failed') : ''}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: layout.screenPaddingBottom },
  actions: { flexDirection: 'row', gap: layout.stackGap, marginBottom: layout.stackGap, flexWrap: 'wrap' },
  segment: { marginBottom: layout.stackGap },
  field: { marginBottom: 8 },
  searchBtn: { marginBottom: layout.stackGap },
  loader: { marginVertical: layout.stackGap },
  card: { marginBottom: layout.stackGap },
  meta: { color: appColors.textSecondary, marginTop: 2 },
});
