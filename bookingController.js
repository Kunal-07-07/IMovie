const Booking = require('../models/Booking');
const Seat = require('../models/Seat');
const Show = require('../models/Show');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');

// Generate unique booking code
const generateBookingId = () => {
  const prefix = 'IMV';
  const random = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${new Date().getFullYear()}-${random}`;
};

// @desc    Create new ticket booking
// @route   POST /api/bookings
// @access  Private
exports.createBooking = async (req, res) => {
  try {
    const {
      showId,
      seatNumbers, // array of strings e.g. ['A1', 'A2']
      snacks,      // array of { name, quantity, price }
      paymentMethod = 'UPI'
    } = req.body;

    if (!showId || !seatNumbers || seatNumbers.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select show and at least one seat' });
    }

    const show = await Show.findById(showId).populate('movie').populate('theatre');
    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Find requested seats for this show
    const seats = await Seat.find({
      show: showId,
      seatNumber: { $in: seatNumbers }
    });

    if (seats.length !== seatNumbers.length) {
      return res.status(400).json({ success: false, message: 'Some selected seats are invalid' });
    }

    // Check if any seat is already booked or locked by someone else
    const alreadyBooked = seats.find(
      (s) => s.status === 'booked' || (s.status === 'locked' && s.lockedBy !== req.user._id.toString())
    );

    if (alreadyBooked) {
      return res.status(400).json({
        success: false,
        message: `Seat ${alreadyBooked.seatNumber} is no longer available. Please choose another seat.`
      });
    }

    // Calculate subtotal from seat prices
    let subtotal = 0;
    const seatDetails = seats.map((s) => {
      subtotal += s.price;
      return {
        seatNumber: s.seatNumber,
        tier: s.tier,
        price: s.price
      };
    });

    // Snacks total
    let snacksTotal = 0;
    if (snacks && Array.isArray(snacks)) {
      snacks.forEach((snack) => {
        snacksTotal += (snack.price || 0) * (snack.quantity || 1);
      });
    }

    const convenienceFee = Math.round(seatNumbers.length * 25);
    const tax = Math.round((subtotal + snacksTotal) * 0.18); // 18% GST
    const totalAmount = subtotal + snacksTotal + convenienceFee + tax;

    const bookingId = generateBookingId();
    const qrCodeData = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      `IMOVIES-TICKET|${bookingId}|${show.movie.title}|Seats:${seatNumbers.join(',')}|Total:${totalAmount}`
    )}`;

    // Create Booking
    const booking = await Booking.create({
      bookingId,
      user: req.user._id,
      show: show._id,
      movie: show.movie._id,
      theatre: show.theatre._id,
      seats: seatNumbers,
      seatDetails,
      snacks: snacks || [],
      subtotal: subtotal + snacksTotal,
      convenienceFee,
      tax,
      totalAmount,
      status: 'confirmed',
      qrCode: qrCodeData
    });

    // Create Payment Record
    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: totalAmount,
      paymentMethod,
      transactionId,
      status: 'success',
      paymentDetails: {
        method: paymentMethod,
        timestamp: new Date().toISOString()
      }
    });

    booking.payment = payment._id;
    await booking.save();

    // Mark seats as booked
    await Seat.updateMany(
      { show: showId, seatNumber: { $in: seatNumbers } },
      {
        $set: {
          status: 'booked',
          booking: booking._id,
          lockedBy: null,
          lockedAt: null
        }
      }
    );

    // Update available count in show
    const remainingAvailable = await Seat.countDocuments({ show: showId, status: 'available' });
    show.availableSeatsCount = remainingAvailable;
    await show.save();

    // Create confirmation Notification for user
    await Notification.create({
      user: req.user._id,
      title: 'Booking Confirmed!',
      message: `Your tickets for "${show.movie.title}" at ${show.theatre.name} (${show.showTime}) have been confirmed! Booking ID: ${bookingId}`,
      type: 'booking',
      link: '/my-bookings'
    });

    // Emit live seat update to Socket room if io instance available
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(showId.toString()).emit('seats_updated', {
        showId: showId.toString(),
        bookedSeats: seatNumbers,
        action: 'booked'
      });
    }

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('payment');

    res.status(201).json({
      success: true,
      message: 'Booking confirmed successfully!',
      data: populatedBooking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get logged in user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('payment')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking details by ID
// @route   GET /api/bookings/:id
// @access  Private
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('show')
      .populate('payment');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Check ownership or admin
    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this ticket' });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking and release seats
// @route   POST /api/bookings/:id/cancel
// @access  Private
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theatre')
      .populate('show');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled' });
    }

    // Calculate 85% refund policy
    const refundAmount = Math.round(booking.totalAmount * 0.85);

    booking.status = 'cancelled';
    booking.cancelledAt = new Date();
    booking.refundAmount = refundAmount;
    await booking.save();

    // Release seats back to 'available'
    await Seat.updateMany(
      { show: booking.show._id, seatNumber: { $in: booking.seats } },
      {
        $set: {
          status: 'available',
          booking: null,
          lockedBy: null,
          lockedAt: null
        }
      }
    );

    // Update show availability count
    const availableCount = await Seat.countDocuments({ show: booking.show._id, status: 'available' });
    await Show.findByIdAndUpdate(booking.show._id, { availableSeatsCount: availableCount });

    // Update payment record to refunded
    if (booking.payment) {
      await Payment.findByIdAndUpdate(booking.payment, { status: 'refunded' });
    }

    // Send Cancellation Notification
    await Notification.create({
      user: booking.user,
      title: 'Booking Cancelled',
      message: `Your booking (${booking.bookingId}) for ${booking.movie.title} has been cancelled. Refund of ₹${refundAmount} has been initiated.`,
      type: 'cancellation',
      link: '/my-bookings'
    });

    // Emit live seat release to Socket
    if (req.app.get('io')) {
      const io = req.app.get('io');
      io.to(booking.show._id.toString()).emit('seats_updated', {
        showId: booking.show._id.toString(),
        releasedSeats: booking.seats,
        action: 'released'
      });
    }

    res.json({
      success: true,
      message: `Booking cancelled successfully. ₹${refundAmount} refunded to source payment method.`,
      data: booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all bookings (Admin only)
// @route   GET /api/bookings
// @access  Private/Admin
exports.getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('user', 'name email phone')
      .populate('movie', 'title posterUrl')
      .populate('theatre', 'name city')
      .populate('show', 'showDate showTime screenName')
      .populate('payment')
      .sort({ createdAt: -1 });

    const totalRevenue = bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((acc, curr) => acc + curr.totalAmount, 0);

    const totalConfirmed = bookings.filter((b) => b.status === 'confirmed').length;
    const totalCancelled = bookings.filter((b) => b.status === 'cancelled').length;

    res.json({
      success: true,
      metrics: {
        totalRevenue,
        totalBookings: bookings.length,
        totalConfirmed,
        totalCancelled
      },
      data: bookings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
