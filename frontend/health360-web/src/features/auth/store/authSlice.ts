import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AuthTokenData, AuthUser } from '../api/authApi';
import type { ImpersonationContext } from '@/features/admin/api/impersonationApi';

const ACTOR_SESSION_KEY = 'impersonation.actorSession';
const IMPERSONATION_KEY = 'impersonation';

export interface ActorSessionBackup {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  impersonation: ImpersonationContext | null;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: readJson<AuthUser>('user'),
  impersonation: readJson<ImpersonationContext>(IMPERSONATION_KEY),
};

function persistCredentials(accessToken: string, refreshToken: string, user: AuthUser) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
  localStorage.setItem('user', JSON.stringify(user));
}

function clearPersistedCredentials() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}

function persistImpersonation(context: ImpersonationContext | null) {
  if (context) {
    localStorage.setItem(IMPERSONATION_KEY, JSON.stringify(context));
  } else {
    localStorage.removeItem(IMPERSONATION_KEY);
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<AuthTokenData>) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      persistCredentials(action.payload.accessToken, action.payload.refreshToken, action.payload.user);
      if (!state.impersonation) {
        localStorage.removeItem(ACTOR_SESSION_KEY);
      }
    },
    beginImpersonation: (
      state,
      action: PayloadAction<{ tokens: AuthTokenData; impersonation: ImpersonationContext }>,
    ) => {
      if (state.accessToken && state.refreshToken && state.user) {
        const backup: ActorSessionBackup = {
          accessToken: state.accessToken,
          refreshToken: state.refreshToken,
          user: state.user,
        };
        localStorage.setItem(ACTOR_SESSION_KEY, JSON.stringify(backup));
      }
      state.accessToken = action.payload.tokens.accessToken;
      state.refreshToken = action.payload.tokens.refreshToken;
      state.user = action.payload.tokens.user;
      state.impersonation = action.payload.impersonation;
      persistCredentials(
        action.payload.tokens.accessToken,
        action.payload.tokens.refreshToken,
        action.payload.tokens.user,
      );
      persistImpersonation(action.payload.impersonation);
    },
    endImpersonationLocal: (state) => {
      const backup = readJson<ActorSessionBackup>(ACTOR_SESSION_KEY);
      state.impersonation = null;
      persistImpersonation(null);
      localStorage.removeItem(ACTOR_SESSION_KEY);
      if (backup) {
        state.accessToken = backup.accessToken;
        state.refreshToken = backup.refreshToken;
        state.user = backup.user;
        persistCredentials(backup.accessToken, backup.refreshToken, backup.user);
      }
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.impersonation = null;
      clearPersistedCredentials();
      persistImpersonation(null);
      localStorage.removeItem(ACTOR_SESSION_KEY);
    },
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (!state.user) {
        return;
      }
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('user', JSON.stringify(state.user));
    },
  },
});

export const {
  setCredentials,
  beginImpersonation,
  endImpersonationLocal,
  clearCredentials,
  updateUser,
} = authSlice.actions;
export const authReducer = authSlice.reducer;

export function selectIsImpersonating(state: { auth: AuthState }) {
  return Boolean(state.auth.impersonation);
}
