import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle, Eye, EyeOff, ShieldCheck } from 'lucide-react';

export const AdminLogin = () => {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // If already logged in as admin, redirect to admin panel
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        if (result.user.role === 'admin') {
          navigate('/admin');
        } else {
          logout();
          setError('Access denied. This portal is reserved exclusively for LUNSOLE administrators.');
        }
      } else {
        setError(result.error || 'Invalid administrator credentials');
      }
    } catch {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at top right, #1a1c26 0%, #0f1017 60%, #08090d 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle luxury ambient lighting */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '-15%', right: '-10%',
          width: 550, height: 550,
          background: 'radial-gradient(circle, rgba(197,168,128,0.08) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
        <div style={{
          position: 'absolute', bottom: '-15%', left: '-10%',
          width: 450, height: 450,
          background: 'radial-gradient(circle, rgba(197,168,128,0.05) 0%, transparent 70%)',
          borderRadius: '50%',
        }} />
      </div>

      {/* Login Card */}
      <div style={{
        maxWidth: 440, width: '100%', position: 'relative', zIndex: 1,
        background: 'rgba(18, 19, 26, 0.75)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(197,168,128,0.2)',
        borderRadius: 20,
        padding: '48px 40px',
        boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)',
      }}>
        {/* Logo mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16,
            background: 'linear-gradient(135deg, #c5a880 0%, #a88a60 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            boxShadow: '0 10px 28px rgba(197,168,128,0.35)',
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>
          <h1 style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '1.9rem', fontWeight: 700, color: '#c5a880',
            letterSpacing: '0.08em', margin: 0, lineHeight: 1,
          }}>
            LUNSOLE
          </h1>
          <p style={{
            fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.28em',
            textTransform: 'uppercase', color: 'rgba(197,168,128,0.6)',
            margin: '8px 0 0',
          }}>
            Executive Management Portal
          </p>
          <div style={{
            width: 44, height: 1,
            background: 'linear-gradient(90deg, transparent, #c5a880, transparent)',
            margin: '16px auto 0',
          }} />
        </div>

        {/* Error alert */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 10,
            background: 'rgba(239, 68, 68, 0.12)', color: '#fca5a5',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 10, padding: '12px 14px', fontSize: '0.83rem',
            marginBottom: 24, lineHeight: 1.5,
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#c5a880', pointerEvents: 'none' }} />
              <input
                type="email"
                id="admin-email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="admin@lunsole.com"
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,168,128,0.25)',
                  borderRadius: 10, color: '#fff', fontSize: '0.9rem',
                  outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#c5a880'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(197,168,128,0.25)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 32 }}>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#c5a880', pointerEvents: 'none' }} />
              <input
                type={showPass ? 'text' : 'password'}
                id="admin-password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{
                  width: '100%', padding: '13px 44px 13px 42px',
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,168,128,0.25)',
                  borderRadius: 10, color: '#fff', fontSize: '0.9rem',
                  outline: 'none', transition: 'all 0.2s', boxSizing: 'border-box',
                  fontFamily: 'inherit',
                }}
                onFocus={e => { e.target.style.borderColor = '#c5a880'; e.target.style.background = 'rgba(255,255,255,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(197,168,128,0.25)'; e.target.style.background = 'rgba(255,255,255,0.04)'; }}
              />
              <button
                type="button"
                onClick={() => setShowPass(p => !p)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'rgba(197,168,128,0.6)', padding: 4,
                  display: 'flex', alignItems: 'center',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? 'rgba(197,168,128,0.4)' : 'linear-gradient(135deg, #c5a880 0%, #a88a60 100%)',
              border: 'none', borderRadius: 10, color: '#ffffff',
              fontSize: '0.95rem', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.25s', letterSpacing: '0.04em',
              boxShadow: loading ? 'none' : '0 6px 20px rgba(197,168,128,0.35)',
              fontFamily: 'inherit',
            }}
          >
            {loading ? 'Authenticating Executive...' : 'Sign In to Executive Dashboard'}
          </button>
        </form>

        {/* Back link */}
        <div style={{ marginTop: 28, textAlign: 'center', borderTop: '1px solid rgba(197,168,128,0.12)', paddingTop: 22 }}>
          <Link to="/" style={{ color: 'rgba(197,168,128,0.5)', fontSize: '0.82rem', textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#c5a880'}
            onMouseLeave={e => e.target.style.color = 'rgba(197,168,128,0.5)'}
          >
            ← Return to Public Guest Website
          </Link>
        </div>
      </div>
    </div>
  );
};
