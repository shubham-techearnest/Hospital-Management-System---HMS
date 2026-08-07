import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField } from '@/features/patient/components/SelectField';
import { SaveButton } from '@/features/patient/components/profile/SaveButton';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import {
  ALCOHOL_OPTIONS,
  DIET_OPTIONS,
  FREQUENCY_OPTIONS,
  OCCUPATION_OPTIONS,
  SMOKING_OPTIONS,
} from '@/features/patient/constants/enums';
import { usePatientProfile, useUpdateLifestyle } from '@/features/patient/hooks/usePatientQueries';
import { lifestyleSchema, type LifestyleForm } from '@/features/patient/schemas/patient.schema';
import { normalizeLifestyleForm } from '@/features/patient/utils/profileEnumMapper';
import { getApiErrorMessage } from '@/shared/utils/helpers';

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
  });

  useEffect(() => {
    if (!profile) return;
    reset(normalizeLifestyleForm(profile.lifestyle));
  }, [profile, reset]);

  const onSubmit = async (values: LifestyleForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(values);
      setSaved(true);
      onSaveSuccess('Lifestyle profile saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Unable to save lifestyle profile.');
      setError(msg);
      onSaveError(msg);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Controller control={control} name="smokingStatus" render={({ field: { onChange, value } }) => (
        <SelectField label="Smoking Status" value={value} options={SMOKING_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="smokingFrequency" render={({ field: { onChange, value } }) => (
        <SelectField label="Smoking Frequency" value={value} options={FREQUENCY_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="alcoholConsumption" render={({ field: { onChange, value } }) => (
        <SelectField label="Alcohol Consumption" value={value} options={ALCOHOL_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="exerciseFrequency" render={({ field: { onChange, value } }) => (
        <SelectField label="Exercise Frequency" value={value} options={FREQUENCY_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="exerciseType" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Exercise Type" mode="outlined" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} />
      )} />
      <Controller control={control} name="exerciseDurationMinutes" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Exercise Duration (min)" mode="outlined" keyboardType="number-pad" value={value?.toString() ?? ''} onBlur={onBlur} onChangeText={(t) => onChange(t === '' ? undefined : Number(t))} />
      )} />
      <Controller control={control} name="occupationType" render={({ field: { onChange, value } }) => (
        <SelectField label="Occupation Type" value={value} options={OCCUPATION_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="averageSleepHours" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Average Sleep (hours)" mode="outlined" keyboardType="decimal-pad" value={value?.toString() ?? ''} onBlur={onBlur} onChangeText={(t) => onChange(t === '' ? undefined : Number(t))} />
      )} />
      <Controller control={control} name="dietaryPreference" render={({ field: { onChange, value } }) => (
        <SelectField label="Dietary Preference" value={value} options={DIET_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="stressLevel" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Stress Level (1-5)" mode="outlined" keyboardType="number-pad" value={value?.toString() ?? ''} onBlur={onBlur} onChangeText={(t) => onChange(t === '' ? undefined : Number(t))} />
      )} />
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  error: { color: '#b00020' },
});
