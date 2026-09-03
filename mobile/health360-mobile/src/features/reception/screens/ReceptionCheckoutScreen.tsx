import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Menu, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { useBillingMutations, useEncounterInvoice } from '@/features/billing/hooks/useBillingQueries';
import { useEncounter, useEncounterNotes, useEncounterPrescriptions } from '@/features/clinical/hooks/useClinicalQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { ReceptionPatientsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<ReceptionPatientsStackParamList, 'Checkout'>;
type LineForm = { description: string; quantity: string; unitPrice: string };

const PAYMENT_METHODS = ['CASH', 'UPI', 'CARD', 'OTHER'] as const;

function checkoutBlockers(notes: { noteType: string; status?: string }[], prescriptions: { status: string }[]): string[] {
  const missing: string[] = [];
  if (!notes.some((note) => note.noteType === 'CONSULTATION' && note.status === 'FINAL')) {
    missing.push('finalized consultation report');
  }
  if (!prescriptions.some((rx) => rx.status === 'SIGNED')) {
    missing.push('signed e-prescription');
  }
  return missing;
}

export function ReceptionCheckoutScreen({ route }: Props) {
  const { encounterId } = route.params;
  const { data: encounter, isLoading: encounterLoading } = useEncounter(encounterId);
  const { data: invoice, isLoading: invoiceLoading, refetch } = useEncounterInvoice(encounterId);
  const { data: notes = [] } = useEncounterNotes(encounterId);
  const { data: prescriptions = [] } = useEncounterPrescriptions(encounterId);
  const mutations = useBillingMutations(encounterId);

  const [lines, setLines] = useState<LineForm[]>([
    { description: 'OPD consultation', quantity: '1', unitPrice: '500' },
  ]);
  const [notesText, setNotesText] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<(typeof PAYMENT_METHODS)[number]>('CASH');
  const [methodMenu, setMethodMenu] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const missing = checkoutBlockers(notes, prescriptions);
  const checkoutReady = missing.length === 0;
  const lineTotal = useMemo(
    () => lines.reduce((sum, line) => sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0), 0),
    [lines],
  );
  const outstanding = invoice
    ? Number(invoice.totalAmount) - Number(invoice.amountPaid)
    : lineTotal;
  const canPay = Boolean(invoice && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && outstanding > 0);

  useEffect(() => {
    if (invoice && outstanding > 0) {
      setPaymentAmount(outstanding.toFixed(2));
    }
  }, [invoice?.invoiceId, invoice?.totalAmount, invoice?.amountPaid, outstanding]);

  const issueInvoice = async () => {
    setError(null);
    setSuccess(null);
    if (!checkoutReady) {
      setError(`Checkout is blocked until the doctor has a ${missing.join(' and a ')}.`);
      return;
    }
    const payloadLines = lines
      .filter((line) => line.description.trim())
      .map((line) => ({
        description: line.description.trim(),
        quantity: Number(line.quantity) || 1,
        unitPrice: Number(line.unitPrice) || 0,
        sourceType: 'ENCOUNTER',
      }));
    if (payloadLines.length === 0) {
      setError('Add at least one charge line.');
      return;
    }
    try {
      await mutations.createInvoice.mutateAsync({
        encounterId,
        notes: notesText.trim() || undefined,
        lineItems: payloadLines,
      });
      setSuccess('Invoice issued.');
      await refetch();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to issue invoice'));
    }
  };

  const collectPayment = async () => {
    if (!invoice) return;
    setError(null);
    setSuccess(null);
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0) {
      setError('Enter a valid payment amount.');
      return;
    }
    try {
      await mutations.recordPayment.mutateAsync({
        invoiceId: invoice.invoiceId,
        payload: { amount, paymentMethod, notes: notesText.trim() || undefined },
      });
      setSuccess('Payment recorded.');
      await refetch();
    } catch (e) {
      setError(getApiErrorMessage(e, 'Unable to record payment'));
    }
  };

  if (encounterLoading || invoiceLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenIntro
        description={
          encounter
            ? `${encounter.patientName ?? 'Patient'}${encounter.uhid ? ` · ${encounter.uhid}` : ''} · ${encounter.encounterNumber}`
            : 'Issue invoice and record desk payment.'
        }
      />
      {!invoice && !checkoutReady ? (
        <Text style={styles.warn}>
          Checkout is locked until the doctor finalizes consultation and signs an e-prescription
          {missing.length ? ` (missing: ${missing.join(', ')})` : ''}.
        </Text>
      ) : null}
      {success ? <Text style={styles.ok}>{success}</Text> : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}

      {invoice ? (
        <AppCard style={styles.card}>
          <View style={styles.row}>
            <Text variant="titleMedium">{invoice.invoiceNumber}</Text>
            <Chip compact>{invoice.status}</Chip>
          </View>
          <Text style={styles.meta}>
            Total ₹{Number(invoice.totalAmount).toFixed(2)} · Paid ₹{Number(invoice.amountPaid).toFixed(2)}
            · Outstanding ₹{outstanding.toFixed(2)}
          </Text>
          {invoice.lineItems.map((line) => (
            <Text key={line.lineItemId} style={styles.meta}>
              {line.description} — {line.quantity} × ₹{Number(line.unitPrice).toFixed(2)}
            </Text>
          ))}
          {canPay ? (
            <>
              <TextInput
                label="Amount"
                keyboardType="decimal-pad"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                style={styles.field}
              />
              <Menu
                visible={methodMenu}
                onDismiss={() => setMethodMenu(false)}
                anchor={
                  <Button mode="outlined" onPress={() => setMethodMenu(true)} style={styles.field}>
                    Method: {paymentMethod}
                  </Button>
                }
              >
                {PAYMENT_METHODS.map((method) => (
                  <Menu.Item
                    key={method}
                    title={method}
                    onPress={() => {
                      setPaymentMethod(method);
                      setMethodMenu(false);
                    }}
                  />
                ))}
              </Menu>
              <Button
                mode="contained"
                loading={mutations.recordPayment.isPending}
                onPress={() => void collectPayment()}
              >
                Record payment
              </Button>
            </>
          ) : invoice.status === 'PAID' ? (
            <Text style={styles.ok}>Invoice fully paid.</Text>
          ) : null}
        </AppCard>
      ) : (
        <AppCard style={styles.card}>
          <Text variant="titleMedium" style={styles.cardTitle}>Create invoice</Text>
          {lines.map((line, idx) => (
            <View key={idx}>
              <TextInput
                label="Description"
                value={line.description}
                onChangeText={(description) =>
                  setLines((prev) => prev.map((item, i) => (i === idx ? { ...item, description } : item)))
                }
                style={styles.field}
              />
              <View style={styles.row}>
                <TextInput
                  label="Qty"
                  keyboardType="number-pad"
                  value={line.quantity}
                  onChangeText={(quantity) =>
                    setLines((prev) => prev.map((item, i) => (i === idx ? { ...item, quantity } : item)))
                  }
                  style={styles.half}
                />
                <TextInput
                  label="Unit price"
                  keyboardType="decimal-pad"
                  value={line.unitPrice}
                  onChangeText={(unitPrice) =>
                    setLines((prev) => prev.map((item, i) => (i === idx ? { ...item, unitPrice } : item)))
                  }
                  style={styles.half}
                />
              </View>
            </View>
          ))}
          <Button
            compact
            onPress={() => setLines((prev) => [...prev, { description: '', quantity: '1', unitPrice: '0' }])}
          >
            Add line
          </Button>
          <TextInput label="Notes" value={notesText} onChangeText={setNotesText} style={styles.field} />
          <Text style={styles.meta}>Estimated total: ₹{lineTotal.toFixed(2)}</Text>
          <Button
            mode="contained"
            disabled={!checkoutReady}
            loading={mutations.createInvoice.isPending}
            onPress={() => void issueInvoice()}
          >
            Issue invoice
          </Button>
        </AppCard>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: layout.stackGap },
  cardTitle: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  half: { flex: 1, marginBottom: 8 },
  field: { marginTop: 8, marginBottom: 8 },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  error: { color: appColors.error, marginBottom: layout.stackGap },
  ok: { color: appColors.success, marginBottom: layout.stackGap },
  warn: { color: appColors.warning, marginBottom: layout.stackGap },
});
