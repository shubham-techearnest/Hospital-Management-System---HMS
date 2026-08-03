import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { verifyEmail } from '@/features/auth/api/authApi';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export function VerifyEmailScreen({ navigation, route }: Props) {
  const token = route.params?.token;
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const verifiedRef = useRef(false);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Verification token is missing.');
      return;
    }

    if (verifiedRef.current) {
      return;
    }
    verifiedRef.current = true;

    verifyEmail(token)
      .then((msg) => {
        setStatus('success');
        setMessage(msg);
      })
      .catch((e: unknown) => {
        setStatus('error');
        setMessage(getApiErrorMessage(e, 'Invalid or expired verification link.'));
      });
  }, [token]);

  return (
    <ScreenContainer scroll={false}>
      <Text variant="headlineMedium" style={styles.title}>
        Email verification
      </Text>

      <View style={styles.content}>
        {status === 'loading' && (
          <>
            <ActivityIndicator animating size="large" />
            <Text style={styles.info}>Verifying your email…</Text>
          </>
        )}
        {status === 'success' && <Text style={styles.success}>{message}</Text>}
        {status === 'error' && <Text style={styles.error}>{message}</Text>}

        {status !== 'loading' && (
          <Button mode="contained" onPress={() => navigation.navigate('Login')} style={styles.button}>
            Go to sign in
          </Button>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 16 },
  content: { gap: 12, alignItems: 'center' },
  info: { marginTop: 12, opacity: 0.7 },
  success: { color: '#2e7d32', textAlign: 'center' },
  error: { color: '#b00020', textAlign: 'center' },
  button: { marginTop: 8, alignSelf: 'stretch' },
});
