"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Unsubscribe } from "firebase/auth";

import {
  initializeAuthPersistence,
  loginWithEmailPassword,
  logoutCurrentUser,
  registerWithEmailPassword,
  subscribeToAuthState,
} from "@/lib/auth/firebase-auth-client";
import { syncSessionCookie } from "@/lib/auth/session-client";
import type {
  AuthContextValue,
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "@/types/auth";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

async function syncSessionSafely(idToken: string | null): Promise<void> {
  try {
    await syncSessionCookie(idToken);
  } catch (error) {
    console.error("Failed to sync auth session cookie.", error);
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    let ignore = false;
    let unsubscribe: Unsubscribe | undefined;

    async function bootstrapAuth(): Promise<void> {
      await initializeAuthPersistence();

      unsubscribe = subscribeToAuthState(async (result) => {
        if (ignore) {
          return;
        }

        setUser(result?.user ?? null);
        setAuthLoading(false);

        await syncSessionSafely(result?.idToken ?? null);
      });
    }

    void bootstrapAuth().catch(async (error) => {
      if (ignore) {
        return;
      }

      console.error("Failed to initialize authentication state.", error);
      setUser(null);
      setAuthLoading(false);
      await syncSessionSafely(null);
    });

    return () => {
      ignore = true;
      unsubscribe?.();
    };
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const result = await loginWithEmailPassword(credentials);

    setUser(result.user);
    await syncSessionSafely(result.idToken);
  }, []);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const result = await registerWithEmailPassword(credentials);

    setUser(result.user);
    await syncSessionSafely(result.idToken);
  }, []);

  const logout = useCallback(async () => {
    await logoutCurrentUser();
    setUser(null);
    await syncSessionSafely(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      authLoading,
      login,
      register,
      logout,
    }),
    [authLoading, login, logout, register, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuthContext must be used inside an AuthProvider.");
  }

  return context;
}
