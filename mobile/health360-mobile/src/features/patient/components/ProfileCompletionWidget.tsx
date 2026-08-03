import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, ProgressBar, Text, useTheme } from 'react-native-paper';
import type { ProfileCompletion } from '@/features/patient/api/patientApi';
import { SECTION_LABELS, completionLabel, type ProfileSectionId } from '@/features/patient/utils/patientUtils';

const API_KEY_TO_SECTION: Record<string, ProfileSectionId> = {
  BASIC_INFO: 'basic-info',
  CONTACT_INFO: 'contact-info',
  PHYSICAL_MEASUREMENTS: 'measurements',
  MEDICAL_INFO: 'medical',
  LIFESTYLE: 'lifestyle',
  EMERGENCY_CONTACTS: 'emergency-contacts',
};

interface ProfileCompletionWidgetProps {
  completion?: ProfileCompletion;
  loading?: boolean;
  compact?: boolean;
  onSectionPress?: (sectionId: ProfileSectionId) => void;
}

export function ProfileCompletionWidget({
  completion,
  loading,
  compact = false,
  onSectionPress,
}: ProfileCompletionWidgetProps) {
  const theme = useTheme();

  if (loading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  if (!completion) return null;

  const incomplete = completion.sections.filter((s) => !s.completed);
  const next = incomplete[0];
  const progress = Math.min(Math.max(completion.completionScore / 100, 0), 1);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text variant="titleMedium" style={styles.title}>Profile Completion</Text>
        <Text variant="titleLarge" style={[styles.score, { color: theme.colors.primary }]}>
          {completion.completionScore}%
        </Text>
      </View>
      <ProgressBar progress={progress} color={theme.colors.primary} style={styles.progress} />
      <Text variant="bodySmall" style={styles.subtitle}>{completionLabel(completion.completionScore)}</Text>

      {!compact && (
        <>
          <Text variant="bodySmall" style={styles.meta}>
            {completion.sections.filter((s) => s.completed).length} of {completion.sections.length} sections complete
          </Text>
          {next && (
            <Text variant="bodySmall" style={styles.next}>
              Next: {SECTION_LABELS[next.name] ?? next.name}
            </Text>
          )}
          {incomplete.map((section) => (
            <Text
              key={section.name}
              variant="bodySmall"
              style={[styles.link, { color: theme.colors.primary }]}
              onPress={() => onSectionPress?.(API_KEY_TO_SECTION[section.name] ?? 'basic-info')}
            >
              • {SECTION_LABELS[section.name] ?? section.name}
            </Text>
          ))}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 6 },
  loader: { padding: 24 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontWeight: '700' },
  score: { fontWeight: '700' },
  progress: {
    height: 8,
    borderRadius: 999,
    marginTop: 4,
  },
  subtitle: { opacity: 0.7 },
  meta: { opacity: 0.7, marginTop: 4 },
  next: { marginTop: 8, fontWeight: '600' },
  link: { marginTop: 4 },
});
