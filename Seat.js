const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema(
  {
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true,
      index: true
    },
    seatNumber: {
      type: String,
      required: true
    },
    row: {
      type: String,
      required: true
    },
    col: {
      type: Number,
      required: true
    },
    tier: {
      type: String,
      enum: ['VIP', 'Premium', 'Standard'],
      default: 'Standard'
    },
    price: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'locked', 'booked'],
      default: 'available'
    },
    lockedBy: {
      type: String, // userId or socketId
      default: null
    },
    lockedAt: {
      type: Date,
      default: null
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      default: null
    }
  },
  { timestamps: true }
);

// Compound index to guarantee uniqueness of seatNumber per show
seatSchema.index({ show: 1, seatNumber: 1 }, { unique: true });

module.exports = mongoose.model('Seat', seatSchema);
