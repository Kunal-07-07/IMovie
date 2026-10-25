const mongoose = require('mongoose');

const showSchema = new mongoose.Schema(
  {
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
    screenName: {
      type: String,
      default: 'Audi 1 - Laser 4K'
    },
    showDate: {
      type: String, // format YYYY-MM-DD for easy querying
      required: true
    },
    showTime: {
      type: String, // e.g. "06:30 PM"
      required: true
    },
    format: {
      type: String,
      default: '2D'
    },
    language: {
      type: String,
      default: 'English'
    },
    pricing: {
      vip: { type: Number, default: 450 },
      premium: { type: Number, default: 320 },
      standard: { type: Number, default: 220 }
    },
    totalSeats: {
      type: Number,
      default: 64
    },
    availableSeatsCount: {
      type: Number,
      default: 64
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Show', showSchema);
