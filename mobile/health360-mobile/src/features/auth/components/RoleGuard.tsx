import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { userHasRole, useAuth } from '@/features/auth/context/AuthContext';
import type { AuthUser } from '@/features/auth/api/authApi';

interface RoleGuardProps {
  role: string;
  children: ReactNode;
  fallbackMessage?: string;
}

export function RoleGuard({ role, children, fallbackMessage }: RoleGuardProps) {
  const { user, signOut } = useAuth();

  if (!userHasRole(user, role)) {
    return (
      <View style={styles.container}>
        <Text variant="titleMedium" style={styles.title}>
          Access denied
        </Text>
        <Text style={styles.message}>
          {fallbackMessage ?? `This area requires the ${role} role.`}
        </Text>
        <Button mode="contained" onPress={() => signOut()}>
          Sign out
        </Button>
      </View>
    );
  }

  return <>{children}</>;
}

export function getPrimaryRole(user: AuthUser | null): 'DOCTOR' | 'HOSPITAL_ADMIN' | 'PATIENT' | null {
  if (userHasRole(user, 'DOCTOR')) {
    return 'DOCTOR';
  }
  if (userHasRole(user, 'HOSPITAL_ADMIN')) {
    return 'HOSPITAL_ADMIN';
  }
  if (userHasRole(user, 'PATIENT')) {
    return 'PATIENT';
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 12,
  },
  title: { fontWeight: '700' },
  message: { textAlign: 'center', opacity: 0.7, marginBottom: 8 },
});
