import type { AuthTokenData } from '@/features/auth/api/authApi';

type SessionListener = (session: AuthTokenData | null) => void;
type SessionClearListener = () => void;

let memorySession: AuthTokenData | null = null;
const sessionListeners = new Set<SessionListener>();
const clearListeners = new Set<SessionClearListener>();

export const sessionStore = {
  get(): AuthTokenData | null {
    return memorySession;
  },

  set(session: AuthTokenData): void {
    memorySession = session;
    sessionListeners.forEach((listener) => listener(session));
  },

  clear(): void {
    memorySession = null;
    clearListeners.forEach((listener) => listener());
  },

  onSessionChange(listener: SessionListener): () => void {
    sessionListeners.add(listener);
    return () => sessionListeners.delete(listener);
  },

  onSessionClear(listener: SessionClearListener): () => void {
    clearListeners.add(listener);
    return () => clearListeners.delete(listener);
  },
};
