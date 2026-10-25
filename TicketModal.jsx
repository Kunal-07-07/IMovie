import React from 'react';
import { X, Printer, CheckCircle2, MapPin, Calendar, Clock, Ticket } from 'lucide-react';

const TicketModal = ({ booking, onClose }) => {
  if (!booking) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem'
      }}
    >
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '520px',
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 30px rgba(229, 9, 20, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          background: '#0d1322'
        }}
      >
        {/* Header Bar */}
        <div
          style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'linear-gradient(90deg, #151c30 0%, #0d1322 100%)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#22c55e' }}>
            <CheckCircle2 size={18} />
            <span style={{ fontWeight: 700, fontSize: '14px', color: '#f8fafc' }}>
              Booking Confirmed
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Digital Ticket Body */}
        <div style={{ padding: '1.75rem', position: 'relative' }}>
          {/* Movie banner row */}
          <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <img
              src={booking.movie?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=300&q=80'}
              alt={booking.movie?.title}
              style={{
                width: '85px',
                height: '115px',
                borderRadius: '12px',
                objectFit: 'cover',
                boxShadow: '0 8px 16px rgba(0,0,0,0.5)'
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: 'inline-block',
                  background: 'rgba(229, 9, 20, 0.2)',
                  color: '#ff4b55',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '0.3rem'
                }}
              >
                {booking.show?.format || 'IMAX 3D'}
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.3rem' }}>
                {booking.movie?.title}
              </h2>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                {booking.movie?.language} • {booking.movie?.duration ? `${Math.floor(booking.movie.duration / 60)}h ${booking.movie.duration % 60}m` : '2h 30m'}
              </div>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 600, marginTop: '0.4rem' }}>
                Booking ID: {booking.bookingId}
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              marginBottom: '1.5rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                <MapPin size={12} color="#e50914" /> Cinema & Screen
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                {booking.theatre?.name}
              </div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>
                {booking.show?.screenName || 'Screen 1'}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                <Calendar size={12} color="#38bdf8" /> Date & Time
              </div>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#f8fafc' }}>
                {booking.show?.showDate}
              </div>
              <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: 600 }}>
                {booking.show?.showTime}
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                <Ticket size={12} color="#f59e0b" /> Reserved Seats
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#fbbf24' }}>
                {booking.seats?.join(', ')}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                {booking.seats?.length} {booking.seats?.length === 1 ? 'Ticket' : 'Tickets'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '2px' }}>
                Amount Paid
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#22c55e' }}>
                ₹{booking.totalAmount}
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>
                All taxes & fees included
              </div>
            </div>
          </div>

          {/* QR Code & Barcode Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              paddingTop: '1rem',
              borderTop: '2px dashed rgba(255, 255, 255, 0.15)'
            }}
          >
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
                Scan at Cinema Entry
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', lineHeight: 1.4 }}>
                Show this digital QR code directly at the theatre turnstile for instant admission.
              </div>
            </div>

            {booking.qrCode && (
              <div
                style={{
                  background: '#ffffff',
                  padding: '6px',
                  borderRadius: '10px',
                  flexShrink: 0
                }}
              >
                <img
                  src={booking.qrCode}
                  alt="Boarding QR Code"
                  style={{ width: '85px', height: '85px', display: 'block' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            padding: '1.25rem 1.75rem',
            background: 'rgba(14, 19, 34, 0.95)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            gap: '1rem',
            justifyContent: 'flex-end'
          }}
        >
          <button onClick={handlePrint} className="btn-secondary" style={{ fontSize: '13px' }}>
            <Printer size={15} /> Print / Save PDF
          </button>
          <button onClick={onClose} className="btn-primary" style={{ fontSize: '13px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default TicketModal;
