import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import { acceptConsent } from '@/features/patient/api/patientApi';
import { patientKeys } from '@/features/patient/hooks/usePatientQueries';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';

export function ConsentScreen() {
  const queryClient = useQueryClient();
  const [accepted, setAccepted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!accepted) {
      setError('You must accept the health data consent to continue.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const profile = await acceptConsent();
      queryClient.setQueryData(patientKeys.profile, profile);
      await queryClient.invalidateQueries({ queryKey: patientKeys.completion });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Unable to save consent. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScreenContainer safeAreaBottom>
      <AppCard style={styles.card}>
        <Text variant="headlineSmall" style={styles.title}>Health Data Consent</Text>
        <Text variant="bodyMedium" style={styles.body}>
          To build your health profile, Health360 needs your consent to collect and store personal
          health information. Your data is encrypted and used only to provide personalized health
          insights and care coordination.
        </Text>
        <View style={styles.list}>
          <Text variant="bodySmall" style={styles.bullet}>• Basic demographics and contact details</Text>
          <Text variant="bodySmall" style={styles.bullet}>• Physical measurements and lifestyle information</Text>
          <Text variant="bodySmall" style={styles.bullet}>• Medical history including allergies and medications</Text>
          <Text variant="bodySmall" style={styles.bullet}>• Emergency contact information</Text>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <Checkbox.Item
          label="I consent to Health360 collecting and processing my health data as described above."
          status={accepted ? 'checked' : 'unchecked'}
          onPress={() => setAccepted(!accepted)}
          labelStyle={styles.checkboxLabel}
        />
        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={submitting}
          disabled={submitting}
          style={styles.submit}
        >
          Accept & Continue
        </Button>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: layout.stackGap,
  },
  title: {
    fontWeight: '700',
    color: appColors.textPrimary,
  },
  body: {
    color: appColors.textSecondary,
    lineHeight: layout.textLineHeight,
  },
  list: {
    gap: 6,
    paddingLeft: 4,
  },
  bullet: {
    color: appColors.textSecondary,
    lineHeight: layout.textLineHeight,
  },
  error: {
    color: appColors.error,
  },
  checkboxLabel: {
    lineHeight: layout.textLineHeight,
  },
  submit: {
    marginTop: layout.stackGap,
    borderRadius: 10,
  },
});
