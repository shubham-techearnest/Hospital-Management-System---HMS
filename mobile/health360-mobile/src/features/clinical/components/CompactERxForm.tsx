import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import type { Prescription } from '@/features/clinical/api/clinicalApi';
import { useEncounterActions } from '@/features/clinical/hooks/useClinicalQueries';
import { AppCard } from '@/shared/components/AppCard';
import { appColors, layout } from '@/shared/theme';

type Line = { key: string; medicineName: string; doseText: string; frequency: string; durationDays: string };

type Props = {
  encounterId: string;
  prescriptions: Prescription[];
  canEdit: boolean;
  onMessage: (message: string) => void;
};

function emptyLine(): Line {
  return {
    key: `${Date.now()}-${Math.random()}`,
    medicineName: '',
    doseText: '',
    frequency: '',
    durationDays: '',
  };
}

export function CompactERxForm({ encounterId, prescriptions, canEdit, onMessage }: Props) {
  const actions = useEncounterActions(encounterId);
  const draft = prescriptions.find((p) => p.status === 'DRAFT');
  const signed = prescriptions.filter((p) => p.status === 'SIGNED');
  const readOnly = !canEdit || signed.length > 0;

  const [lines, setLines] = useState<Line[]>([emptyLine()]);

  useEffect(() => {
    if (draft?.items?.length) {
      setLines(
        draft.items.map((item) => ({
          key: item.itemId,
          medicineName: item.medicineName ?? '',
          doseText: item.doseText ?? '',
          frequency: item.frequency ?? '',
          durationDays: item.durationDays != null ? String(item.durationDays) : '',
        })),
      );
    } else if (!draft) {
      setLines([emptyLine()]);
    }
  }, [draft?.prescriptionId, draft?.items]);

  const pending =
    actions.createPrescription.isPending
    || actions.updatePrescription.isPending
    || actions.signPrescription.isPending
    || actions.declareNoMedication.isPending;

  const saveAndSign = async () => {
    const items = lines
      .filter((l) => l.medicineName.trim())
      .map((l) => ({
        medicineName: l.medicineName.trim(),
        doseText: l.doseText.trim() || undefined,
        frequency: l.frequency.trim() || undefined,
        durationDays: l.durationDays ? Number(l.durationDays) : undefined,
      }));
    if (items.length === 0) {
      onMessage('Add at least one medicine, or declare no medication');
      return;
    }
    try {
      let prescriptionId = draft?.prescriptionId;
      if (prescriptionId) {
        await actions.updatePrescription.mutateAsync({
          prescriptionId,
          payload: { items },
        });
      } else {
        const created = await actions.createPrescription.mutateAsync({ items });
        prescriptionId = created.prescriptionId;
      }
      await actions.signPrescription.mutateAsync(prescriptionId);
      onMessage('Prescription signed');
    } catch {
      onMessage('Failed to sign prescription');
    }
  };

  const declareNoMed = async () => {
    try {
      await actions.declareNoMedication.mutateAsync();
      onMessage('No medication declared');
    } catch {
      onMessage('Failed to declare no medication');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium">E-prescription</Text>
      {signed.length > 0 ? (
        <HelperText type="info" visible>
          Signed — checkout gate satisfied for Rx
        </HelperText>
      ) : null}

      {signed.map((rx) => (
        <AppCard key={rx.prescriptionId} style={styles.card}>
          <Text variant="labelLarge">{rx.prescriptionNumber} · {rx.status}</Text>
          {rx.notes ? <Text style={styles.meta}>{rx.notes}</Text> : null}
          {rx.items.map((item) => (
            <Text key={item.itemId}>
              {item.medicineName}
              {item.doseText ? ` · ${item.doseText}` : ''}
              {item.frequency ? ` · ${item.frequency}` : ''}
            </Text>
          ))}
        </AppCard>
      ))}

      {!readOnly ? (
        <>
          {lines.map((line, index) => (
            <View key={line.key} style={styles.line}>
              <TextInput
                label="Medicine"
                mode="outlined"
                value={line.medicineName}
                onChangeText={(v) =>
                  setLines((prev) => prev.map((l, i) => (i === index ? { ...l, medicineName: v } : l)))
                }
                disabled={pending}
                style={styles.input}
              />
              <TextInput
                label="Dose"
                mode="outlined"
                value={line.doseText}
                onChangeText={(v) =>
                  setLines((prev) => prev.map((l, i) => (i === index ? { ...l, doseText: v } : l)))
                }
                disabled={pending}
                style={styles.input}
              />
              <TextInput
                label="Frequency"
                mode="outlined"
                value={line.frequency}
                onChangeText={(v) =>
                  setLines((prev) => prev.map((l, i) => (i === index ? { ...l, frequency: v } : l)))
                }
                disabled={pending}
                style={styles.input}
              />
              <TextInput
                label="Days"
                mode="outlined"
                keyboardType="number-pad"
                value={line.durationDays}
                onChangeText={(v) =>
                  setLines((prev) => prev.map((l, i) => (i === index ? { ...l, durationDays: v } : l)))
                }
                disabled={pending}
                style={styles.input}
              />
            </View>
          ))}
          <View style={styles.actions}>
            <Button mode="text" onPress={() => setLines((prev) => [...prev, emptyLine()])} disabled={pending}>
              Add line
            </Button>
            <Button mode="outlined" loading={pending} onPress={() => void declareNoMed()}>
              No medication
            </Button>
            <Button mode="contained" loading={pending} onPress={() => void saveAndSign()}>
              Sign Rx
            </Button>
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: layout.stackGap, marginTop: layout.stackGap },
  card: { marginTop: 4 },
  meta: { color: appColors.textSecondary, marginBottom: 4 },
  line: { gap: 8, marginBottom: 8 },
  input: { backgroundColor: appColors.surface },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
