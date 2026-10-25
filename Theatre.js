const mongoose = require('mongoose');

const theatreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Theatre name is required'],
      trim: true
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    totalScreens: {
      type: Number,
      default: 4
    },
    facilities: [
      {
        type: String,
        default: ['Dolby Atmos', 'Recliner Seats', 'Food Court', 'Parking']
      }
    ],
    contactPhone: {
      type: String,
      default: '+91 98765 43210'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Theatre', theatreSchema);
