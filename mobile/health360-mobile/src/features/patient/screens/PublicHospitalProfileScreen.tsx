import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  fetchHospitalReviews,
  fetchPublicHospitalProfile,
} from '@/features/public/api/publicProfileApi';
import type { CareStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'PublicHospitalProfile'>;

function openMaps(lat: number, lng: number, label: string) {
  const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}(${encodeURIComponent(label)})`;
  void Linking.openURL(url);
}

export function PublicHospitalProfileScreen({ navigation, route }: Props) {
  const { hospitalId } = route.params;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public', 'hospital', hospitalId],
    queryFn: () => fetchPublicHospitalProfile(hospitalId),
  });

  const { data: reviews } = useQuery({
    queryKey: ['public', 'hospital', hospitalId, 'reviews'],
    queryFn: () => fetchHospitalReviews(hospitalId),
    enabled: Boolean(profile),
  });

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text>Hospital profile not available.</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>{profile.name}</Text>
      <Text variant="bodyLarge" style={styles.subtitle}>
        {profile.hospitalType?.replace(/_/g, ' ') ?? 'Hospital'}
      </Text>
      {profile.averageRating != null ? (
        <Text>★ {profile.averageRating.toFixed(1)} ({profile.reviewCount} reviews)</Text>
      ) : null}
      <View style={styles.chips}>
        {profile.emergencyInfo.emergencyAvailable24x7 ? <Chip>24×7 Emergency</Chip> : null}
        {profile.emergencyInfo.icuAvailable ? <Chip>ICU</Chip> : null}
        {profile.emergencyInfo.ambulanceAvailable ? <Chip>Ambulance</Chip> : null}
      </View>

      {profile.description ? (
        <Card style={styles.card}>
          <Card.Title title="About" />
          <Card.Content><Text>{profile.description}</Text></Card.Content>
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Card.Title title="Locations" />
        <Card.Content>
          {profile.branches.map((branch) => (
            <View key={branch.id} style={styles.listItem}>
              <Text variant="titleSmall">{branch.name}</Text>
              <Text>{branch.addressLine1}, {branch.city}, {branch.state} {branch.pincode}</Text>
              <Button
                mode="outlined"
                compact
                onPress={() => openMaps(Number(branch.latitude), Number(branch.longitude), branch.name)}
                style={styles.mapButton}
              >
                Open in Google Maps
              </Button>
            </View>
          ))}
        </Card.Content>
      </Card>

      {profile.departments.length > 0 ? (
        <Card style={styles.card}>
          <Card.Title title="Departments" />
          <Card.Content>
            {profile.departments.map((dept) => (
              <Text key={dept.id} style={styles.listItem}>{dept.name}</Text>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      {profile.featuredDoctors.length > 0 ? (
        <Card style={styles.card}>
          <Card.Title title="Doctors" />
          <Card.Content>
            {profile.featuredDoctors.map((doctor) => (
              <View key={doctor.doctorId} style={styles.listItem}>
                <Text variant="titleSmall">{doctor.name}</Text>
                <Text>{doctor.specialization ?? 'General consultation'}</Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => navigation.navigate('PublicDoctorProfile', { doctorId: doctor.doctorId })}
                >
                  View profile
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Card.Title title="Reviews" />
        <Card.Content>
          {(reviews?.content.length ?? 0) === 0 ? (
            <Text>No reviews yet.</Text>
          ) : (
            reviews?.content.map((review) => (
              <View key={review.id} style={styles.listItem}>
                <Text variant="titleSmall">{review.reviewerName} · {'★'.repeat(review.rating)}</Text>
                {review.comment ? <Text>{review.comment}</Text> : null}
              </View>
            ))
          )}
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontWeight: '700' },
  subtitle: { marginBottom: 8, opacity: 0.7 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 8 },
  card: { marginTop: 12 },
  listItem: { marginBottom: 12 },
  mapButton: { marginTop: 6, alignSelf: 'flex-start' },
});
