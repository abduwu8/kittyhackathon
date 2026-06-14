import type { Session, User } from '@supabase/supabase-js';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { supabase } from '../lib/supabase';
import type { AuthCredentials, SignUpResult } from '../types/auth';

function getAuthErrorMessage(error: unknown): string {
  const message =
    error && typeof error === 'object' && 'message' in error
      ? String((error as { message: unknown }).message)
      : 'something went wrong. please try again.';

  const status =
    error && typeof error === 'object' && 'status' in error
      ? Number((error as { status: unknown }).status)
      : null;

  const lowerMessage = message.toLowerCase();

  if (
    status === 504 ||
    lowerMessage.includes('504') ||
    lowerMessage.includes('gateway timeout') ||
    lowerMessage.includes('timed out')
  ) {
    return 'signup timed out while sending your verification email. check smtp settings in supabase, or temporarily turn off confirm email to test.';
  }

  return lowerMessage;
}

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<string | null>;
  signUp: (credentials: AuthCredentials) => Promise<SignUpResult>;
  verifySignUpOtp: (email: string, token: string) => Promise<string | null>;
  resendSignUpOtp: (email: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(async ({ email, password }: AuthCredentials) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }, []);

  const signUp = useCallback(async ({ email, password }: AuthCredentials): Promise<SignUpResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({ email, password });

      if (error) {
        return { status: 'error', message: getAuthErrorMessage(error) };
      }

      if (data.session) {
        return { status: 'verified' };
      }

      return { status: 'otp_sent' };
    } catch (error) {
      return { status: 'error', message: getAuthErrorMessage(error) };
    }
  }, []);

  const verifySignUpOtp = useCallback(async (email: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'signup',
    });

    return error?.message ?? null;
  }, []);

  const resendSignUpOtp = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });

    return error?.message ?? null;
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      isLoading,
      signIn,
      signUp,
      verifySignUpOtp,
      resendSignUpOtp,
      signOut,
    }),
    [session, user, isLoading, signIn, signUp, verifySignUpOtp, resendSignUpOtp, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
