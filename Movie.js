const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Movie title is required'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Movie description is required']
    },
    genres: [
      {
        type: String,
        required: true
      }
    ],
    language: {
      type: String,
      required: true,
      default: 'English'
    },
    duration: {
      type: Number, // in minutes
      required: true
    },
    releaseDate: {
      type: Date,
      default: Date.now
    },
    rating: {
      type: Number,
      default: 8.5,
      min: 0,
      max: 10
    },
    votesCount: {
      type: Number,
      default: 1250
    },
    posterUrl: {
      type: String,
      required: true
    },
    backdropUrl: {
      type: String,
      default: ''
    },
    trailerUrl: {
      type: String,
      default: 'https://www.youtube.com/watch?v=Way9Dexny3w'
    },
    director: {
      type: String,
      default: ''
    },
    cast: [
      {
        type: String
      }
    ],
    formats: [
      {
        type: String,
        enum: ['2D', '3D', 'IMAX 3D', '4DX', 'Dolby Cinema'],
        default: ['2D']
      }
    ],
    status: {
      type: String,
      enum: ['now_showing', 'coming_soon'],
      default: 'now_showing'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Movie', movieSchema);
