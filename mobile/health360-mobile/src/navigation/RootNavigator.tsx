import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { NavigationContainer, type LinkingOptions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, useTheme } from 'react-native-paper';
import * as Linking from 'expo-linking';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AppShellNavigator } from './AppStackNavigator';
import { AuthStackNavigator } from './AuthStackNavigator';
import type { RootStackParamList } from './types';

const RootStack = createNativeStackNavigator<RootStackParamList>();

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [Linking.createURL('/'), 'health360://'],
  config: {
    screens: {
      Auth: {
        screens: {
          VerifyEmail: {
            path: 'verify-email',
            parse: {
              token: (token: string) => token,
            },
          },
        },
      },
    },
  },
};

function LoadingScreen() {
  const theme = useTheme();

  return (
    <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
      <Text variant="headlineSmall" style={[styles.brand, { color: theme.colors.primary }]}>
        Health360 AI
      </Text>
      <ActivityIndicator size="large" color={theme.colors.primary} style={styles.spinner} />
      <Text variant="bodyMedium" style={styles.loadingText}>
        Loading your session…
      </Text>
    </View>
  );
}

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer linking={linking}>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="App" component={AppShellNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthStackNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  brand: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  spinner: {
    marginTop: 24,
  },
  loadingText: {
    marginTop: 12,
    opacity: 0.65,
  },
});
