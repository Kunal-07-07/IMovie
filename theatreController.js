const Theatre = require('../models/Theatre');

// @desc    Get all theatres, optionally filtered by city
// @route   GET /api/theatres
// @access  Public
exports.getTheatres = async (req, res) => {
  try {
    const { city, search } = req.query;
    let query = {};

    if (city && city !== 'All') {
      query.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const theatres = await Theatre.find(query).sort({ name: 1 });

    res.json({
      success: true,
      count: theatres.length,
      data: theatres
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single theatre by ID
// @route   GET /api/theatres/:id
// @access  Public
exports.getTheatreById = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    res.json({
      success: true,
      data: theatre
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new theatre (Admin only)
// @route   POST /api/theatres
// @access  Private/Admin
exports.createTheatre = async (req, res) => {
  try {
    const theatreData = req.body;

    if (typeof theatreData.facilities === 'string') {
      theatreData.facilities = theatreData.facilities.split(',').map((f) => f.trim());
    }

    const theatre = await Theatre.create(theatreData);

    res.status(201).json({
      success: true,
      message: 'Theatre created successfully',
      data: theatre
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update theatre (Admin only)
// @route   PUT /api/theatres/:id
// @access  Private/Admin
exports.updateTheatre = async (req, res) => {
  try {
    const theatreData = req.body;
    if (typeof theatreData.facilities === 'string') {
      theatreData.facilities = theatreData.facilities.split(',').map((f) => f.trim());
    }

    const theatre = await Theatre.findByIdAndUpdate(req.params.id, theatreData, {
      new: true,
      runValidators: true
    });

    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    res.json({
      success: true,
      message: 'Theatre updated successfully',
      data: theatre
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete theatre (Admin only)
// @route   DELETE /api/theatres/:id
// @access  Private/Admin
exports.deleteTheatre = async (req, res) => {
  try {
    const theatre = await Theatre.findById(req.params.id);

    if (!theatre) {
      return res.status(404).json({ success: false, message: 'Theatre not found' });
    }

    await theatre.deleteOne();

    res.json({
      success: true,
      message: 'Theatre removed'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
