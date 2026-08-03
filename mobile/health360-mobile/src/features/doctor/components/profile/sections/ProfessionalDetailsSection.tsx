import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { SelectField } from '@/features/patient/components/SelectField';
import { SaveButton } from '@/features/patient/components/profile/SaveButton';
import { DOCTOR_GENDER_OPTIONS, DOCTOR_TITLES } from '@/features/doctor/constants/enums';
import type { ProfileSectionCallbacks } from '@/features/doctor/components/profile/types';
import { useDoctorProfile, useUpdateProfessionalDetails } from '@/features/doctor/hooks/useDoctorQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

interface ProfessionalForm {
  title: string;
  medicalRegistrationNumber: string;
  registrationCouncil: string;
  registrationYear?: number;
  registrationExpiry: string;
  gender: string;
  totalYearsExperience?: number;
}

export function ProfessionalDetailsSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = useDoctorProfile();
  const updateMutation = useUpdateProfessionalDetails();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, formState: { isSubmitting } } = useForm<ProfessionalForm>({
    defaultValues: {
      title: 'DR',
      medicalRegistrationNumber: '',
      registrationCouncil: '',
      registrationExpiry: '',
      gender: '',
    },
  });

  useEffect(() => {
    if (!profile) return;
    const p = profile.professionalDetails;
    reset({
      title: p.title ?? 'DR',
      medicalRegistrationNumber: p.medicalRegistrationNumber ?? '',
      registrationCouncil: p.registrationCouncil ?? '',
      registrationYear: p.registrationYear,
      registrationExpiry: p.registrationExpiry ?? '',
      gender: p.gender ?? '',
      totalYearsExperience: p.totalYearsExperience,
    });
  }, [profile, reset]);

  const onSubmit = async (values: ProfessionalForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync({
        title: values.title,
        medicalRegistrationNumber: values.medicalRegistrationNumber || undefined,
        registrationCouncil: values.registrationCouncil || undefined,
        registrationYear: values.registrationYear,
        registrationExpiry: values.registrationExpiry || undefined,
        gender: values.gender || undefined,
        totalYearsExperience: values.totalYearsExperience,
      });
      setSaved(true);
      onSaveSuccess('Professional details saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Unable to save professional details.');
      setError(msg);
      onSaveError(msg);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Controller control={control} name="title" render={({ field: { onChange, value } }) => (
        <SelectField label="Title" value={value} options={DOCTOR_TITLES} onChange={onChange} />
      )} />
      <Controller control={control} name="medicalRegistrationNumber" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Medical Registration Number" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} />
      )} />
      <Controller control={control} name="registrationCouncil" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Registration Council" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} />
      )} />
      <Controller control={control} name="registrationYear" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          label="Registration Year"
          mode="outlined"
          keyboardType="number-pad"
          value={value != null ? String(value) : ''}
          onBlur={onBlur}
          onChangeText={(t) => onChange(t ? Number(t) : undefined)}
        />
      )} />
      <Controller control={control} name="registrationExpiry" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Registration Expiry (YYYY-MM-DD)" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} />
      )} />
      <Controller control={control} name="gender" render={({ field: { onChange, value } }) => (
        <SelectField label="Gender" value={value} options={DOCTOR_GENDER_OPTIONS} onChange={onChange} />
      )} />
      <Controller control={control} name="totalYearsExperience" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput
          label="Total Years of Experience"
          mode="outlined"
          keyboardType="number-pad"
          value={value != null ? String(value) : ''}
          onBlur={onBlur}
          onChangeText={(t) => onChange(t ? Number(t) : undefined)}
        />
      )} />
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  error: { color: '#b00020', marginBottom: 4 },
});
