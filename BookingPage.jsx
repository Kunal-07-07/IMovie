import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Calendar, Clock, Ticket, ShieldCheck, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import SeatMatrix from '../components/SeatMatrix';
import { toast } from 'react-toastify';

const BookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const { socket, joinShowRoom } = useSocket();
  const { user } = useAuth();

  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [selectedSeatsDetails, setSelectedSeatsDetails] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch show and seats
  const fetchShowAndSeats = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/shows/${showId}`);
      if (data.success) {
        setShow(data.data.show);
        setSeats(data.data.seats);
      }
    } catch (err) {
      console.error('Error fetching show', err);
      toast.error('Unable to load seating arrangement.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (showId) {
      fetchShowAndSeats();
      joinShowRoom(showId);
    }
  }, [showId, socket]);

  // Listen for real-time socket events
  useEffect(() => {
    if (!socket) return;

    const handleSeatLocked = ({ seatNumber, lockedBy }) => {
      setSeats((prev) =>
        prev.map((s) =>
          s.seatNumber === seatNumber ? { ...s, status: 'locked', lockedBy } : s
        )
      );
    };

    const handleSeatUnlocked = ({ seatNumber }) => {
      setSeats((prev) =>
        prev.map((s) =>
          s.seatNumber === seatNumber ? { ...s, status: 'available', lockedBy: null } : s
        )
      );
    };

    const handleSeatsUpdated = ({ action }) => {
      fetchShowAndSeats();
    };

    socket.on('seat_locked', handleSeatLocked);
    socket.on('seat_unlocked', handleSeatUnlocked);
    socket.on('seats_updated', handleSeatsUpdated);

    return () => {
      socket.off('seat_locked', handleSeatLocked);
      socket.off('seat_unlocked', handleSeatUnlocked);
      socket.off('seats_updated', handleSeatsUpdated);
    };
  }, [socket]);

  // Toggle seat selection
  const handleSeatToggle = (seatNumber, isSelected, price, tier) => {
    if (isSelected) {
      setSelectedSeats((prev) => [...prev, seatNumber]);
      setSelectedSeatsDetails((prev) => [...prev, { seatNumber, price, tier }]);
    } else {
      setSelectedSeats((prev) => prev.filter((s) => s !== seatNumber));
      setSelectedSeatsDetails((prev) => prev.filter((s) => s.seatNumber !== seatNumber));
    }
  };

  const totalPrice = selectedSeatsDetails.reduce((sum, s) => sum + s.price, 0);

  const handleProceedToCheckout = () => {
    if (selectedSeats.length === 0) {
      toast.warning('Please select at least one seat to continue.');
      return;
    }

    if (!user) {
      toast.info('Please sign in or create an account to complete your booking.');
      navigate('/login', {
        state: {
          from: `/booking/${showId}`,
          bookingData: {
            showId,
            show,
            selectedSeats,
            selectedSeatsDetails,
            totalPrice
          }
        }
      });
      return;
    }

    // Save temporary booking payload and navigate to checkout
    sessionStorage.setItem(
      'current_booking_payload',
      JSON.stringify({
        showId,
        show,
        selectedSeats,
        selectedSeatsDetails,
        totalPrice
      })
    );

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Preparing auditorium seating...
      </div>
    );
  }

  if (!show) {
    return (
      <div style={{ padding: '5rem 1.5rem', textAlign: 'center', color: '#94a3b8' }}>
        Show not found. Please return to the movies page.
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '7rem' }}>
      {/* ================= HEADER BAR ================= */}
      <div
        className="glass-panel"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          padding: '1rem 1.5rem',
          position: 'sticky',
          top: '60px',
          zIndex: 40
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Back button and Movie Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--border-subtle)',
                color: '#f8fafc',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                  {show.movie?.title}
                </h1>
                <span className="badge-cyan" style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px' }}>
                  {show.format}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '2px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <MapPin size={12} color="#e50914" /> {show.theatre?.name} ({show.screenName})
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <Calendar size={12} color="#38bdf8" /> {show.showDate}
                </span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '3px', color: '#fbbf24', fontWeight: 600 }}>
                  <Clock size={12} /> {show.showTime}
                </span>
              </div>
            </div>
          </div>

          {/* Real-time Indicator */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'rgba(34, 197, 94, 0.1)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              padding: '0.35rem 0.85rem',
              borderRadius: '999px',
              fontSize: '11px',
              color: '#4ade80',
              fontWeight: 700
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: '#22c55e',
                boxShadow: '0 0 8px #22c55e'
              }}
            />
            Live Seat Sync Active
          </div>
        </div>
      </div>

      {/* ================= SEAT MATRIX SECTION ================= */}
      <div style={{ maxWidth: '1280px', margin: '3rem auto 0', padding: '0 1.5rem' }}>
        <SeatMatrix
          showId={showId}
          seats={seats}
          selectedSeats={selectedSeats}
          onSeatToggle={handleSeatToggle}
        />
      </div>

      {/* ================= FLOATING CHECKOUT DOCK ================= */}
      {selectedSeats.length > 0 && (
        <div
          className="glass-panel"
          style={{
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: '850px',
            borderRadius: '20px',
            padding: '1rem 1.5rem',
            border: '1px solid rgba(229, 9, 20, 0.4)',
            boxShadow: '0 15px 40px rgba(0, 0, 0, 0.8), 0 0 25px rgba(229, 9, 20, 0.3)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          {/* Selected Seats summary */}
          <div>
            <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}>
              Selected Seats ({selectedSeats.length})
            </div>
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '4px' }}>
              {selectedSeats.map((s) => (
                <span
                  key={s}
                  style={{
                    background: '#e50914',
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Price & Continue CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8' }}>Tickets Subtotal</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#fbbf24' }}>
                ₹{totalPrice}
              </div>
            </div>

            <button
              onClick={handleProceedToCheckout}
              className="btn-primary"
              style={{
                padding: '0.75rem 1.75rem',
                fontSize: '14px',
                borderRadius: '12px'
              }}
            >
              <Ticket size={16} /> Continue to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
