import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import type { ClinicalNote } from '@/features/clinical/api/clinicalApi';
import { useEncounterActions } from '@/features/clinical/hooks/useClinicalQueries';
import { appColors, layout } from '@/shared/theme';

type Props = {
  encounterId: string;
  notes: ClinicalNote[];
  visitReason?: string;
  canEdit: boolean;
  onMessage: (message: string) => void;
};

function toQuickForm(note: ClinicalNote | undefined, visitReason?: string) {
  if (!note) {
    return { findings: visitReason?.trim() ?? '', plan: '' };
  }
  return {
    findings: [note.chiefComplaint, note.hpi, note.examination].filter(Boolean).join('\n'),
    plan: [note.assessment, note.plan].filter(Boolean).join('\n'),
  };
}

export function CompactConsultForm({ encounterId, notes, visitReason, canEdit, onMessage }: Props) {
  const actions = useEncounterActions(encounterId);
  const draft = notes.find((n) => n.noteType === 'CONSULTATION' && n.status === 'DRAFT');
  const latest = draft ?? notes.find((n) => n.noteType === 'CONSULTATION');
  const isFinal = latest?.status === 'FINAL' && !draft;
  const readOnly = !canEdit || isFinal;

  const [findings, setFindings] = useState('');
  const [plan, setPlan] = useState('');

  useEffect(() => {
    const q = toQuickForm(latest, visitReason);
    setFindings(q.findings);
    setPlan(q.plan);
  }, [latest?.noteId, latest?.status, visitReason, latest?.chiefComplaint, latest?.assessment]);

  const payload = () => ({
    noteType: 'CONSULTATION',
    chiefComplaint: findings.trim() || undefined,
    assessment: plan.trim() || undefined,
  });

  const pending =
    actions.createNote.isPending
    || actions.updateNote.isPending
    || actions.finalizeNote.isPending;

  const saveDraft = async () => {
    if (!findings.trim() && !plan.trim()) {
      onMessage('Enter findings or assessment before saving');
      return;
    }
    try {
      if (draft) {
        await actions.updateNote.mutateAsync({ noteId: draft.noteId, payload: payload() });
      } else {
        await actions.createNote.mutateAsync(payload());
      }
      onMessage('Consultation draft saved');
    } catch {
      onMessage('Failed to save consultation');
    }
  };

  const finalize = async () => {
    try {
      let noteId = draft?.noteId;
      if (!noteId) {
        const created = await actions.createNote.mutateAsync(payload());
        noteId = created.noteId;
      } else {
        await actions.updateNote.mutateAsync({ noteId, payload: payload() });
      }
      await actions.finalizeNote.mutateAsync(noteId);
      onMessage('Consultation finalized');
    } catch {
      onMessage('Failed to finalize consultation');
    }
  };

  return (
    <View style={styles.wrap}>
      <Text variant="titleMedium">Consultation</Text>
      {isFinal ? (
        <HelperText type="info" visible>
          Finalized — checkout gate satisfied for consult
        </HelperText>
      ) : null}
      <TextInput
        label="Complaint & examination"
        mode="outlined"
        multiline
        numberOfLines={3}
        value={findings}
        onChangeText={setFindings}
        disabled={readOnly || pending}
        style={styles.input}
      />
      <TextInput
        label="Assessment & plan"
        mode="outlined"
        multiline
        numberOfLines={3}
        value={plan}
        onChangeText={setPlan}
        disabled={readOnly || pending}
        style={styles.input}
      />
      {!readOnly ? (
        <View style={styles.actions}>
          <Button mode="outlined" loading={pending} onPress={() => void saveDraft()}>
            Save draft
          </Button>
          <Button mode="contained" loading={pending} onPress={() => void finalize()}>
            Finalize
          </Button>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: layout.stackGap, marginTop: layout.stackGap },
  input: { backgroundColor: appColors.surface },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
