import { useState, useEffect } from 'react';
import { ChevronLeft, Settings, Code, RotateCcw, Pause, Play, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const TOTAL_TIME = 25 * 60; // 25 minutes
  const [timeLeft, setTimeLeft] = useState(9 * 60 + 58); // default based on image 9:58
  const [isActive, setIsActive] = useState(false);
  const [session, setSession] = useState(2);
  const totalSessions = 4;
  const navigate = useNavigate();

  useEffect(() => {
    let interval: number | null = null;
    
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft(timeLeft => timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    
    return () => {
      if (interval) window.clearInterval(interval);
    };
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setTimeLeft(TOTAL_TIME); };
  const stopTimer = () => { setIsActive(false); setTimeLeft(TOTAL_TIME); setSession(1); };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const currentTask = {
    title: "Angular tutorial",
    totalTimeMins: 60,
    sessionDurationMins: 25
  };

  // SVG Progress calculation
  const radius = 110;
  const circumference = 2 * Math.PI * radius;
  const progress = ((TOTAL_TIME - timeLeft) / TOTAL_TIME);
  const dashoffset = circumference * (1 - progress);

  return (
    <main style={{ 
      backgroundColor: '#ffffff', 
      minHeight: '100vh', 
      padding: '24px',
      color: '#1a1a1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
    }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#1a1a1a" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Pomodoro timer</h1>
        <button style={styles.iconBtn}>
          <Settings size={22} color="#1a1a1a" />
        </button>
      </header>

      {/* Task Card */}
      <div style={styles.taskCard}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={styles.taskIconWrapper}>
            <Code size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>{currentTask.title}</h2>
            <p style={{ fontSize: '14px', color: '#8e8e93', margin: 0 }}>{currentTask.totalTimeMins} mins</p>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 4px 0' }}>{session}/{totalSessions}</p>
          <p style={{ fontSize: '14px', color: '#8e8e93', margin: 0 }}>{currentTask.sessionDurationMins} mins</p>
        </div>
      </div>

      {/* Timer Circle */}
      <div style={styles.timerWrapper}>
        <svg width="260" height="260" viewBox="0 0 260 260" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle cx="130" cy="130" r={radius} stroke="#f0f0f5" strokeWidth="12" fill="none" />
          {/* Progress circle */}
          <circle cx="130" cy="130" r={radius} stroke="#537DF5" strokeWidth="12" fill="none" strokeLinecap="round" style={{ strokeDasharray: circumference, strokeDashoffset: dashoffset, transition: 'stroke-dashoffset 1s linear' }} />
          {/* Knob */}
          <circle cx="130" cy="130" r="10" fill="#537DF5" style={{ transformOrigin: '130px 130px', transform: `rotate(${progress * 360}deg) translateX(${radius}px)`, transition: 'transform 1s linear' }} />
        </svg>

        {/* Timer Text */}
        <div style={styles.timerTextContainer}>
          <span style={styles.timerTime}>{formatTime(timeLeft)}</span>
          <span style={styles.timerSession}>{session} of {totalSessions} sessions</span>
        </div>
      </div>

      {/* Stay Focus Text */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <p style={{ fontSize: '14px', color: '#8e8e93' }}>Stay focus for {currentTask.sessionDurationMins} minutes</p>
      </div>

      {/* Controls */}
      <div style={styles.controlsWrapper}>
        <button onClick={resetTimer} style={{ ...styles.controlBtn, ...styles.secondaryControl }}>
          <RotateCcw size={20} color="#a1a1aa" />
        </button>
        <button onClick={toggleTimer} style={styles.mainControlBtn}>
          {isActive ? <Pause size={28} color="#fff" fill="#fff" /> : <Play size={28} color="#fff" fill="#fff" />}
        </button>
        <button onClick={stopTimer} style={{ ...styles.controlBtn, ...styles.secondaryControl }}>
          <Square size={20} color="#a1a1aa" fill="#a1a1aa" />
        </button>
      </div>
    </main>
  );
}

const styles = {
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  taskCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid #f0f0f5', borderRadius: '16px', marginBottom: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
  taskIconWrapper: { width: '44px', height: '44px', backgroundColor: '#FF6361', borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  timerWrapper: { position: 'relative' as const, display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px' },
  timerTextContainer: { position: 'absolute' as const, top: '0', left: '0', right: '0', bottom: '0', display: 'flex', flexDirection: 'column' as const, justifyContent: 'center', alignItems: 'center' },
  timerTime: { fontSize: '56px', fontWeight: 700, color: '#1a1a1a', lineHeight: '1', marginBottom: '8px' },
  timerSession: { fontSize: '14px', color: '#8e8e93' },
  controlsWrapper: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '24px' },
  controlBtn: { border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', outline: 'none' },
  secondaryControl: { width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.06)' },
  mainControlBtn: { width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#FF6361', border: 'none', boxShadow: '0 8px 24px rgba(255, 99, 97, 0.4)', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', outline: 'none' }
};