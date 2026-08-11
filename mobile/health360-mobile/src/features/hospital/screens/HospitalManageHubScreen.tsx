import { StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppCard } from '@/shared/components/AppCard';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { ScreenIntro } from '@/shared/components/ScreenIntro';
import { layout } from '@/shared/theme';
import type { HospitalManageStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HospitalManageStackParamList, 'ManageHub'>;

export function HospitalManageHubScreen({ navigation }: Props) {
  return (
    <ScreenContainer scroll={false}>
      <ScreenIntro description="Manage departments, emergency capacity, and your doctor roster." />
      <AppCard style={styles.card}>
        <List.Section style={styles.section}>
          <List.Item
            title="Departments"
            description="Add and manage clinical departments"
            left={(props) => <List.Icon {...props} icon="office-building" />}
            onPress={() => navigation.navigate('Departments')}
          />
          <List.Item
            title="Emergency & ICU"
            description="24×7 emergency and ICU capacity"
            left={(props) => <List.Icon {...props} icon="ambulance" />}
            onPress={() => navigation.navigate('Emergency')}
          />
          <List.Item
            title="Facilities & Amenities"
            description="Diagnostic, surgical, emergency, and other facilities"
            left={(props) => <List.Icon {...props} icon="hospital-box" />}
            onPress={() => navigation.navigate('Facilities')}
          />
          <List.Item
            title="Photo Gallery"
            description="Upload hospital photos for your public profile"
            left={(props) => <List.Icon {...props} icon="image-multiple" />}
            onPress={() => navigation.navigate('Gallery')}
          />
          <List.Item
            title="Doctor Roster"
            description="Search and associate verified doctors"
            left={(props) => <List.Icon {...props} icon="doctor" />}
            onPress={() => navigation.navigate('Doctors')}
          />
          <List.Item
            title="Subscription"
            description="View plan, usage limits, and features"
            left={(props) => <List.Icon {...props} icon="card-account-details" />}
            onPress={() => navigation.navigate('Subscription')}
          />
        </List.Section>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: 0,
    paddingHorizontal: 0,
    overflow: 'hidden',
  },
  section: {
    marginTop: 0,
    marginBottom: 0,
  },
});
