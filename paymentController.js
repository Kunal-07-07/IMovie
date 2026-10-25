const Payment = require('../models/Payment');

// @desc    Simulate or verify payment
// @route   POST /api/payments/process
// @access  Private
exports.processPayment = async (req, res) => {
  try {
    const { amount, paymentMethod = 'UPI', bookingId } = req.body;

    const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const payment = await Payment.create({
      booking: bookingId,
      user: req.user._id,
      amount,
      paymentMethod,
      transactionId,
      status: 'success',
      paymentDetails: {
        gateway: 'Razorpay / UPI Sandbox',
        paidAt: new Date().toISOString()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Payment processed successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user payments
// @route   GET /api/payments/my-payments
// @access  Private
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user._id })
      .populate('booking')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
