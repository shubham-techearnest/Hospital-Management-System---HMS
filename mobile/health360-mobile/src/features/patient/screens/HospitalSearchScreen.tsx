import { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Chip, Searchbar, Switch, Text, TextInput } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useHospitalSearch } from '@/features/search/hooks/useHospitalSearch';
import { useUserLocation } from '@/features/location/hooks/useUserLocation';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { appColors } from '@/shared/theme';
import { getApiErrorMessage } from '@/shared/utils/helpers';
import type { CareStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'HospitalSearch'>;

function travelEstimateMinutes(distanceKm?: number) {
  if (distanceKm == null) return null;
  return Math.round(distanceKm * 2.5);
}

export function HospitalSearchScreen({ navigation }: Props) {
  const [q, setQ] = useState('');
  const [query, setQuery] = useState('');
  const [department, setDepartment] = useState('');
  const [emergency24x7, setEmergency24x7] = useState(false);
  const [useNearby, setUseNearby] = useState(false);
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
      <Text variant="headlineSmall" style={styles.title}>Find a Hospital</Text>
      <Text variant="bodyMedium" style={styles.subtitle}>
        Search by hospital name, department, or emergency facilities.
      </Text>
      <Searchbar
        placeholder="Search hospitals..."
        value={q}
        onChangeText={setQ}
        onSubmitEditing={runSearch}
        style={styles.search}
      />
      <TextInput label="Department" mode="outlined" value={department} onChangeText={setDepartment} style={styles.input} />
      <View style={styles.row}>
        <Text>24×7 Emergency</Text>
        <Switch value={emergency24x7} onValueChange={setEmergency24x7} />
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
      {useNearby && coords ? <Chip compact icon="map-marker" style={styles.locChip}>Using your location</Chip> : null}
      <Button mode="contained" onPress={runSearch} style={styles.btn}>Search</Button>
      <Button mode="text" onPress={() => navigation.navigate('DoctorSearch')}>Find doctors instead</Button>

      {error ? (
        <AppCard style={styles.card}>
          <Text style={styles.error}>{getApiErrorMessage(error, 'Unable to load hospitals.')}</Text>
          <Button onPress={() => refetch()}>Retry</Button>
        </AppCard>
      ) : null}

      {isLoading ? <ActivityIndicator style={styles.loader} /> : null}

      {!isLoading && !error && results.length === 0 ? (
        <Text style={styles.empty}>No hospitals found.</Text>
      ) : null}
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
            <Text variant="titleMedium">{item.name}</Text>
            <Text variant="bodySmall">{[item.branchName, item.city].filter(Boolean).join(' · ')}</Text>
            <View style={styles.chips}>
              {item.distanceKm != null ? <Chip compact>{item.distanceKm} km</Chip> : null}
              {travelEstimateMinutes(item.distanceKm) != null ? (
                <Chip compact>~{travelEstimateMinutes(item.distanceKm)} min</Chip>
              ) : null}
            </View>
            {item.emergencyAvailable24x7 ? <Text style={styles.badge}>24×7 Emergency</Text> : null}
            {item.icuAvailable ? <Text style={styles.badge}>ICU</Text> : null}
            <Button
              mode="outlined"
              onPress={() => navigation.navigate('PublicHospitalProfile', { hospitalId: item.hospitalId })}
            >
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
  header: { paddingBottom: 4 },
  title: { fontWeight: '700', marginBottom: 4, color: appColors.textPrimary },
  subtitle: { color: appColors.textSecondary, marginBottom: 12 },
  search: { marginBottom: 8 },
  input: { marginBottom: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  btn: { marginBottom: 4 },
  loader: { marginTop: 24, marginBottom: 12 },
  card: { marginTop: 12, gap: 4 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 4 },
  locChip: { alignSelf: 'flex-start', marginBottom: 8 },
  badge: { color: appColors.success, fontWeight: '600' },
  empty: { textAlign: 'center', color: appColors.textSecondary, marginTop: 24, marginBottom: 12 },
  error: { color: appColors.error, marginBottom: 8 },
  locHint: { color: appColors.textSecondary, marginBottom: 8 },
});
