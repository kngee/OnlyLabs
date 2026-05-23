import { useState, useEffect } from 'react';
import { ChevronLeft, Settings, Play, Pause, X, Check, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSession } from '../contexts/SessionContext';
import { supabase } from '../lib/supabase';

interface CompletedSession {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSession, elapsedSeconds, isRunning, isRecovering, startSession, pauseSession, resumeSession, finishSession, quitSession, loading: sessionLoading } = useSession();

  const [completedSessions, setCompletedSessions] = useState<CompletedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTimerModal, setShowTimerModal] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Fetch completed sessions for today
  useEffect(() => {
    if (!user) return;

    const fetchTodaysSessions = async () => {
      try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStart = today.toISOString();

        const { data, error } = await supabase
          .from('lab_sessions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'completed')
          .gte('start_time', todayStart)
          .order('start_time', { ascending: false });

        if (error) throw error;
        setCompletedSessions(data || []);
      } catch (err) {
        console.error('Error fetching sessions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTodaysSessions();
  }, [user, activeSession]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDuration = (start: string, end: string) => {
    const startMs = new Date(start).getTime();
    const endMs = new Date(end).getTime();
    const seconds = Math.floor((endMs - startMs) / 1000);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      setDeleting(sessionId);
      const { error } = await supabase.from('lab_sessions').delete().eq('id', sessionId);

      if (error) throw error;
      setCompletedSessions(completedSessions.filter(s => s.id !== sessionId));
      setDeleting(null);
    } catch (err) {
      console.error('Error deleting session:', err);
      setDeleting(null);
    }
  };

  if (sessionLoading) {
    return <main style={styles.main}><p style={{ textAlign: 'center', color: '#8e8e93' }}>Loading session...</p></main>;
  }

  return (
    <main style={styles.main}>
      {/* Header */}
      <header style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.iconBtn}>
          <ChevronLeft size={24} />
        </button>
        <h1 style={styles.title}>Task</h1>
        <button style={styles.iconBtn}>
          <Settings size={22} />
        </button>
      </header>

      <div style={styles.container}>
        {/* Active Session Card */}
        {activeSession && (
          <div style={{...styles.activeCard, position: 'relative', opacity: isRecovering ? 0.8 : 1}}>
            {isRecovering && <div style={styles.recoveringBadge}>Resuming...</div>}
            <div style={styles.activeCardContent}>
              <div style={styles.timeDisplay}>{formatTime(elapsedSeconds)}</div>
              <div style={styles.activeLabel}>Active Session</div>
            </div>
            <button
              onClick={() => setShowTimerModal(true)}
              style={styles.expandBtn}
              title="Open timer"
            >
              →
            </button>
          </div>
        )}

        {/* Today's Sessions */}
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>Today</h2>
          {loading ? (
            <p style={{ color: '#8e8e93' }}>Loading sessions...</p>
          ) : completedSessions.length === 0 ? (
            <p style={{ color: '#8e8e93' }}>No sessions yet</p>
          ) : (
            <div style={styles.sessionsList}>
              {completedSessions.map(session => (
                <div key={session.id} style={styles.sessionItem}>
                  <div>
                    <p style={styles.duration}>{formatDuration(session.start_time, session.end_time)}</p>
                    <p style={styles.time}>{new Date(session.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteSession(session.id)}
                    disabled={deleting === session.id}
                    style={styles.deleteBtn}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Start Button (if no active session) */}
        {!activeSession && (
          <button
            onClick={() => startSession()}
            style={styles.startBtn}
          >
            <Play size={20} fill="#fff" color="#fff" style={{ marginRight: '8px' }} />
            Start Session
          </button>
        )}
      </div>

      {/* Timer Modal */}
      {showTimerModal && activeSession && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            {/* Modal Header */}
            <div style={styles.modalHeader}>
              <button onClick={() => setShowTimerModal(false)} style={styles.closeBtn}>
                <X size={24} />
              </button>
              <h2 style={styles.modalTitle}>Study Session</h2>
              <div style={{ width: '24px' }} />
            </div>

            {/* Large Timer Display */}
            <div style={styles.timerDisplay}>
              <div style={styles.largeTime}>{formatTime(elapsedSeconds)}</div>
            </div>

            {/* Controls */}
            <div style={styles.modalControls}>
              {isRunning ? (
                <button onClick={pauseSession} style={{ ...styles.modalBtn, ...styles.pauseBtn }}>
                  <Pause size={24} fill="#fff" />
                </button>
              ) : (
                <button onClick={resumeSession} style={{ ...styles.modalBtn, ...styles.pauseBtn }}>
                  <Play size={24} fill="#fff" />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div style={styles.actionButtons}>
              <button onClick={finishSession} style={{ ...styles.actionBtn, ...styles.finishBtn }}>
                <Check size={20} />
                Finish
              </button>
              <button onClick={quitSession} style={{ ...styles.actionBtn, ...styles.quitBtn }}>
                <X size={20} />
                Quit
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  main: {
    color: '#1a1a1a',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    padding: '20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
  },
  title: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  container: {
    maxWidth: '450px',
    margin: '0 auto',
  },
  activeCard: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: '16px',
    borderRadius: '16px',
    marginBottom: '32px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recoveringBadge: {
    position: 'absolute',
    top: '8px',
    right: '8px',
    fontSize: '10px',
    backgroundColor: '#6366F1',
    padding: '4px 8px',
    borderRadius: '4px',
    color: '#fff',
  } as React.CSSProperties,
  activeCardContent: {
    flex: 1,
  },
  timeDisplay: {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '4px',
  },
  activeLabel: {
    fontSize: '14px',
    color: '#a1a1aa',
  },
  expandBtn: {
    background: 'none',
    border: 'none',
    color: '#6366F1',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
  },
  section: {
    marginBottom: '32px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#8e8e93',
    margin: '0 0 16px 0',
  },
  sessionsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,
  sessionItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    border: '1px solid #f0f0f5',
    borderRadius: '12px',
    backgroundColor: '#ffffff',
  },
  duration: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#1a1a1a',
    margin: '0 0 4px 0',
  },
  time: {
    fontSize: '12px',
    color: '#8e8e93',
    margin: 0,
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  startBtn: {
    width: '100%',
    padding: '16px',
    backgroundColor: '#6366F1',
    color: '#fff',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '24px',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as React.CSSProperties,
  modal: {
    backgroundColor: '#fff',
    borderRadius: '24px',
    padding: '24px',
    maxWidth: '400px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  } as React.CSSProperties,
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1a1a1a',
  },
  modalTitle: {
    fontSize: '18px',
    fontWeight: 600,
    margin: 0,
  },
  timerDisplay: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#f0f4f9',
    borderRadius: '16px',
  },
  largeTime: {
    fontSize: '64px',
    fontWeight: 700,
    color: '#1a1a1a',
    margin: 0,
  },
  modalControls: {
    display: 'flex',
    justifyContent: 'center',
    gap: '24px',
  } as React.CSSProperties,
  modalBtn: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
  },
  pauseBtn: {
    backgroundColor: '#6366F1',
    color: '#fff',
  },
  actionButtons: {
    display: 'flex',
    gap: '12px',
  } as React.CSSProperties,
  actionBtn: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  finishBtn: {
    backgroundColor: '#10b981',
    color: '#fff',
  },
  quitBtn: {
    backgroundColor: '#ef4444',
    color: '#fff',
  },
};
