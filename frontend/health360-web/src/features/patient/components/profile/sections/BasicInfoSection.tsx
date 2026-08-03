import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, MenuItem, Stack, TextField } from '@mui/material';
import { usePatientProfile, useUpdateBasicInfo } from '../../../hooks/usePatientQueries';
import { basicInfoSchema, type BasicInfoForm } from '../../../schemas/patient.schema';
import { SaveButton } from '../SaveButton';
import type { ProfileSectionCallbacks } from '../types';

const genderOptions = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];
const bloodGroups = ['A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE'];
const maritalStatuses = ['SINGLE', 'MARRIED', 'DIVORCED', 'WIDOWED'];

export function BasicInfoSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = usePatientProfile();
  const updateMutation = useUpdateBasicInfo();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: { dateOfBirth: '', gender: '', bloodGroup: '', maritalStatus: '', nationality: 'IN', profilePhotoUrl: '' },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      dateOfBirth: profile.basicInfo?.dateOfBirth ?? '',
      gender: profile.basicInfo?.gender ?? '',
      bloodGroup: profile.basicInfo?.bloodGroup ?? '',
      maritalStatus: profile.basicInfo?.maritalStatus ?? '',
      nationality: profile.basicInfo?.nationality ?? 'IN',
      profilePhotoUrl: profile.basicInfo?.profilePhotoUrl ?? '',
    }, { keepDirtyValues: true });
  }, [profile, reset]);

  const onSubmit = async (values: BasicInfoForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(values);
      setSaved(true);
      onSaveSuccess('Basic information saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Unable to save basic information.');
      onSaveError('Unable to save basic information.');
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      <Controller name="dateOfBirth" control={control} render={({ field }) => (
        <TextField {...field} label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} error={!!errors.dateOfBirth} helperText={errors.dateOfBirth?.message} />
      )} />
      <Controller name="gender" control={control} render={({ field }) => (
        <TextField {...field} select label="Gender" error={!!errors.gender}>
          <MenuItem value="">Select</MenuItem>
          {genderOptions.map((g) => <MenuItem key={g} value={g}>{g.replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="bloodGroup" control={control} render={({ field }) => (
        <TextField {...field} select label="Blood Group">
          <MenuItem value="">Select</MenuItem>
          {bloodGroups.map((g) => <MenuItem key={g} value={g}>{g.replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="maritalStatus" control={control} render={({ field }) => (
        <TextField {...field} select label="Marital Status">
          <MenuItem value="">Select</MenuItem>
          {maritalStatuses.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="nationality" control={control} render={({ field }) => (
        <TextField {...field} label="Nationality (ISO code)" inputProps={{ maxLength: 2 }} />
      )} />
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} />
    </Stack>
  );
}
