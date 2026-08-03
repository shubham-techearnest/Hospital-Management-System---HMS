import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';
import type { ProfileSectionCallbacks } from '@/features/patient/components/profile/types';
import { usePatientProfile } from '@/features/patient/hooks/usePatientQueries';
import { useUpdateHealthGoals } from '@/features/patient/hooks/usePatientExtendedQueries';

export function HealthGoalsSection({ onSaveSuccess, onSaveError }: ProfileSectionCallbacks) {
  const { data: profile } = usePatientProfile();
  const updateGoals = useUpdateHealthGoals();
  const goals = profile?.healthGoals;

  const [form, setForm] = useState({
    targetWeightKg: '',
    dailyStepsGoal: '',
    sleepHoursGoal: '',
    waterIntakeMlGoal: '',
    weeklyExerciseMinutesGoal: '',
  });

  useEffect(() => {
    if (!goals) return;
    setForm({
      targetWeightKg: goals.targetWeightKg?.toString() ?? '',
      dailyStepsGoal: goals.dailyStepsGoal?.toString() ?? '',
      sleepHoursGoal: goals.sleepHoursGoal?.toString() ?? '',
      waterIntakeMlGoal: goals.waterIntakeMlGoal?.toString() ?? '',
      weeklyExerciseMinutesGoal: goals.weeklyExerciseMinutesGoal?.toString() ?? '',
    });
  }, [goals]);

  const handleSave = async () => {
    try {
      await updateGoals.mutateAsync({
        targetWeightKg: form.targetWeightKg ? Number(form.targetWeightKg) : undefined,
        dailyStepsGoal: form.dailyStepsGoal ? Number(form.dailyStepsGoal) : undefined,
        sleepHoursGoal: form.sleepHoursGoal ? Number(form.sleepHoursGoal) : undefined,
        waterIntakeMlGoal: form.waterIntakeMlGoal ? Number(form.waterIntakeMlGoal) : undefined,
        weeklyExerciseMinutesGoal: form.weeklyExerciseMinutesGoal ? Number(form.weeklyExerciseMinutesGoal) : undefined,
      });
      onSaveSuccess('Health goals updated.');
    } catch {
      onSaveError('Unable to save health goals.');
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="bodySmall" style={styles.hint}>Set targets to track progress on your dashboard.</Text>
      <TextInput label="Target weight (kg)" mode="outlined" keyboardType="decimal-pad" value={form.targetWeightKg} onChangeText={(targetWeightKg) => setForm({ ...form, targetWeightKg })} style={styles.input} />
      <TextInput label="Daily steps goal" mode="outlined" keyboardType="number-pad" value={form.dailyStepsGoal} onChangeText={(dailyStepsGoal) => setForm({ ...form, dailyStepsGoal })} style={styles.input} />
      <TextInput label="Sleep hours goal" mode="outlined" keyboardType="decimal-pad" value={form.sleepHoursGoal} onChangeText={(sleepHoursGoal) => setForm({ ...form, sleepHoursGoal })} style={styles.input} />
      <TextInput label="Water intake goal (ml)" mode="outlined" keyboardType="number-pad" value={form.waterIntakeMlGoal} onChangeText={(waterIntakeMlGoal) => setForm({ ...form, waterIntakeMlGoal })} style={styles.input} />
      <TextInput label="Weekly exercise minutes goal" mode="outlined" keyboardType="number-pad" value={form.weeklyExerciseMinutesGoal} onChangeText={(weeklyExerciseMinutesGoal) => setForm({ ...form, weeklyExerciseMinutesGoal })} style={styles.input} />
      <Button mode="contained" onPress={handleSave} loading={updateGoals.isPending} disabled={updateGoals.isPending}>
        Save goals
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 4 },
  hint: { opacity: 0.7, marginBottom: 12 },
  input: { marginBottom: 8 },
});
