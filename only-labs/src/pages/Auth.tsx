import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isPWA, setIsPWA] = useState(true); // default true mostly so it doesn't flicker, we check on mount
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Check if the app is running in Standalone mode (added to home screen)
    const checkStandalone = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || ('standalone' in navigator && (navigator as any).standalone === true);
      
      // FOR DEV: bypass PWA requirement when testing locally by setting to true
      setIsPWA(import.meta.env.DEV ? true : isStandalone);
    };

    checkStandalone();
    
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
    return () => window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      } else {
        if (!username) throw new Error('Username is required');
        
        // Setup initial user signup
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username // this goes to auth raw_user_meta_data and can be passed to our profile via database trigger
            }
          }
        });
        
        if (error) throw error;
        
        if (data.session) {
          onAuthSuccess();
        } else {
          setErrorMsg('Check your email for the confirmation link!');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isPWA) {
    return (
      <main style={styles.container}>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Add to Homescreen</h1>
        <p style={{ textAlign: 'center', marginBottom: '40px', color: '#8e8e93' }}>
          To sign up and use OnlyLabs, you must first add this app to your Home Screen.
        </p>
        <p style={{ textAlign: 'center', color: '#1a1a1a', fontWeight: 'bold' }}>
          iOS: Tap Share {"->"} Add to Home Screen<br />
          Android: Tap Menu {"->"} Install App
        </p>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</h1>
      <p style={{ fontSize: '14px', color: '#8e8e93', marginBottom: '40px' }}>
        {isLogin ? 'Enter your details to continue.' : 'Join the OnlyLabs community.'}
      </p>

      {errorMsg && (
        <div style={{ backgroundColor: '#FFEbeb', color: '#FF6B6B', padding: '12px', borderRadius: '8px', marginBottom: '20px', width: '100%', fontSize: '14px', textAlign: 'center' }}>
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleAuth} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={styles.input}
            required
          />
        )}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" disabled={loading} style={styles.submitBtn}>
          {loading ? 'Processing...' : (isLogin ? 'SIGN IN' : 'SIGN UP')}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} style={styles.toggleBtn}>
        {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
      </button>
    </main>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  input: {
    width: '100%',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e0e0e0',
    fontSize: '16px',
    outline: 'none',
    backgroundColor: '#f9f9f9',
  },
  submitBtn: {
    width: '100%',
    padding: '18px',
    marginTop: '20px',
    border: 'none',
    borderRadius: '16px',
    backgroundColor: '#537DF5',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(83, 125, 245, 0.3)',
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#8e8e93',
    marginTop: '30px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500'
  }
};