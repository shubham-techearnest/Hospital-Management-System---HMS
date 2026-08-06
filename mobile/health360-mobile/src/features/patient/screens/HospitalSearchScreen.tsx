import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Searchbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHospitalSearch } from '@/features/search/hooks/useHospitalSearch';
import { useUserLocation } from '@/features/location/hooks/useUserLocation';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors, layout } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import type { CareStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'HospitalSearch'>;

export function HospitalSearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [emergency24x7, setEmergency24x7] = useState(false);
  const [useNearby, setUseNearby] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { coords, loading: locLoading, detect } = useUserLocation();

  const { data, isLoading, error, refetch } = useHospitalSearch({
    q: query || undefined,
    department: department || undefined,
    emergency24x7: emergency24x7 || undefined,
    latitude: useNearby && coords ? coords.latitude : undefined,
    longitude: useNearby && coords ? coords.longitude : undefined,
    page: 0,
    size: 20,
  });

  const results = data?.content ?? [];
  const runSearch = () => setQuery(q.trim());

  const listHeader = (
    <View style={styles.header}>
      <PageHero compact subtitle="Search hospitals by name, department, or emergency services." />

      <Searchbar
        placeholder="Hospital name, department..."
        value={q}
        onChangeText={setQ}
        onSubmitEditing={runSearch}
        onIconPress={runSearch}
        style={styles.search}
        inputStyle={styles.searchInput}
      />

      <View style={styles.quickFilters}>
        <Chip compact selected={emergency24x7} onPress={() => setEmergency24x7((v) => !v)} style={styles.filterChip}>
          24×7
        </Chip>
        <Chip
          compact
          selected={useNearby}
          onPress={() => {
            setUseNearby((v) => {
              const next = !v;
              if (next && !coords) void detect();
              return next;
            });
          }}
          style={styles.filterChip}
        >
          Near me
        </Chip>
        <Chip compact selected={filtersOpen} onPress={() => setFiltersOpen((v) => !v)} icon="tune-variant" style={styles.filterChip}>
          Filters
        </Chip>
        <Button mode="contained" compact onPress={runSearch}>Search</Button>
      </View>

      {filtersOpen ? (
        <TextInput label="Department" mode="outlined" dense value={department} onChangeText={setDepartment} style={styles.input} />
      ) : null}

      {useNearby && locLoading ? <Text style={styles.hint}>Detecting location…</Text> : null}
      <Button mode="text" compact onPress={() => navigation.navigate('DoctorSearch')}>Find doctors instead</Button>

      {error ? (
        <AppCard style={styles.card}>
          <Text style={styles.error}>{getApiErrorMessage(error, 'Unable to load hospitals.')}</Text>
          <Button compact onPress={() => refetch()}>Retry</Button>
        </AppCard>
      ) : null}
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
      {!isLoading && !error && results.length === 0 ? <Text style={styles.empty}>No hospitals found.</Text> : null}
    </View>
  );

  return (
    <ScreenContainer scroll={false} centered={false}>
      <FlatList
        style={styles.list}
        data={isLoading || error ? [] : results}
        keyExtractor={(item) => item.hospitalId}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Text variant="titleSmall">{item.name}</Text>
            <Text variant="bodySmall" style={styles.meta}>{[item.branchName, item.city].filter(Boolean).join(' · ')}</Text>
            <View style={styles.chips}>
              {item.emergencyAvailable24x7 ? <Chip compact style={styles.metaChip}>24×7</Chip> : null}
              {item.icuAvailable ? <Chip compact style={styles.metaChip}>ICU</Chip> : null}
              {item.distanceKm != null ? <Chip compact style={styles.metaChip}>{item.distanceKm} km</Chip> : null}
            </View>
            <Button mode="outlined" compact onPress={() => navigation.navigate('PublicHospitalProfile', { hospitalId: item.hospitalId })}>
              View profile
            </Button>
          </AppCard>
        )}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: { flex: 1 },
  listContent: { paddingBottom: 32 },
  header: { gap: 0 },
  search: { marginBottom: 6, height: 44 },
  searchInput: { minHeight: 0, fontSize: 14 },
  quickFilters: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 6 },
  filterChip: { height: 30 },
  input: { marginBottom: 6 },
  hint: { color: appColors.textSecondary, fontSize: 12 },
  loader: { marginVertical: 12 },
  card: { marginTop: 8, gap: 4 },
  meta: { color: appColors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  metaChip: { height: 26 },
  empty: { textAlign: 'center', color: appColors.textSecondary, marginTop: 12 },
  error: { color: appColors.error },
});
