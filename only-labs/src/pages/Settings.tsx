import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { user, session, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogout = async () => {
    setIsLoggingOut(true);
    setErrorMsg('');
    try {
      await logout();
      navigate('/');
      window.location.reload();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to logout. Please try again.');
      setIsLoggingOut(false);
    }
  };

  return (
    <main style={{
      color: '#1a1a1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      padding: '20px',
      maxWidth: '450px',
      margin: '0 auto'
    }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button onClick={() => navigate(-1)} style={styles.iconBtn}>
          <ChevronLeft size={24} color="#1a1a1a" />
        </button>
        <h1 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Settings</h1>
        <div style={{ width: '24px' }} />
      </header>

      {errorMsg && (
        <div style={styles.errorBox}>
          {errorMsg}
        </div>
      )}

      {/* Account Section */}
      <section style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#8e8e93' }}>Account</h2>

        {/* User Info Card */}
        <div style={styles.card}>
          <div style={{ marginBottom: '16px' }}>
            <p style={{ fontSize: '12px', color: '#8e8e93', margin: '0 0 4px 0', fontWeight: 600 }}>Username</p>
            <p style={{ fontSize: '16px', color: '#1a1a1a', margin: 0, fontWeight: 500 }}>
              {user?.username || 'Not set'}
            </p>
          </div>

          <div style={{ borderBottom: '1px solid #f0f0f5', marginBottom: '16px' }} />

          <div>
            <p style={{ fontSize: '12px', color: '#8e8e93', margin: '0 0 4px 0', fontWeight: 600 }}>Email</p>
            <p style={{ fontSize: '16px', color: '#1a1a1a', margin: 0, fontWeight: 500 }}>
              {user?.email || session?.user?.email || 'Not available'}
            </p>
          </div>
        </div>
      </section>

      {/* Logout Section */}
      <section>
        <h2 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px', color: '#8e8e93' }}>Session</h2>

        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          style={{
            ...styles.logoutBtn,
            opacity: isLoggingOut ? 0.7 : 1,
            cursor: isLoggingOut ? 'not-allowed' : 'pointer'
          }}
        >
          <LogOut size={20} color="#FF6361" />
          <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>
      </section>

      {/* Info Footer */}
      <p style={{ fontSize: '12px', color: '#c7c7cc', textAlign: 'center', marginTop: '40px' }}>
        You are currently logged in to OnlyLabs
      </p>
    </main>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  iconBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    padding: '16px',
    border: '1px solid #f0f0f5',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
  },
  logoutBtn: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid #f0f0f5',
    backgroundColor: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    fontSize: '16px',
    fontWeight: 600,
    color: '#FF6361',
    boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
    transition: 'all 0.2s'
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: 500,
    border: '1px solid #fecaca',
    marginBottom: '16px'
  }
};
