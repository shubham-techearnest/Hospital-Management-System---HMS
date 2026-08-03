import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Text } from 'react-native-paper';
import { useQueryClient } from '@tanstack/react-query';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  updateNotificationPreferences,
  type NotificationPreference,
} from '@/features/settings/api/userApi';
import {
  isSmsDisabledForType,
  NOTIFICATION_TYPE_LABELS,
} from '@/features/settings/constants/notificationLabels';
import { useNotificationPreferences, userKeys } from '@/features/settings/hooks/useUserQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'NotificationPreferences'>;

export function NotificationPreferencesScreen({ navigation }: Props) {
  const queryClient = useQueryClient();
  const { data: loadedPreferences, isLoading, error: loadError } = useNotificationPreferences();
  const [preferences, setPreferences] = useState<NotificationPreference[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loadedPreferences) {
      setPreferences(loadedPreferences);
    }
  }, [loadedPreferences]);

  const togglePreference = (
    index: number,
    field: 'emailEnabled' | 'smsEnabled',
    value: boolean,
  ) => {
    setPreferences((current) =>
      current.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const onSave = async () => {
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      const updated = await updateNotificationPreferences(preferences);
      setPreferences(updated);
      queryClient.setQueryData(userKeys.notificationPreferences, updated);
      setSuccess('Notification preferences saved');
    } catch (e: unknown) {
      setError(getApiErrorMessage(e, 'Failed to save preferences'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text variant="headlineSmall" style={styles.title}>
        Notification preferences
      </Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Choose how you receive alerts. In-app notifications are always enabled.
      </Text>

      {isLoading && <ActivityIndicator animating style={styles.loader} />}
      {loadError ? (
        <Text style={styles.error}>{getApiErrorMessage(loadError, 'Unable to load preferences')}</Text>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}

      {!isLoading && preferences.length > 0 && (
        <View style={styles.list}>
          {preferences.map((pref, index) => (
            <View key={pref.notificationType} style={styles.card}>
              <Text variant="titleSmall" style={styles.cardTitle}>
                {NOTIFICATION_TYPE_LABELS[pref.notificationType] ?? pref.notificationType}
              </Text>
              <View style={styles.checkboxRow}>
                <Checkbox.Item
                  label="Email"
                  status={pref.emailEnabled ? 'checked' : 'unchecked'}
                  onPress={() => togglePreference(index, 'emailEnabled', !pref.emailEnabled)}
                />
                <Checkbox.Item
                  label="SMS"
                  status={pref.smsEnabled ? 'checked' : 'unchecked'}
                  disabled={isSmsDisabledForType(pref.notificationType)}
                  onPress={() => togglePreference(index, 'smsEnabled', !pref.smsEnabled)}
                />
                <Checkbox.Item label="In-app" status="checked" disabled />
              </View>
            </View>
          ))}
          <Button mode="contained" onPress={onSave} loading={saving} disabled={saving}>
            Save preferences
          </Button>
        </View>
      )}

      <Button mode="text" onPress={() => navigation.navigate('AccountSettings')} style={styles.link}>
        Back to account settings
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingBottom: 40 },
  title: { fontWeight: '700', marginBottom: 4 },
  subtitle: { opacity: 0.7, marginBottom: 16 },
  loader: { marginVertical: 16 },
  list: { gap: 12 },
  card: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 8,
    backgroundColor: '#fff',
  },
  cardTitle: { fontWeight: '600', paddingHorizontal: 8, paddingTop: 4 },
  checkboxRow: { gap: 0 },
  error: { color: '#b00020', marginBottom: 8 },
  success: { color: '#2e7d32', marginBottom: 8 },
  link: { marginTop: 16 },
});
