import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { PageHero } from '@/shared/components/PageHero';
import { useMyEncounters } from '@/features/clinical/hooks/useClinicalQueries';
import { encounterStatusLabel, formatEncounterDate } from '@/features/clinical/utils/encounterUtils';
import { queueStatusLabel } from '@/features/opd/utils/visitStatus';
import { appColors, layout } from '@/shared/theme';
import type { AppointmentsStackParamList, HomeStackParamList } from '@/navigation/types';

type OpdNavParams = HomeStackParamList & AppointmentsStackParamList;

export function EncountersListScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<OpdNavParams>>();
  const { data, isLoading, refetch, isRefetching } = useMyEncounters();
  const encounters = data?.content ?? [];

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : encounters}
        keyExtractor={(item) => item.encounterId}
        refreshing={isRefetching}
        onRefresh={refetch}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <PageHero compact subtitle="Clinical visits and OPD encounters." />
            {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="hospital-box-outline"
              title="No visits on record"
              message="Request an OPD visit at your hospital to start your care journey."
              actionLabel="Request OPD"
              onAction={() => navigation.navigate('RequestOpd')}
            />
          ) : null
        }
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <View style={styles.row}>
              <Text variant="titleMedium">{item.encounterNumber}</Text>
              <View style={styles.chips}>
                <Chip compact>{encounterStatusLabel(item.status)}</Chip>
                {item.queueStatus ? (
                  <Chip compact mode="outlined">{queueStatusLabel(item.queueStatus)}</Chip>
                ) : null}
              </View>
            </View>
            <Text style={styles.meta}>
              {item.encounterType} · {formatEncounterDate(item.startedAt ?? item.createdAt)}
            </Text>
            {item.visitReason ? <Text style={styles.meta}>{item.visitReason}</Text> : null}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('EncounterDetail', { encounterId: item.encounterId })}
              style={styles.btn}
            >
              View details
            </Button>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: layout.stackGap },
  loader: { marginVertical: layout.sectionGap },
  listContent: { paddingBottom: layout.screenPaddingBottom },
  card: { marginBottom: layout.stackGap },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 1, justifyContent: 'flex-end' },
  meta: { color: appColors.textSecondary, marginTop: 4 },
  btn: { marginTop: layout.stackGap },
});
