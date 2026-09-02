import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { PatientTabParamList } from '@/navigation/types';

type RequestOpdParams = {
  hospitalId?: string;
  branchId?: string;
  doctorId?: string;
};

export function navigateToRequestOpd(
  tabNavigation: BottomTabNavigationProp<PatientTabParamList> | undefined,
  params?: RequestOpdParams,
) {
  tabNavigation?.navigate('Appointments', {
    screen: 'RequestOpd',
    params,
  });
}
