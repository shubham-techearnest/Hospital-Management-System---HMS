import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import type { ProfileSectionCallbacks } from '@/features/doctor/components/profile/types';
import { useDoctorProfile, useUpdateConsultationDefaults } from '@/features/doctor/hooks/useDoctorQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function ConsultationFeesSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = useDoctorProfile();
  const updateConsultation = useUpdateConsultationDefaults();
  const [inPersonFee, setInPersonFee] = useState('0');
  const [followUpFee, setFollowUpFee] = useState('0');
  const [duration, setDuration] = useState('15');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    const inPerson = profile.consultationDefaults.find((c) => c.consultationType === 'IN_PERSON');
    const followUp = profile.consultationDefaults.find((c) => c.consultationType === 'FOLLOW_UP');
    if (inPerson) setInPersonFee(String(inPerson.feeAmount));
    if (followUp) setFollowUpFee(String(followUp.feeAmount));
    if (inPerson?.durationMinutes) setDuration(String(inPerson.durationMinutes));
  }, [profile]);

  const handleSave = async () => {
    setError(null);
    try {
      await updateConsultation.mutateAsync([
        {
          consultationType: 'IN_PERSON',
          feeAmount: Number(inPersonFee),
          currency: 'INR',
          durationMinutes: Number(duration),
        },
        {
          consultationType: 'FOLLOW_UP',
          feeAmount: Number(followUpFee),
          currency: 'INR',
          durationMinutes: Number(duration),
        },
      ]);
      onSaveSuccess('Consultation fees saved.');
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Unable to save consultation fees.');
      setError(msg);
      onSaveError(msg);
    }
  };

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TextInput
        label="In-Person Fee (INR)"
        mode="outlined"
        keyboardType="number-pad"
        value={inPersonFee}
        onChangeText={setInPersonFee}
      />
      <HelperText type="info">Enter 0 for free consultation</HelperText>
      <TextInput
        label="Follow-Up Fee (INR)"
        mode="outlined"
        keyboardType="number-pad"
        value={followUpFee}
        onChangeText={setFollowUpFee}
      />
      <TextInput
        label="Duration (minutes)"
        mode="outlined"
        keyboardType="number-pad"
        value={duration}
        onChangeText={setDuration}
      />
      <Button
        mode="contained"
        onPress={handleSave}
        disabled={updateConsultation.isPending}
        loading={updateConsultation.isPending}
      >
        Save
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  error: { color: '#b00020' },
});
