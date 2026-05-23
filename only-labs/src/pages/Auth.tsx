import { useState, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AuthFlow = 'login' | 'signup' | 'forgot-password' | 'reset-password';

export default function Auth({ onAuthSuccess }: { onAuthSuccess: () => void }) {
  const [isPWA, setIsPWA] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);
  const [flow, setFlow] = useState<AuthFlow>('login');
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    const checkStandalone = () => {
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

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      onAuthSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (!username.trim()) {
      setErrorMsg('Username is required');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    if (!acceptedPrivacy) {
      setErrorMsg('You must accept the Privacy Policy and Terms of Service');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.trim(),
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        setSuccessMsg('Account created successfully! You can now sign in.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
        setAcceptedPrivacy(false);
        setTimeout(() => setFlow('login'), 2000);
      }
    } catch (err: any) {
      if (err.message.includes('already registered')) {
        setErrorMsg('This email is already registered. Please sign in instead.');
      } else if (err.message.includes('weak password')) {
        setErrorMsg('Password is too weak. Use a mix of letters, numbers, and symbols.');
      } else {
        setErrorMsg(err.message || 'Failed to create account');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}?flow=reset-password`,
      });

      if (error) throw error;

      setSuccessMsg('Password reset link sent to your email. Check your inbox!');
      setEmail('');
      setTimeout(() => setFlow('login'), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send password reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccessMsg('Password reset successfully! Signing you in...');
      setPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        onAuthSuccess();
      }, 2000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      clearMessages();
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
      <div style={{
        ...styles.card,
        gridTemplateColumns: isDesktop ? 'repeat(2, 1fr)' : '1fr',
      }}>
        {/* Form Section */}
        <div style={styles.formSection}>
          <div style={styles.headerContainer}>
            {flow !== 'login' && (
              <button
                type="button"
                onClick={() => {
                  clearMessages();
                  setFlow('login');
                  setPassword('');
                  setConfirmPassword('');
                }}
                style={styles.backButton}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <h1 style={styles.title}>
              {flow === 'login' && 'Welcome back'}
              {flow === 'signup' && 'Create Account'}
              {flow === 'forgot-password' && 'Reset Password'}
              {flow === 'reset-password' && 'Set New Password'}
            </h1>
            <p style={styles.subtitle}>
              {flow === 'login' && 'Sign in to your OnlyLabs account'}
              {flow === 'signup' && 'Join the community and start learning'}
              {flow === 'forgot-password' && 'Enter your email to receive a reset link'}
              {flow === 'reset-password' && 'Create a new password for your account'}
            </p>
          </div>

          {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}
          {successMsg && <div style={styles.successBox}>{successMsg}</div>}

          {flow === 'login' && (
            <form onSubmit={handleLogin} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <div style={styles.passwordLabelContainer}>
                  <label style={styles.label}>Password</label>
                  <button
                    type="button"
                    onClick={() => {
                      clearMessages();
                      setFlow('forgot-password');
                      setEmail('');
                      setPassword('');
                    }}
                    style={styles.forgotLink}
                  >
                    Forgot password?
                  </button>
                </div>
                <div style={styles.passwordWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner}></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>

              <div style={styles.divider}>
                <div style={styles.dividerLine}></div>
                <span style={styles.dividerText}>Or continue with</span>
                <div style={styles.dividerLine}></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                style={{
                  ...styles.socialButton,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{ width: '20px', height: '20px' }}>
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                </svg>
                <span>Google</span>
              </button>

              <p style={styles.toggleText}>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setFlow('signup');
                  }}
                  style={styles.toggleButton}
                >
                  Sign up
                </button>
              </p>
            </form>
          )}

          {flow === 'signup' && (
            <form onSubmit={handleSignup} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Full Name</label>
                <div style={styles.inputWrapper}>
                  <User size={18} style={styles.inputIcon} />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Password</label>
                <p style={{ ...styles.hint, marginBottom: '8px' }}>At least 6 characters</p>
                <div style={styles.passwordWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.passwordWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ ...styles.input, paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

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
                  I agree to the{' '}
                  <a href="#" style={styles.link} onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="#" style={styles.link} onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner}></span>
                    Creating account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>

              <p style={styles.toggleText}>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    clearMessages();
                    setFlow('login');
                  }}
                  style={styles.toggleButton}
                >
                  Sign in
                </button>
              </p>
            </form>
          )}

          {flow === 'forgot-password' && (
            <form onSubmit={handleForgotPassword} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Email</label>
                <div style={styles.inputWrapper}>
                  <Mail size={18} style={styles.inputIcon} />
                  <input
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={styles.input}
                    required
                  />
                </div>
              </div>

              <p style={styles.hint}>
                We'll send a password reset link to your email address.
              </p>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner}></span>
                    Sending...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </form>
          )}

          {flow === 'reset-password' && (
            <form onSubmit={handleResetPassword} style={styles.form}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>New Password</label>
                <p style={{ ...styles.hint, marginBottom: '8px' }}>At least 6 characters</p>
                <div style={styles.passwordWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Confirm Password</label>
                <div style={styles.passwordWrapper}>
                  <Lock size={18} style={styles.inputIcon} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={{ ...styles.input, paddingRight: '40px' }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...styles.button,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? (
                  <span style={styles.loadingText}>
                    <span style={styles.spinner}></span>
                    Resetting...
                  </span>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Animated Background Section (Desktop only) */}
        {isDesktop && (
          <div style={styles.backgroundSection}>
            <div style={styles.animatedGradient}></div>
            <div style={styles.gradientOverlay}>
              <div style={styles.brandText}>
                <h2 style={{ fontSize: '32px', fontWeight: 700, color: '#fff', margin: '0 0 16px 0' }}>OnlyLabs</h2>
                <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)', margin: 0, lineHeight: '1.6' }}>
                  Focus on learning. Track your progress. Collaborate with peers.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <p style={styles.disclaimer}>
        By using OnlyLabs, you agree to our{' '}
        <a href="#" style={styles.link} onClick={(e) => e.preventDefault()}>
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="#" style={styles.link} onClick={(e) => e.preventDefault()}>
          Privacy Policy
        </a>
        .
      </p>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  pageWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    margin: 0,
    boxSizing: 'border-box',
  },
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f4f9',
    padding: '24px 16px',
    fontFamily: 'sans-serif',
    margin: 0,
    boxSizing: 'border-box',
  },
  card: {
    display: 'grid',
    width: '100%',
    maxWidth: '900px',
    overflow: 'hidden',
    borderRadius: '16px',
    backgroundColor: '#ffffff',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
  },
  formSection: {
    padding: '40px 32px',
    display: 'flex',
    flexDirection: 'column',
  } as React.CSSProperties,
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    flex: 1,
  } as React.CSSProperties,
  headerContainer: {
    textAlign: 'center',
    marginBottom: '24px',
    position: 'relative',
  } as React.CSSProperties,
  backButton: {
    position: 'absolute',
    left: 0,
    top: 0,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#1f2937',
  },
  title: {
    fontSize: '28px',
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
    flexDirection: 'column',
    gap: '8px',
  } as React.CSSProperties,
  label: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#1f2937',
  },
  inputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  inputIcon: {
    position: 'absolute',
    left: '12px',
    color: '#9ca3af',
    pointerEvents: 'none',
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '11px 12px 11px 44px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#ffffff',
    color: '#111827',
    fontWeight: '500',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
  },
  passwordLabelContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  } as React.CSSProperties,
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  } as React.CSSProperties,
  eyeButton: {
    position: 'absolute',
    right: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.6,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#9ca3af',
  },
  forgotLink: {
    fontSize: '12px',
    color: '#6b7280',
    textDecoration: 'underline',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
  },
  checkboxContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '10px',
  } as React.CSSProperties,
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
  hint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
    fontStyle: 'italic',
  },
  button: {
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#000000',
    color: '#ffffff',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px',
    marginBottom: '4px',
  },
  loadingText: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  } as React.CSSProperties,
  spinner: {
    display: 'inline-block',
    width: '12px',
    height: '12px',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderTop: '2px solid #ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '16px 0 12px 0',
  } as React.CSSProperties,
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  socialButton: {
    padding: '11px 16px',
    borderRadius: '8px',
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
    textAlign: 'center',
    margin: '16px 0 0 0',
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
  backgroundSection: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    minHeight: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  animatedGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #4facfe 75%, #667eea 100%)',
    backgroundSize: '300% 300%',
    animation: 'gradient 15s ease infinite',
  },
  gradientOverlay: {
    position: 'relative',
    zIndex: 1,
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  } as React.CSSProperties,
  brandText: {
    color: '#ffffff',
  },
  disclaimer: {
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
    margin: '20px 0 0 0',
    lineHeight: '1.5',
  },
  link: {
    color: '#6b7280',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
};

// Add CSS animations for the spinner and gradient
const style = document.createElement('style');
style.textContent = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
  @media (max-width: 767px) {
    input {
      font-size: 16px !important;
    }
  }
`;
document.head.appendChild(style);
