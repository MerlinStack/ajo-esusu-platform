import React, { useEffect, useRef } from 'react';
import { createBrowserRouter, RouterProvider, Navigate, Link } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Snackbar, Alert } from '@mui/material';
import getCustomTheme from './theme/muiTheme';
import useThemeStore from './store/useThemeStore';
import useAppStore from './store/useAppStore';
import { initAuthListener } from './firebase/auth';
import AppMainLayout from './layouts/AppMainLayout';
import ConsumerDashboard from './pages/ConsumerDashboard';
import AdminTerminal from './pages/AdminTerminal';

const LoginScreen = () => {
  const auth = useAppStore((s) => s.auth);
  const login = useAppStore((s) => s.login);
  const register = useAppStore((s) => s.register);
  const resetError = useAppStore((s) => s.resetError);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const toggleTheme = useThemeStore((s) => s.toggleTheme);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [regName, setRegName] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');

  useEffect(() => {
    resetError();
  }, [isRegistering, resetError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRegistering) {
      await register({ name: regName, email, phone: regPhone, password });
    } else {
      await login(email, password);
    }
  };

  if (auth.isAuthenticated && auth.currentUser) {
    const dest = auth.currentUser.role === 'Admin' ? '/admin' : '/';
    return <Navigate to={dest} replace />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode
          ? 'linear-gradient(135deg, #0a1929 0%, #0d2137 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #e8edf5 100%)',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: isDarkMode ? '#1a2a3a' : '#ffffff',
          borderRadius: 16,
          padding: 32,
          boxShadow: isDarkMode
            ? '0 8px 40px rgba(0,0,0,0.5)'
            : '0 8px 40px rgba(0,105,92,0.12)',
          border: isDarkMode
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(0,105,92,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#00695c',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
              <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
              <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '1.4rem',
              color: isDarkMode ? '#e3f2fd' : '#1a237e',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Ajo/Esusu Platform
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: isDarkMode ? '#b0bec5' : '#546e7a',
              marginTop: 4,
            }}
          >
            Digital Cooperative Savings &amp; Trust
          </p>
        </div>

        {auth.error && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: isDarkMode ? 'rgba(211,47,47,0.15)' : 'rgba(211,47,47,0.08)',
              color: '#d32f2f',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              marginBottom: 16,
              border: '1px solid rgba(211,47,47,0.2)',
            }}
          >
            {auth.error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            {isRegistering && (
              <>
                <label
                  style={{
                    display: 'block',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: isDarkMode ? '#b0bec5' : '#546e7a',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                  placeholder="e.g., Amara Okafor"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: isDarkMode
                      ? '1px solid rgba(255,255,255,0.12)'
                      : '1px solid rgba(0,0,0,0.12)',
                    background: isDarkMode ? '#0d2137' : '#f5f7fa',
                    color: isDarkMode ? '#e3f2fd' : '#1a237e',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ height: 12 }} />
              </>
            )}

            <label
              style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                fontWeight: 600,
                color: isDarkMode ? '#b0bec5' : '#546e7a',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: isDarkMode
                  ? '1px solid rgba(255,255,255,0.12)'
                  : '1px solid rgba(0,0,0,0.12)',
                background: isDarkMode ? '#0d2137' : '#f5f7fa',
                color: isDarkMode ? '#e3f2fd' : '#1a237e',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            {isRegistering && (
              <>
                <label
                  style={{
                    display: 'block',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    color: isDarkMode ? '#b0bec5' : '#546e7a',
                    marginBottom: 4,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+2348012345678"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: 8,
                    border: isDarkMode
                      ? '1px solid rgba(255,255,255,0.12)'
                      : '1px solid rgba(0,0,0,0.12)',
                    background: isDarkMode ? '#0d2137' : '#f5f7fa',
                    color: isDarkMode ? '#e3f2fd' : '#1a237e',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ height: 12 }} />
              </>
            )}

            <label
              style={{
                display: 'block',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.7rem',
                fontWeight: 600,
                color: isDarkMode ? '#b0bec5' : '#546e7a',
                marginBottom: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '10px 12px',
                borderRadius: 8,
                border: isDarkMode
                  ? '1px solid rgba(255,255,255,0.12)'
                  : '1px solid rgba(0,0,0,0.12)',
                background: isDarkMode ? '#0d2137' : '#f5f7fa',
                color: isDarkMode ? '#e3f2fd' : '#1a237e',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.8rem',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={auth.isLoading}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: 8,
              border: 'none',
              background: auth.isLoading ? '#999' : '#00695c',
              color: '#ffffff',
              fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: auth.isLoading ? 'not-allowed' : 'pointer',
              marginBottom: 12,
            }}
          >
            {auth.isLoading
              ? 'Processing...'
              : isRegistering
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            style={{
              background: 'none',
              border: 'none',
              color: '#00695c',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 4,
            }}
          >
            {isRegistering
              ? 'Already have an account? Sign In'
              : "Don't have an account? Register"}
          </button>
        </div>

        <div style={{ marginTop: 16, paddingTop: 12, borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.65rem',
              color: isDarkMode ? '#b0bec5' : '#546e7a',
              textAlign: 'center',
              margin: 0,
              marginBottom: 8,
            }}
          >
            Demo: amara.okafor@example.com / chidi.eze@example.com (password: password123)
          </p>
          <Link
            to="/admin/login"
            style={{
              display: 'block',
              textAlign: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.7rem',
              color: '#ff8f00',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Admin Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
};

const AdminLoginScreen = () => {
  const auth = useAppStore((s) => s.auth);
  const login = useAppStore((s) => s.login);
  const registerAdmin = useAppStore((s) => s.registerAdminWithVerification);
  const startUpgrade = useAppStore((s) => s.startAdminUpgrade);
  const checkVerification = useAppStore((s) => s.checkAdminEmailVerification);
  const resetError = useAppStore((s) => s.resetError);
  const isDarkMode = useThemeStore((s) => s.isDarkMode);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loginError, setLoginError] = React.useState(null);
  const [isRegistering, setIsRegistering] = React.useState(false);
  const [regName, setRegName] = React.useState('');
  const [regPhone, setRegPhone] = React.useState('');
  const [verificationSent, setVerificationSent] = React.useState(false);
  const [checkingVerification, setCheckingVerification] = React.useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = React.useState(false);
  const [upgradeLoading, setUpgradeLoading] = React.useState(false);

  useEffect(() => {
    resetError();
    setLoginError(null);
  }, [isRegistering, resetError]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoginError(null);
    if (isRegistering) {
      const result = await registerAdmin({ name: regName, email, phone: regPhone, password });
      if (result.emailSent) {
        setVerificationSent(true);
      } else if (result.error === 'email-in-use') {
        setShowUpgradePrompt(true);
      }
    } else {
      const result = await login(email, password);
      if (result.success) {
        const role = result.user?.role;
        if (role === 'Admin') {
          return;
        }
        if (role === 'PendingAdmin') {
          setVerificationSent(true);
          return;
        }
        useAppStore.getState().logout();
        setLoginError('Access denied. This portal is for administrators only.');
      } else {
        setLoginError(result.error || 'Invalid credentials.');
      }
    }
  };

  const handleUpgrade = async () => {
    setUpgradeLoading(true);
    setLoginError(null);
    const result = await startUpgrade(email, password, regName, regPhone);
    setUpgradeLoading(false);
    if (result.emailSent) {
      setShowUpgradePrompt(false);
      setVerificationSent(true);
    } else if (result.alreadyAdmin) {
      setShowUpgradePrompt(false);
    } else {
      setLoginError(result.error || 'Upgrade failed.');
    }
  };

  const handleCheckVerification = async () => {
    setCheckingVerification(true);
    setLoginError(null);
    const result = await checkVerification();
    setCheckingVerification(false);
    if (!result.success) {
      setLoginError(result.error || 'Email not verified yet.');
    }
  };

  if (auth.isAuthenticated && auth.currentUser?.role === 'Admin') {
    return <Navigate to="/admin" replace />;
  }

  if (verificationSent) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDarkMode ? 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%)', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 420, background: isDarkMode ? '#1a1a1a' : '#ffffff', borderRadius: 16, padding: 32, boxShadow: isDarkMode ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(211,47,47,0.12)', border: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(211,47,47,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'JetBrains Mono', 'Inter', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: isDarkMode ? '#e3f2fd' : '#b71c1c', margin: '0 0 8px' }}>Verify Your Email</h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: isDarkMode ? '#b0bec5' : '#546e7a', margin: 0, lineHeight: 1.5 }}>
              A verification email has been sent to <strong>{auth.currentUser?.email}</strong>. Click the link in the email to verify your admin account.
            </p>
          </div>
          {loginError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: isDarkMode ? 'rgba(211,47,47,0.15)' : 'rgba(211,47,47,0.08)', color: '#d32f2f', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', marginBottom: 16, border: '1px solid rgba(211,47,47,0.2)' }}>
              {loginError}
            </div>
          )}
          <button onClick={handleCheckVerification} disabled={checkingVerification} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: checkingVerification ? '#999' : '#d32f2f', color: '#ffffff', fontFamily: "'JetBrains Mono', 'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', cursor: checkingVerification ? 'not-allowed' : 'pointer', marginBottom: 12 }}>
            {checkingVerification ? 'Checking...' : 'I\'ve Verified — Continue'}
          </button>
          <button onClick={() => { setVerificationSent(false); useAppStore.getState().logout(); }} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid', borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', background: 'transparent', color: isDarkMode ? '#b0bec5' : '#546e7a', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', cursor: 'pointer' }}>
            Cancel &amp; Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showUpgradePrompt) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isDarkMode ? 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 100%)' : 'linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%)', padding: 16 }}>
        <div style={{ width: '100%', maxWidth: 420, background: isDarkMode ? '#1a1a1a' : '#ffffff', borderRadius: 16, padding: 32, boxShadow: isDarkMode ? '0 8px 40px rgba(0,0,0,0.5)' : '0 8px 40px rgba(211,47,47,0.12)', border: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(211,47,47,0.06)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontFamily: "'JetBrains Mono', 'Inter', sans-serif", fontWeight: 700, fontSize: '1.2rem', color: isDarkMode ? '#e3f2fd' : '#b71c1c', margin: '0 0 8px' }}>Account Already Exists</h1>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: isDarkMode ? '#b0bec5' : '#546e7a', margin: 0, lineHeight: 1.5 }}>
              An account with <strong>{email}</strong> already exists. Sign in with your password to upgrade it to an admin account. A verification email will be sent.
            </p>
          </div>
          {loginError && (
            <div style={{ padding: '10px 14px', borderRadius: 8, background: isDarkMode ? 'rgba(211,47,47,0.15)' : 'rgba(211,47,47,0.08)', color: '#d32f2f', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', marginBottom: 16, border: '1px solid rgba(211,47,47,0.2)' }}>
              {loginError}
            </div>
          )}
          <button onClick={handleUpgrade} disabled={upgradeLoading} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: upgradeLoading ? '#999' : '#d32f2f', color: '#ffffff', fontFamily: "'JetBrains Mono', 'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', cursor: upgradeLoading ? 'not-allowed' : 'pointer', marginBottom: 12 }}>
            {upgradeLoading ? 'Signing in...' : 'Sign In &amp; Upgrade to Admin'}
          </button>
          <button onClick={() => { setShowUpgradePrompt(false); setLoginError(null); }} style={{ width: '100%', padding: '8px', borderRadius: 8, border: '1px solid', borderColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', background: 'transparent', color: isDarkMode ? '#b0bec5' : '#546e7a', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', cursor: 'pointer' }}>
            Use a different email
          </button>
        </div>
      </div>
    );
  }

  const displayError = loginError || auth.error;

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDarkMode
          ? 'linear-gradient(135deg, #1a0000 0%, #2d0a0a 100%)'
          : 'linear-gradient(135deg, #fef2f2 0%, #fde8e8 100%)',
        padding: 16,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: isDarkMode ? '#1a1a1a' : '#ffffff',
          borderRadius: 16,
          padding: 32,
          boxShadow: isDarkMode
            ? '0 8px 40px rgba(0,0,0,0.5)'
            : '0 8px 40px rgba(211,47,47,0.12)',
          border: isDarkMode
            ? '1px solid rgba(255,255,255,0.06)'
            : '1px solid rgba(211,47,47,0.06)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: '#d32f2f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: "'JetBrains Mono', 'Inter', sans-serif",
              fontWeight: 700,
              fontSize: '1.4rem',
              color: isDarkMode ? '#e3f2fd' : '#b71c1c',
              margin: 0,
              letterSpacing: '-0.02em',
            }}
          >
            Admin Portal
          </h1>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              color: isDarkMode ? '#b0bec5' : '#546e7a',
              marginTop: 4,
            }}
          >
            {isRegistering ? 'Register a new admin account' : 'Ajo/Esusu &middot; Authorized Personnel Only'}
          </p>
        </div>

        {displayError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              background: isDarkMode ? 'rgba(211,47,47,0.15)' : 'rgba(211,47,47,0.08)',
              color: '#d32f2f',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.75rem',
              marginBottom: 16,
              border: '1px solid rgba(211,47,47,0.2)',
            }}
          >
            {displayError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600, color: isDarkMode ? '#b0bec5' : '#546e7a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input type="text" value={regName} onChange={(e) => setRegName(e.target.value)} required placeholder="e.g., Amara Okafor" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)', background: isDarkMode ? '#0d2137' : '#f5f7fa', color: isDarkMode ? '#e3f2fd' : '#1a237e', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600, color: isDarkMode ? '#b0bec5' : '#546e7a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</label>
                <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+2348012345678" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)', background: isDarkMode ? '#0d2137' : '#f5f7fa', color: isDarkMode ? '#e3f2fd' : '#1a237e', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            </>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600, color: isDarkMode ? '#b0bec5' : '#546e7a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Admin Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="admin@example.com" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)', background: isDarkMode ? '#0d2137' : '#f5f7fa', color: isDarkMode ? '#e3f2fd' : '#1a237e', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', fontWeight: 600, color: isDarkMode ? '#b0bec5' : '#546e7a', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Enter admin password" style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: isDarkMode ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.12)', background: isDarkMode ? '#0d2137' : '#f5f7fa', color: isDarkMode ? '#e3f2fd' : '#1a237e', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box' }} />
          </div>

          <button type="submit" disabled={auth.isLoading} style={{ width: '100%', padding: '12px', borderRadius: 8, border: 'none', background: auth.isLoading ? '#999' : '#d32f2f', color: '#ffffff', fontFamily: "'JetBrains Mono', 'Inter', sans-serif", fontWeight: 600, fontSize: '0.85rem', cursor: auth.isLoading ? 'not-allowed' : 'pointer', marginBottom: 12 }}>
            {auth.isLoading ? 'Processing...' : isRegistering ? 'Register Admin' : 'Access Admin Panel'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <button onClick={() => { setIsRegistering(!isRegistering); setLoginError(null); resetError(); }} style={{ background: 'none', border: 'none', color: '#d32f2f', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline', padding: 4 }}>
            {isRegistering ? 'Already an admin? Sign In' : "Don't have an admin account? Register"}
          </button>
        </div>

        <div style={{ textAlign: 'center' }}>
          <Link to="/login" style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: '#00695c', fontWeight: 600, textDecoration: 'underline' }}>
            &larr; Consumer Login
          </Link>
        </div>

        {!isRegistering && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: isDarkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.65rem', color: isDarkMode ? '#b0bec5' : '#546e7a', textAlign: 'center', margin: 0 }}>
              Admins: amara.okafor@example.com / tunde.bakare@example.com (password: password123)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const isAuthenticated = useAppStore((s) => s.auth.isAuthenticated);
  const currentUser = useAppStore((s) => s.auth.currentUser);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (requireAdmin && currentUser?.role !== 'Admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginScreen />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginScreen />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppMainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <ConsumerDashboard />,
      },
      {
        path: 'admin',
        element: (
          <ProtectedRoute requireAdmin>
            <AdminTerminal />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/login" replace />,
  },
]);

const App = () => {
  const isDarkMode = useThemeStore((s) => s.isDarkMode);
  const theme = getCustomTheme(isDarkMode);
  const seedInitialData = useAppStore((s) => s.seedInitialData);
  const onAuthChanged = useAppStore((s) => s.onAuthChanged);
  const snackbar = useAppStore((s) => s.ui.snackbar);
  const setSnackbar = useAppStore((s) => s.setSnackbar);
  const listenerRef = useRef(null);

  useEffect(() => {
    listenerRef.current = initAuthListener(async (firebaseUser) => {
      await onAuthChanged(firebaseUser);
    });
    return () => {
      if (listenerRef.current) listenerRef.current();
    };
  }, [onAuthChanged]);

  useEffect(() => {
    seedInitialData();
  }, [seedInitialData]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(false, '', 'info')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(false, '', 'info')}
          severity={snackbar.severity}
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            borderRadius: 2,
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
};

export default App;
