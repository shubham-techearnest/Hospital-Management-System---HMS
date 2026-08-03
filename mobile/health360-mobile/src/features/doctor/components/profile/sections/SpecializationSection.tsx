import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Button, Checkbox, Text } from 'react-native-paper';
import { OptionSelectField } from '@/features/doctor/components/OptionSelectField';
import type { ProfileSectionCallbacks } from '@/features/doctor/components/profile/types';
import {
  useDoctorProfile,
  useSpecializations,
  useUpdateSpecialization,
} from '@/features/doctor/hooks/useDoctorQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';

export function SpecializationSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = useDoctorProfile();
  const { data: specializations = [], isLoading } = useSpecializations();
  const updateSpecialization = useUpdateSpecialization();
  const [primarySpec, setPrimarySpec] = useState('');
  const [subSpecs, setSubSpecs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile) return;
    setPrimarySpec(profile.specialization?.primarySpecializationId ?? '');
    setSubSpecs(profile.specialization?.subSpecializations?.map((s) => s.id) ?? []);
  }, [profile]);

  const secondaryOptions = specializations.filter((s) => s.id !== primarySpec);

  const toggleSubSpec = (id: string) => {
    setSubSpecs((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSave = async () => {
    setError(null);
    try {
      await updateSpecialization.mutateAsync({
        primarySpecializationId: primarySpec,
        subSpecializationIds: subSpecs,
      });
      onSaveSuccess('Specialization saved.');
    } catch (e: unknown) {
      const msg = getApiErrorMessage(e, 'Unable to save specialization.');
      setError(msg);
      onSaveError(msg);
    }
  };

  if (isLoading) {
    return <ActivityIndicator style={styles.loader} />;
  }

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <OptionSelectField
        label="Primary Specialization"
        value={primarySpec}
        options={specializations.map((s) => ({ id: s.id, label: s.name }))}
        onChange={(id) => {
          setPrimarySpec(id);
          setSubSpecs((prev) => prev.filter((x) => x !== id));
        }}
      />
      {primarySpec ? (
        <View style={styles.subSection}>
          <Text variant="titleSmall" style={styles.subLabel}>Secondary Specializations</Text>
          {secondaryOptions.map((s) => (
            <Checkbox.Item
              key={s.id}
              label={s.name}
              status={subSpecs.includes(s.id) ? 'checked' : 'unchecked'}
              onPress={() => toggleSubSpec(s.id)}
            />
          ))}
          {secondaryOptions.length === 0 && (
            <Text style={styles.empty}>No other specializations available.</Text>
          )}
        </View>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSave}
        disabled={!primarySpec || updateSpecialization.isPending}
        loading={updateSpecialization.isPending}
      >
        Save
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 8 },
  loader: { padding: 16 },
  error: { color: '#b00020' },
  subSection: { marginTop: 4 },
  subLabel: { marginBottom: 4 },
  empty: { opacity: 0.6, fontStyle: 'italic' },
});
