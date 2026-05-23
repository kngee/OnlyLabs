import { createContext, useState, useContext, type ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface LabSession {
  id: string;
  user_id: string;
  start_time: string;
  end_time: string;
  status: string;
  manual_edit: boolean;
}

export interface SessionContextType {
  activeSession: LabSession | null;
  elapsedSeconds: number;
  isRunning: boolean;
  isRecovering: boolean;
  startSession: (sessionId?: string) => Promise<void>;
  pauseSession: () => void;
  resumeSession: () => void;
  finishSession: () => Promise<void>;
  quitSession: () => Promise<void>;
  loading: boolean;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export function SessionProvider({ children, userId }: { children: ReactNode; userId: string | null }) {
  const [activeSession, setActiveSession] = useState<LabSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize: Check for active sessions on mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchActiveSession = async () => {
      try {
        const { data, error } = await supabase
          .from('lab_sessions')
          .select('*')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (data) {
          // Found active session - resume it
          setActiveSession(data);
          const startTime = new Date(data.start_time).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - startTime) / 1000);

          setSessionStartTime(startTime);
          setElapsedSeconds(elapsed);
          setIsRecovering(true);
          setIsRunning(true);

          // Update profile to mark user as in lab
          await supabase.from('profiles').update({ is_in_lab: true }).eq('id', userId);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching active session:', err);
        setLoading(false);
      }
    };

    fetchActiveSession();
  }, [userId]);

  // Timer effect using requestAnimationFrame for smooth updates
  useEffect(() => {
    if (!isRunning || !sessionStartTime) return;

    let animationId: number;
    let lastUpdate = Date.now();

    const updateTimer = () => {
      const now = Date.now();
      if (now - lastUpdate >= 100) {
        // Update every 100ms
        const elapsed = Math.floor((now - sessionStartTime) / 1000);
        setElapsedSeconds(elapsed);
        lastUpdate = now;
      }
      animationId = requestAnimationFrame(updateTimer);
    };

    animationId = requestAnimationFrame(updateTimer);

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isRunning, sessionStartTime]);

  const startSession = useCallback(
    async (sessionId?: string) => {
      if (isRunning) return;

      try {
        const now = new Date().toISOString();
        const startTimeMs = Date.now();

        if (sessionId) {
          // Resume existing session
          const { data, error } = await supabase
            .from('lab_sessions')
            .select('*')
            .eq('id', sessionId)
            .single();

          if (error) throw error;

          setActiveSession(data);
          setSessionStartTime(startTimeMs - Math.floor((data.end_time ? new Date(data.end_time).getTime() - new Date(data.start_time).getTime() : 0)));
          setElapsedSeconds(Math.floor((startTimeMs - new Date(data.start_time).getTime()) / 1000));
        } else {
          // Create new session
          const { data, error } = await supabase
            .from('lab_sessions')
            .insert({
              user_id: userId,
              start_time: now,
              end_time: now,
              status: 'active',
              manual_edit: false,
            })
            .select()
            .single();

          if (error) throw error;

          setActiveSession(data);
          setSessionStartTime(startTimeMs);
          setElapsedSeconds(0);
        }

        // Update profile
        if (userId) {
          await supabase.from('profiles').update({ is_in_lab: true }).eq('id', userId);
        }

        setIsRunning(true);
        setIsRecovering(false);
      } catch (err) {
        console.error('Error starting session:', err);
      }
    },
    [isRunning, userId]
  );

  const pauseSession = useCallback(() => {
    setIsRunning(false);
  }, []);

  const resumeSession = useCallback(() => {
    if (sessionStartTime) {
      setIsRunning(true);
    }
  }, [sessionStartTime]);

  const finishSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      const endTime = new Date().toISOString();

      const { error } = await supabase
        .from('lab_sessions')
        .update({
          end_time: endTime,
          status: 'completed',
        })
        .eq('id', activeSession.id);

      if (error) throw error;

      // Update profile
      if (userId) {
        await supabase.from('profiles').update({ is_in_lab: false, last_seen_at: endTime }).eq('id', userId);
      }

      setActiveSession(null);
      setElapsedSeconds(0);
      setIsRunning(false);
      setSessionStartTime(null);
      setIsRecovering(false);
    } catch (err) {
      console.error('Error finishing session:', err);
    }
  }, [activeSession, userId]);

  const quitSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      // Delete active session without saving
      const { error } = await supabase.from('lab_sessions').delete().eq('id', activeSession.id);

      if (error) throw error;

      // Update profile
      if (userId) {
        await supabase.from('profiles').update({ is_in_lab: false }).eq('id', userId);
      }

      setActiveSession(null);
      setElapsedSeconds(0);
      setIsRunning(false);
      setSessionStartTime(null);
      setIsRecovering(false);
    } catch (err) {
      console.error('Error quitting session:', err);
    }
  }, [activeSession, userId]);

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        elapsedSeconds,
        isRunning,
        isRecovering,
        startSession,
        pauseSession,
        resumeSession,
        finishSession,
        quitSession,
        loading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
