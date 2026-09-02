import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  ActivityIndicator,
  Button,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useQuery } from '@tanstack/react-query';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useRegisterOpdRequest } from '@/features/opd/hooks/useOpdQueries';
import { VisitFlowGuide } from '@/features/opd/components/VisitFlowGuide';
import { fetchHospitalDoctors, fetchPublicHospitalProfile } from '@/features/public/api/publicProfileApi';
import { useHospitalSearch } from '@/features/search/hooks/useHospitalSearch';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { AppointmentsStackParamList, HomeStackParamList } from '@/navigation/types';

type OpdNavParams = HomeStackParamList & AppointmentsStackParamList;

export function PatientRequestOpdScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OpdNavParams>>();
  const route = useRoute<RouteProp<OpdNavParams, 'RequestOpd'>>();
  const prefillHospitalId = route.params?.hospitalId ?? '';
  const prefillBranchId = route.params?.branchId ?? '';
  const prefillDoctorId = route.params?.doctorId ?? '';

  const [hospitalQuery, setHospitalQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHospitalId, setSelectedHospitalId] = useState(prefillHospitalId);
  const [selectedHospitalName, setSelectedHospitalName] = useState('');
  const [branchId, setBranchId] = useState(prefillBranchId);
  const [doctorId, setDoctorId] = useState(prefillDoctorId);
  const [visitReason, setVisitReason] = useState('');
  const [snack, setSnack] = useState('');

  const registerRequest = useRegisterOpdRequest();

  const { data: hospitalResults, isLoading: hospitalsLoading } = useHospitalSearch({
    q: searchTerm || undefined,
    page: 0,
    size: 10,
  });

  const { data: hospitalProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['public-hospital', selectedHospitalId],
    queryFn: () => fetchPublicHospitalProfile(selectedHospitalId),
    enabled: Boolean(selectedHospitalId),
  });

  const { data: doctorsPage } = useQuery({
    queryKey: ['hospital-doctors', selectedHospitalId],
    queryFn: () => fetchHospitalDoctors(selectedHospitalId, { page: 0, size: 50 }),
    enabled: Boolean(selectedHospitalId),
  });

  const branches = hospitalProfile?.branches ?? [];
  const doctors = doctorsPage?.content ?? [];
  const hospitals = hospitalResults?.content ?? [];

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      const preferred = branches.find((b) => b.id === prefillBranchId)
        ?? branches.find((b) => b.primary)
        ?? branches[0];
      if (preferred) setBranchId(preferred.id);
    }
  }, [branches, branchId, prefillBranchId]);

  const hospitalName = selectedHospitalName || hospitalProfile?.name || '';

  const branchMenu = useMemo(
    () => branches.map((b) => ({
      id: b.id,
      label: `${b.name}${b.primary ? ' (main)' : ''}${b.city ? ` — ${b.city}` : ''}`,
    })),
    [branches],
  );

  const submit = async () => {
    if (!selectedHospitalId || !branchId) {
      setSnack('Select a hospital and branch.');
      return;
    }
    try {
      await registerRequest.mutateAsync({
        hospitalId: selectedHospitalId,
        branchId,
        primaryDoctorId: doctorId || undefined,
        visitReason: visitReason.trim() || undefined,
      });
      const routeNames = navigation.getState().routeNames;
      if (routeNames.includes('OpdStatus')) {
        navigation.replace('OpdStatus');
      } else {
        navigation.replace('AppointmentsList');
      }
    } catch (e) {
      setSnack(getApiErrorMessage(e, 'Unable to submit OPD request.'));
    }
  };

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <PageHero
          title="Request OPD visit"
          subtitle="Choose hospital, branch, and optional doctor. Reception will add you to today's queue."
        />

        <VisitFlowGuide compact />

        <AppCard style={styles.section}>
          <Text variant="titleSmall" style={styles.sectionTitle}>Find hospital</Text>
          <TextInput
            label="Hospital name"
            mode="outlined"
            value={hospitalQuery}
            onChangeText={setHospitalQuery}
            onSubmitEditing={() => setSearchTerm(hospitalQuery.trim())}
            right={<TextInput.Icon icon="magnify" onPress={() => setSearchTerm(hospitalQuery.trim())} />}
          />
          {hospitalsLoading ? <ActivityIndicator style={styles.loader} /> : null}
          {searchTerm && hospitals.length === 0 && !hospitalsLoading ? (
            <Text style={styles.hint}>No hospitals found. Try another name.</Text>
          ) : null}
          {hospitals.map((h) => (
            <Button
              key={h.hospitalId}
              mode={selectedHospitalId === h.hospitalId ? 'contained' : 'outlined'}
              onPress={() => {
                setSelectedHospitalId(h.hospitalId);
                setSelectedHospitalName(h.name);
                setBranchId('');
                setDoctorId('');
              }}
              style={styles.pickBtn}
              contentStyle={styles.pickBtnContent}
            >
              {h.name}
              {h.city ? ` · ${h.city}` : ''}
            </Button>
          ))}
        </AppCard>

        {selectedHospitalId ? (
          <AppCard style={styles.section}>
            <Text variant="titleSmall" style={styles.sectionTitle}>
              {hospitalName || 'Selected hospital'}
            </Text>
            {profileLoading ? <ActivityIndicator /> : null}

            <Text style={styles.fieldLabel}>Branch</Text>
            {branchMenu.map((b) => (
              <Button
                key={b.id}
                mode={branchId === b.id ? 'contained' : 'outlined'}
                onPress={() => setBranchId(b.id)}
                style={styles.pickBtn}
                contentStyle={styles.pickBtnContent}
              >
                {b.label}
              </Button>
            ))}

            {doctors.length > 0 ? (
              <>
                <Text style={[styles.fieldLabel, styles.fieldGap]}>Doctor (optional)</Text>
                <Button
                  mode={!doctorId ? 'contained-tonal' : 'outlined'}
                  onPress={() => setDoctorId('')}
                  style={styles.pickBtn}
                >
                  Any available doctor
                </Button>
                {doctors.map((d) => (
                  <Button
                    key={d.doctorId}
                    mode={doctorId === d.doctorId ? 'contained' : 'outlined'}
                    onPress={() => setDoctorId(d.doctorId)}
                    style={styles.pickBtn}
                    contentStyle={styles.pickBtnContent}
                  >
                    {d.name}{d.specialization ? ` · ${d.specialization}` : ''}
                  </Button>
                ))}
              </>
            ) : null}

            <TextInput
              label="Visit reason (optional)"
              mode="outlined"
              multiline
              numberOfLines={3}
              value={visitReason}
              onChangeText={setVisitReason}
              style={styles.reasonInput}
            />
          </AppCard>
        ) : null}

        <Button
          mode="contained"
          onPress={submit}
          loading={registerRequest.isPending}
          disabled={!selectedHospitalId || !branchId}
          style={styles.submit}
        >
          Submit OPD request
        </Button>
      </ScrollView>

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack('')} duration={4000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: layout.screenPaddingBottom,
    gap: layout.sectionGap,
  },
  section: { gap: 10 },
  sectionTitle: { fontWeight: '600', color: appColors.textPrimary },
  loader: { marginVertical: 8 },
  hint: { color: appColors.textSecondary },
  pickBtn: { borderRadius: 12 },
  pickBtnContent: { justifyContent: 'flex-start' },
  fieldLabel: { fontWeight: '600', color: appColors.textSecondary, marginTop: 4 },
  fieldGap: { marginTop: 12 },
  reasonInput: { marginTop: 8 },
  submit: { borderRadius: 12, marginTop: 8 },
});
