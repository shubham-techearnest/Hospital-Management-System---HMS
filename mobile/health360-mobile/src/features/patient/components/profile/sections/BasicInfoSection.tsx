import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { HelperText, Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SelectField } from '@/features/patient/components/SelectField';
import { SaveButton } from '@/features/patient/components/profile/SaveButton';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import {
  BLOOD_GROUPS,
  GENDER_OPTIONS,
  MARITAL_STATUSES,
} from '@/features/patient/constants/enums';
import { usePatientProfile, useUpdateBasicInfo } from '@/features/patient/hooks/usePatientQueries';
import { basicInfoSchema, type BasicInfoForm } from '@/features/patient/schemas/patient.schema';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function BasicInfoSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = usePatientProfile();
  const updateMutation = useUpdateBasicInfo();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<BasicInfoForm>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: { dateOfBirth: '', gender: '', bloodGroup: '', maritalStatus: '', nationality: 'IN' },
  });

  useEffect(() => {
    if (!profile) return;
    reset({
      dateOfBirth: profile.basicInfo?.dateOfBirth ?? '',
      gender: profile.basicInfo?.gender ?? '',
      bloodGroup: profile.basicInfo?.bloodGroup ?? '',
      maritalStatus: profile.basicInfo?.maritalStatus ?? '',
      nationality: profile.basicInfo?.nationality ?? 'IN',
    });
  }, [profile, reset]);

  const onSubmit = async (values: BasicInfoForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(values);
      setSaved(true);
      onSaveSuccess('Basic information saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Unable to save basic information.');
      setError(msg);
      onSaveError(msg);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Controller control={control} name="dateOfBirth" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Date of Birth (YYYY-MM-DD)" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} />
      )} />
      <Controller control={control} name="gender" render={({ field: { onChange, value } }) => (
        <SelectField label="Gender" value={value} options={GENDER_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="bloodGroup" render={({ field: { onChange, value } }) => (
        <SelectField label="Blood Group" value={value} options={BLOOD_GROUPS} onChange={onChange} />
      )} />
      <Controller control={control} name="maritalStatus" render={({ field: { onChange, value } }) => (
        <SelectField label="Marital Status" value={value} options={MARITAL_STATUSES} onChange={onChange} />
      )} />
      <Controller control={control} name="nationality" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Nationality (ISO)" mode="outlined" maxLength={2} value={value} onBlur={onBlur} onChangeText={onChange} error={!!errors.nationality} />
      )} />
      <HelperText type="error" visible={!!errors.nationality}>{errors.nationality?.message}</HelperText>
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  error: { color: '#b00020', marginBottom: 4 },
});
