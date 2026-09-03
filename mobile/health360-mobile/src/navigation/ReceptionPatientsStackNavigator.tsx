import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ReceptionPatientSearchScreen } from '@/features/reception/screens/ReceptionPatientSearchScreen';
import { ReceptionPatientRegisterScreen } from '@/features/reception/screens/ReceptionPatientRegisterScreen';
import { ReceptionPatientDetailScreen } from '@/features/reception/screens/ReceptionPatientDetailScreen';
import { ReceptionPatientReceiptScreen } from '@/features/reception/screens/ReceptionPatientReceiptScreen';
import { ReceptionWalkInScreen } from '@/features/reception/screens/ReceptionWalkInScreen';
import { ReceptionCheckoutScreen } from '@/features/reception/screens/ReceptionCheckoutScreen';
import { stackScreenOptions } from '@/shared/theme';
import type { ReceptionPatientsStackParamList } from './types';

const Stack = createNativeStackNavigator<ReceptionPatientsStackParamList>();

export function ReceptionPatientsStackNavigator() {
  return (
    <Stack.Navigator screenOptions={stackScreenOptions}>
      <Stack.Screen name="PatientSearch" component={ReceptionPatientSearchScreen} options={{ title: 'Patients' }} />
      <Stack.Screen name="PatientRegister" component={ReceptionPatientRegisterScreen} options={{ title: 'Register patient' }} />
      <Stack.Screen name="PatientDetail" component={ReceptionPatientDetailScreen} options={{ title: 'Patient' }} />
      <Stack.Screen name="PatientReceipt" component={ReceptionPatientReceiptScreen} options={{ title: 'Registration receipt' }} />
      <Stack.Screen name="WalkIn" component={ReceptionWalkInScreen} options={{ title: 'Walk-in' }} />
      <Stack.Screen name="Checkout" component={ReceptionCheckoutScreen} options={{ title: 'Checkout' }} />
    </Stack.Navigator>
  );
}
