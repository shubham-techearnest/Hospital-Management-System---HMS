import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AppCard } from '@/shared/components/AppCard';
import { appColors, layout } from '@/shared/theme';

export function UnauthorizedScreen() {
  const { signOut, user } = useAuth();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingTop: insets.top + layout.screenPaddingY,
          paddingBottom: insets.bottom + layout.screenPaddingY,
          paddingHorizontal: layout.screenPaddingX,
        },
      ]}
    >
      <AppCard style={styles.card}>
        <Text variant="titleLarge" style={styles.title}>
          Unsupported role
        </Text>
        <Text style={styles.message}>
          Your account roles ({user?.roles?.join(', ') ?? 'none'}) are not supported in the mobile app
          yet. Please sign in with a patient, doctor, hospital admin, or platform admin account.
        </Text>
        <Button mode="contained" onPress={() => signOut()} style={styles.button}>
          Sign out
        </Button>
      </AppCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: appColors.background,
    justifyContent: 'center',
  },
  card: {
    gap: layout.stackGap,
  },
  title: {
    fontWeight: '700',
    color: appColors.textPrimary,
  },
  message: {
    color: appColors.textSecondary,
    lineHeight: layout.textLineHeight,
  },
  button: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    marginTop: layout.stackGap,
  },
});
