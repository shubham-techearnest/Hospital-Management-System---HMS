import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, Stack, TextField } from '@mui/material';
import { usePatientProfile, useUpdatePhysicalMeasurements } from '../../../hooks/usePatientQueries';
import { physicalMeasurementsSchema, type PhysicalMeasurementsForm } from '../../../schemas/patient.schema';
import { SaveButton } from '../SaveButton';
import type { ProfileSectionCallbacks } from '../types';

export function PhysicalMeasurementsSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = usePatientProfile();
  const updateMutation = useUpdatePhysicalMeasurements();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PhysicalMeasurementsForm>({
    resolver: zodResolver(physicalMeasurementsSchema),
    defaultValues: {
      heightCm: undefined,
      weightKg: undefined,
      waistCm: undefined,
      hipCm: undefined,
      neckCm: undefined,
      bodyFatPercent: undefined,
      measuredAt: new Date().toISOString().slice(0, 16),
    },
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!profile) return;
    const m = profile.physicalMeasurements;
    reset({
      heightCm: m?.heightCm,
      weightKg: m?.weightKg,
      waistCm: m?.waistCm,
      hipCm: m?.hipCm,
      neckCm: m?.neckCm,
      bodyFatPercent: m?.bodyFatPercent,
      measuredAt: m?.measuredAt
        ? new Date(m.measuredAt).toISOString().slice(0, 16)
        : new Date().toISOString().slice(0, 16),
    }, { keepDirtyValues: true });
  }, [profile, reset]);

  const onSubmit = async (values: PhysicalMeasurementsForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync({
        ...values,
        measuredAt: new Date(values.measuredAt).toISOString(),
      });
      setSaved(true);
      onSaveSuccess('Physical measurements saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Unable to save measurements.');
      onSaveError('Unable to save measurements.');
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      <Controller name="heightCm" control={control} render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          label="Height (cm)"
          type="number"
          error={!!errors.heightCm}
          helperText={errors.heightCm?.message}
        />
      )} />
      <Controller name="weightKg" control={control} render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          label="Weight (kg)"
          type="number"
          error={!!errors.weightKg}
          helperText={errors.weightKg?.message}
        />
      )} />
      <Controller name="waistCm" control={control} render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          label="Waist (cm)"
          type="number"
        />
      )} />
      <Controller name="hipCm" control={control} render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          label="Hip (cm)"
          type="number"
        />
      )} />
      <Controller name="neckCm" control={control} render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          label="Neck (cm)"
          type="number"
        />
      )} />
      <Controller name="bodyFatPercent" control={control} render={({ field }) => (
        <TextField
          {...field}
          value={field.value ?? ''}
          onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          label="Body Fat (%)"
          type="number"
        />
      )} />
      <Controller name="measuredAt" control={control} render={({ field }) => (
        <TextField {...field} label="Measured At" type="datetime-local" InputLabelProps={{ shrink: true }} error={!!errors.measuredAt} />
      )} />
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} />
    </Stack>
  );
}
