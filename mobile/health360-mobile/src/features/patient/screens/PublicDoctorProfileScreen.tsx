import { Linking, ScrollView, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, Button, Card, Chip, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  fetchDoctorReviews,
  fetchPublicDoctorProfile,
} from '@/features/public/api/publicProfileApi';
import { navigateToRequestOpd } from '@/shared/navigation/opdNavigation';
import type { CareStackParamList, PatientTabParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'PublicDoctorProfile'>;

export function PublicDoctorProfileScreen({ navigation, route }: Props) {
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<PatientTabParamList>>();
  const { doctorId } = route.params;

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public', 'doctor', doctorId],
    queryFn: () => fetchPublicDoctorProfile(doctorId),
  });

  const { data: reviews } = useQuery({
    queryKey: ['public', 'doctor', doctorId, 'reviews'],
    queryFn: () => fetchDoctorReviews(doctorId),
    enabled: Boolean(profile),
  });

  if (isLoading) {
    return <ActivityIndicator style={styles.centered} />;
  }

  if (error || !profile) {
    return (
      <View style={styles.centered}>
        <Text>Doctor profile not available.</Text>
        <Button onPress={() => navigation.goBack()}>Go back</Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        {profile.title ? `${profile.title}. ` : ''}{profile.name}
      </Text>
      {profile.verified ? <Chip icon="check-decagram" style={styles.chip}>Verified</Chip> : null}
      <Text variant="bodyLarge" style={styles.subtitle}>{profile.specialization ?? 'Healthcare professional'}</Text>
      {profile.averageRating != null ? (
        <Text>★ {profile.averageRating.toFixed(1)} ({profile.reviewCount} reviews)</Text>
      ) : null}

      {profile.biography ? (
        <Card style={styles.card}>
          <Card.Title title="About" />
          <Card.Content><Text>{profile.biography}</Text></Card.Content>
        </Card>
      ) : null}

      {profile.qualifications.length > 0 ? (
        <Card style={styles.card}>
          <Card.Title title="Qualifications" />
          <Card.Content>
            {profile.qualifications.map((q) => (
              <Text key={q.id} style={styles.listItem}>
                {q.degree} — {q.institution}{q.yearOfCompletion ? ` (${q.yearOfCompletion})` : ''}
              </Text>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      {profile.hospitals.length > 0 ? (
        <Card style={styles.card}>
          <Card.Title title="Hospitals & fees" />
          <Card.Content>
            {profile.hospitals.map((h) => (
              <View key={`${h.hospitalId}-${h.branchName ?? 'main'}`} style={styles.listItem}>
                <Text variant="titleSmall">{h.hospitalName}</Text>
                <Text>{[h.branchName, h.city].filter(Boolean).join(', ')}</Text>
                <Text>{h.consultationFees.map((f) => f.feeDisplay).join(' · ')}</Text>
                <Button
                  mode="text"
                  compact
                  onPress={() => navigation.navigate('PublicHospitalProfile', { hospitalId: h.hospitalId })}
                >
                  View hospital
                </Button>
              </View>
            ))}
          </Card.Content>
        </Card>
      ) : null}

      <Card style={styles.card}>
        <Card.Title title="OPD availability" />
        <Card.Content>
          <Text>
            {profile.availabilityPreview.availableToday
              ? 'Seeing patients today — request OPD at the hospital.'
              : 'Not listed for OPD today — you can still request a walk-in visit.'}
          </Text>
          <Text style={styles.availabilityHint}>
            Walk-in OPD does not use appointment slots. Reception adds you to today's queue.
          </Text>
        </Card.Content>
      </Card>

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

      <Button
        mode="contained"
        icon="clipboard-plus-outline"
        onPress={() => {
          const primaryHospital = profile.hospitals[0];
          navigateToRequestOpd(tabNavigation, {
            hospitalId: primaryHospital?.hospitalId,
            doctorId,
          });
        }}
        style={styles.cta}
      >
        Request OPD visit
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  title: { fontWeight: '700' },
  subtitle: { marginBottom: 8, opacity: 0.7 },
  chip: { alignSelf: 'flex-start', marginBottom: 8 },
  card: { marginTop: 12 },
  listItem: { marginBottom: 12 },
  availabilityHint: { marginTop: 8, opacity: 0.7, lineHeight: 20 },
  cta: { marginTop: 16, borderRadius: 12 },
});
