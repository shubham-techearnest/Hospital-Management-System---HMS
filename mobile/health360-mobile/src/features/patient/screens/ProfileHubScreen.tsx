import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { List, Snackbar, Text } from 'react-native-paper';
import { useRoute, type RouteProp } from '@react-navigation/native';
import type { PatientTabParamList } from '@/navigation/types';
import { ProfileAccordionSection } from '@/features/patient/components/profile/ProfileAccordionSection';
import { BasicInfoSection } from '@/features/patient/components/profile/sections/BasicInfoSection';
import { ContactInfoSection } from '@/features/patient/components/profile/sections/ContactInfoSection';
import { EmergencyContactsSection } from '@/features/patient/components/profile/sections/EmergencyContactsSection';
import { FamilyMembersSection } from '@/features/patient/components/profile/sections/FamilyMembersSection';
import { HealthGoalsSection } from '@/features/patient/components/profile/sections/HealthGoalsSection';
import { LifestyleSection } from '@/features/patient/components/profile/sections/LifestyleSection';
import { MedicalInfoSection } from '@/features/patient/components/profile/sections/MedicalInfoSection';
import { PhysicalMeasurementsSection } from '@/features/patient/components/profile/sections/PhysicalMeasurementsSection';
import { ProfileCompletionWidget } from '@/features/patient/components/ProfileCompletionWidget';
import { usePatientProfile, useProfileCompletionEnabled } from '@/features/patient/hooks/usePatientQueries';
import { PROFILE_SECTIONS, type ProfileSectionId } from '@/features/patient/utils/patientUtils';

const DEFAULT_EXPANDED: ProfileSectionId = 'basic-info';

export function ProfileHubScreen() {
  const route = useRoute<RouteProp<PatientTabParamList, 'Profile'>>();
  const scrollRef = useRef<ScrollView>(null);
  const { isLoading: profileLoading } = usePatientProfile();
  const { data: completion, isLoading: completionLoading } = useProfileCompletionEnabled(true);

  const [expanded, setExpanded] = useState<Record<ProfileSectionId, boolean>>(() =>
    Object.fromEntries(PROFILE_SECTIONS.map((s) => [s.id, s.id === DEFAULT_EXPANDED])) as Record<
      ProfileSectionId,
      boolean
    >,
  );
  const [everOpened, setEverOpened] = useState<Record<ProfileSectionId, boolean>>(() =>
    Object.fromEntries(PROFILE_SECTIONS.map((s) => [s.id, s.id === DEFAULT_EXPANDED])) as Record<
      ProfileSectionId,
      boolean
    >,
  );
  const [snackbar, setSnackbar] = useState<{ visible: boolean; message: string; isError: boolean }>({
    visible: false,
    message: '',
    isError: false,
  });

  const handleExpandedChange = useCallback((id: ProfileSectionId, isExpanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));
    if (isExpanded) {
      setEverOpened((prev) => ({ ...prev, [id]: true }));
    }
  }, []);

  const focusSection = useCallback((sectionId: ProfileSectionId) => {
    setExpanded((prev) => ({ ...prev, [sectionId]: true }));
    setEverOpened((prev) => ({ ...prev, [sectionId]: true }));
  }, []);

  useEffect(() => {
    const section = route.params?.focusSection;
    if (section) {
      focusSection(section);
    }
  }, [route.params?.focusSection, focusSection]);

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

  const handleCompletionSectionPress = useCallback(
    (sectionId: ProfileSectionId) => {
      focusSection(sectionId);
    },
    [focusSection],
  );

  return (
    <>
      <ScrollView ref={scrollRef} contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>My Health Profile</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Expand a section to view or update your information. Your completion score updates when you save.
        </Text>

        <View style={styles.completionCard}>
          <ProfileCompletionWidget
            completion={completion}
            loading={profileLoading && completionLoading}
            onSectionPress={(id) => handleCompletionSectionPress(id)}
          />
        </View>

        <List.Section style={styles.accordion}>
          <ProfileAccordionSection
            title="Basic Information"
            expanded={expanded['basic-info']}
            onExpandedChange={(v) => handleExpandedChange('basic-info', v)}
          >
            {everOpened['basic-info'] && <BasicInfoSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Contact Information"
            expanded={expanded['contact-info']}
            onExpandedChange={(v) => handleExpandedChange('contact-info', v)}
          >
            {everOpened['contact-info'] && <ContactInfoSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Physical Measurements"
            expanded={expanded.measurements}
            onExpandedChange={(v) => handleExpandedChange('measurements', v)}
          >
            {everOpened.measurements && <PhysicalMeasurementsSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Medical Information"
            expanded={expanded.medical}
            onExpandedChange={(v) => handleExpandedChange('medical', v)}
          >
            {everOpened.medical && (
              <MedicalInfoSection active={expanded.medical} {...sectionCallbacks} />
            )}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Lifestyle"
            expanded={expanded.lifestyle}
            onExpandedChange={(v) => handleExpandedChange('lifestyle', v)}
          >
            {everOpened.lifestyle && <LifestyleSection {...sectionCallbacks} />}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Emergency Contacts"
            expanded={expanded['emergency-contacts']}
            onExpandedChange={(v) => handleExpandedChange('emergency-contacts', v)}
          >
            {everOpened['emergency-contacts'] && (
              <EmergencyContactsSection active={expanded['emergency-contacts']} {...sectionCallbacks} />
            )}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Family Members"
            expanded={expanded['family-members']}
            onExpandedChange={(v) => handleExpandedChange('family-members', v)}
          >
            {everOpened['family-members'] && (
              <FamilyMembersSection active={expanded['family-members']} {...sectionCallbacks} />
            )}
          </ProfileAccordionSection>

          <ProfileAccordionSection
            title="Health Goals"
            expanded={expanded['health-goals']}
            onExpandedChange={(v) => handleExpandedChange('health-goals', v)}
          >
            {everOpened['health-goals'] && <HealthGoalsSection {...sectionCallbacks} />}
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
  title: { fontWeight: '700', paddingHorizontal: 16, paddingTop: 16 },
  subtitle: { opacity: 0.7, paddingHorizontal: 16, marginBottom: 12 },
  completionCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  accordion: { backgroundColor: '#fff', marginHorizontal: 8 },
  snackbarError: { backgroundColor: '#b00020' },
});
