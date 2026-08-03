import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AuthTokenData, AuthUser } from '@/features/auth/api/authApi';
import { logout as logoutApi } from '@/features/auth/api/authApi';
import { clearSession, loadSession, saveSession } from '@/shared/storage/secureStorage';
import { sessionStore } from '@/shared/storage/sessionStore';

interface AuthContextValue {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (tokens: AuthTokenData) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: AuthUser) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    loadSession()
      .then((session) => {
        if (!mounted) {
          return;
        }
        setAccessToken(session.accessToken);
        setRefreshToken(session.refreshToken);
        setUser(session.user);
        if (session.accessToken && session.refreshToken && session.user) {
          sessionStore.set({
            accessToken: session.accessToken,
            refreshToken: session.refreshToken,
            user: session.user,
            expiresIn: 0,
            tokenType: 'Bearer',
          });
        }
      })
      .finally(() => {
        if (mounted) {
          setIsLoading(false);
        }
      });

    const unsubscribeClear = sessionStore.onSessionClear(() => {
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    });

    return () => {
      mounted = false;
      unsubscribeClear();
    };
  }, []);

  const signIn = useCallback(async (tokens: AuthTokenData) => {
    await saveSession(tokens.accessToken, tokens.refreshToken, tokens.user);
    sessionStore.set(tokens);
    setAccessToken(tokens.accessToken);
    setRefreshToken(tokens.refreshToken);
    setUser(tokens.user);
  }, []);

  const signOut = useCallback(async () => {
    const currentAccess = accessToken ?? sessionStore.get()?.accessToken;
    const currentRefresh = refreshToken ?? sessionStore.get()?.refreshToken;

    try {
      if (currentAccess) {
        await logoutApi(currentAccess, currentRefresh ?? undefined);
      }
    } catch {
      // Clear locally even if API fails (mirrors web)
    }

    await clearSession();
    sessionStore.clear();
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  }, [accessToken, refreshToken]);

  const updateUser = useCallback(async (updatedUser: AuthUser) => {
    const currentAccess = accessToken ?? sessionStore.get()?.accessToken;
    const currentRefresh = refreshToken ?? sessionStore.get()?.refreshToken;
    if (currentAccess && currentRefresh) {
      await saveSession(currentAccess, currentRefresh, updatedUser);
      sessionStore.set({
        accessToken: currentAccess,
        refreshToken: currentRefresh,
        user: updatedUser,
        expiresIn: 0,
        tokenType: 'Bearer',
      });
    }
    setUser(updatedUser);
  }, [accessToken, refreshToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      accessToken,
      refreshToken,
      user,
      isLoading,
      isAuthenticated: Boolean(accessToken),
      signIn,
      signOut,
      updateUser,
    }),
    [accessToken, refreshToken, user, isLoading, signIn, signOut, updateUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function userHasRole(user: AuthUser | null, role: string): boolean {
  return Boolean(user?.roles?.includes(role));
}
