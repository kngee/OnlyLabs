import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isPWA, setIsPWA] = useState(true);
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', checkStandalone);
      window.removeEventListener('resize', handleResize);
    };
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
        
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              username: username
            }
          }
        });
        
        if (signUpError) throw signUpError;

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

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in with Google');
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
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.cardWrapper}>
          <div style={styles.card}>
            <div style={styles.formSection}>
              <form onSubmit={handleAuth} style={styles.form}>
                <div style={styles.headerContainer}>
                  <h1 style={styles.title}>
                    {isLogin ? 'Welcome back' : 'Create Account'}
                  </h1>
                  <p style={styles.subtitle}>
                    {isLogin 
                      ? 'Login to your OnlyLabs account'
                      : 'Join the community and start creating today'
                    }
                  </p>
                </div>

                {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}
                {successMsg && <div style={styles.successBox}>{successMsg}</div>}

                {!isLogin && (
                  <div style={styles.fieldGroup}>
                    <label htmlFor="username" style={styles.label}>Full Name</label>
                    <input
                      id="username"
                      type="text"
                      placeholder="John Doe"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      style={styles.input}
                      required
                    />
                  </div>
                )}

                <div style={styles.fieldGroup}>
                  <label htmlFor="email" style={styles.label}>Email</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <div style={styles.passwordLabelContainer}>
                    <label htmlFor="password" style={styles.label}>Password</label>
                    {isLogin && (
                      <a href="#" style={styles.forgotLink}>Forgot your password?</a>
                    )}
                  </div>
                  <div style={styles.passwordWrapper}>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ ...styles.input, paddingRight: '40px' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={styles.eyeButton}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </div>

                {!isLogin && (
                  <div style={styles.checkboxContainer}>
                    <div 
                      style={{
                        ...styles.checkbox,
                        backgroundColor: acceptedPrivacy ? '#000' : 'transparent',
                        border: acceptedPrivacy ? '2px solid #000' : '2px solid #e5e7eb',
                      }}
                      onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}
                      role="checkbox"
                      aria-checked={acceptedPrivacy}
                    >
                      {acceptedPrivacy && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <label style={styles.checkboxLabel} onClick={() => setAcceptedPrivacy(!acceptedPrivacy)}>
                      I agree to the <a href="#" style={styles.link}>Privacy Policy</a> and <a href="#" style={styles.link}>Terms of Service</a>
                    </label>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  style={{
                    ...styles.button,
                    opacity: loading ? 0.7 : 1,
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? (
                    <span style={styles.loadingText}>
                      <span style={styles.spinner}></span>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </span>
                  ) : (
                    isLogin ? 'Login' : 'Create account'
                  )}
                </button>

                <div style={styles.divider}>
                  <div style={styles.dividerLine}></div>
                  <span style={styles.dividerText}>Or continue with</span>
                  <div style={styles.dividerLine}></div>
                </div>

                <div style={styles.socialButtons}>
                  <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    disabled={loading}
                    style={{
                      ...styles.socialButton,
                      opacity: loading ? 0.7 : 1,
                      cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                    title="Google"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span>Google</span>
                  </button>
                </div>

                <p style={styles.toggleText}>
                  {isLogin ? "Don't have an account? " : 'Already have an account? '}
                  <button 
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setErrorMsg('');
                      setSuccessMsg('');
                    }} 
                    style={styles.toggleButton}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </form>
            </div>

            {isDesktop && (
              <div style={styles.imageSection}>
                <img
                  src="https://images.unsplash.com/photo-1557821552-17105176677c?w=500&h=500&fit=crop"
                  alt="OnlyLabs"
                  style={styles.image}
                />
              </div>
            )}
          </div>

          <p style={styles.disclaimer}>
            By clicking continue, you agree to our <a href="#" style={styles.link}>Terms of Service</a> and <a href="#" style={styles.link}>Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: '24px 16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: 0,
    boxSizing: 'border-box' as const,
  },
  container: {
    width: '100%',
    maxWidth: '928px',
    margin: '0 auto',
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    overflow: 'hidden',
    borderRadius: '8px',
    backgroundColor: '#ffffff',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  formSection: {
    padding: '40px',
    display: 'flex',
    flexDirection: 'column' as const,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '16px',
  },
  headerContainer: {
    textAlign: 'center' as const,
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#111827',
    margin: 0,
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    lineHeight: '1.5',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1f2937',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontWeight: '500',
    boxSizing: 'border-box' as const,
    transition: 'all 0.2s ease',
  },
  passwordLabelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passwordWrapper: {
    position: 'relative' as const,
  },
  eyeButton: {
    position: 'absolute' as const,
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: 0,
    opacity: 0.6,
  },
  forgotLink: {
    fontSize: '12px',
    color: '#6b7280',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 0.2s',
    marginTop: '2px',
    cursor: 'pointer',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: 500,
    lineHeight: '1.5',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 16px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '4px',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  spinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '8px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const,
  },
  socialButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
  },
  socialButton: {
    padding: '10px 16px',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.2s',
    fontWeight: 600,
    fontSize: '14px',
  },
  toggleText: {
    fontSize: '13px',
    color: '#6b7280',
    textAlign: 'center' as const,
    margin: 0,
    fontWeight: 500,
  },
  toggleButton: {
    background: 'none',
    border: 'none',
    color: '#1f2937',
    fontWeight: 700,
    cursor: 'pointer',
    fontSize: '13px',
    textDecoration: 'underline',
    padding: 0,
  },
  imageSection: {
    position: 'relative' as const,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    minHeight: '300px',
    display: 'none',
  },
  image: {
    position: 'absolute' as const,
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    filter: 'brightness(0.8) grayscale(20%)',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    margin: '16px 0 0 0',
    lineHeight: '1.5',
  },
  link: {
    color: '#6b7280',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  errorBox: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '12px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'center' as const,
    fontWeight: 500,
    border: '1px solid #fecaca',
  },
  successBox: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    padding: '12px 14px',
    borderRadius: '6px',
    fontSize: '13px',
    textAlign: 'center' as const,
    fontWeight: 500,
    border: '1px solid #bbf7d0',
  },
};