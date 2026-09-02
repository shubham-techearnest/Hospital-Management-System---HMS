import { ScrollView, StyleSheet } from 'react-native';
import { List } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PageHero } from '@/shared/components/PageHero';
import { ScreenContainer } from '@/shared/components/ScreenContainer';
import { useMyNotifications } from '@/features/settings/hooks/useNotificationQueries';
import { appColors, layout } from '@/shared/theme';
import type { SettingsStackParamList } from '@/navigation/types';

type Props = NativeStackScreenProps<SettingsStackParamList, 'SettingsHome'>;

export function SettingsHomeScreen({ navigation }: Props) {
  const { data: notifications = [] } = useMyNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerStyle={styles.content}>
        <PageHero title="Settings" subtitle="Account, alerts, and app preferences." />

        <List.Section>
          <List.Item
            title="Account"
            description="Profile, password, sign out"
            left={(props) => <List.Icon {...props} icon="account-cog" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('AccountSettings')}
          />
          <List.Item
            title="Notifications"
            description={unread > 0 ? `${unread} unread hospital alert${unread === 1 ? '' : 's'}` : 'OPD and visit updates'}
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('NotificationsInbox')}
          />
          <List.Item
            title="Notification preferences"
            description="Email, SMS, and in-app channels"
            left={(props) => <List.Icon {...props} icon="tune" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('NotificationPreferences')}
          />
        </List.Section>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: { paddingBottom: layout.screenPaddingBottom },
});
