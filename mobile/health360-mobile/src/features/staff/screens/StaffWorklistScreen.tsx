import { FlatList, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { StaffScopeBar } from '@/features/opd/components/StaffScopeBar';
import { useStaffHospitalScope } from '@/features/hospital/hooks/useStaffHospitalScope';
import { useStaffWorklist, type StaffWorklistKind } from '@/features/staff/hooks/useStaffWorklist';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors, layout } from '@/shared/theme';

type Props = {
  kind: StaffWorklistKind;
  title: string;
  emptyLabel: string;
  hint: string;
};

export function StaffWorklistScreen({ kind, title, emptyLabel, hint }: Props) {
  const scope = useStaffHospitalScope();
  const { data: rows = [], isLoading, isError, isFetching, refetch } = useStaffWorklist(
    kind,
    scope.scopeReady ? scope.hospitalId : undefined,
    scope.scopeReady ? scope.branchId : undefined,
  );

  return (
    <ScreenContainer>
      <Text variant="headlineSmall" style={styles.title}>{title}</Text>
      <Text style={styles.hint}>{hint}</Text>

      {scope.isLoading ? <ActivityIndicator /> : null}
      {scope.isError || !scope.hasAssignment ? (
        <Text style={styles.empty}>No hospital assignment found for this account.</Text>
      ) : (
        <StaffScopeBar
          scopes={scope.scopes}
          activeScopeIndex={scope.activeScopeIndex}
          onScopeChange={scope.setActiveScopeIndex}
          branches={scope.branches}
          branchId={scope.branchId}
          onBranchChange={scope.setBranchId}
          hospitalName={scope.hospitalName}
        />
      )}

      {!scope.scopeReady ? null : isLoading ? (
        <ActivityIndicator style={styles.loader} />
      ) : isError ? (
        <Text style={styles.empty}>Unable to load worklist for this scope.</Text>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(item) => item.id}
          refreshing={isFetching && !isLoading}
          onRefresh={() => { void refetch(); }}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>{emptyLabel}</Text>}
          renderItem={({ item }) => (
            <AppCard style={styles.card}>
              <Text variant="titleSmall">{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              {item.meta ? <Text style={styles.meta}>{item.meta}</Text> : null}
            </AppCard>
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { fontWeight: '700', marginBottom: 4 },
  hint: { color: appColors.textSecondary, marginBottom: layout.stackGap, lineHeight: layout.textLineHeight },
  loader: { marginTop: layout.sectionGap },
  list: { paddingBottom: layout.screenPaddingBottom, gap: layout.stackGap },
  card: { marginBottom: layout.stackGap },
  subtitle: { color: appColors.textPrimary, marginTop: 2 },
  meta: { color: appColors.textSecondary, marginTop: 4, fontSize: 12 },
  empty: { color: appColors.textSecondary, marginTop: layout.sectionGap },
});
