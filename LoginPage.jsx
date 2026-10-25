import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Lock, Mail, UserCheck, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectPath = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await login(email, password);
    setSubmitting(false);
    if (res?.success) {
      navigate(redirectPath);
    }
  };

  const handleQuickLogin = async (type) => {
    if (type === 'admin') {
      setEmail('admin@imovies.com');
      setPassword('admin123');
      const res = await login('admin@imovies.com', 'admin123');
      if (res?.success) navigate('/admin');
    } else {
      setEmail('user@imovies.com');
      setPassword('user123');
      const res = await login('user@imovies.com', 'user123');
      if (res?.success) navigate(redirectPath);
    }
  };

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem'
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)'
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #e50914 0%, #880008 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              boxShadow: '0 0 20px rgba(229, 9, 20, 0.6)'
            }}
          >
            <Film size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.4rem' }}>
            Sign In to IMovies
          </h1>
          <p style={{ fontSize: '13px', color: '#94a3b8' }}>
            Book cinema tickets, manage passes, and track seat allocations.
          </p>
        </div>

        {/* Quick Demo Login Fillers */}
        <div style={{ marginBottom: '1.75rem', display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('user')}
            className="btn-secondary"
            style={{ flex: 1, fontSize: '11.5px', padding: '0.45rem', gap: '4px' }}
          >
            <UserCheck size={14} color="#38bdf8" /> Demo User
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="btn-secondary"
            style={{ flex: 1, fontSize: '11.5px', padding: '0.45rem', gap: '4px', color: '#ff4b55' }}
          >
            <ShieldAlert size={14} color="#e50914" /> Admin Demo
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#cbd5e1', display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} color="#64748b" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  color: '#f8fafc',
                  fontSize: '13.5px',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ width: '100%', padding: '0.75rem', fontSize: '14px', marginTop: '0.5rem' }}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '13px', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: '#e50914', fontWeight: 700, textDecoration: 'none' }}>
            Register Now
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
