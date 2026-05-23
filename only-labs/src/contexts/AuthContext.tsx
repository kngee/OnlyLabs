import { createContext, useState, useEffect, useContext, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string;
  weekly_goal?: number;
  is_in_lab?: boolean;
  last_seen_at?: string;
}

export interface AuthContextType {
  session: Session | null;
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const initSession = async () => {
      try {
        // Check if password reset is in progress
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) {
          // User is in password reset flow, don't auto-redirect
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.getSession();
        if (mounted) {
          if (error) console.error('Supabase getSession error:', error);
          setSession(data?.session || null);
          if (data?.session?.user?.id) {
            await fetchUserProfile(data.session.user.id, data.session.user.email || '');
          }
          setLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error('Supabase client crash:', err);
          setLoading(false);
        }
      }
    };

    initSession();

    let subscription: any = null;
    try {
      const authSub = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        if (mounted) {
          setSession(newSession);
          if (newSession?.user?.id) {
            await fetchUserProfile(newSession.user.id, newSession.user.email || '');
          } else {
            setUser(null);
          }
        }
      });
      subscription = authSub.data.subscription;
    } catch (err) {
      console.error('Supabase auth listener crash:', err);
      if (mounted) setLoading(false);
    }

    return () => {
      mounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist - create it
        console.log('Profile not found, creating one...');
        await createUserProfile(userId, userEmail);
      } else if (error) {
        throw error;
      } else if (data) {
        setUser({
          id: data.id,
          username: data.username || '',
          email: userEmail,
          avatar_url: data.avatar_url,
          weekly_goal: data.weekly_goal,
          is_in_lab: data.is_in_lab,
          last_seen_at: data.last_seen_at,
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Set minimal user data if profile fetch fails
      setUser({
        id: userId,
        username: '',
        email: userEmail,
      });
    }
  };

  const createUserProfile = async (userId: string, userEmail: string) => {
    try {
      const username = userEmail.split('@')[0];
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          username: username,
          email: userEmail,
          weekly_goal: 20,
          is_in_lab: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          username: data.username || '',
          email: userEmail,
          avatar_url: data.avatar_url,
          weekly_goal: data.weekly_goal,
          is_in_lab: data.is_in_lab,
          last_seen_at: data.last_seen_at,
        });
      }
    } catch (err) {
      console.error('Error creating user profile:', err);
      // Set minimal user data if profile creation fails
      setUser({
        id: userId,
        username: userEmail.split('@')[0],
        email: userEmail,
      });
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
    } catch (err) {
      console.error('Error logging out:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

