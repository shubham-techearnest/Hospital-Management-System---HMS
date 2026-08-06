import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Searchbar, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { EmptyState } from '@/shared/components/EmptyState';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { PageHero } from '@/shared/components/PageHero';
import { FilterChipRow } from '@/shared/components/FilterChipRow';
import { useUnifiedSearch } from '@/features/search/hooks/useUnifiedSearch';
import { useUserLocation } from '@/features/location/hooks/useUserLocation';
import { appColors, layout } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import type { CareStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'UnifiedSearch'>;
type SearchType = 'ALL' | 'DOCTOR' | 'HOSPITAL';

export function UnifiedSearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [type, setType] = useState<SearchType>('ALL');
  const [useNearby, setUseNearby] = useState(false);
  const { coords, loading: locLoading, detect } = useUserLocation();

  const { data, isLoading, error } = useUnifiedSearch({
    q: query || undefined,
    type,
    latitude: useNearby && coords ? coords.latitude : undefined,
    longitude: useNearby && coords ? coords.longitude : undefined,
    maxDistance: useNearby && coords ? 25 : undefined,
    page: 0,
    size: 20,
  });

  const doctors = data?.doctors ?? [];
  const hospitals = data?.hospitals ?? [];
  const showDoctors = type === 'ALL' || type === 'DOCTOR';
  const showHospitals = type === 'ALL' || type === 'HOSPITAL';

  const combined = [
    ...(showDoctors ? doctors.map((d) => ({ kind: 'doctor' as const, id: d.doctorId, data: d })) : []),
    ...(showHospitals ? hospitals.map((h) => ({ kind: 'hospital' as const, id: h.hospitalId, data: h })) : []),
  ];

  const runSearch = () => setQuery(q.trim());

  const listHeader = (
    <View style={styles.header}>
      <PageHero compact subtitle="Find verified doctors and hospitals from one place." />

      <Searchbar
        placeholder="Search doctors, hospitals, cities..."
        value={q}
        onChangeText={setQ}
        onSubmitEditing={runSearch}
        onIconPress={runSearch}
        style={styles.search}
        inputStyle={styles.searchInput}
      />

      <FilterChipRow
        value={type}
        options={[
          { value: 'ALL', label: `All (${(data?.doctorCount ?? 0) + (data?.hospitalCount ?? 0)})` },
          { value: 'DOCTOR', label: `Doctors (${data?.doctorCount ?? 0})` },
          { value: 'HOSPITAL', label: `Hospitals (${data?.hospitalCount ?? 0})` },
        ]}
        onChange={setType}
      />

      <View style={styles.inlineActions}>
        <Chip
          compact
          selected={useNearby && Boolean(coords)}
          onPress={() => { setUseNearby(true); void detect(); }}
          icon="map-marker"
          style={styles.filterChip}
        >
          {coords && useNearby ? 'Location on' : 'Near me'}
        </Chip>
        <Button mode="text" compact onPress={() => navigation.navigate('DoctorSearch')}>Doctor filters</Button>
        <Button mode="text" compact onPress={() => navigation.navigate('HospitalSearch')}>Hospital filters</Button>
      </View>
      {coords && useNearby ? (
        <Text variant="bodySmall" style={styles.locationHint}>
          Showing results near your location (within 25 km when available).
        </Text>
      ) : null}
      {error ? <Text style={styles.error}>{getApiErrorMessage(error, 'Search failed.')}</Text> : null}
      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
    </View>
  );

  return (
    <ScreenContainer scroll={false}>
      <FlatList
        data={isLoading ? [] : combined}
        keyExtractor={(item) => `${item.kind}-${item.id}`}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !isLoading && !error ? <EmptyState icon="magnify" title="No results found" message="Try a different search or enable location." /> : null
        }
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.kind === 'doctor') {
            const doctor = item.data;
            return (
              <Pressable onPress={() => navigation.navigate('PublicDoctorProfile', { doctorId: doctor.doctorId })}>
                <AppCard style={styles.card}>
                  <Text variant="titleSmall" style={styles.name}>{doctor.name}</Text>
                  <Text variant="bodySmall" style={styles.meta}>
                    {[doctor.specialization, doctor.city, doctor.hospitalName].filter(Boolean).join(' · ') || 'Doctor'}
                  </Text>
                  {doctor.averageRating != null ? (
                    <Text variant="bodySmall" style={styles.meta}>{doctor.averageRating.toFixed(1)} ★ ({doctor.reviewCount ?? 0})</Text>
                  ) : null}
                </AppCard>
              </Pressable>
            );
          }
          const hospital = item.data;
          return (
            <Pressable onPress={() => navigation.navigate('PublicHospitalProfile', { hospitalId: hospital.hospitalId })}>
              <AppCard style={styles.card}>
                <Text variant="titleSmall" style={styles.name}>{hospital.name}</Text>
                <Text variant="bodySmall" style={styles.meta}>
                  {[hospital.hospitalType?.replace(/_/g, ' '), hospital.city].filter(Boolean).join(' · ') || 'Hospital'}
                </Text>
                {hospital.averageRating != null ? (
                  <Text variant="bodySmall" style={styles.meta}>{hospital.averageRating.toFixed(1)} ★ ({hospital.reviewCount})</Text>
                ) : null}
              </AppCard>
            </Pressable>
          );
        }}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: layout.stackGap, gap: layout.stackGap },
  search: { marginBottom: 6, height: 44 },
  searchInput: { minHeight: 0, fontSize: 14 },
  inlineActions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, marginBottom: 6 },
  filterChip: { height: 30 },
  locationHint: { color: appColors.textSecondary },
  list: { paddingBottom: layout.sectionGap, gap: layout.stackGap },
  card: { gap: 4 },
  name: { fontWeight: '600', color: appColors.textPrimary },
  meta: { color: appColors.textSecondary },
  error: { color: appColors.error },
  loader: { marginVertical: layout.stackGap },
});
