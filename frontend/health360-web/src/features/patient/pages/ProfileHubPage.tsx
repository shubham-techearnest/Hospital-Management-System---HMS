import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Alert,
  Paper,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material';
import { AnimatedPage } from '../components/AnimatedPage';
import { ProfileAccordionSection } from '../components/profile/ProfileAccordionSection';
import { ProfileCompletionWidget } from '../components/ProfileCompletionWidget';
import { BasicInfoSection } from '../components/profile/sections/BasicInfoSection';
import { ContactInfoSection } from '../components/profile/sections/ContactInfoSection';
import { PhysicalMeasurementsSection } from '../components/profile/sections/PhysicalMeasurementsSection';
import { LifestyleSection } from '../components/profile/sections/LifestyleSection';
import { MedicalInfoSection } from '../components/profile/sections/MedicalInfoSection';
import { EmergencyContactsSection } from '../components/profile/sections/EmergencyContactsSection';
import { FamilyMembersSection } from '../components/profile/sections/FamilyMembersSection';
import { HealthGoalsSection } from '../components/profile/sections/HealthGoalsSection';
import { usePatientProfile, useProfileCompletion } from '../hooks/usePatientQueries';
import { PROFILE_SECTIONS, type ProfileSectionId } from '../utils/patientUtils';

const DEFAULT_EXPANDED: ProfileSectionId = 'basic-info';

export function ProfileHubPage() {
  const location = useLocation();
  const { isLoading: profileLoading } = usePatientProfile();
  const { data: completion, isLoading: completionLoading } = useProfileCompletion();

  const [expanded, setExpanded] = useState<Record<ProfileSectionId, boolean>>(() =>
    Object.fromEntries(PROFILE_SECTIONS.map((s) => [s.id, s.id === DEFAULT_EXPANDED])) as Record<ProfileSectionId, boolean>,
  );
  const [everOpened, setEverOpened] = useState<Record<ProfileSectionId, boolean>>(() =>
    Object.fromEntries(PROFILE_SECTIONS.map((s) => [s.id, s.id === DEFAULT_EXPANDED])) as Record<ProfileSectionId, boolean>,
  );
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const hashSection = useMemo(() => {
    const hash = location.hash.replace('#', '') as ProfileSectionId;
    return PROFILE_SECTIONS.some((s) => s.id === hash) ? hash : null;
  }, [location.hash]);

  useEffect(() => {
    if (!hashSection) return;
    setExpanded((prev) => ({ ...prev, [hashSection]: true }));
    setEverOpened((prev) => ({ ...prev, [hashSection]: true }));
    requestAnimationFrame(() => {
      document.getElementById(`section-${hashSection}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [hashSection]);

  const handleExpandedChange = useCallback((id: ProfileSectionId, isExpanded: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: isExpanded }));
    if (isExpanded) {
      setEverOpened((prev) => ({ ...prev, [id]: true }));
    }
  }, []);

  const onSaveSuccess = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'success' });
  }, []);

  const onSaveError = useCallback((message: string) => {
    setSnackbar({ open: true, message, severity: 'error' });
  }, []);

  const sectionCallbacks = useMemo(
    () => ({ onSaveSuccess, onSaveError }),
    [onSaveSuccess, onSaveError],
  );

  return (
    <AnimatedPage>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        My Health Profile
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Expand a section to view or update your information. Your completion score updates when you save.
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }} elevation={0} variant="outlined">
        {profileLoading && completionLoading ? (
          <Skeleton variant="rounded" height={180} aria-label="Loading profile completion" />
        ) : (
          <ProfileCompletionWidget completion={completion} loading={completionLoading} />
        )}
      </Paper>

      <Paper elevation={0} variant="outlined" sx={{ overflow: 'hidden' }}>
        <ProfileAccordionSection
          id="section-basic-info"
          title="Basic Information"
          expanded={expanded['basic-info']}
          onExpandedChange={(v) => handleExpandedChange('basic-info', v)}
        >
          {everOpened['basic-info'] && <BasicInfoSection {...sectionCallbacks} />}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-contact-info"
          title="Contact Information"
          expanded={expanded['contact-info']}
          onExpandedChange={(v) => handleExpandedChange('contact-info', v)}
        >
          {everOpened['contact-info'] && <ContactInfoSection {...sectionCallbacks} />}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-measurements"
          title="Physical Measurements"
          expanded={expanded['measurements']}
          onExpandedChange={(v) => handleExpandedChange('measurements', v)}
        >
          {everOpened['measurements'] && <PhysicalMeasurementsSection {...sectionCallbacks} />}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-medical"
          title="Medical Information"
          expanded={expanded['medical']}
          onExpandedChange={(v) => handleExpandedChange('medical', v)}
        >
          {everOpened['medical'] && (
            <MedicalInfoSection active={expanded['medical']} {...sectionCallbacks} />
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-lifestyle"
          title="Lifestyle"
          expanded={expanded['lifestyle']}
          onExpandedChange={(v) => handleExpandedChange('lifestyle', v)}
        >
          {everOpened['lifestyle'] && <LifestyleSection {...sectionCallbacks} />}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-emergency-contacts"
          title="Emergency Contacts"
          expanded={expanded['emergency-contacts']}
          onExpandedChange={(v) => handleExpandedChange('emergency-contacts', v)}
        >
          {everOpened['emergency-contacts'] && (
            <EmergencyContactsSection active={expanded['emergency-contacts']} {...sectionCallbacks} />
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-family-members"
          title="Family Members"
          expanded={expanded['family-members']}
          onExpandedChange={(v) => handleExpandedChange('family-members', v)}
        >
          {everOpened['family-members'] && (
            <FamilyMembersSection active={expanded['family-members']} {...sectionCallbacks} />
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-health-goals"
          title="Health Goals"
          expanded={expanded['health-goals']}
          onExpandedChange={(v) => handleExpandedChange('health-goals', v)}
        >
          {everOpened['health-goals'] && <HealthGoalsSection {...sectionCallbacks} />}
        </ProfileAccordionSection>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
