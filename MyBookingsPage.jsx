import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, Clock, MapPin, AlertCircle, XCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';
import TicketModal from '../components/TicketModal';
import { toast } from 'react-toastify';

const MyBookingsPage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalBooking, setActiveModalBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/bookings/my-bookings');
      if (data.success) {
        setBookings(data.data);
      }
    } catch (err) {
      console.error('Error fetching bookings', err);
      toast.error('Unable to fetch your booking history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket? An 85% refund will be credited back to your original payment method.')) {
      return;
    }

    try {
      setCancellingId(bookingId);
      const { data } = await api.post(`/bookings/${bookingId}/cancel`);
      if (data.success) {
        toast.success(data.message || 'Ticket cancelled and seats released.');
        fetchBookings();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel ticket.');
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', marginBottom: '0.2rem' }}>
              My Cinema Bookings
            </h1>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>
              View digital entry passes, QR codes, or manage ticket cancellations.
            </p>
          </div>

          <button
            onClick={fetchBookings}
            className="btn-secondary"
            style={{ fontSize: '12px', padding: '0.45rem 0.85rem' }}
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: '4rem 0', textAlign: 'center', color: '#94a3b8' }}>
            Retrieving your passes...
          </div>
        ) : bookings.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              borderRadius: '20px',
              maxWidth: '500px',
              margin: '2rem auto'
            }}
          >
            <Ticket size={48} color="#e50914" style={{ margin: '0 auto 1rem', opacity: 0.6 }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
              No Tickets Booked Yet
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '1.5rem' }}>
              You don't have any movie ticket bookings yet. Explore our current cinema releases and secure your seats today!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookings.map((b) => {
              const isCancelled = b.status === 'cancelled';
              return (
                <div
                  key={b._id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px',
                    display: 'flex',
                    gap: '1.5rem',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    opacity: isCancelled ? 0.75 : 1
                  }}
                >
                  {/* Poster Thumbnail */}
                  <img
                    src={b.movie?.posterUrl || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=200&q=80'}
                    alt={b.movie?.title}
                    style={{ width: '75px', height: '105px', borderRadius: '10px', objectFit: 'cover' }}
                  />

                  {/* Booking Details */}
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                        {b.movie?.title}
                      </h3>
                      {isCancelled ? (
                        <span className="badge-red" style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px' }}>
                          CANCELLED
                        </span>
                      ) : (
                        <span style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: '1px solid rgba(34, 197, 94, 0.3)', fontSize: '10px', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>
                          CONFIRMED
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: '12.5px', color: '#cbd5e1', marginBottom: '0.4rem' }}>
                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>{b.theatre?.name}</span> • {b.show?.screenName || 'Screen 1'}
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} color="#38bdf8" /> {b.show?.showDate}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} color="#fbbf24" /> {b.show?.showTime}
                      </span>
                      <span>•</span>
                      <span style={{ fontWeight: 700, color: '#f8fafc' }}>
                        Seats: {b.seats?.join(', ')}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '0.4rem' }}>
                      Booking ID: <span style={{ color: '#cbd5e1' }}>{b.bookingId}</span> • Paid: ₹{b.totalAmount}
                      {isCancelled && b.refundAmount && (
                        <span style={{ color: '#f59e0b', marginLeft: '0.5rem' }}>
                          (Refund ₹{b.refundAmount} credited)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                    <button
                      onClick={() => setActiveModalBooking(b)}
                      className="btn-primary"
                      style={{ fontSize: '12.5px', padding: '0.5rem 1rem' }}
                    >
                      <Ticket size={14} /> View Digital Pass
                    </button>

                    {!isCancelled && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={cancellingId === b._id}
                        className="btn-secondary"
                        style={{ fontSize: '11.5px', padding: '0.45rem 1rem', color: '#ef4444' }}
                      >
                        <XCircle size={14} /> {cancellingId === b._id ? 'Cancelling...' : 'Cancel Ticket'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      {activeModalBooking && (
        <TicketModal
          booking={activeModalBooking}
          onClose={() => setActiveModalBooking(null)}
        />
      )}
    </div>
  );
};

export default MyBookingsPage;
