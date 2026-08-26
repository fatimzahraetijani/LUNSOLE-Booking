import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, AlertTriangle } from 'lucide-react';

export const AdminLogin = () => {
  const { login, user, logout } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
          // If not admin, log out and deny access
          logout();
          setError('Access denied. This portal is reserved for administrators.');
        }
      } else {
        setError(result.error || 'Invalid administrator credentials');
      }
    } catch (err) {
      setError('An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '80vh', 
      backgroundColor: 'var(--bg-main)',
      padding: '24px'
    }}>
      <div style={{ 
        maxWidth: '420px', 
        width: '100%', 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '16px', 
        padding: '40px',
        boxShadow: 'var(--shadow-md)',
        textAlign: 'center'
      }}>
        <div style={{ 
          width: '60px', 
          height: '60px', 
          borderRadius: '50%', 
          backgroundColor: 'var(--primary)', 
          color: 'var(--accent)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          margin: '0 auto 24px' 
        }}>
          <Lock size={28} />
        </div>

        <h2 style={{ 
          fontSize: '2rem', 
          fontFamily: 'var(--font-serif)', 
          color: 'var(--primary)', 
          marginBottom: '8px' 
        }}>LUNSOLE</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
          Administrative Security Portal
        </p>

        {error && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            backgroundColor: 'rgba(198,40,40,0.1)', 
            color: 'var(--error)', 
            padding: '12px 16px', 
            borderRadius: '8px', 
            fontSize: '0.85rem', 
            textAlign: 'left',
            marginBottom: '24px',
            border: '1px solid rgba(198,40,40,0.2)'
          }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                placeholder="admin@lunsole.com"
                style={{ paddingLeft: '36px' }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label htmlFor="password">Security Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                id="password" 
                className="form-control" 
                placeholder="••••••••"
                style={{ paddingLeft: '36px' }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
            style={{ width: '100%', height: '48px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>

        <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textDecoration: 'none' }}>
            &larr; Return to Guest Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
