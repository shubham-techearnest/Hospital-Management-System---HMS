import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { Button, Chip, List, Snackbar, Text } from 'react-native-paper';
import { ProfileAccordionSection } from '@/features/patient/components/profile/ProfileAccordionSection';
import { ConsultationFeesSection } from '@/features/doctor/components/profile/sections/ConsultationFeesSection';
import { ExperienceSection } from '@/features/doctor/components/profile/sections/ExperienceSection';
import { ProfessionalDetailsSection } from '@/features/doctor/components/profile/sections/ProfessionalDetailsSection';
import { QualificationsSection } from '@/features/doctor/components/profile/sections/QualificationsSection';
import { SpecializationSection } from '@/features/doctor/components/profile/sections/SpecializationSection';
import type { DoctorSectionId } from '@/features/doctor/components/profile/types';
import { useDoctorProfile } from '@/features/doctor/hooks/useDoctorQueries';
import type { DoctorTabParamList } from '@/navigation/types';

function verificationChipStyle(status?: string) {
  switch (status) {
    case 'VERIFIED':
      return { backgroundColor: '#e8f5e9' };
    case 'PENDING_VERIFICATION':
      return { backgroundColor: '#fff8e1' };
    case 'REJECTED':
      return { backgroundColor: '#ffebee' };
    default:
      return undefined;
  }
}

function formatVerificationStatus(status: string) {
  return status.replace(/_/g, ' ');
}

export function DoctorProfileScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<DoctorTabParamList>>();
  const { data: profile, isLoading, isError } = useDoctorProfile();

  const [expanded, setExpanded] = useState<Record<DoctorSectionId, boolean>>({
    professional: true,
    qualifications: false,
    experience: false,
    specialization: false,
    consultation: false,
  });
  const [everOpened, setEverOpened] = useState<Record<DoctorSectionId, boolean>>({
    professional: true,
    qualifications: false,
    experience: false,
    specialization: false,
    consultation: false,
  });
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; isError: boolean }>({
    visible: false,
    message: '',
    isError: false,
  });

  const handleExpandedChange = useCallback((id: DoctorSectionId, isExpanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));
    if (isExpanded) {
      setEverOpened((prev) => ({ ...prev, [id]: true }));
    }
  }, []);

  const onSaveSuccess = useCallback((message: string) => {
    setSnackbar({ visible: true, message, isError: false });
  }, []);

  const onSaveError = useCallback((message: string) => {
    setSnackbar({ visible: true, message, isError: true });
  }, []);

  const sectionCallbacks = useMemo(
    () => ({ onSaveSuccess, onSaveError }),
    [onSaveSuccess, onSaveError],
  );

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Unable to load doctor profile.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text variant="headlineSmall" style={styles.title}>Professional Profile</Text>
          {profile ? (
            <Chip compact style={verificationChipStyle(profile.verificationStatus)}>
              {formatVerificationStatus(profile.verificationStatus)}
            </Chip>
          ) : null}
        </View>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Complete your profile in draft status. It will not appear in public search until verified.
        </Text>

        {profile && (profile.verificationStatus === 'DRAFT' || profile.verificationStatus === 'REJECTED') ? (
          <Button
            mode="contained-tonal"
            icon="file-certificate"
            onPress={() => navigation.navigate('Verification')}
            style={styles.verificationCta}
          >
            Go to Verification
          </Button>
        ) : null}

        <List.Section style={styles.accordion}>
          <ProfileAccordionSection
            title="Professional Details"
            expanded={expanded.professional}
            onExpandedChange={(v) => handleExpandedChange('professional', v)}
          >
            {everOpened.professional && <ProfessionalDetailsSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Qualifications"
            expanded={expanded.qualifications}
            onExpandedChange={(v) => handleExpandedChange('qualifications', v)}
          >
            {everOpened.qualifications && <QualificationsSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Experience"
            expanded={expanded.experience}
            onExpandedChange={(v) => handleExpandedChange('experience', v)}
          >
            {everOpened.experience && <ExperienceSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Specialization"
            expanded={expanded.specialization}
            onExpandedChange={(v) => handleExpandedChange('specialization', v)}
          >
            {everOpened.specialization && <SpecializationSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Consultation Fees"
            expanded={expanded.consultation}
            onExpandedChange={(v) => handleExpandedChange('consultation', v)}
          >
            {everOpened.consultation && <ConsultationFeesSection {...sectionCallbacks} />}
          </ProfileAccordionSection>
        </List.Section>
      </ScrollView>

      <Snackbar
        visible={snackbar.visible}
        onDismiss={() => setSnackbar((s) => ({ ...s, visible: false }))}
        duration={4000}
        style={snackbar.isError ? styles.snackbarError : undefined}
      >
        {snackbar.message}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 32 },
  loader: { flex: 1, marginTop: 48 },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { color: '#b00020' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingTop: 16, flexWrap: 'wrap' },
  title: { fontWeight: '700' },
  subtitle: { opacity: 0.7, paddingHorizontal: 16, marginBottom: 12 },
  verificationCta: { marginHorizontal: 16, marginBottom: 12 },
  accordion: { backgroundColor: '#fff', marginHorizontal: 8 },
  snackbarError: { backgroundColor: '#b00020' },
});
