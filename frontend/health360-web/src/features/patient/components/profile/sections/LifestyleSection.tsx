import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, MenuItem, Stack, TextField } from '@mui/material';
import { usePatientProfile, useUpdateLifestyle } from '../../../hooks/usePatientQueries';
import { lifestyleSchema, type LifestyleForm } from '../../../schemas/patient.schema';
import { normalizeLifestyleForm } from '../../../utils/profileEnumMapper';
import { SaveButton } from '../SaveButton';
import type { ProfileSectionCallbacks } from '../types';

const smokingOptions = ['NEVER', 'FORMER', 'CURRENT'];
const frequencyOptions = ['DAILY', 'WEEKLY', 'OCCASIONALLY', 'RARELY', 'NEVER'];
const alcoholOptions = ['NEVER', 'OCCASIONAL', 'MODERATE', 'HEAVY'];
const exerciseOptions = ['DAILY', 'WEEKLY', 'OCCASIONALLY', 'RARELY', 'NEVER'];
const occupationOptions = ['SEDENTARY', 'MODERATE', 'ACTIVE', 'VERY_ACTIVE'];
const dietOptions = ['VEGETARIAN', 'NON_VEGETARIAN', 'VEGAN', 'EGGETARIAN', 'OTHER'];

export function LifestyleSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = usePatientProfile();
  const updateMutation = useUpdateLifestyle();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<LifestyleForm>({
    resolver: zodResolver(lifestyleSchema),
    defaultValues: {
      smokingStatus: '',
      smokingFrequency: '',
      alcoholConsumption: '',
      exerciseFrequency: '',
      exerciseType: '',
      occupationType: '',
      dietaryPreference: '',
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!profile) return;
    reset(normalizeLifestyleForm(profile.lifestyle), { keepDirtyValues: true });
  }, [profile, reset]);

  const onSubmit = async (values: LifestyleForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(values);
      setSaved(true);
      onSaveSuccess('Lifestyle profile saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Unable to save lifestyle profile.');
      onSaveError('Unable to save lifestyle profile.');
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      <Controller name="smokingStatus" control={control} render={({ field }) => (
        <TextField {...field} select label="Smoking Status">
          <MenuItem value="">Select</MenuItem>
          {smokingOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="smokingFrequency" control={control} render={({ field }) => (
        <TextField {...field} select label="Smoking Frequency">
          <MenuItem value="">Select</MenuItem>
          {frequencyOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="alcoholConsumption" control={control} render={({ field }) => (
        <TextField {...field} select label="Alcohol Consumption">
          <MenuItem value="">Select</MenuItem>
          {alcoholOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="exerciseFrequency" control={control} render={({ field }) => (
        <TextField {...field} select label="Exercise Frequency">
          <MenuItem value="">Select</MenuItem>
          {exerciseOptions.map((o) => <MenuItem key={o} value={o}>{o}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="exerciseType" control={control} render={({ field }) => (
        <TextField {...field} label="Exercise Type" />
      )} />
      <Controller name="exerciseDurationMinutes" control={control} render={({ field }) => (
        <TextField {...field} label="Exercise Duration (minutes)" type="number" />
      )} />
      <Controller name="occupationType" control={control} render={({ field }) => (
        <TextField {...field} select label="Occupation Type">
          <MenuItem value="">Select</MenuItem>
          {occupationOptions.map((o) => <MenuItem key={o} value={o}>{o.replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="averageSleepHours" control={control} render={({ field }) => (
        <TextField {...field} label="Average Sleep (hours)" type="number" />
      )} />
      <Controller name="dietaryPreference" control={control} render={({ field }) => (
        <TextField {...field} select label="Dietary Preference">
          <MenuItem value="">Select</MenuItem>
          {dietOptions.map((o) => <MenuItem key={o} value={o}>{o.replace(/_/g, ' ')}</MenuItem>)}
        </TextField>
      )} />
      <Controller name="stressLevel" control={control} render={({ field }) => (
        <TextField {...field} label="Stress Level (1–5)" type="number" inputProps={{ min: 1, max: 5 }} />
      )} />
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} />
    </Stack>
  );
}
