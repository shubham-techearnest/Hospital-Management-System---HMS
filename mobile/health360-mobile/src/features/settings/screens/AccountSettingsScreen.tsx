import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Divider, HelperText, Text, TextInput } from 'react-native-paper';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '@/features/auth/context/AuthContext';
import { changePassword, updateProfile } from '@/features/settings/api/userApi';
import { useCurrentUser } from '@/features/settings/hooks/useUserQueries';
import {
  changePasswordSchema,
  profileSchema,
  type ChangePasswordForm,
  type ProfileForm,
} from '@/features/settings/schemas/settings.schema';
import { mergeProfileIntoAuthUser } from '@/features/settings/utils/profileMapper';
import { loginMessageStore } from '@/shared/storage/loginMessageStore';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'AccountSettings'>;

const profileDefaults: ProfileForm = {
  firstName: '',
  lastName: '',
  phone: '',
  timezone: '',
  locale: '',
};

export function AccountSettingsScreen({ navigation, route }: Props) {
  const { user, signOut, updateUser } = useAuth();
  const scrollRef = useRef<ScrollView>(null);
  const passwordSectionY = useRef(0);
  const { data: profile, isLoading, error: loadError } = useCurrentUser();

  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: profileDefaults,
  });

  const passwordForm = useForm<ChangePasswordForm>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: profile.firstName ?? '',
        lastName: profile.lastName ?? '',
        phone: profile.phone ?? '',
        timezone: profile.timezone ?? '',
        locale: profile.locale ?? '',
      });
    }
  }, [profile, profileForm]);

  useEffect(() => {
    if (route.params?.focusPassword && passwordSectionY.current > 0) {
      scrollRef.current?.scrollTo({ y: passwordSectionY.current, animated: true });
    }
  }, [route.params?.focusPassword, profile]);

  const onProfileSubmit = async (values: ProfileForm) => {
    setProfileError(null);
    setProfileSuccess(null);
    try {
      const updated = await updateProfile(values);
      if (user) {
        await updateUser(mergeProfileIntoAuthUser(updated, user));
      }
      setProfileSuccess('Profile updated successfully');
    } catch (e: unknown) {
      setProfileError(getApiErrorMessage(e, 'Failed to update profile'));
    }
  };

  const onPasswordSubmit = async (values: ChangePasswordForm) => {
    setPasswordError(null);
    setPasswordSuccess(null);
    try {
      const message = await changePassword(values);
      setPasswordSuccess(message);
      passwordForm.reset();
      loginMessageStore.set('Password changed. Please sign in again.');
      setTimeout(async () => {
        await signOut();
      }, 1500);
    } catch (e: unknown) {
      setPasswordError(getApiErrorMessage(e, 'Failed to change password'));
    }
  };

  const email = profile?.email ?? user?.email ?? '';

  return (
    <ScrollView ref={scrollRef} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="headlineSmall" style={styles.title}>
        Account settings
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Manage your profile and password
      </Text>

      {loadError ? (
        <Text style={styles.error}>{getApiErrorMessage(loadError, 'Unable to load profile')}</Text>
      ) : null}

      <Text variant="titleMedium" style={styles.sectionTitle}>
        Profile
      </Text>
      {profileError ? <Text style={styles.error}>{profileError}</Text> : null}
      {profileSuccess ? <Text style={styles.success}>{profileSuccess}</Text> : null}

      {isLoading ? (
        <ActivityIndicator animating style={styles.loader} />
      ) : (
        <View style={styles.form}>
          <TextInput label="Email" mode="outlined" value={email} disabled />
          <Controller
            control={profileForm.control}
            name="firstName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="First name" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} error={!!profileForm.formState.errors.firstName} />
            )}
          />
          <HelperText type="error" visible={!!profileForm.formState.errors.firstName}>
            {profileForm.formState.errors.firstName?.message}
          </HelperText>

          <Controller
            control={profileForm.control}
            name="lastName"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Last name" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} error={!!profileForm.formState.errors.lastName} />
            )}
          />
          <HelperText type="error" visible={!!profileForm.formState.errors.lastName}>
            {profileForm.formState.errors.lastName?.message}
          </HelperText>

          <Controller
            control={profileForm.control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Phone" mode="outlined" keyboardType="phone-pad" value={value} onBlur={onBlur} onChangeText={onChange} error={!!profileForm.formState.errors.phone} />
            )}
          />
          <HelperText type="error" visible={!!profileForm.formState.errors.phone}>
            {profileForm.formState.errors.phone?.message}
          </HelperText>

          <Controller
            control={profileForm.control}
            name="timezone"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Timezone" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} error={!!profileForm.formState.errors.timezone} />
            )}
          />
          <HelperText type="error" visible={!!profileForm.formState.errors.timezone}>
            {profileForm.formState.errors.timezone?.message}
          </HelperText>

          <Controller
            control={profileForm.control}
            name="locale"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Locale" mode="outlined" value={value} onBlur={onBlur} onChangeText={onChange} error={!!profileForm.formState.errors.locale} />
            )}
          />
          <HelperText type="error" visible={!!profileForm.formState.errors.locale}>
            {profileForm.formState.errors.locale?.message}
          </HelperText>

          <Button
            mode="contained"
            onPress={profileForm.handleSubmit(onProfileSubmit)}
            loading={profileForm.formState.isSubmitting}
            disabled={profileForm.formState.isSubmitting}
          >
            Save profile
          </Button>
        </View>
      )}

      <Divider style={styles.divider} />

      <View
        onLayout={(event) => {
          passwordSectionY.current = event.nativeEvent.layout.y;
        }}
      >
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Change password
        </Text>
        {passwordError ? <Text style={styles.error}>{passwordError}</Text> : null}
        {passwordSuccess ? <Text style={styles.success}>{passwordSuccess}</Text> : null}

        <View style={styles.form}>
          <Controller
            control={passwordForm.control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Current password" mode="outlined" secureTextEntry value={value} onBlur={onBlur} onChangeText={onChange} error={!!passwordForm.formState.errors.currentPassword} />
            )}
          />
          <HelperText type="error" visible={!!passwordForm.formState.errors.currentPassword}>
            {passwordForm.formState.errors.currentPassword?.message}
          </HelperText>

          <Controller
            control={passwordForm.control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="New password" mode="outlined" secureTextEntry value={value} onBlur={onBlur} onChangeText={onChange} error={!!passwordForm.formState.errors.newPassword} />
            )}
          />
          <HelperText type="error" visible={!!passwordForm.formState.errors.newPassword}>
            {passwordForm.formState.errors.newPassword?.message}
          </HelperText>

          <Controller
            control={passwordForm.control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput label="Confirm new password" mode="outlined" secureTextEntry value={value} onBlur={onBlur} onChangeText={onChange} error={!!passwordForm.formState.errors.confirmPassword} />
            )}
          />
          <HelperText type="error" visible={!!passwordForm.formState.errors.confirmPassword}>
            {passwordForm.formState.errors.confirmPassword?.message}
          </HelperText>

          <Button
            mode="outlined"
            onPress={passwordForm.handleSubmit(onPasswordSubmit)}
            loading={passwordForm.formState.isSubmitting}
            disabled={passwordForm.formState.isSubmitting}
          >
            Change password
          </Button>
        </View>
      </View>

      <Button mode="text" onPress={() => navigation.navigate('NotificationPreferences')} style={styles.link}>
        Notification preferences
      </Button>

      <Button mode="outlined" onPress={() => signOut()} style={styles.signOut}>
        Sign out
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  sectionTitle: { fontWeight: '600', marginBottom: 8, marginTop: 8 },
  form: { gap: 4, marginBottom: 8 },
  divider: { marginVertical: 20 },
  loader: { marginVertical: 16 },
  error: { color: '#b00020', marginBottom: 8 },
  success: { color: '#2e7d32', marginBottom: 8 },
  link: { marginTop: 16 },
  signOut: { marginTop: 24 },
});
