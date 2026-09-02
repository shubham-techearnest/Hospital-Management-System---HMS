import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Divider, Snackbar, Text } from 'react-native-paper';
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import {
  useEncounter,
  useEncounterDiagnoses,
  useEncounterNotes,
  useEncounterOrders,
  useEncounterPrescriptions,
  useEncounterWellnessPlan,
} from '@/features/clinical/hooks/useClinicalQueries';
import { useEncounterLabReports } from '@/features/lab/hooks/useLabQueries';
import { useEncounterImagingReports } from '@/features/radiology/hooks/useRadiologyQueries';
import { useEncounterInvoice } from '@/features/billing/hooks/useBillingQueries';
import { LeaveReviewDialog } from '@/features/review/components/LeaveReviewDialog';
import { encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { AppointmentsStackParamList, HomeStackParamList } from '@/navigation/types';

type OpdNavParams = HomeStackParamList & AppointmentsStackParamList;

export function EncounterDetailScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OpdNavParams>>();
  const route = useRoute<RouteProp<OpdNavParams, 'EncounterDetail'>>();
  const { encounterId } = route.params;
  const [reviewOpen, setReviewOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const { data: encounter, isLoading, error } = useEncounter(encounterId);
  const { data: diagnoses = [] } = useEncounterDiagnoses(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: orders = [] } = useEncounterOrders(encounterId);
  const { data: prescriptions = [] } = useEncounterPrescriptions(encounterId);
  const { data: wellness } = useEncounterWellnessPlan(encounterId);
  const { data: labReports = [] } = useEncounterLabReports(encounterId);
  const { data: imagingReports = [] } = useEncounterImagingReports(encounterId);
  const showBilling = encounter?.status === 'COMPLETED';
  const { data: invoice } = useEncounterInvoice(encounterId, showBilling);

  const consultationNote = notes.find((n) => n.noteType === 'CONSULTATION');
  const wellnessHasContent = Boolean(
    wellness?.diet ||
      wellness?.restGuidance ||
      wellness?.exercise ||
      wellness?.lifestyle ||
      wellness?.notes ||
      wellness?.followUpDate,
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  if (error || !encounter) {
    return (
      <ScreenContainer>
        <Text style={styles.error}>{getApiErrorMessage(error, 'Visit not found.')}</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <Button onPress={() => navigation.goBack()} compact>← Back</Button>

        <PageHero
          compact
          title={encounter.encounterNumber}
          subtitle={`${encounter.encounterType} · ${formatEncounterDate(encounter.startedAt ?? encounter.createdAt)}`}
        />

        <View style={styles.header}>
          <Chip compact>{encounterStatusLabel(encounter.status)}</Chip>
        </View>

        {encounter.visitReason ? (
          <AppCard>
            <Text variant="labelLarge">Reason for visit</Text>
            <Text>{encounter.visitReason}</Text>
          </AppCard>
        ) : null}

        {invoice ? (
          <AppCard style={styles.billingCard}>
            <Text variant="titleSmall">Visit bill</Text>
            <Text style={styles.meta}>
              {invoice.invoiceNumber} · {invoice.status}
            </Text>
            <Text style={styles.meta}>
              Total ₹{Number(invoice.totalAmount).toFixed(2)} · Paid ₹{Number(invoice.amountPaid).toFixed(2)}
            </Text>
            <Button mode="outlined" compact onPress={() => navigation.navigate('Payments')}>
              View all payments
            </Button>
          </AppCard>
        ) : null}

        <Section title="Diagnoses" empty={diagnoses.length === 0}>
          {diagnoses.map((dx) => (
            <AppCard key={dx.diagnosisId} style={styles.card}>
              <Text variant="titleSmall">{dx.diagnosisText}</Text>
              <Text style={styles.meta}>
                {[dx.diagnosisType, dx.diagnosisCode].filter(Boolean).join(' · ')}
              </Text>
            </AppCard>
          ))}
        </Section>

        <Section title="Prescriptions" empty={prescriptions.length === 0}>
          {prescriptions.map((rx) => (
            <AppCard key={rx.prescriptionId} style={styles.card}>
              <Text variant="titleSmall">{rx.prescriptionNumber} — {rx.status}</Text>
              {rx.items.map((item) => (
                <Text key={item.itemId} style={styles.meta}>
                  {item.medicineName}
                  {item.doseText ? ` · ${item.doseText}` : ''}
                  {item.frequency ? ` · ${item.frequency}` : ''}
                  {item.durationDays != null ? ` · ${item.durationDays}d` : ''}
                </Text>
              ))}
            </AppCard>
          ))}
        </Section>

        <Section title="Care plan / consultation notes" empty={!consultationNote && notes.length === 0}>
          {consultationNote ? (
            <AppCard style={styles.card}>
              {consultationNote.assessment ? (
                <Text style={styles.bodyText}>
                  <Text style={styles.strong}>Assessment: </Text>
                  {consultationNote.assessment}
                </Text>
              ) : null}
              {consultationNote.plan ? (
                <Text style={styles.bodyText}>
                  <Text style={styles.strong}>Plan: </Text>
                  {consultationNote.plan}
                </Text>
              ) : null}
              {!consultationNote.assessment && !consultationNote.plan && consultationNote.content ? (
                <Text style={styles.bodyText}>{consultationNote.content}</Text>
              ) : null}
            </AppCard>
          ) : (
            notes.map((note) => (
              <AppCard key={note.noteId} style={styles.card}>
                <Text variant="labelLarge">{note.noteType}</Text>
                <Text>{note.content}</Text>
              </AppCard>
            ))
          )}
        </Section>

        <Section title="Wellness & follow-up" empty={!wellnessHasContent}>
          <AppCard style={styles.card}>
            {wellness?.diet ? <Text style={styles.bodyText}><Text style={styles.strong}>Diet: </Text>{wellness.diet}</Text> : null}
            {wellness?.restGuidance ? <Text style={styles.bodyText}><Text style={styles.strong}>Rest: </Text>{wellness.restGuidance}</Text> : null}
            {wellness?.exercise ? <Text style={styles.bodyText}><Text style={styles.strong}>Exercise: </Text>{wellness.exercise}</Text> : null}
            {wellness?.lifestyle ? <Text style={styles.bodyText}><Text style={styles.strong}>Lifestyle: </Text>{wellness.lifestyle}</Text> : null}
            {wellness?.notes ? <Text style={styles.bodyText}><Text style={styles.strong}>Notes: </Text>{wellness.notes}</Text> : null}
            {wellness?.followUpDate ? (
              <Text style={styles.bodyText}>
                <Text style={styles.strong}>Follow-up: </Text>
                {wellness.followUpDate}
                {wellness.followUpReason ? ` — ${wellness.followUpReason}` : ''}
              </Text>
            ) : null}
          </AppCard>
        </Section>

        <Section title="Lab reports" empty={labReports.length === 0}>
          {labReports.map((report) => (
            <AppCard key={report.reportId} style={styles.card}>
              <Text variant="titleSmall">{report.testName}</Text>
              {report.summaryText ? <Text style={styles.meta}>{report.summaryText}</Text> : null}
              {report.results.map((r) => (
                <Text key={r.resultId} style={styles.meta}>
                  {r.parameterName}: {r.valueText} {r.unit ?? ''}
                  {r.referenceRange ? ` (ref ${r.referenceRange})` : ''}
                </Text>
              ))}
            </AppCard>
          ))}
        </Section>

        <Section title="Imaging results" empty={imagingReports.length === 0}>
          {imagingReports.map((report) => (
            <AppCard key={report.reportId} style={styles.card}>
              <Text variant="titleSmall">{report.modalityName} ({report.modalityCode})</Text>
              {report.findingsText ? <Text style={styles.bodyText}>{report.findingsText}</Text> : null}
              {report.impressionText ? (
                <Text style={styles.meta}>Impression: {report.impressionText}</Text>
              ) : null}
              {report.releasedAt ? (
                <Text style={styles.meta}>Released {formatEncounterDate(report.releasedAt)}</Text>
              ) : null}
            </AppCard>
          ))}
        </Section>

        <Section title="Orders" empty={orders.length === 0}>
          {orders.map((order) => (
            <AppCard key={order.orderId} style={styles.card}>
              <Text variant="titleSmall">{order.orderType} — {order.status}</Text>
              <Text style={styles.meta}>{order.items.map((i) => i.itemName).join(', ')}</Text>
            </AppCard>
          ))}
        </Section>

        {encounter.status === 'COMPLETED' ? (
          <View style={styles.actions}>
            {encounter.appointmentId ? (
              <Button mode="outlined" compact icon="star" onPress={() => setReviewOpen(true)}>
                Rate visit
              </Button>
            ) : null}
            <Button mode="contained" compact onPress={() => navigation.navigate('Prescriptions')}>
              Prescriptions
            </Button>
            <Button mode="outlined" compact onPress={() => navigation.navigate('Payments')}>
              Payments
            </Button>
            <Button mode="outlined" compact onPress={() => navigation.navigate('LabValues')}>
              Labs
            </Button>
          </View>
        ) : null}
      </ScrollView>

      {encounter.appointmentId ? (
        <LeaveReviewDialog
          visible={reviewOpen}
          appointmentId={encounter.appointmentId}
          onDismiss={() => setReviewOpen(false)}
          onSuccess={() => setSnack('Thank you for your review!')}
        />
      ) : null}

      <Snackbar visible={Boolean(snack)} onDismiss={() => setSnack(null)} duration={3000}>
        {snack}
      </Snackbar>
    </ScreenContainer>
  );
}

function Section({
  title,
  empty,
  children,
}: {
  title: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text variant="titleMedium">{title}</Text>
      <Divider style={styles.divider} />
      {empty ? <Text style={styles.empty}>None recorded.</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: layout.screenPaddingBottom, gap: layout.stackGap },
  billingCard: { gap: 6 },
  header: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { color: appColors.textSecondary, marginTop: 4, lineHeight: 20 },
  bodyText: { color: appColors.textPrimary, lineHeight: 22, marginBottom: 6 },
  strong: { fontWeight: '600' },
  section: { marginTop: layout.sectionGap },
  divider: { marginVertical: layout.stackGap },
  card: { marginTop: layout.stackGap, gap: 4 },
  empty: { color: appColors.textSecondary },
  error: { color: appColors.error, marginBottom: 12 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.stackGap, marginTop: layout.sectionGap },
});
