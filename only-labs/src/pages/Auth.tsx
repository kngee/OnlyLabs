import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isPWA, setIsPWA] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true); // Default to Sign In as per design
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const checkStandalone = () => {
      // In development, ignore PWA requirement to make it easier to build.
      if (import.meta.env.DEV) {
        setIsPWA(true);
        return;
      }
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
        || ('standalone' in navigator && (navigator as any).standalone === true);
      setIsPWA(isStandalone);
    };

    checkStandalone();
    window.matchMedia('(display-mode: standalone)').addEventListener('change', checkStandalone);
    return () => window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuthSuccess();
      } else {
        if (!acceptedPrivacy) throw new Error('You must accept the Privacy Policy');
        if (!username) throw new Error('Username is required');
        
        // 1. Sign up the user in Supabase Auth
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          phone: phone || undefined,
          options: {
            data: {
              username: username,
              phone: phone
            }
          }
        });
        
        if (signUpError) throw signUpError;
        
        // 2. Add an entry to the public.profiles database table directly
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert([
              { 
                id: data.user.id, 
                username: username
              }
            ]);
            
          if (profileError) {
            console.error("Profile insertion error:", profileError);
            // It might fail if RLS blocks it, but we log the error for now
          }
        }

        if (data.session) {
          onAuthSuccess();
        } else {
          setSuccessMsg('Account created! Please check your email for the confirmation link.');
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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <h1 style={styles.title}>Install App</h1>
          <p style={{ textAlign: 'center', marginBottom: '40px', color: '#8e8e93', fontSize: '15px' }}>
            To use this app, you must add it to your Home Screen first.
          </p>
          <div style={{ backgroundColor: '#fcfcfc', padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1a1a1a', fontWeight: '500' }}>
              🍎 <span style={{ fontWeight: 'bold' }}>iOS:</span> Tap Share {"->"} Add to Home Screen
            </p>
            <p style={{ margin: 0, fontSize: '14px', color: '#1a1a1a', fontWeight: '500' }}>
              🤖 <span style={{ fontWeight: 'bold' }}>Android:</span> Tap Menu {"->"} Install App
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={styles.container}>
      <div style={styles.scrollWrapper}>
        <h1 style={styles.title}>{isLogin ? 'Sign In' : 'Sign Up'}</h1>

        {errorMsg && (
          <div style={styles.errorBox}>{errorMsg}</div>
        )}
        {successMsg && (
          <div style={styles.successBox}>{successMsg}</div>
        )}

        <form onSubmit={handleAuth} style={styles.form}>
          
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
            placeholder={isLogin ? "Phone / Email" : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          
          {!isLogin && (
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={styles.input}
            />
          )}

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />

          {!isLogin && (
            <div style={styles.checkboxContainer}>
              <div 
                style={{
                  ...styles.checkbox,
                  backgroundColor: acceptedPrivacy ? '#000' : 'transparent',
                  border: acceptedPrivacy ? '2px solid #000' : '2px solid #e0e0e0',
                }}
                onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
              >
                {acceptedPrivacy && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
              </div>
              <span style={styles.checkboxText} onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}>
                By continuing you accept our Privacy Policy
              </span>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
          </button>

          {isLogin && (
            <div style={styles.forgotPassword}>
              Forgot Password?
            </div>
          )}
        </form>

        <div style={styles.socialSection}>
          <p style={styles.socialTitle}>Sign in with</p>
          <div style={styles.socialRow}>
            {/* Apple Icon */}
            <div style={styles.socialIcon}>
              <svg viewBox="0 0 384 512" width="24" height="24">
                <path fill="#000" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
            </div>
            {/* Facebook Icon */}
            <div style={styles.socialIcon}>
              <svg viewBox="0 0 512 512" width="24" height="24">
                <path fill="#1877F2" d="M504 256C504 119 393 8 256 8S8 119 8 256c0 123.8 90.7 226.4 209.3 245V327.7h-63V256h63v-54.6c0-62.2 37-96.5 93.7-96.5 27.1 0 55.5 4.8 55.5 4.8v61h-31.3c-30.8 0-40.4 19.1-40.4 38.7V256h68.8l-11 71.7h-57.8V501C413.3 482.4 504 379.8 504 256z"/>
              </svg>
            </div>
            {/* Google Icon */}
            <div style={styles.socialIcon}>
              <svg viewBox="0 0 488 512" width="24" height="24">
                <path fill="#4285F4" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"/>
                <path fill="#34A853" d="M488 261.8c0 16.5-1.6 28.7-3.9 41.4H248v85.3h196.8c-5.8 36.5-42.6 106.9-140.8 106.9-84.6 0-153.7-70.1-153.7-156.6 0-139.4 164.2-203.4 252.5-81.8l-67.5-64.9z" opacity=".8"/>
                <path fill="#FBBC05" d="M248 137.6c36.1 0 68.3 12.8 93.6 35.8l67.5-64.9C369.3 67.5 313.3 43 248 43 147.2 43 60.5 106.6 23.3 194.2l82.7 64C126.5 186.2 182.1 137.6 248 137.6z"/>
                <path fill="#EA4335" d="M248 468c46.9 0 88.2-15.5 119.5-41.8l-82.3-64.1c-22.3 15-51.1 23.9-85.7 23.9-65.9 0-121.5-48.6-142-120.6l-82.7 64C60.5 417 147.2 468 248 468z"/>
              </svg>
            </div>
          </div>
        </div>

        <button onClick={() => {
          setIsLogin(!isLogin);
          setErrorMsg('');
          setSuccessMsg('');
        }} style={styles.toggleBtn}>
          {isLogin ? (
            <>Don't have an account? <span style={styles.linkText}>Sign Up</span></>
          ) : (
            <>Already have an account? <span style={styles.linkText}>Sign In</span></>
          )}
        </button>
      </div>
    </main>
  );
}

const styles = {
  container: {
    backgroundColor: '#ffffff',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column' as const,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
  },
  scrollWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '60px 32px 40px 32px',
    maxWidth: '450px',
    margin: '0 auto',
    width: '100%',
  },
  title: {
    fontSize: '32px',
    fontWeight: 700,
    marginBottom: '40px',
    color: '#000',
    textAlign: 'center' as const,
    marginTop: '40px',
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px'
  },
  input: {
    width: '100%',
    padding: '18px 20px',
    borderRadius: '12px',
    border: 'none',
    fontSize: '15px',
    outline: 'none',
    backgroundColor: '#FAFAFA',
    color: '#333',
    fontWeight: '500',
    boxSizing: 'border-box' as const
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px',
    marginBottom: '12px',
    cursor: 'pointer'
  },
  checkbox: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  checkboxText: {
    fontSize: '13px',
    color: '#aaa',
    fontWeight: '500'
  },
  submitBtn: {
    width: '100%',
    padding: '18px',
    marginTop: '12px',
    border: 'none',
    borderRadius: '12px',
    backgroundColor: '#000',
    color: '#fff',
    fontWeight: 'bold',
    fontSize: '16px',
    cursor: 'pointer',
  },
  forgotPassword: {
    textAlign: 'center' as const,
    fontSize: '13px',
    color: '#666',
    marginTop: '12px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  socialSection: {
    marginTop: '60px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center'
  },
  socialTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#333',
    marginBottom: '24px'
  },
  socialRow: {
    display: 'flex',
    gap: '30px',
    justifyContent: 'center'
  },
  socialIcon: {
    width: '45px',
    height: '45px',
    backgroundColor: '#fff',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
  },
  toggleBtn: {
    background: 'none',
    border: 'none',
    color: '#888',
    marginTop: 'auto',
    paddingTop: '60px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  linkText: {
    color: '#000',
    fontWeight: '700',
    textDecoration: 'underline'
  },
  errorBox: {
    backgroundColor: '#FFEbeb', 
    color: '#FF6B6B', 
    padding: '14px', 
    borderRadius: '12px', 
    marginBottom: '20px', 
    width: '100%', 
    fontSize: '14px', 
    textAlign: 'center' as const,
    fontWeight: '500'
  },
  successBox: {
    backgroundColor: '#E6F4EA', 
    color: '#1E4620', 
    padding: '14px', 
    borderRadius: '12px', 
    marginBottom: '20px', 
    width: '100%', 
    fontSize: '14px', 
    textAlign: 'center' as const,
    fontWeight: '500'
  }
};