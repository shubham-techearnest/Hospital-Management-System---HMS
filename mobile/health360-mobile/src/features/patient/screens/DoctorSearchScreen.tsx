import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Searchbar, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDoctorSearch } from '@/features/search/hooks/useDoctorSearch';
import { useUserLocation } from '@/features/location/hooks/useUserLocation';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors, layout } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import type { CareStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'DoctorSearch'>;

function travelEstimateMinutes(distanceKm?: number) {
  if (distanceKm == null) return null;
  return Math.round(distanceKm * 2.5);
}

export function DoctorSearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [city, setCity] = useState('');
  const [availableToday, setAvailableToday] = useState(false);
  const [useNearby, setUseNearby] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { coords, loading: locLoading, detect } = useUserLocation();

  const { data, isLoading, error, refetch, isFetching } = useDoctorSearch({
    q: query || undefined,
    specialization: specialization || undefined,
    city: city || undefined,
    availableToday: availableToday || undefined,
    latitude: useNearby && coords ? coords.latitude : undefined,
    longitude: useNearby && coords ? coords.longitude : undefined,
    page: 0,
    size: 20,
  });

  const results = data?.content ?? [];
  const runSearch = () => setQuery(q.trim());

  const listHeader = (
    <View style={styles.header}>
      <PageHero compact subtitle="Search by name, specialty, city, or availability." />

      <Searchbar
        placeholder="Doctor name, specialty, hospital..."
        value={q}
        onChangeText={setQ}
        onSubmitEditing={runSearch}
        onIconPress={runSearch}
        style={styles.search}
        inputStyle={styles.searchInput}
      />

      <View style={styles.quickFilters}>
        <Chip
          compact
          selected={availableToday}
          onPress={() => setAvailableToday((v) => !v)}
          style={styles.filterChip}
        >
          Today
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
          {useNearby && coords ? 'Nearby' : 'Near me'}
        </Chip>
        <Chip
          compact
          selected={filtersOpen}
          onPress={() => setFiltersOpen((v) => !v)}
          icon={filtersOpen ? 'chevron-up' : 'tune-variant'}
          style={styles.filterChip}
        >
          Filters
        </Chip>
        <Button mode="contained" compact onPress={runSearch} style={styles.searchBtn}>
          Search
        </Button>
      </View>

      {filtersOpen ? (
        <View style={styles.advanced}>
          <TextInput label="Specialty" mode="outlined" dense value={specialization} onChangeText={setSpecialization} style={styles.input} />
          <TextInput label="City" mode="outlined" dense value={city} onChangeText={setCity} style={styles.input} />
        </View>
      ) : null}

      {useNearby && locLoading ? <Text style={styles.hint}>Detecting location…</Text> : null}
      <Button mode="text" compact onPress={() => navigation.navigate('HospitalSearch')}>Find hospitals instead</Button>

      {error ? (
        <AppCard style={styles.card}>
          <Text style={styles.error}>{getApiErrorMessage(error, 'Unable to load doctors.')}</Text>
          <Button compact onPress={() => refetch()}>Retry</Button>
        </AppCard>
      ) : null}
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
      {isFetching && !isLoading ? <Text style={styles.hint}>Updating…</Text> : null}
      {!isLoading && !error && results.length === 0 ? (
        <Text style={styles.empty}>No doctors found. Try different filters.</Text>
      ) : null}
    </View>
  );

  return (
    <ScreenContainer scroll={false} centered={false}>
      <FlatList
        style={styles.list}
        data={isLoading || error ? [] : results}
        keyExtractor={(item) => item.doctorId}
        ListHeaderComponent={listHeader}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <AppCard style={styles.card}>
            <Text variant="titleSmall" style={styles.doctorName}>{item.name}</Text>
            <Text variant="bodySmall">{item.specialization ?? 'General consultation'}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              {[item.hospitalName, item.city].filter(Boolean).join(' · ')}
            </Text>
            <View style={styles.chips}>
              {item.availableToday ? <Chip compact style={styles.metaChip}>Today</Chip> : null}
              {item.distanceKm != null ? <Chip compact style={styles.metaChip}>{item.distanceKm} km</Chip> : null}
              {item.averageRating != null ? <Chip compact style={styles.metaChip}>★ {item.averageRating}</Chip> : null}
            </View>
            <View style={styles.actions}>
              <Button mode="outlined" compact onPress={() => navigation.navigate('PublicDoctorProfile', { doctorId: item.doctorId })}>
                Profile
              </Button>
              <Button mode="contained" compact onPress={() => navigation.navigate('BookAppointment', { doctorId: item.doctorId })}>
                Book
              </Button>
            </View>
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
  searchBtn: { marginLeft: 'auto' },
  advanced: { gap: 6, marginBottom: 6 },
  input: { marginBottom: 0 },
  hint: { color: appColors.textSecondary, fontSize: 12, marginBottom: 4 },
  loader: { marginVertical: 12 },
  card: { marginTop: 8, gap: 4, padding: layout.cardPadding },
  doctorName: { fontWeight: '600' },
  meta: { color: appColors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  metaChip: { height: 26 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  empty: { textAlign: 'center', color: appColors.textSecondary, marginTop: 12 },
  error: { color: appColors.error, marginBottom: 4 },
});
