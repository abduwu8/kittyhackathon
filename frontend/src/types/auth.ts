import type { Session, User } from '@supabase/supabase-js';

export type AuthState = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type SignUpResult =
  | { status: 'verified' }
  | { status: 'otp_sent' }
  | { status: 'error'; message: string };
