import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Checkbox, HelperText, Text, TextInput } from 'react-native-paper';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { registerSchema, type RegisterForm } from '@/features/auth/schemas/auth.schema';
import { register as registerApi } from '@/features/auth/api/authApi';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { BrandHeader } from '@/shared/components/BrandHeader';
import { appColors } from '@/shared/theme';
import type { AuthStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

const ROLE_OPTIONS: Array<{ label: string; value: RegisterForm['role'] }> = [
  { label: 'Patient', value: 'PATIENT' },
  { label: 'Individual practice', value: 'INDIVIDUAL_PRACTICE' },
];

export function RegisterScreen({ navigation }: Props) {
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: 'PATIENT',
      clinicName: '',
      acceptTerms: false,
    },
  });

  const selectedRole = useWatch({ control, name: 'role' });

  const onSubmit = async (values: RegisterForm) => {
    setError(null);
    try {
      await registerApi(values);
      navigation.navigate('Login', {
        message: 'Registration successful. Check your email to verify your account.',
      });
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Registration failed'));
    }
  };

  return (
    <ScreenContainer centered>
      <BrandHeader
        title="Create account"
        subtitle="Join Health360 AI as a patient or register your individual practice."
      />

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <Controller
          control={control}
          name="firstName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="First name" mode="outlined" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} error={!!errors.firstName} />
          )}
        />
        <HelperText type="error" visible={!!errors.firstName}>{errors.firstName?.message}</HelperText>

        <Controller
          control={control}
          name="lastName"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Last name" mode="outlined" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} error={!!errors.lastName} />
          )}
        />
        <HelperText type="error" visible={!!errors.lastName}>{errors.lastName?.message}</HelperText>

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Email" mode="outlined" keyboardType="email-address" autoCapitalize="none" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} error={!!errors.email} />
          )}
        />
        <HelperText type="error" visible={!!errors.email}>{errors.email?.message}</HelperText>

        <Controller
          control={control}
          name="phone"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Phone" mode="outlined" keyboardType="phone-pad" value={value ?? ''} onBlur={onBlur} onChangeText={onChange} error={!!errors.phone} />
          )}
        />
        <HelperText type="error" visible={!!errors.phone}>{errors.phone?.message}</HelperText>

        <Text variant="labelLarge" style={styles.roleLabel}>Role</Text>
        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  mode={value === option.value ? 'contained' : 'outlined'}
                  onPress={() => onChange(option.value)}
                  style={styles.roleButton}
                >
                  {option.label}
                </Button>
              ))}
            </View>
          )}
        />
        <HelperText type="error" visible={!!errors.role}>{errors.role?.message}</HelperText>

        {selectedRole === 'INDIVIDUAL_PRACTICE' ? (
          <>
            <Controller
              control={control}
              name="clinicName"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  label="Clinic / practice name"
                  mode="outlined"
                  value={value ?? ''}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  error={!!errors.clinicName}
                />
              )}
            />
            <HelperText type="info" visible>
              Your practice is set up as a single-doctor clinic on the Free plan.
            </HelperText>
            <HelperText type="error" visible={!!errors.clinicName}>{errors.clinicName?.message}</HelperText>
          </>
        ) : null}

        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Password" mode="outlined" secureTextEntry value={value ?? ''} onBlur={onBlur} onChangeText={onChange} error={!!errors.password} />
          )}
        />
        <HelperText type="error" visible={!!errors.password}>{errors.password?.message}</HelperText>

        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput label="Confirm password" mode="outlined" secureTextEntry value={value ?? ''} onBlur={onBlur} onChangeText={onChange} error={!!errors.confirmPassword} />
          )}
        />
        <HelperText type="error" visible={!!errors.confirmPassword}>{errors.confirmPassword?.message}</HelperText>

        <Controller
          control={control}
          name="acceptTerms"
          render={({ field: { onChange, value } }) => (
            <View style={styles.termsRow}>
              <Checkbox status={value ? 'checked' : 'unchecked'} onPress={() => onChange(!value)} />
              <Text variant="bodySmall" style={styles.termsText}>
                I accept the Terms of Service and Privacy Policy
              </Text>
            </View>
          )}
        />
        <HelperText type="error" visible={!!errors.acceptTerms}>{errors.acceptTerms?.message}</HelperText>

        <Button mode="contained" onPress={handleSubmit(onSubmit)} loading={isSubmitting} disabled={isSubmitting} style={styles.button} contentStyle={styles.buttonContent}>
          Register
        </Button>
      </View>

      <Button mode="text" onPress={() => navigation.navigate('Login')}>
        Already have an account? Sign in
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Welcome')}>
        Back to overview
      </Button>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: { gap: 4, marginBottom: 12 },
  button: { marginTop: 8, borderRadius: 12 },
  buttonContent: { paddingVertical: 6 },
  errorBox: {
    backgroundColor: appColors.errorContainer,
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  error: { color: appColors.error },
  roleLabel: { marginTop: 4 },
  roleRow: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  roleButton: { flex: 1 },
  termsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  termsText: { flex: 1 },
});
