import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { StatusChip } from '@/shared/components/StatusChip';
import { appColors, layout } from '@/shared/theme';
import { usePendingVerifications } from '../hooks/useAdminQueries';
import type { AdminStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<AdminStackParamList, 'VerificationQueue'>;

export function AdminVerificationQueueScreen({ navigation }: Props) {
  const { data, isLoading, isError, refetch, isFetching } = usePendingVerifications();
  const items = data?.content ?? [];

  const listHeader = (
    <View style={styles.header}>
      <ScreenIntro description="Review pending doctor verification requests submitted from the Verification page." />
      {isError ? <Text style={styles.error}>Unable to load verification queue.</Text> : null}
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : items}
        keyExtractor={(item) => item.doctorId}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !isLoading ? <EmptyState icon="file-certificate-outline" title="No pending verifications" /> : null
        }
        refreshControl={<RefreshControl refreshing={isFetching && !isLoading} onRefresh={refetch} />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Text variant="titleSmall" style={styles.name}>{item.doctorName}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              Reg: {item.medicalRegistrationNumber ?? '—'}
            </Text>
            <Text variant="bodySmall" style={styles.meta}>
              Submitted: {item.submittedAt ? new Date(item.submittedAt).toLocaleString() : '—'}
            </Text>
            <View style={styles.row}>
              <StatusChip status={item.verificationStatus} />
              <Button
                mode="contained"
                compact
                onPress={() => navigation.navigate('VerificationReview', { doctorId: item.doctorId })}
              >
                Review
              </Button>
            </View>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: layout.stackGap },
  list: { paddingBottom: layout.sectionGap, gap: layout.stackGap },
  card: { gap: 6 },
  name: { fontWeight: '600', color: appColors.textPrimary },
  meta: { color: appColors.textSecondary },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: layout.stackGap },
  error: { color: appColors.error, marginBottom: layout.stackGap },
  loader: { marginVertical: layout.stackGap },
});
