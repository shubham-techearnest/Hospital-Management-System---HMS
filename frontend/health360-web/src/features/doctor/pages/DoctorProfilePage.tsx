import { useCallback, useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import type { AxiosError } from 'axios';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { ProfileAccordionSection } from '@/features/patient/components/profile/ProfileAccordionSection';
import { SaveButton } from '@/features/patient/components/profile/SaveButton';
import {
  useCreateExperience,
  useCreateQualification,
  useCreateAward,
  useCreateMembership,
  useDeleteExperience,
  useDeleteQualification,
  useDeleteAward,
  useDeleteMembership,
  useDoctorProfile,
  useAwards,
  useMemberships,
  useSpecializations,
  useUpdateBiography,
  useUpdateConsultationDefaults,
  useUpdateProfessionalDetails,
  useUpdateSpecialization,
} from '../hooks/useDoctorQueries';
import { doctorProfileLockMessage, isDoctorProfileEditable } from '../utils/profileUtils';
import { getApiErrorMessage } from '@/shared/utils/apiError';

type SectionId = 'professional' | 'biography' | 'qualifications' | 'awards' | 'memberships' | 'experience' | 'specialization' | 'consultation';

export function DoctorProfilePage() {
  const { data: profile, isLoading, isError, error } = useDoctorProfile();
  const { data: specializations = [] } = useSpecializations();
  const { data: awards = [] } = useAwards();
  const { data: memberships = [] } = useMemberships();
  const updateProfessional = useUpdateProfessionalDetails();
  const updateBiography = useUpdateBiography();
  const createQualification = useCreateQualification();
  const deleteQualification = useDeleteQualification();
  const createAward = useCreateAward();
  const deleteAward = useDeleteAward();
  const createMembership = useCreateMembership();
  const deleteMembership = useDeleteMembership();
  const createExperience = useCreateExperience();
  const deleteExperience = useDeleteExperience();
  const updateSpecialization = useUpdateSpecialization();
  const updateConsultation = useUpdateConsultationDefaults();

  const [expanded, setExpanded] = useState<Record<SectionId, boolean>>({
    professional: true,
    biography: false,
    qualifications: false,
    awards: false,
    memberships: false,
    experience: false,
    specialization: false,
    consultation: false,
  });
  const [everOpened, setEverOpened] = useState<Record<SectionId, boolean>>({
    professional: true,
    biography: false,
    qualifications: false,
    awards: false,
    memberships: false,
    experience: false,
    specialization: false,
    consultation: false,
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [saved, setSaved] = useState(false);
  const [qualDialog, setQualDialog] = useState(false);
  const [awardDialog, setAwardDialog] = useState(false);
  const [membershipDialog, setMembershipDialog] = useState(false);
  const [expDialog, setExpDialog] = useState(false);
  const [biographyText, setBiographyText] = useState('');
  const [biographySaved, setBiographySaved] = useState(false);
  const [qualForm, setQualForm] = useState({ degree: '', institution: '', yearOfCompletion: new Date().getFullYear(), country: 'IN' });
  const [awardForm, setAwardForm] = useState({ title: '', organization: '', awardYear: new Date().getFullYear() });
  const [membershipForm, setMembershipForm] = useState({ organization: '', membershipId: '', memberSince: new Date().getFullYear() });
  const [expForm, setExpForm] = useState({ institution: '', position: '', startYear: new Date().getFullYear(), endYear: '' as number | '' });
  const [primarySpec, setPrimarySpec] = useState('');
  const [subSpecs, setSubSpecs] = useState<string[]>([]);
  const [inPersonFee, setInPersonFee] = useState('0');
  const [followUpFee, setFollowUpFee] = useState('0');
  const [duration, setDuration] = useState('15');

  const professionalForm = useForm({
    defaultValues: {
      title: 'DR',
      medicalRegistrationNumber: '',
      registrationCouncil: '',
      registrationYear: undefined as number | undefined,
      registrationExpiry: '',
      gender: '',
      totalYearsExperience: undefined as number | undefined,
    },
  });

  useEffect(() => {
    if (!profile) return;
    const p = profile.professionalDetails;
    professionalForm.reset({
      title: p.title ?? 'DR',
      medicalRegistrationNumber: p.medicalRegistrationNumber ?? '',
      registrationCouncil: p.registrationCouncil ?? '',
      registrationYear: p.registrationYear,
      registrationExpiry: p.registrationExpiry ?? '',
      gender: p.gender ?? '',
      totalYearsExperience: p.totalYearsExperience,
    }, { keepDirtyValues: true });

    setPrimarySpec(profile.specialization?.primarySpecializationId ?? '');
    setSubSpecs(profile.specialization?.subSpecializations?.map((s) => s.id) ?? []);

    const inPerson = profile.consultationDefaults.find((c) => c.consultationType === 'IN_PERSON');
    const followUp = profile.consultationDefaults.find((c) => c.consultationType === 'FOLLOW_UP');
    if (inPerson) setInPersonFee(String(inPerson.feeAmount));
    if (followUp) setFollowUpFee(String(followUp.feeAmount));
    if (inPerson?.durationMinutes) setDuration(String(inPerson.durationMinutes));
    setBiographyText(profile.professionalDetails.biography ?? '');
  }, [profile, professionalForm]);

  const handleExpand = useCallback((id: SectionId, open: boolean) => {
    setExpanded((prev) => ({ ...prev, [id]: open }));
    if (open) setEverOpened((prev) => ({ ...prev, [id]: true }));
  }, []);

  const notify = useCallback((message: string, severity: 'success' | 'error' = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const isProfileEditable = isDoctorProfileEditable(profile?.verificationStatus);
  const profileLockMessage = doctorProfileLockMessage(profile?.verificationStatus);

  const onSaveProfessional = professionalForm.handleSubmit(async (values) => {
    if (!isProfileEditable) {
      notify(profileLockMessage ?? 'Profile is locked for editing.', 'error');
      return;
    }
    setSaved(false);
    try {
      await updateProfessional.mutateAsync({
        ...values,
        registrationYear: values.registrationYear || undefined,
        totalYearsExperience: values.totalYearsExperience || undefined,
      });
      setSaved(true);
      notify('Professional details saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      notify(getApiErrorMessage(e, 'Unable to save professional details.'), 'error');
    }
  });

  const statusColor = useMemo(() => {
    switch (profile?.verificationStatus) {
      case 'VERIFIED': return 'success';
      case 'PENDING_VERIFICATION': return 'warning';
      case 'REJECTED': return 'error';
      default: return 'default';
    }
  }, [profile?.verificationStatus]);

  const authErrorMessage = useMemo(() => {
    if (!isError) return null;
    const status = (error as AxiosError)?.response?.status;
    if (status === 401) {
      return 'Your session has expired. Please sign in again as a doctor account.';
    }
    if (status === 403) {
      return 'Your account does not have permission to view the doctor profile. Sign in with a doctor account.';
    }
    return 'Unable to load your doctor profile. Please try again.';
  }, [isError, error]);

  if (isLoading) {
    return (
      <AnimatedPage>
        <Typography variant="body1" color="text.secondary">Loading profile…</Typography>
      </AnimatedPage>
    );
  }

  if (isError && authErrorMessage) {
    return (
      <AnimatedPage>
        <Alert severity="error" sx={{ mb: 2 }}>{authErrorMessage}</Alert>
        <Button component={RouterLink} to="/login" variant="contained">Sign in</Button>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage>
      <Box display="flex" alignItems="center" gap={2} mb={1}>
        <Typography variant="h4" fontWeight={700}>Professional Profile</Typography>
        {profile && (
          <Chip label={profile.verificationStatus.replace(/_/g, ' ')} color={statusColor} size="small" />
        )}
      </Box>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Complete your profile in draft status. It will not appear in public search until verified.
      </Typography>
      {profileLockMessage && (
        <Alert severity="info" sx={{ mb: 3 }}>{profileLockMessage}</Alert>
      )}

      <Paper elevation={0} variant="outlined" sx={{ overflow: 'hidden' }}>
        <ProfileAccordionSection
          id="section-professional"
          title="Professional Details"
          expanded={expanded.professional}
          onExpandedChange={(v) => handleExpand('professional', v)}
        >
          {everOpened.professional && (
            <Stack component="form" spacing={2} onSubmit={onSaveProfessional}>
              <Controller name="title" control={professionalForm.control} render={({ field }) => (
                <TextField {...field} select label="Title" disabled={!isProfileEditable}>
                  {['DR', 'PROF', 'MR', 'MS'].map((t) => <MenuItem key={t} value={t}>{t}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="medicalRegistrationNumber" control={professionalForm.control} render={({ field }) => (
                <TextField {...field} label="Medical Registration Number" disabled={!isProfileEditable} />
              )} />
              <Controller name="registrationCouncil" control={professionalForm.control} render={({ field }) => (
                <TextField {...field} label="Registration Council" disabled={!isProfileEditable} />
              )} />
              <Controller name="registrationYear" control={professionalForm.control} render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Registration Year"
                  type="number"
                  disabled={!isProfileEditable}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                />
              )} />
              <Controller name="registrationExpiry" control={professionalForm.control} render={({ field }) => (
                <TextField {...field} label="Registration Expiry" type="date" InputLabelProps={{ shrink: true }} disabled={!isProfileEditable} />
              )} />
              <Controller name="gender" control={professionalForm.control} render={({ field }) => (
                <TextField {...field} select label="Gender" disabled={!isProfileEditable}>
                  <MenuItem value="">Select</MenuItem>
                  {['MALE', 'FEMALE', 'OTHER'].map((g) => <MenuItem key={g} value={g}>{g}</MenuItem>)}
                </TextField>
              )} />
              <Controller name="totalYearsExperience" control={professionalForm.control} render={({ field }) => (
                <TextField
                  {...field}
                  value={field.value ?? ''}
                  label="Total Years of Experience"
                  type="number"
                  disabled={!isProfileEditable}
                  onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
                />
              )} />
              <SaveButton saving={updateProfessional.isPending} saved={saved} disabled={!isProfileEditable} />
            </Stack>
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-biography"
          title="Biography"
          expanded={expanded.biography}
          onExpandedChange={(v) => handleExpand('biography', v)}
        >
          {everOpened.biography && (
            <Stack spacing={2}>
              <TextField
                label="Professional biography"
                multiline
                minRows={4}
                value={biographyText}
                onChange={(e) => setBiographyText(e.target.value)}
                helperText="Describe your practice, expertise, and approach to patient care."
              />
              <Button
                variant="contained"
                disabled={updateBiography.isPending}
                onClick={async () => {
                  setBiographySaved(false);
                  try {
                    await updateBiography.mutateAsync(biographyText);
                    setBiographySaved(true);
                    notify('Biography saved.');
                    setTimeout(() => setBiographySaved(false), 2000);
                  } catch {
                    notify('Unable to save biography.', 'error');
                  }
                }}
              >
                {updateBiography.isPending ? 'Saving…' : biographySaved ? 'Saved' : 'Save'}
              </Button>
            </Stack>
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-qualifications"
          title="Qualifications"
          expanded={expanded.qualifications}
          onExpandedChange={(v) => handleExpand('qualifications', v)}
        >
          {everOpened.qualifications && (
            <>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setQualDialog(true)} sx={{ mb: 2 }}>
                Add Qualification
              </Button>
              <List disablePadding>
                {(profile?.qualifications ?? []).map((q) => (
                  <ListItem key={q.id} divider secondaryAction={
                    <IconButton edge="end" onClick={async () => {
                      try {
                        await deleteQualification.mutateAsync(q.id);
                        notify('Qualification removed.');
                      } catch { notify('Unable to delete qualification.', 'error'); }
                    }}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText primary={q.degree} secondary={`${q.institution} · ${q.yearOfCompletion}`} />
                  </ListItem>
                ))}
                {(profile?.qualifications ?? []).length === 0 && (
                  <ListItem><ListItemText primary="No qualifications added yet." /></ListItem>
                )}
              </List>
            </>
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-awards"
          title="Awards"
          expanded={expanded.awards}
          onExpandedChange={(v) => handleExpand('awards', v)}
        >
          {everOpened.awards && (
            <>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setAwardDialog(true)} sx={{ mb: 2 }}>
                Add Award
              </Button>
              <List disablePadding>
                {awards.map((a) => (
                  <ListItem key={a.id} divider secondaryAction={
                    <IconButton edge="end" onClick={async () => {
                      try {
                        await deleteAward.mutateAsync(a.id);
                        notify('Award removed.');
                      } catch { notify('Unable to delete award.', 'error'); }
                    }}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText
                      primary={a.title}
                      secondary={[a.organization, a.awardYear].filter(Boolean).join(' · ')}
                    />
                  </ListItem>
                ))}
                {awards.length === 0 && (
                  <ListItem><ListItemText primary="No awards added yet." /></ListItem>
                )}
              </List>
            </>
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-memberships"
          title="Memberships"
          expanded={expanded.memberships}
          onExpandedChange={(v) => handleExpand('memberships', v)}
        >
          {everOpened.memberships && (
            <>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setMembershipDialog(true)} sx={{ mb: 2 }}>
                Add Membership
              </Button>
              <List disablePadding>
                {memberships.map((m) => (
                  <ListItem key={m.id} divider secondaryAction={
                    <IconButton edge="end" onClick={async () => {
                      try {
                        await deleteMembership.mutateAsync(m.id);
                        notify('Membership removed.');
                      } catch { notify('Unable to delete membership.', 'error'); }
                    }}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText
                      primary={m.organization}
                      secondary={[m.membershipId, m.memberSince].filter(Boolean).join(' · ')}
                    />
                  </ListItem>
                ))}
                {memberships.length === 0 && (
                  <ListItem><ListItemText primary="No memberships added yet." /></ListItem>
                )}
              </List>
            </>
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-experience"
          title="Experience"
          expanded={expanded.experience}
          onExpandedChange={(v) => handleExpand('experience', v)}
        >
          {everOpened.experience && (
            <>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={() => setExpDialog(true)} sx={{ mb: 2 }}>
                Add Experience
              </Button>
              <List disablePadding>
                {(profile?.experience ?? []).map((e) => (
                  <ListItem key={e.id} divider secondaryAction={
                    <IconButton edge="end" onClick={async () => {
                      try {
                        await deleteExperience.mutateAsync(e.id);
                        notify('Experience entry removed.');
                      } catch { notify('Unable to delete experience.', 'error'); }
                    }}><DeleteIcon /></IconButton>
                  }>
                    <ListItemText
                      primary={`${e.position} at ${e.institution}`}
                      secondary={`${e.startYear}${e.endYear ? ` – ${e.endYear}` : ' – Present'}`}
                    />
                  </ListItem>
                ))}
                {(profile?.experience ?? []).length === 0 && (
                  <ListItem><ListItemText primary="No experience entries yet." /></ListItem>
                )}
              </List>
            </>
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-specialization"
          title="Specialization"
          expanded={expanded.specialization}
          onExpandedChange={(v) => handleExpand('specialization', v)}
        >
          {everOpened.specialization && (
            <Stack spacing={2}>
              <TextField select label="Primary Specialization" value={primarySpec} onChange={(e) => setPrimarySpec(e.target.value)} fullWidth>
                <MenuItem value="">Select</MenuItem>
                {specializations.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
              </TextField>
              <TextField
                select
                label="Secondary Specializations"
                value={subSpecs}
                onChange={(e) => setSubSpecs(typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value)}
                SelectProps={{ multiple: true }}
                fullWidth
              >
                {specializations.filter((s) => s.id !== primarySpec).map((s) => (
                  <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                ))}
              </TextField>
              <Button variant="contained" disabled={!primarySpec || updateSpecialization.isPending} onClick={async () => {
                try {
                  await updateSpecialization.mutateAsync({ primarySpecializationId: primarySpec, subSpecializationIds: subSpecs });
                  notify('Specialization saved.');
                } catch { notify('Unable to save specialization.', 'error'); }
              }}>
                {updateSpecialization.isPending ? 'Saving…' : 'Save'}
              </Button>
            </Stack>
          )}
        </ProfileAccordionSection>

        <ProfileAccordionSection
          id="section-consultation"
          title="Consultation Fees"
          expanded={expanded.consultation}
          onExpandedChange={(v) => handleExpand('consultation', v)}
        >
          {everOpened.consultation && (
            <Stack spacing={2}>
              <TextField label="In-Person Fee (INR)" type="number" value={inPersonFee} onChange={(e) => setInPersonFee(e.target.value)} helperText="Enter 0 for Free Consultation" />
              <TextField label="Follow-Up Fee (INR)" type="number" value={followUpFee} onChange={(e) => setFollowUpFee(e.target.value)} />
              <TextField label="Duration (minutes)" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
              <Button variant="contained" disabled={updateConsultation.isPending} onClick={async () => {
                try {
                  await updateConsultation.mutateAsync([
                    { consultationType: 'IN_PERSON', feeAmount: Number(inPersonFee), currency: 'INR', durationMinutes: Number(duration) },
                    { consultationType: 'FOLLOW_UP', feeAmount: Number(followUpFee), currency: 'INR', durationMinutes: Number(duration) },
                  ]);
                  notify('Consultation fees saved.');
                } catch { notify('Unable to save consultation fees.', 'error'); }
              }}>
                {updateConsultation.isPending ? 'Saving…' : 'Save'}
              </Button>
            </Stack>
          )}
        </ProfileAccordionSection>
      </Paper>

      <Dialog open={qualDialog} onClose={() => setQualDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Qualification</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Degree" value={qualForm.degree} onChange={(e) => setQualForm({ ...qualForm, degree: e.target.value })} />
            <TextField label="Institution" value={qualForm.institution} onChange={(e) => setQualForm({ ...qualForm, institution: e.target.value })} />
            <TextField label="Year" type="number" value={qualForm.yearOfCompletion} onChange={(e) => setQualForm({ ...qualForm, yearOfCompletion: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQualDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={!qualForm.degree || !qualForm.institution} onClick={async () => {
            try {
              await createQualification.mutateAsync(qualForm);
              setQualDialog(false);
              setQualForm({ degree: '', institution: '', yearOfCompletion: new Date().getFullYear(), country: 'IN' });
              notify('Qualification added.');
            } catch { notify('Unable to add qualification.', 'error'); }
          }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={expDialog} onClose={() => setExpDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Experience</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Institution" value={expForm.institution} onChange={(e) => setExpForm({ ...expForm, institution: e.target.value })} />
            <TextField label="Position" value={expForm.position} onChange={(e) => setExpForm({ ...expForm, position: e.target.value })} />
            <TextField label="Start Year" type="number" value={expForm.startYear} onChange={(e) => setExpForm({ ...expForm, startYear: Number(e.target.value) })} />
            <TextField label="End Year (leave empty if current)" type="number" value={expForm.endYear} onChange={(e) => setExpForm({ ...expForm, endYear: e.target.value ? Number(e.target.value) : '' })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExpDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={!expForm.institution || !expForm.position} onClick={async () => {
            try {
              await createExperience.mutateAsync({
                institution: expForm.institution,
                position: expForm.position,
                startYear: expForm.startYear,
                endYear: expForm.endYear === '' ? undefined : expForm.endYear,
              });
              setExpDialog(false);
              setExpForm({ institution: '', position: '', startYear: new Date().getFullYear(), endYear: '' });
              notify('Experience added.');
            } catch { notify('Unable to add experience.', 'error'); }
          }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={awardDialog} onClose={() => setAwardDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Award</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Title" value={awardForm.title} onChange={(e) => setAwardForm({ ...awardForm, title: e.target.value })} />
            <TextField label="Organization" value={awardForm.organization} onChange={(e) => setAwardForm({ ...awardForm, organization: e.target.value })} />
            <TextField label="Year" type="number" value={awardForm.awardYear} onChange={(e) => setAwardForm({ ...awardForm, awardYear: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAwardDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={!awardForm.title} onClick={async () => {
            try {
              await createAward.mutateAsync(awardForm);
              setAwardDialog(false);
              setAwardForm({ title: '', organization: '', awardYear: new Date().getFullYear() });
              notify('Award added.');
            } catch { notify('Unable to add award.', 'error'); }
          }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={membershipDialog} onClose={() => setMembershipDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Membership</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField label="Organization" value={membershipForm.organization} onChange={(e) => setMembershipForm({ ...membershipForm, organization: e.target.value })} />
            <TextField label="Membership ID" value={membershipForm.membershipId} onChange={(e) => setMembershipForm({ ...membershipForm, membershipId: e.target.value })} />
            <TextField label="Member since (year)" type="number" value={membershipForm.memberSince} onChange={(e) => setMembershipForm({ ...membershipForm, memberSince: Number(e.target.value) })} />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMembershipDialog(false)}>Cancel</Button>
          <Button variant="contained" disabled={!membershipForm.organization} onClick={async () => {
            try {
              await createMembership.mutateAsync(membershipForm);
              setMembershipDialog(false);
              setMembershipForm({ organization: '', membershipId: '', memberSince: new Date().getFullYear() });
              notify('Membership added.');
            } catch { notify('Unable to add membership.', 'error'); }
          }}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar((s) => ({ ...s, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AnimatedPage>
  );
}
