import { useMemo, useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Snackbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { completePatientPortalAccount } from '@/features/auth/api/patientAccountApi';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'CompletePatientAccount'>;

export function CompletePatientAccountScreen({ navigation, route }: Props) {
  const tokenFromRoute = route.params?.token ?? '';
  const [token, setToken] = useState(tokenFromRoute);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [snack, setSnack] = useState('');

  const canSubmit = useMemo(
    () => token.trim().length > 0 && email.trim().length > 0 && password.length >= 8,
    [token, email, password],
  );

  const submit = async () => {
    setPending(true);
    try {
      await completePatientPortalAccount({
        token: token.trim(),
        email: email.trim(),
        password,
      });
      setDone(true);
    } catch (err) {
      setSnack(getApiErrorMessage(err, 'Unable to activate account.'));
    } finally {
      setPending(false);
    }
  };

  return (
    <ScreenContainer>
      <PageHero
        title="Complete patient account"
        subtitle="Your hospital registered you on Health360. Set email and password to access your portal."
      />

      {done ? (
        <AppCard style={styles.card}>
          <Text variant="titleMedium" style={styles.success}>Account activated</Text>
          <Text style={styles.meta}>You can log in with your new credentials.</Text>
          <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.btn}>
            Go to login
          </Button>
        </AppCard>
      ) : (
        <AppCard style={styles.card}>
          <TextInput
            label="Invite token"
            mode="outlined"
            value={token}
            onChangeText={setToken}
            style={styles.input}
          />
          <TextInput
            label="Email"
            mode="outlined"
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
          />
          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            style={styles.input}
          />
          <Button mode="contained" onPress={submit} loading={pending} disabled={!canSubmit || pending}>
            Activate account
          </Button>
        </AppCard>
      )}

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack('')} duration={4000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: layout.stackGap },
  input: { backgroundColor: appColors.surface },
  btn: { borderRadius: 12, marginTop: 8 },
  success: { fontWeight: '600', color: appColors.success },
  meta: { color: appColors.textSecondary },
});
