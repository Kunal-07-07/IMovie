import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Film, MapPin, Search, User, LogOut, ShieldAlert, Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDrawer from './NotificationDrawer';

const cities = ['Mumbai', 'Delhi NCR', 'Bengaluru', 'Hyderabad'];

const Navbar = ({ selectedCity, setSelectedCity, searchQuery, setSearchQuery }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header
      className="glass-panel"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.85rem 1.5rem'
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}
      >
        {/* Brand Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #e50914 0%, #880008 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(229, 9, 20, 0.6)'
            }}
          >
            <Film size={22} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontSize: '1.35rem',
                fontWeight: 900,
                letterSpacing: '-0.03em',
                lineHeight: 1,
                fontFamily: 'var(--font-heading)'
              }}
            >
              <span style={{ color: '#ffffff' }}>I</span>
              <span style={{ color: '#e50914' }}>MOVIES</span>
            </span>
            <span style={{ fontSize: '9px', letterSpacing: '0.12em', color: '#94a3b8', textTransform: 'uppercase' }}>
              Cinema Ticket Booking
            </span>
          </div>
        </Link>

        {/* City Selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'rgba(255, 255, 255, 0.05)',
            padding: '0.4rem 0.8rem',
            borderRadius: '999px',
            border: '1px solid var(--border-subtle)',
            fontSize: '13px',
            color: '#cbd5e1'
          }}
        >
          <MapPin size={15} color="#e50914" />
          <select
            value={selectedCity || 'Mumbai'}
            onChange={(e) => setSelectedCity && setSelectedCity(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
              fontWeight: 500
            }}
          >
            {cities.map((c) => (
              <option key={c} value={c} style={{ background: '#0e1322', color: '#f8fafc' }}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {/* Search Bar */}
        <div
          style={{
            flex: 1,
            maxWidth: '380px',
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '999px',
            padding: '0.4rem 1rem',
            gap: '0.6rem'
          }}
        >
          <Search size={16} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search for movies, genres, or theatres..."
            value={searchQuery || ''}
            onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#f8fafc',
              fontSize: '13px'
            }}
          />
        </div>

        {/* Right Nav Items */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link
            to="/"
            style={{
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'color 0.2s'
            }}
          >
            Movies
          </Link>

          {user && (
            <Link
              to="/my-bookings"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: '#cbd5e1',
                textDecoration: 'none',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <Ticket size={16} color="#e50914" />
              <span>My Tickets</span>
            </Link>
          )}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="badge-red"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                padding: '0.35rem 0.75rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <ShieldAlert size={14} /> Admin
            </Link>
          )}

          {/* Notifications */}
          <NotificationDrawer />

          {/* User Auth Profile or Login Button */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.06)'
                }}
              >
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}
                  alt={user.name}
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#f8fafc' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {showProfileMenu && (
                <div
                  className="glass-panel"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: '46px',
                    width: '200px',
                    borderRadius: '12px',
                    padding: '0.5rem',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.6)',
                    zIndex: 100
                  }}
                >
                  <div style={{ padding: '0.6rem 0.8rem', borderBottom: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontWeight: 600, fontSize: '13px' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{user.email}</div>
                  </div>

                  <Link
                    to="/my-bookings"
                    onClick={() => setShowProfileMenu(false)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem 0.8rem',
                      color: '#f8fafc',
                      textDecoration: 'none',
                      fontSize: '13px',
                      borderRadius: '8px',
                      marginTop: '4px'
                    }}
                  >
                    <Ticket size={15} /> My Bookings
                  </Link>

                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setShowProfileMenu(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.6rem 0.8rem',
                        color: '#ff4b55',
                        textDecoration: 'none',
                        fontSize: '13px',
                        borderRadius: '8px'
                      }}
                    >
                      <ShieldAlert size={15} /> Admin Dashboard
                    </Link>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowProfileMenu(false);
                      navigate('/');
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      color: '#ef4444',
                      background: 'none',
                      border: 'none',
                      fontSize: '13px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      textAlign: 'left'
                    }}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', fontSize: '13px', padding: '0.5rem 1.1rem' }}>
              <User size={15} /> Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
