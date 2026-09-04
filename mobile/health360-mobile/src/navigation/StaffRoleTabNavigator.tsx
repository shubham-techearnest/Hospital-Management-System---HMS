import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { StaffWorklistRole } from '@/features/auth/utils/appShell';
import { STAFF_WORKLIST_KIND_BY_ROLE } from '@/features/auth/utils/appShell';
import { StaffWorklistScreen } from '@/features/staff/screens/StaffWorklistScreen';
import type { StaffWorklistKind } from '@/features/staff/hooks/useStaffWorklist';
import { SettingsStackNavigator } from './SettingsStackNavigator';
import { tabBarOptions } from '@/shared/theme';
import type { StaffRoleTabParamList } from './types';

const Tab = createBottomTabNavigator<StaffRoleTabParamList>();

type Config = {
  kind: StaffWorklistKind;
  title: string;
  emptyLabel: string;
  hint: string;
  tabLabel: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
};

const CONFIG: Record<StaffWorklistRole, Config> = {
  LAB_TECHNICIAN: {
    kind: STAFF_WORKLIST_KIND_BY_ROLE.LAB_TECHNICIAN as StaffWorklistKind,
    title: 'Lab worklist',
    emptyLabel: 'No pending lab orders.',
    hint: 'Pending hospital lab orders for your assigned branch. Process details on web.',
    tabLabel: 'Worklist',
    icon: 'flask',
  },
  RADIOLOGY_TECHNICIAN: {
    kind: STAFF_WORKLIST_KIND_BY_ROLE.RADIOLOGY_TECHNICIAN as StaffWorklistKind,
    title: 'Imaging worklist',
    emptyLabel: 'No pending imaging orders.',
    hint: 'Pending radiology orders for your branch. Full reporting remains on web.',
    tabLabel: 'Worklist',
    icon: 'radioactive-circle',
  },
  PHARMACIST: {
    kind: STAFF_WORKLIST_KIND_BY_ROLE.PHARMACIST as StaffWorklistKind,
    title: 'Pharmacy worklist',
    emptyLabel: 'No pending medication orders.',
    hint: 'Pending pharmacy orders. Verify and dispense on web when needed.',
    tabLabel: 'Worklist',
    icon: 'pill',
  },
  OT_COORDINATOR: {
    kind: STAFF_WORKLIST_KIND_BY_ROLE.OT_COORDINATOR as StaffWorklistKind,
    title: 'OT worklist',
    emptyLabel: 'No pending OT procedures.',
    hint: 'Pending OT requests. Scheduling and team assignment on web.',
    tabLabel: 'Worklist',
    icon: 'bed',
  },
  NURSE: {
    kind: STAFF_WORKLIST_KIND_BY_ROLE.NURSE as StaffWorklistKind,
    title: 'Ward board',
    emptyLabel: 'No active IPD admissions.',
    hint: 'Active inpatient admissions. Chart vitals and MAR on web.',
    tabLabel: 'Ward',
    icon: 'bed-outline',
  },
  ICU_NURSE: {
    kind: STAFF_WORKLIST_KIND_BY_ROLE.ICU_NURSE as StaffWorklistKind,
    title: 'ICU board',
    emptyLabel: 'No active ICU stays.',
    hint: 'Active ICU stays. Monitoring charts on web.',
    tabLabel: 'ICU',
    icon: 'heart-pulse',
  },
};

type Props = {
  role: StaffWorklistRole;
};

export function StaffRoleTabNavigator({ role }: Props) {
  const config = CONFIG[role];

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="Worklist"
        options={{
          headerShown: true,
          title: config.title,
          tabBarLabel: config.tabLabel,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name={config.icon} color={color} size={size} />
          ),
        }}
      >
        {() => (
          <StaffWorklistScreen
            kind={config.kind}
            title={config.title}
            emptyLabel={config.emptyLabel}
            hint={config.hint}
          />
        )}
      </Tab.Screen>
      <Tab.Screen
        name="Settings"
        component={SettingsStackNavigator}
        options={{
          headerShown: false,
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
