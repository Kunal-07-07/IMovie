const Show = require('../models/Show');
const Seat = require('../models/Seat');
const Theatre = require('../models/Theatre');

// Helper to auto-generate 64 seats (8 rows x 8 cols)
const generateSeatsForShow = async (showId, pricing) => {
  const rows = [
    { row: 'A', tier: 'VIP', price: pricing.vip || 450 },
    { row: 'B', tier: 'VIP', price: pricing.vip || 450 },
    { row: 'C', tier: 'Premium', price: pricing.premium || 320 },
    { row: 'D', tier: 'Premium', price: pricing.premium || 320 },
    { row: 'E', tier: 'Premium', price: pricing.premium || 320 },
    { row: 'F', tier: 'Premium', price: pricing.premium || 320 },
    { row: 'G', tier: 'Standard', price: pricing.standard || 220 },
    { row: 'H', tier: 'Standard', price: pricing.standard || 220 }
  ];

  const seatsToInsert = [];
  rows.forEach((r) => {
    for (let col = 1; col <= 8; col++) {
      seatsToInsert.push({
        show: showId,
        seatNumber: `${r.row}${col}`,
        row: r.row,
        col: col,
        tier: r.tier,
        price: r.price,
        status: 'available'
      });
    }
  });

  return await Seat.insertMany(seatsToInsert);
};

// @desc    Get shows with filtering
// @route   GET /api/shows
// @access  Public
exports.getShows = async (req, res) => {
  try {
    const { movieId, theatreId, date, city } = req.query;
    let query = {};

    if (movieId) query.movie = movieId;
    if (theatreId) query.theatre = theatreId;
    if (date) query.showDate = date;

    let shows = await Show.find(query)
      .populate('movie')
      .populate('theatre')
      .sort({ showDate: 1, showTime: 1 });

    // Optional city filter on theatre
    if (city && city !== 'All') {
      shows = shows.filter(
        (s) => s.theatre && s.theatre.city.toLowerCase() === city.toLowerCase()
      );
    }

    res.json({
      success: true,
      count: shows.length,
      data: shows
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single show details along with its seats
// @route   GET /api/shows/:id
// @access  Public
exports.getShowById = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theatre');

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Fetch all seats for this show
    let seats = await Seat.find({ show: show._id }).sort({ row: 1, col: 1 });

    // If for some reason seats weren't generated, generate now
    if (seats.length === 0) {
      seats = await generateSeatsForShow(show._id, show.pricing);
    }

    // Release any stale locks older than 8 minutes
    const eightMinutesAgo = new Date(Date.now() - 8 * 60 * 1000);
    await Seat.updateMany(
      { show: show._id, status: 'locked', lockedAt: { $lt: eightMinutesAgo } },
      { $set: { status: 'available', lockedBy: null, lockedAt: null } }
    );

    // Re-fetch clean seats
    seats = await Seat.find({ show: show._id }).sort({ row: 1, col: 1 });

    const availableCount = seats.filter((s) => s.status === 'available').length;
    show.availableSeatsCount = availableCount;
    await show.save();

    res.json({
      success: true,
      data: {
        show,
        seats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new show (Admin only)
// @route   POST /api/shows
// @access  Private/Admin
exports.createShow = async (req, res) => {
  try {
    const {
      movie,
      theatre,
      screenName,
      showDate,
      showTime,
      format,
      language,
      pricing
    } = req.body;

    const show = await Show.create({
      movie,
      theatre,
      screenName: screenName || 'Screen 1 - 4K Laser',
      showDate,
      showTime,
      format: format || '2D',
      language: language || 'English',
      pricing: pricing || { vip: 450, premium: 320, standard: 220 },
      totalSeats: 64,
      availableSeatsCount: 64
    });

    // Auto-generate seats for this show
    await generateSeatsForShow(show._id, show.pricing);

    const populatedShow = await Show.findById(show._id)
      .populate('movie')
      .populate('theatre');

    res.status(201).json({
      success: true,
      message: 'Show created with 64 seats layout',
      data: populatedShow
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete show (Admin only)
// @route   DELETE /api/shows/:id
// @access  Private/Admin
exports.deleteShow = async (req, res) => {
  try {
    const show = await Show.findById(req.params.id);

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    await Seat.deleteMany({ show: show._id });
    await show.deleteOne();

    res.json({
      success: true,
      message: 'Show and related seats deleted'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
