import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { forgotPassword } from '@/features/auth/api/authApi';
import { BrandHeader } from '@/shared/components/BrandHeader';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { emailRequiredSchema } from '@/shared/validation/inputSchemas';
import { liveValidationOptions } from '@/shared/validation/formConfig';
import type { AuthStackParamList } from '@/navigation/types';

const schema = z.object({
  email: emailRequiredSchema,
});

type Form = z.infer<typeof schema>;

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({
    ...liveValidationOptions,
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: Form) => {
    setError(null);
    try {
      await forgotPassword(values.email.trim());
      setDone(true);
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Unable to send reset link'));
    }
  };

  return (
    <ScreenContainer centered>
      <BrandHeader
        title="Forgot password"
        subtitle="Enter your account email. If it exists, we will send a reset link."
      />

      {done ? (
        <View style={styles.successBox}>
          <Text style={styles.success}>
            If an account exists for that email, a reset link has been sent. Open the link on this device
            or use the token from email / API logs in Reset password.
          </Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {!done ? (
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

          <Button
            mode="contained"
            onPress={handleSubmit(onSubmit)}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Send reset link
          </Button>
        </View>
      ) : (
        <Button mode="outlined" onPress={() => navigation.navigate('Login')} style={styles.button}>
          Back to sign in
        </Button>
      )}

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
    marginTop: 8,
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
  successBox: {
    backgroundColor: appColors.successContainer,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  success: {
    color: appColors.success,
  },
});
