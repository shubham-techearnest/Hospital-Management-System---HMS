import { useEffect, useState } from 'react';
import { Alert, Button, Stack, TextField } from '@mui/material';
import { usePatientProfile } from '../../../hooks/usePatientQueries';
import { useUpdateHealthGoals } from '../../../hooks/usePatientExtendedQueries';
import type { ProfileSectionCallbacks } from '../types';

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
    <Stack spacing={2}>
      <Alert severity="info">Set targets to track progress on your dashboard.</Alert>
      <TextField label="Target weight (kg)" type="number" value={form.targetWeightKg} onChange={(e) => setForm({ ...form, targetWeightKg: e.target.value })} />
      <TextField label="Daily steps goal" type="number" value={form.dailyStepsGoal} onChange={(e) => setForm({ ...form, dailyStepsGoal: e.target.value })} />
      <TextField label="Sleep hours goal" type="number" value={form.sleepHoursGoal} onChange={(e) => setForm({ ...form, sleepHoursGoal: e.target.value })} />
      <TextField label="Water intake goal (ml)" type="number" value={form.waterIntakeMlGoal} onChange={(e) => setForm({ ...form, waterIntakeMlGoal: e.target.value })} />
      <TextField label="Weekly exercise minutes goal" type="number" value={form.weeklyExerciseMinutesGoal} onChange={(e) => setForm({ ...form, weeklyExerciseMinutesGoal: e.target.value })} />
      <Button variant="contained" onClick={handleSave} disabled={updateGoals.isPending}>Save goals</Button>
    </Stack>
  );
}
