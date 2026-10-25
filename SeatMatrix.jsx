import React from 'react';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const SeatMatrix = ({ showId, seats = [], selectedSeats = [], onSeatToggle }) => {
  const { lockSeat, unlockSeat } = useSocket();
  const { user } = useAuth();

  const handleSeatClick = (seat) => {
    if (seat.status === 'booked') {
      toast.info(`Seat ${seat.seatNumber} is already booked.`);
      return;
    }

    if (seat.status === 'locked' && seat.lockedBy !== user?._id) {
      toast.warning(`Seat ${seat.seatNumber} is currently selected by another viewer.`);
      return;
    }

    const isSelected = selectedSeats.includes(seat.seatNumber);

    if (isSelected) {
      unlockSeat(showId, seat.seatNumber);
      onSeatToggle(seat.seatNumber, false, seat.price, seat.tier);
    } else {
      // Maximum 8 seats per booking
      if (selectedSeats.length >= 8) {
        toast.warning('You can select a maximum of 8 seats per transaction.');
        return;
      }
      lockSeat(showId, seat.seatNumber);
      onSeatToggle(seat.seatNumber, true, seat.price, seat.tier);
    }
  };

  // Group seats by tier
  const tiers = [
    { name: 'VIP Recliners', price: 450, rows: ['A', 'B'] },
    { name: 'Premium Club', price: 320, rows: ['C', 'D', 'E', 'F'] },
    { name: 'Standard Executive', price: 220, rows: ['G', 'H'] }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '850px', margin: '0 auto' }}>
      {/* Curved Screen */}
      <div className="cinema-screen-container">
        <div className="cinema-screen-curve" />
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#38bdf8',
            opacity: 0.8
          }}
        >
          All Eyes This Way • Cinema Screen
        </span>
      </div>

      {/* Seat Matrix Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {tiers.map((tier) => (
          <div key={tier.name} style={{ textAlign: 'center' }}>
            {/* Tier Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.8rem',
                marginBottom: '1rem'
              }}
            >
              <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase' }}>
                {tier.name} — <span style={{ color: '#fbbf24' }}>₹{tier.price}</span>
              </span>
              <div style={{ height: '1px', flex: 1, background: 'var(--border-subtle)' }} />
            </div>

            {/* Rows in this tier */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {tier.rows.map((rowLetter) => {
                const rowSeats = seats
                  .filter((s) => s.row === rowLetter)
                  .sort((a, b) => a.col - b.col);

                return (
                  <div
                    key={rowLetter}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {/* Row Label Left */}
                    <span
                      style={{
                        width: '24px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#64748b',
                        textAlign: 'right'
                      }}
                    >
                      {rowLetter}
                    </span>

                    {/* Seats (1 to 8 with aisle split between 4 and 5) */}
                    <div style={{ display: 'flex', gap: '0.45rem' }}>
                      {rowSeats.map((seat, index) => {
                        const isSelected = selectedSeats.includes(seat.seatNumber);
                        const isLocked = seat.status === 'locked' && seat.lockedBy !== user?._id;
                        const isBooked = seat.status === 'booked';

                        let bgColor = '#172033';
                        let borderColor = '#2d3b55';
                        let cursor = 'pointer';
                        let textColor = '#cbd5e1';

                        if (isSelected) {
                          bgColor = '#e50914';
                          borderColor = '#ff4b55';
                          textColor = '#ffffff';
                        } else if (isLocked) {
                          bgColor = '#78350f';
                          borderColor = '#f59e0b';
                          cursor = 'not-allowed';
                        } else if (isBooked) {
                          bgColor = '#1e293b';
                          borderColor = '#334155';
                          cursor = 'not-allowed';
                          textColor = '#475569';
                        }

                        return (
                          <React.Fragment key={seat.seatNumber}>
                            {/* Aisle space in middle */}
                            {index === 4 && <div style={{ width: '1.25rem' }} />}

                            <button
                              type="button"
                              onClick={() => handleSeatClick(seat)}
                              disabled={isBooked || isLocked}
                              style={{
                                width: '34px',
                                height: '34px',
                                borderRadius: '8px',
                                border: `1.5px solid ${borderColor}`,
                                backgroundColor: bgColor,
                                color: textColor,
                                fontSize: '11px',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor,
                                transition: 'all 0.15s ease',
                                transform: isSelected ? 'scale(1.1)' : 'scale(1)',
                                boxShadow: isSelected ? '0 0 12px rgba(229, 9, 20, 0.7)' : 'none'
                              }}
                              title={`Seat ${seat.seatNumber} (${seat.tier}) - ₹${seat.price}`}
                            >
                              {seat.col}
                            </button>
                          </React.Fragment>
                        );
                      })}
                    </div>

                    {/* Row Label Right */}
                    <span
                      style={{
                        width: '24px',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#64748b',
                        textAlign: 'left'
                      }}
                    >
                      {rowLetter}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Seat Status Legend */}
      <div
        className="glass-panel"
        style={{
          marginTop: '2.5rem',
          padding: '0.85rem 1.5rem',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '2rem',
          flexWrap: 'wrap',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              backgroundColor: '#172033',
              border: '1.5px solid #2d3b55'
            }}
          />
          <span style={{ color: '#cbd5e1' }}>Available</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              backgroundColor: '#e50914',
              border: '1.5px solid #ff4b55',
              boxShadow: '0 0 8px rgba(229, 9, 20, 0.6)'
            }}
          />
          <span style={{ color: '#cbd5e1' }}>Selected</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              backgroundColor: '#78350f',
              border: '1.5px solid #f59e0b'
            }}
          />
          <span style={{ color: '#cbd5e1' }}>In Selection (Real-Time)</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div
            style={{
              width: '18px',
              height: '18px',
              borderRadius: '5px',
              backgroundColor: '#1e293b',
              border: '1.5px solid #334155'
            }}
          />
          <span style={{ color: '#64748b' }}>Sold</span>
        </div>
      </div>
    </div>
  );
};

export default SeatMatrix;
