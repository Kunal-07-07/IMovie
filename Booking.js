const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
      type: String,
      unique: true,
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Show',
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    theatre: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Theatre',
      required: true
    },
    seats: [
      {
        type: String,
        required: true
      }
    ],
    seatDetails: [
      {
        seatNumber: String,
        tier: String,
        price: Number
      }
    ],
    snacks: [
      {
        name: String,
        quantity: Number,
        price: Number
      }
    ],
    subtotal: {
      type: Number,
      required: true
    },
    convenienceFee: {
      type: Number,
      default: 45
    },
    tax: {
      type: Number,
      default: 25
    },
    totalAmount: {
      type: Number,
      required: true
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
      default: null
    },
    status: {
      type: String,
      enum: ['confirmed', 'cancelled'],
      default: 'confirmed'
    },
    bookingDate: {
      type: Date,
      default: Date.now
    },
    qrCode: {
      type: String,
      default: ''
    },
    cancelledAt: {
      type: Date,
      default: null
    },
    refundAmount: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
