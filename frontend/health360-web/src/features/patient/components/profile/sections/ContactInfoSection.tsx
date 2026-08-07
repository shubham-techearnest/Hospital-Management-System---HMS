import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Alert,
  Checkbox,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { usePatientProfile, useUpdateContactInfo } from '../../../hooks/usePatientQueries';
import { contactInfoSchema, type ContactInfoForm } from '../../../schemas/patient.schema';
import { sanitizeContactPayload } from '../../../utils/profileEnumMapper';
import { SaveButton } from '../SaveButton';
import type { ProfileSectionCallbacks } from '../types';

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
    mode: 'onBlur',
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
    }, { keepDirtyValues: true });
  }, [profile, reset]);

  const onSubmit = async (values: ContactInfoForm) => {
    setError(null);
    setSaved(false);
    try {
      await updateMutation.mutateAsync(sanitizeContactPayload(values));
      setSaved(true);
      onSaveSuccess('Contact information saved.');
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError('Unable to save contact information.');
      onSaveError('Unable to save contact information.');
    }
  };

  return (
    <Stack component="form" spacing={2} onSubmit={handleSubmit(onSubmit)}>
      {error && <Alert severity="error">{error}</Alert>}
      <Controller name="primaryPhone" control={control} render={({ field }) => (
        <TextField {...field} label="Primary Phone" />
      )} />
      <Controller name="secondaryPhone" control={control} render={({ field }) => (
        <TextField {...field} label="Secondary Phone" />
      )} />

      <Typography variant="subtitle2" fontWeight={600}>Permanent Address</Typography>
      {(['line1', 'line2', 'city', 'state', 'pincode', 'country'] as const).map((key) => (
        <Controller
          key={`perm-${key}`}
          name={`permanentAddress.${key}`}
          control={control}
          render={({ field }) => (
            <TextField {...field} label={key.charAt(0).toUpperCase() + key.slice(1)} />
          )}
        />
      ))}

      <Controller name="sameAsPermanentAddress" control={control} render={({ field }) => (
        <FormControlLabel
          control={<Checkbox checked={!!field.value} onChange={(e) => field.onChange(e.target.checked)} />}
          label="Current address same as permanent"
        />
      )} />

      {!sameAsPermanent && (
        <>
          <Typography variant="subtitle2" fontWeight={600}>Current Address</Typography>
          {(['line1', 'line2', 'city', 'state', 'pincode', 'country'] as const).map((key) => (
            <Controller
              key={`curr-${key}`}
              name={`currentAddress.${key}`}
              control={control}
              render={({ field }) => (
                <TextField {...field} label={key.charAt(0).toUpperCase() + key.slice(1)} />
              )}
            />
          ))}
        </>
      )}

      <SaveButton saving={isSubmitting || updateMutation.isPending} saved={saved} />
    </Stack>
  );
}
