import { StyleSheet, View } from 'react-native';
import { List, Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HospitalManageStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<HospitalManageStackParamList, 'ManageHub'>;

export function HospitalManageHubScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>Hospital Management</Text>
      <List.Section>
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
          title="Doctor Roster"
          description="Search and associate verified doctors"
          left={(props) => <List.Icon {...props} icon="doctor" />}
          onPress={() => navigation.navigate('Doctors')}
        />
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontWeight: '700', marginBottom: 8 },
});
