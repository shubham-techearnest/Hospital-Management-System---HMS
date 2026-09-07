import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { resetPassword } from '@/features/auth/api/authApi';
import { BrandHeader } from '@/shared/components/BrandHeader';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { passwordRequiredSchema } from '@/shared/validation/inputSchemas';
import { liveValidationOptions } from '@/shared/validation/formConfig';
import { loginMessageStore } from '@/shared/storage/loginMessageStore';
import type { AuthStackParamList } from '@/navigation/types';

const schema = z
  .object({
    newPassword: passwordRequiredSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type Form = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({ navigation, route }: Props) {
  const token = route.params?.token?.trim() ?? '';
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    ...liveValidationOptions,
    resolver: zodResolver(schema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (values: Form) => {
    setError(null);
    if (!token) {
      setError('Reset token is missing. Open the link from your email or request a new one.');
      return;
    }
    try {
      await resetPassword({
        token,
        newPassword: values.newPassword,
        confirmPassword: values.confirmPassword,
      });
      loginMessageStore.set('Password updated. Please sign in.');
      navigation.navigate('Login');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Unable to update password'));
    }
  };

  return (
    <ScreenContainer centered>
      <BrandHeader
        title="Reset password"
        subtitle="Choose a new password for your account."
      />

      {!token ? (
        <View style={styles.warnBox}>
          <Text style={styles.warn}>
            Missing reset token. Request a new link from Forgot password, or open the email deep link
            (health360://reset-password?token=…).
          </Text>
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
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="New password"
              mode="outlined"
              secureTextEntry
              autoComplete="password-new"
              value={value ?? ''}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.newPassword}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.newPassword}>
          {errors.newPassword?.message}
        </HelperText>

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Confirm password"
              mode="outlined"
              secureTextEntry
              autoComplete="password-new"
              value={value ?? ''}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.confirmPassword}
            />
          )}
        />
        <HelperText type="error" visible={!!errors.confirmPassword}>
          {errors.confirmPassword?.message}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
          disabled={isSubmitting || !token}
          style={styles.button}
          contentStyle={styles.buttonContent}
        >
          Update password
        </Button>
      </View>

      <Button mode="text" onPress={() => navigation.navigate('ForgotPassword')} style={styles.link}>
        Request a new link
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Login')} style={styles.link}>
        Back to sign in
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 4,
    marginBottom: 12,
    width: '100%',
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
    width: '100%',
  },
  error: {
    color: appColors.error,
  },
  warnBox: {
    backgroundColor: appColors.warningContainer,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  warn: {
    color: appColors.warning,
  },
});
