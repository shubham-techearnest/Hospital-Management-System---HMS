import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveButton } from '@/features/patient/components/profile/SaveButton';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import { usePatientProfile, useUpdatePhysicalMeasurements } from '@/features/patient/hooks/usePatientQueries';
import { physicalMeasurementsSchema, type PhysicalMeasurementsForm } from '@/features/patient/schemas/patient.schema';
import { getApiErrorMessage } from '@/shared/utils/helpers';

function toLocalDateTimeInput(iso?: string): string {
  if (!iso) return new Date().toISOString().slice(0, 16);
  return iso.slice(0, 16);
}

export function PhysicalMeasurementsSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = usePatientProfile();
  const updateMutation = useUpdatePhysicalMeasurements();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PhysicalMeasurementsForm>({
    resolver: zodResolver(physicalMeasurementsSchema),
    defaultValues: { measuredAt: new Date().toISOString().slice(0, 16) },
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
      measuredAt: toLocalDateTimeInput(m?.measuredAt),
    });
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
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Unable to save measurements.');
      setError(msg);
      onSaveError(msg);
    }
  };

  const numberField = (name: keyof PhysicalMeasurementsForm, label: string) => (
    <Controller
      key={name}
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          label={label}
          mode="outlined"
          keyboardType="decimal-pad"
          value={value?.toString() ?? ''}
          onBlur={onBlur}
          onChangeText={(text) => onChange(text === '' ? undefined : Number(text))}
        />
      )}
    />
  );

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {numberField('heightCm', 'Height (cm)')}
      {numberField('weightKg', 'Weight (kg)')}
      {numberField('waistCm', 'Waist (cm)')}
      {numberField('hipCm', 'Hip (cm)')}
      {numberField('neckCm', 'Neck (cm)')}
      {numberField('bodyFatPercent', 'Body fat (%)')}
      <Controller control={control} name="measuredAt" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Measured at (YYYY-MM-DDTHH:mm)" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} error={!!errors.measuredAt} />
      )} />
      <HelperText type="error" visible={!!errors.measuredAt}>{errors.measuredAt?.message}</HelperText>
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  error: { color: '#b00020' },
});
