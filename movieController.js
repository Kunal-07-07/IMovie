const Movie = require('../models/Movie');
const Show = require('../models/Show');

// @desc    Get all movies with search, filter, and pagination
// @route   GET /api/movies
// @access  Public
exports.getMovies = async (req, res) => {
  try {
    const { search, genre, language, format, status } = req.query;

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (genre && genre !== 'All') {
      query.genres = { $in: [new RegExp(genre, 'i')] };
    }

    if (language && language !== 'All') {
      query.language = { $regex: language, $options: 'i' };
    }

    if (format && format !== 'All') {
      query.formats = { $in: [format] };
    }

    if (status) {
      query.status = status;
    }

    const movies = await Movie.find(query).sort({ rating: -1, releaseDate: -1 });

    res.json({
      success: true,
      count: movies.length,
      data: movies
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single movie by ID
// @route   GET /api/movies/:id
// @access  Public
exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      data: movie
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new movie (Admin only)
// @route   POST /api/movies
// @access  Private/Admin
exports.createMovie = async (req, res) => {
  try {
    const movieData = req.body;

    if (typeof movieData.genres === 'string') {
      movieData.genres = movieData.genres.split(',').map((g) => g.trim());
    }

    if (typeof movieData.cast === 'string') {
      movieData.cast = movieData.cast.split(',').map((c) => c.trim());
    }

    if (typeof movieData.formats === 'string') {
      movieData.formats = movieData.formats.split(',').map((f) => f.trim());
    }

    const movie = await Movie.create(movieData);

    res.status(201).json({
      success: true,
      message: 'Movie added successfully',
      data: movie
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update movie (Admin only)
// @route   PUT /api/movies/:id
// @access  Private/Admin
exports.updateMovie = async (req, res) => {
  try {
    const movieData = req.body;

    if (typeof movieData.genres === 'string') {
      movieData.genres = movieData.genres.split(',').map((g) => g.trim());
    }
    if (typeof movieData.cast === 'string') {
      movieData.cast = movieData.cast.split(',').map((c) => c.trim());
    }

    const movie = await Movie.findByIdAndUpdate(req.params.id, movieData, {
      new: true,
      runValidators: true
    });

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    res.json({
      success: true,
      message: 'Movie updated successfully',
      data: movie
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete movie (Admin only)
// @route   DELETE /api/movies/:id
// @access  Private/Admin
exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    await movie.deleteOne();
    await Show.deleteMany({ movie: req.params.id });

    res.json({
      success: true,
      message: 'Movie and associated shows removed'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
