const Seat = require('../models/Seat');

const setupSeatSocket = (io) => {
  io.on('connection', (socket) => {
    // User joins a specific show room for real-time seat tracking
    socket.on('join_show_room', async ({ showId, userId }) => {
      socket.join(showId);
      socket.data.currentShowId = showId;
      socket.data.userId = userId || socket.id;
    });

    // Client requests to lock a seat while choosing in UI
    socket.on('lock_seat', async ({ showId, seatNumber, userId }) => {
      try {
        const lockerId = userId || socket.id;
        const seat = await Seat.findOne({ show: showId, seatNumber });

        if (!seat) {
          return socket.emit('seat_lock_failed', { seatNumber, message: 'Seat not found' });
        }

        if (seat.status === 'booked') {
          return socket.emit('seat_lock_failed', { seatNumber, message: 'Seat is already booked' });
        }

        if (seat.status === 'locked' && seat.lockedBy !== lockerId) {
          // Check if lock expired (> 8 mins)
          const isExpired = seat.lockedAt && (Date.now() - new Date(seat.lockedAt).getTime() > 8 * 60 * 1000);
          if (!isExpired) {
            return socket.emit('seat_lock_failed', { seatNumber, message: 'Seat is currently selected by another customer' });
          }
        }

        // Lock the seat
        seat.status = 'locked';
        seat.lockedBy = lockerId;
        seat.lockedAt = new Date();
        await seat.save();

        // Broadcast to everyone in room that seat is locked
        io.to(showId).emit('seat_locked', {
          seatNumber,
          lockedBy: lockerId,
          tier: seat.tier,
          price: seat.price
        });
      } catch (err) {
        console.error('Socket lock_seat error:', err);
      }
    });

    // Client deselects a seat
    socket.on('unlock_seat', async ({ showId, seatNumber, userId }) => {
      try {
        const lockerId = userId || socket.id;
        const seat = await Seat.findOne({ show: showId, seatNumber });

        if (seat && seat.status === 'locked' && (seat.lockedBy === lockerId || socket.id)) {
          seat.status = 'available';
          seat.lockedBy = null;
          seat.lockedAt = null;
          await seat.save();

          io.to(showId).emit('seat_unlocked', { seatNumber });
        }
      } catch (err) {
        console.error('Socket unlock_seat error:', err);
      }
    });

    // Handle user disconnect - auto release any temporarily locked seats by this socket
    socket.on('disconnect', async () => {
      try {
        const showId = socket.data.currentShowId;
        const lockerId = socket.data.userId || socket.id;

        if (showId) {
          const lockedSeats = await Seat.find({
            show: showId,
            status: 'locked',
            lockedBy: lockerId
          });

          if (lockedSeats.length > 0) {
            await Seat.updateMany(
              { show: showId, status: 'locked', lockedBy: lockerId },
              { $set: { status: 'available', lockedBy: null, lockedAt: null } }
            );

            lockedSeats.forEach((s) => {
              io.to(showId).emit('seat_unlocked', { seatNumber: s.seatNumber });
            });
          }
        }
      } catch (err) {
        console.error('Socket disconnect cleanup error:', err);
      }
    });
  });
};

module.exports = setupSeatSocket;
