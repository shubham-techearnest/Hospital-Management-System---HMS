import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loginSchema, type LoginForm } from '@/features/auth/schemas/auth.schema';
import { login as loginApi, verifyMfa } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BrandHeader } from '@/shared/components/BrandHeader';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { loginMessageStore } from '@/shared/storage/loginMessageStore';
import { liveValidationOptions } from '@/shared/validation/formConfig';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(route.params?.message);
  const [mfaToken, setMfaToken] = useState<string | null>(null);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaSubmitting, setMfaSubmitting] = useState(false);

  useEffect(() => {
    const stored = loginMessageStore.consume();
    if (stored) {
      setSuccessMessage(stored);
    }
  }, []);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    ...liveValidationOptions,
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setError(null);
    try {
      const result = await loginApi(values);
      if (result.mfaRequired && result.mfaToken) {
        setMfaToken(result.mfaToken);
        setMfaCode('');
        return;
      }
      if (!result.accessToken || !result.refreshToken || !result.user) {
        setError('Unexpected login response');
        return;
      }
      await signIn({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.expiresIn ?? 0,
        tokenType: result.tokenType ?? 'Bearer',
        user: result.user,
      });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Login failed'));
    }
  };

  const onMfaSubmit = async () => {
    if (!mfaToken || !mfaCode.trim()) return;
    setError(null);
    setMfaSubmitting(true);
    try {
      const tokens = await verifyMfa({ mfaToken, code: mfaCode.trim() });
      await signIn(tokens);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Invalid authenticator code'));
    } finally {
      setMfaSubmitting(false);
    }
  };

  return (
    <ScreenContainer centered>
      <BrandHeader
        title={mfaToken ? 'Two-factor authentication' : 'Welcome back'}
        subtitle={
          mfaToken
            ? 'Enter the 6-digit code from your authenticator app (or a backup code).'
            : 'Sign in to manage your health profile, vitals, OPD visits, and records.'
        }
      />

      {successMessage && !mfaToken ? (
        <View style={styles.successBox}>
          <Text style={styles.success}>{successMessage}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {mfaToken ? (
        <View style={styles.form}>
          <TextInput
            label="Authenticator code"
            mode="outlined"
            keyboardType="number-pad"
            value={mfaCode}
            onChangeText={setMfaCode}
            autoComplete="one-time-code"
          />
          <Button
            mode="contained"
            onPress={onMfaSubmit}
            loading={mfaSubmitting}
            disabled={mfaSubmitting || !mfaCode.trim()}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Verify
          </Button>
          <Button
            mode="text"
            onPress={() => {
              setMfaToken(null);
              setMfaCode('');
              setError(null);
            }}
          >
            Back to sign in
          </Button>
        </View>
      ) : (
        <View style={styles.form}>
          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Email"
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                value={value ?? ''}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.email}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.email}>
            {errors.email?.message}
          </HelperText>

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Password"
                mode="outlined"
                secureTextEntry
                autoComplete="password"
                value={value ?? ''}
                onBlur={onBlur}
                onChangeText={onChange}
                error={!!errors.password}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.password}>
            {errors.password?.message}
          </HelperText>

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign in
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')} style={styles.link}>
            Forgot password?
          </Button>
        </View>
      )}

      {!mfaToken ? (
        <>
          <Button mode="text" onPress={() => navigation.navigate('Register')} style={styles.link}>
            Don&apos;t have an account? Register
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('CompletePatientAccount')} style={styles.link}>
            Hospital registered you? Activate account
          </Button>
          <Button mode="text" onPress={() => navigation.navigate('Welcome')} style={styles.link}>
            Back to overview
          </Button>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 4,
    marginBottom: 12,
  },
  button: {
    marginTop: 12,
    borderRadius: 12,
  },
  buttonContent: {
    paddingVertical: 6,
  },
  link: {
    marginTop: 4,
  },
  errorBox: {
    backgroundColor: appColors.errorContainer,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  error: {
    color: appColors.error,
  },
  successBox: {
    backgroundColor: appColors.successContainer,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  success: {
    color: appColors.success,
  },
});
