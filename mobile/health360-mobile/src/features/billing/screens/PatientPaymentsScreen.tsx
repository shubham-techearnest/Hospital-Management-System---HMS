import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Divider, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useMyInvoices } from '@/features/billing/hooks/useBillingQueries';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import { appColors, layout } from '@/shared/theme';
import type { AppointmentsStackParamList, HomeStackParamList } from '@/navigation/types';

type OpdNavParams = HomeStackParamList & AppointmentsStackParamList;

function invoiceStatusColor(status: string): string {
  if (status === 'PAID') return appColors.success;
  if (status === 'CANCELLED') return appColors.textSecondary;
  return appColors.warning;
}

function formatCurrency(amount: number): string {
  return `₹${Number(amount).toFixed(2)}`;
}

function formatDate(iso?: string): string {
  return iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
}

export function PatientPaymentsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OpdNavParams>>();
  const { data, isLoading, error, refetch, isRefetching } = useMyInvoices();
  const invoices = data?.content ?? [];
  const outstanding = invoices
    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) - Number(inv.amountPaid)), 0);

  if (isLoading) {
    return (
      <ScreenContainer>
        <ActivityIndicator />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      >
        <PageHero
          compact
          title="Payments"
          subtitle="Invoices from your hospital visits. Pay at the hospital billing counter."
        />

        {error ? (
          <AppCard style={styles.errorCard}>
            <Text style={styles.errorText}>
              {getApiErrorMessage(error, 'Unable to load invoices.')}
            </Text>
          </AppCard>
        ) : null}

        {!error ? (
          <AppCard style={styles.summaryCard}>
            <Text variant="labelLarge" style={styles.summaryLabel}>Outstanding balance</Text>
            <Text variant="headlineSmall" style={styles.summaryAmount}>
              {formatCurrency(outstanding)}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              {invoices.length} invoice{invoices.length === 1 ? '' : 's'} on record
            </Text>
          </AppCard>
        ) : null}

        {!error && invoices.length === 0 ? (
          <EmptyState icon="receipt" title="No invoices yet" message="Visit bills will appear here after checkout." />
        ) : null}

        {invoices.map((inv) => (
          <AppCard key={inv.invoiceId} style={styles.card}>
            <View style={styles.row}>
              <Text variant="titleMedium">{inv.invoiceNumber}</Text>
              <Chip
                compact
                textStyle={{ color: invoiceStatusColor(inv.status) }}
                style={{ backgroundColor: `${invoiceStatusColor(inv.status)}22` }}
              >
                {inv.status}
              </Chip>
            </View>
            <Text style={styles.meta}>
              Total {formatCurrency(inv.totalAmount)} · Paid {formatCurrency(inv.amountPaid)}
            </Text>
            {inv.issuedAt ? <Text style={styles.meta}>Issued {formatDate(inv.issuedAt)}</Text> : null}
            {inv.lineItems.length > 0 ? (
              <View style={styles.lines}>
                <Divider style={styles.divider} />
                {inv.lineItems.map((line) => (
                  <View key={line.lineItemId} style={styles.lineRow}>
                    <Text variant="bodyMedium" style={styles.lineDesc}>{line.description}</Text>
                    <Text variant="bodyMedium" style={styles.lineAmount}>
                      {formatCurrency(line.lineTotal)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}
            {inv.encounterId ? (
              <Button
                mode="text"
                compact
                onPress={() => navigation.navigate('EncounterDetail', { encounterId: inv.encounterId })}
                style={styles.visitBtn}
              >
                View visit summary
              </Button>
            ) : null}
          </AppCard>
        ))}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: layout.screenPaddingBottom, gap: layout.stackGap },
  summaryCard: { gap: 4 },
  summaryLabel: { color: appColors.textSecondary },
  summaryAmount: { fontWeight: '700', color: appColors.textPrimary },
  meta: { color: appColors.textSecondary, marginTop: 2 },
  errorCard: { backgroundColor: appColors.errorContainer },
  errorText: { color: appColors.error },
  card: { gap: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  lines: { marginTop: layout.stackGap },
  divider: { marginBottom: layout.stackGap },
  lineRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  lineDesc: { flex: 1, color: appColors.textPrimary },
  lineAmount: { color: appColors.textSecondary },
  visitBtn: { alignSelf: 'flex-start', marginTop: 4 },
});
