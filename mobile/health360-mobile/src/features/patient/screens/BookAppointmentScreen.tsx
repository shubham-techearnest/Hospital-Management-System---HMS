import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppCard } from '@/shared/components/AppCard';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { navigateToRequestOpd } from '@/shared/navigation/opdNavigation';
import { appColors, layout } from '@/shared/theme';
import type { CareStackParamList, PatientTabParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<CareStackParamList, 'BookAppointment'>;

/** Legacy route — redirects patients to the OPD walk-in flow (matches web). */
export function BookAppointmentScreen({ route, navigation }: Props) {
  const { doctorId } = route.params;
  const tabNavigation = navigation.getParent<BottomTabNavigationProp<PatientTabParamList>>();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigateToRequestOpd(tabNavigation, { doctorId });
      navigation.goBack();
    }, 1200);
    return () => clearTimeout(timer);
  }, [doctorId, navigation, tabNavigation]);

  return (
    <ScreenContainer>
      <PageHero
        title="OPD walk-in"
        subtitle="Appointments are replaced by today's OPD queue at Indian hospitals."
      />
      <AppCard style={styles.card}>
        <Text variant="bodyMedium" style={styles.body}>
          Redirecting you to request an OPD visit for this doctor…
        </Text>
        <ActivityIndicator style={styles.loader} />
        <Button
          mode="contained"
          onPress={() => {
            navigateToRequestOpd(tabNavigation, { doctorId });
            navigation.goBack();
          }}
          style={styles.btn}
        >
          Request OPD now
        </Button>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { gap: layout.stackGap },
  body: { color: appColors.textSecondary, lineHeight: 22 },
  loader: { marginVertical: 8 },
  btn: { borderRadius: 12 },
});
