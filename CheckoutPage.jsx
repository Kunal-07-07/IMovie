import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Plus, Minus, CreditCard, QrCode, Building, Lock, CheckCircle2, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import TicketModal from '../components/TicketModal';
import { toast } from 'react-toastify';

const availableSnacks = [
  {
    id: 'snack-1',
    name: 'Caramel Popcorn & Coke Combo',
    description: 'Large tub of crunchy caramel popcorn + 600ml chilled fountain drink',
    price: 290,
    image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'snack-2',
    name: 'Gourmet Cheese Nachos',
    description: 'Crispy corn tortilla chips with warm jalapeño cheese sauce and salsa',
    price: 210,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'snack-3',
    name: 'Chilled Coke Zero',
    description: 'Crisp refreshing cola with zero sugar (500ml)',
    price: 120,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=300&q=80'
  }
];

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingPayload, setBookingPayload] = useState(null);
  const [snacksCart, setSnacksCart] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [processing, setProcessing] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Form states for simulation
  const [upiId, setUpiId] = useState('kunal@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvv, setCardCvv] = useState('741');

  useEffect(() => {
    const raw = sessionStorage.getItem('current_booking_payload');
    if (!raw) {
      toast.warning('No active booking found. Please choose seats first.');
      navigate('/');
      return;
    }
    setBookingPayload(JSON.parse(raw));
  }, [navigate]);

  if (!bookingPayload) return null;

  const { show, selectedSeats, selectedSeatsDetails } = bookingPayload;

  // Handle snack increment/decrement
  const updateSnackQty = (snack, delta) => {
    setSnacksCart((prev) => {
      const current = prev[snack.id]?.quantity || 0;
      const updated = current + delta;
      if (updated <= 0) {
        const copy = { ...prev };
        delete copy[snack.id];
        return copy;
      }
      return {
        ...prev,
        [snack.id]: {
          name: snack.name,
          price: snack.price,
          quantity: updated
        }
      };
    });
  };

  // Calculations
  const ticketsSubtotal = selectedSeatsDetails.reduce((sum, s) => sum + s.price, 0);
  const snacksTotal = Object.values(snacksCart).reduce((sum, item) => sum + item.price * item.quantity, 0);
  const convenienceFee = selectedSeats.length * 25;
  const tax = Math.round((ticketsSubtotal + snacksTotal) * 0.18);
  const grandTotal = ticketsSubtotal + snacksTotal + convenienceFee + tax;

  const handlePayAndConfirm = async () => {
    try {
      setProcessing(true);

      const snacksList = Object.values(snacksCart).map((item) => ({
        name: item.name,
        quantity: item.quantity,
        price: item.price
      }));

      const payload = {
        showId: show._id,
        seatNumbers: selectedSeats,
        snacks: snacksList,
        paymentMethod
      };

      const { data } = await api.post('/bookings', payload);

      if (data.success) {
        // Confetti effect
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 }
        });

        sessionStorage.removeItem('current_booking_payload');
        setConfirmedBooking(data.data);
        toast.success('Payment verified! Booking confirmed!');
      }
    } catch (err) {
      console.error('Booking failed', err);
      toast.error(err.response?.data?.message || 'Transaction could not be completed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc', marginBottom: '2rem' }}>
          Checkout & Confirmation
        </h1>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start'
          }}
        >
          {/* ================= LEFT COLUMN: SNACKS & PAYMENT ================= */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Food & Beverages Section */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Grab Cinema Bites & Drinks
                </h3>
                <span className="badge-gold" style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '4px' }}>
                  Delivered to Seat
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {availableSnacks.map((snack) => {
                  const qty = snacksCart[snack.id]?.quantity || 0;
                  return (
                    <div
                      key={snack.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.85rem',
                        borderRadius: '12px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <img
                        src={snack.image}
                        alt={snack.name}
                        style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '13px', color: '#f8fafc' }}>{snack.name}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8', margin: '2px 0 4px' }}>{snack.description}</div>
                        <div style={{ fontWeight: 800, color: '#fbbf24', fontSize: '13px' }}>₹{snack.price}</div>
                      </div>

                      {/* Quantity Controller */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          background: 'rgba(255, 255, 255, 0.06)',
                          borderRadius: '8px',
                          padding: '4px'
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => updateSnackQty(snack, -1)}
                          disabled={qty === 0}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: 'none',
                            border: 'none',
                            color: qty === 0 ? '#475569' : '#f8fafc',
                            cursor: qty === 0 ? 'default' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Minus size={14} />
                        </button>
                        <span style={{ fontSize: '13px', fontWeight: 800, minWidth: '18px', textAlign: 'center' }}>
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSnackQty(snack, 1)}
                          style={{
                            width: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            background: '#e50914',
                            border: 'none',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <ShieldCheck size={20} color="#22c55e" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc' }}>
                  Select Payment Method
                </h3>
              </div>

              {/* Method Tabs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.6rem', marginBottom: '1.5rem' }}>
                {[
                  { id: 'UPI', label: 'UPI / QR', icon: <QrCode size={16} /> },
                  { id: 'Card', label: 'Credit / Debit', icon: <CreditCard size={16} /> },
                  { id: 'NetBanking', label: 'Net Banking', icon: <Building size={16} /> }
                ].map((m) => {
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      style={{
                        padding: '0.75rem 0.5rem',
                        borderRadius: '10px',
                        background: isSelected ? 'rgba(229, 9, 20, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                        border: isSelected ? '1.5px solid #e50914' : '1px solid var(--border-subtle)',
                        color: isSelected ? '#ff4b55' : '#94a3b8',
                        fontWeight: 700,
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '0.35rem',
                        transition: 'all 0.2s'
                      }}
                    >
                      {m.icon}
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Payment Input */}
              {paymentMethod === 'UPI' && (
                <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ background: '#ffffff', padding: '6px', borderRadius: '8px' }}>
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=upi://pay?pa=imovies@upi&am=${grandTotal}`}
                        alt="UPI QR Code"
                        style={{ width: '85px', height: '85px', display: 'block' }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: '180px' }}>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>
                        Scan QR with GPay / PhonePe or enter UPI ID
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        style={{
                          width: '100%',
                          background: 'rgba(0,0,0,0.4)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          padding: '0.6rem 0.8rem',
                          color: '#f8fafc',
                          fontSize: '13px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'Card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Card Number</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '13px' }}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Expiry</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>CVV</label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff', fontSize: '13px' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'NetBanking' && (
                <div style={{ padding: '0.75rem', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', fontSize: '13px', color: '#cbd5e1' }}>
                  All leading banks supported: HDFC, State Bank of India, ICICI, Axis Bank. Instant redirection to test gateway.
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT COLUMN: ORDER SUMMARY ================= */}
          <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px', position: 'sticky', top: '90px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
              Order Summary
            </h3>

            {/* Movie & Show Info */}
            <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.25rem' }}>
              <img
                src={show.movie?.posterUrl}
                alt={show.movie?.title}
                style={{ width: '60px', height: '80px', borderRadius: '8px', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc', marginBottom: '2px' }}>
                  {show.movie?.title}
                </h4>
                <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                  {show.theatre?.name}
                </div>
                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                  {show.showDate} • {show.showTime} ({show.format})
                </div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', marginTop: '4px' }}>
                  Seats: {selectedSeats.join(', ')}
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '13px', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Tickets ({selectedSeats.length} seats)</span>
                <span>₹{ticketsSubtotal}</span>
              </div>

              {snacksTotal > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                  <span>Cinema Food & Drinks</span>
                  <span>₹{snacksTotal}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Convenience Fee</span>
                <span>₹{convenienceFee}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
                <span>Integrated GST (18%)</span>
                <span>₹{tax}</span>
              </div>

              <div
                style={{
                  height: '1px',
                  background: 'var(--border-subtle)',
                  margin: '0.5rem 0'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.15rem', fontWeight: 900, color: '#ffffff' }}>
                <span>Total Payable</span>
                <span style={{ color: '#22c55e' }}>₹{grandTotal}</span>
              </div>
            </div>

            {/* Confirm & Pay CTA */}
            <button
              onClick={handlePayAndConfirm}
              disabled={processing}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '15px',
                borderRadius: '12px'
              }}
            >
              {processing ? (
                'Securing Seats & Confirming...'
              ) : (
                <>
                  <Lock size={16} /> Pay ₹{grandTotal} & Confirm
                </>
              )}
            </button>

            <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '11px', color: '#64748b' }}>
              🔒 256-bit encrypted simulated cinema payment gateway
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed Ticket Modal */}
      {confirmedBooking && (
        <TicketModal
          booking={confirmedBooking}
          onClose={() => {
            setConfirmedBooking(null);
            navigate('/my-bookings');
          }}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
