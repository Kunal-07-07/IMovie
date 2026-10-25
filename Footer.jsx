import React from 'react';
import { Film, Heart, Shield, Sparkles } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        marginTop: '5rem',
        borderTop: '1px solid var(--border-subtle)',
        background: '#05070e',
        padding: '3.5rem 1.5rem 2rem'
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem'
          }}
        >
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #e50914 0%, #880008 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Film size={18} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
                <span style={{ color: '#fff' }}>I</span>
                <span style={{ color: '#e50914' }}>MOVIES</span>
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.2rem' }}>
              The premium movie ticketing platform offering real-time seat availability, instant booking confirmation, and contactless cinema check-in.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className="badge-cyan" style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>MERN Stack</span>
              <span className="badge-gold" style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>Socket.io Live</span>
              <span className="badge-red" style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '6px' }}>JWT Secure</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
              Cinema Experience
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              <li style={{ marginBottom: '0.6rem' }}>Now Showing Blockbusters</li>
              <li style={{ marginBottom: '0.6rem' }}>IMAX 3D & 4DX Experiences</li>
              <li style={{ marginBottom: '0.6rem' }}>Dolby Atmos Auditoriums</li>
              <li style={{ marginBottom: '0.6rem' }}>Gourmet Cinema Dining</li>
            </ul>
          </div>

          {/* Supported Theatres */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
              Partner Theatres
            </h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', color: '#94a3b8' }}>
              <li style={{ marginBottom: '0.6rem' }}>PVR ICON & Superplex</li>
              <li style={{ marginBottom: '0.6rem' }}>INOX Megaplex</li>
              <li style={{ marginBottom: '0.6rem' }}>PVR Director’s Cut</li>
              <li style={{ marginBottom: '0.6rem' }}>Cinépolis VIP</li>
            </ul>
          </div>

          {/* Security & Support */}
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
              Safe & Guaranteed
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94a3b8', fontSize: '13px', marginBottom: '0.8rem' }}>
              <Shield size={18} color="#22c55e" />
              <span>100% Secure Checkout & Instant Refund</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#94a3b8', fontSize: '13px' }}>
              <Sparkles size={18} color="#f59e0b" />
              <span>Real-Time Seat Locking Engine</span>
            </div>
          </div>
        </div>

        <div
          style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center'
          }}
        >
          <div>
            © {new Date().getFullYear()} IMovies Cinema Management System. Built for SmartBridge Project Showcase.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
