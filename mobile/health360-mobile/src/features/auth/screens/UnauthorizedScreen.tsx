import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { useAuth } from '@/features/auth/context/AuthContext';

export function UnauthorizedScreen() {
  const { signOut, user } = useAuth();

  return (
    <View style={styles.container}>
      <Text variant="titleLarge" style={styles.title}>
        Unsupported role
      </Text>
      <Text style={styles.message}>
        Your account roles ({user?.roles?.join(', ') ?? 'none'}) are not supported in the mobile app
        yet.
      </Text>
      <Button mode="contained" onPress={() => signOut()}>
        Sign out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: { fontWeight: '700' },
  message: { opacity: 0.7, marginBottom: 8 },
});
