import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { loginSchema, type LoginForm } from '@/features/auth/schemas/auth.schema';
import { login as loginApi } from '@/features/auth/api/authApi';
import { useAuth } from '@/features/auth/context/AuthContext';
import { BrandHeader } from '@/shared/components/BrandHeader';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { loginMessageStore } from '@/shared/storage/loginMessageStore';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({ navigation, route }: Props) {
  const { signIn } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | undefined>(route.params?.message);

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
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginForm) => {
    setError(null);
    try {
      const tokens = await loginApi(values);
      await signIn(tokens);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Login failed'));
    }
  };

  return (
    <ScreenContainer centered>
      <BrandHeader
        title="Welcome back"
        subtitle="Sign in to manage your health profile, vitals, and appointments."
      />

      {successMessage ? (
        <View style={styles.successBox}>
          <Text style={styles.success}>{successMessage}</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

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
      </View>

      <Button mode="text" onPress={() => navigation.navigate('Register')} style={styles.link}>
        Don&apos;t have an account? Register
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Welcome')} style={styles.link}>
        Back to overview
      </Button>
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
