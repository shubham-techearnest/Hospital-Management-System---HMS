import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, HelperText, Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { SaveButton } from '@/features/patient/components/profile/SaveButton';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import { usePatientProfile, useUpdateContactInfo } from '@/features/patient/hooks/usePatientQueries';
import { contactInfoSchema, type ContactInfoForm } from '@/features/patient/schemas/patient.schema';
import { sanitizeContactPayload } from '@/features/patient/utils/profileEnumMapper';
import { getApiErrorMessage } from '@/shared/utils/helpers';

const emptyAddress = { line1: '', line2: '', city: '', state: '', pincode: '', country: 'IN' };

export function ContactInfoSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = usePatientProfile();
  const updateMutation = useUpdateContactInfo();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { control, handleSubmit, reset, watch, formState: { isSubmitting } } = useForm<ContactInfoForm>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      primaryPhone: '',
      secondaryPhone: '',
      permanentAddress: { ...emptyAddress },
      currentAddress: { ...emptyAddress },
      sameAsPermanentAddress: false,
    },
  });

  const sameAsPermanent = watch('sameAsPermanentAddress');

  useEffect(() => {
    if (!profile) return;
    reset({
      primaryPhone: profile.contactInfo?.primaryPhone ?? '',
      secondaryPhone: profile.contactInfo?.secondaryPhone ?? '',
      permanentAddress: profile.contactInfo?.permanentAddress ?? { ...emptyAddress },
      currentAddress: profile.contactInfo?.currentAddress ?? { ...emptyAddress },
      sameAsPermanentAddress: false,
    });
  }, [profile, reset]);

  const onSubmit = async (values: ContactInfoForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(sanitizeContactPayload(values));
      setSaved(true);
      onSaveSuccess('Contact information saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Unable to save contact information.');
      setError(msg);
      onSaveError(msg);
    }
  };

  const renderAddress = (prefix: 'permanentAddress' | 'currentAddress', title: string) => (
    <>
      <Text variant="titleSmall" style={styles.subheading}>{title}</Text>
      {(['line1', 'line2', 'city', 'state', 'pincode', 'country'] as const).map((key) => (
        <Controller
          key={`${prefix}-${key}`}
          control={control}
          name={`${prefix}.${key}`}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label={key} mode="outlined" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} />
          )}
        />
      ))}
    </>
  );

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Controller control={control} name="primaryPhone" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Primary Phone" mode="outlined" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} />
      )} />
      <Controller control={control} name="secondaryPhone" render={({ field: { onChange, onBlur, value } }) => (
        <TextInput label="Secondary Phone" mode="outlined" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} />
      )} />
      {renderAddress('permanentAddress', 'Permanent Address')}
      <Controller control={control} name="sameAsPermanentAddress" render={({ field: { onChange, value } }) => (
        <Checkbox.Item label="Current address same as permanent" status={value ? 'checked' : 'unchecked'} onPress={() => onChange(!value)} />
      )} />
      {!sameAsPermanent && renderAddress('currentAddress', 'Current Address')}
      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} onPress={handleSubmit(onSubmit)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  subheading: { fontWeight: '600', marginTop: 8 },
  error: { color: '#b00020' },
});
