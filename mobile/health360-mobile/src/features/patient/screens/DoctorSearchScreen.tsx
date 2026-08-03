import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Searchbar, Switch, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useDoctorSearch } from '@/features/search/hooks/useDoctorSearch';
import { useUserLocation } from '@/features/location/hooks/useUserLocation';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors } from '@/shared/theme';
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
      <Text variant="headlineSmall" style={styles.title}>Find a Doctor</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Search verified doctors by name, specialty, city, and availability.
      </Text>

      <Searchbar
        placeholder="Search doctors..."
        value={q}
        onChangeText={setQ}
        onSubmitEditing={runSearch}
        style={styles.search}
      />
      <TextInput label="Specialty" mode="outlined" value={specialization} onChangeText={setSpecialization} style={styles.input} />
      <TextInput label="City" mode="outlined" value={city} onChangeText={setCity} style={styles.input} />
      <View style={styles.row}>
        <Text>Available today</Text>
        <Switch value={availableToday} onValueChange={setAvailableToday} />
      </View>
      <View style={styles.row}>
        <Text>Sort by nearby</Text>
        <Switch
          value={useNearby}
          onValueChange={(v) => {
            setUseNearby(v);
            if (v && !coords) void detect();
          }}
        />
      </View>
      {useNearby && locLoading ? <Text style={styles.locHint}>Detecting location…</Text> : null}
      {useNearby && coords ? <Chip compact icon="map-marker">Using your location</Chip> : null}
      <Button mode="outlined" onPress={runSearch} style={styles.btn}>Search</Button>
      <Button mode="text" onPress={() => navigation.navigate('HospitalSearch')}>Find hospitals instead</Button>

      {error ? (
        <AppCard style={styles.card}>
          <Text style={styles.error}>{getApiErrorMessage(error, 'Unable to load doctors.')}</Text>
          <Button onPress={() => refetch()}>Retry</Button>
        </AppCard>
      ) : null}

      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}
      {isFetching && !isLoading ? <Text style={styles.fetching}>Updating…</Text> : null}

      {!isLoading && !error && results.length === 0 ? (
        <Text style={styles.empty}>No doctors found. Try a different search.</Text>
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
            <Text variant="titleMedium" style={styles.doctorName}>{item.name}</Text>
            <Text variant="bodyMedium">{item.specialization ?? 'General consultation'}</Text>
            <Text variant="bodySmall" style={styles.meta}>
              {[item.hospitalName, item.branchName, item.city].filter(Boolean).join(' · ')}
            </Text>
            <View style={styles.chips}>
              {item.availableToday ? <Chip compact>Available today</Chip> : null}
              {item.distanceKm != null ? <Chip compact>{item.distanceKm} km</Chip> : null}
              {travelEstimateMinutes(item.distanceKm) != null ? (
                <Chip compact>~{travelEstimateMinutes(item.distanceKm)} min</Chip>
              ) : null}
              {item.averageRating != null ? <Chip compact>★ {item.averageRating}</Chip> : null}
            </View>
            <Button mode="outlined" onPress={() => navigation.navigate('PublicDoctorProfile', { doctorId: item.doctorId })}>
              View profile
            </Button>
            <Button mode="contained" onPress={() => navigation.navigate('BookAppointment', { doctorId: item.doctorId })}>
              Book appointment
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
  header: { gap: 0, paddingBottom: 4 },
  title: { fontWeight: '700', marginBottom: 4, color: appColors.textPrimary },
  subtitle: { color: appColors.textSecondary, marginBottom: 12 },
  search: { marginBottom: 8 },
  input: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  btn: { marginBottom: 4 },
  loader: { marginTop: 24, marginBottom: 12 },
  card: { marginTop: 12, gap: 6 },
  doctorName: { fontWeight: '600' },
  meta: { color: appColors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  empty: { textAlign: 'center', color: appColors.textSecondary, marginTop: 24, marginBottom: 12 },
  error: { color: appColors.error, marginBottom: 8 },
  fetching: { textAlign: 'center', color: appColors.textSecondary, marginTop: 8, marginBottom: 8 },
  locHint: { color: appColors.textSecondary, marginBottom: 8 },
});
