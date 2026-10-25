import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play, Ticket, Star, Sparkles, Filter, Clapperboard, Compass } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';

const genresList = ['All', 'Action', 'Sci-Fi', 'Adventure', 'Drama', 'Biography', 'Animation'];
const formatsList = ['All', 'IMAX 3D', '3D', '2D', '4DX'];

const HomePage = ({ selectedCity, searchQuery }) => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedFormat, setSelectedFormat] = useState('All');
  const [heroMovie, setHeroMovie] = useState(null);

  useEffect(() => {
    fetchMovies();
  }, [searchQuery, selectedGenre, selectedFormat, selectedCity]);

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedGenre !== 'All') params.genre = selectedGenre;
      if (selectedFormat !== 'All') params.format = selectedFormat;

      const { data } = await api.get('/movies', { params });
      if (data.success) {
        setMovies(data.data);
        if (data.data.length > 0 && !heroMovie) {
          setHeroMovie(data.data[0]); // Feature first movie as hero
        }
      }
    } catch (err) {
      console.error('Failed to fetch movies', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '3rem' }}>
      {/* ================= HERO BANNER ================= */}
      {heroMovie && !searchQuery && (
        <section
          style={{
            position: 'relative',
            minHeight: '480px',
            marginBottom: '3rem',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          {/* Backdrop Image with gradient overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${heroMovie.backdropUrl || heroMovie.posterUrl})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 20%',
              filter: 'brightness(0.35)',
              transform: 'scale(1.02)'
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, #070913 25%, rgba(7, 9, 19, 0.7) 60%, transparent 100%), linear-gradient(to top, #070913 0%, transparent 50%)'
            }}
          />

          {/* Hero Content */}
          <div
            style={{
              position: 'relative',
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '3rem 1.5rem',
              width: '100%'
            }}
          >
            <div style={{ maxWidth: '650px' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(229, 9, 20, 0.2)',
                  border: '1px solid rgba(229, 9, 20, 0.4)',
                  color: '#ff4b55',
                  fontSize: '11px',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: '1rem'
                }}
              >
                <Sparkles size={13} /> Trending Now in {selectedCity}
              </div>

              <h1
                style={{
                  fontSize: 'clamp(2.2rem, 5vw, 3.5rem)',
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: 1.1,
                  marginBottom: '1rem',
                  textShadow: '0 4px 20px rgba(0,0,0,0.8)'
                }}
              >
                {heroMovie.title}
              </h1>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '13px',
                  color: '#cbd5e1',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 700 }}>
                  <Star size={16} fill="#fbbf24" />
                  <span>{heroMovie.rating.toFixed(1)}/10</span>
                </div>
                <span>•</span>
                <span>{heroMovie.language}</span>
                <span>•</span>
                <span>{Math.floor(heroMovie.duration / 60)}h {heroMovie.duration % 60}m</span>
                <span>•</span>
                <span className="badge-cyan" style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px' }}>
                  {heroMovie.formats?.join(' • ')}
                </span>
              </div>

              <p
                style={{
                  fontSize: '14px',
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  marginBottom: '1.75rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {heroMovie.description}
              </p>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <Link
                  to={`/movie/${heroMovie._id}`}
                  className="btn-primary"
                  style={{ textDecoration: 'none', padding: '0.8rem 1.75rem', fontSize: '14px' }}
                >
                  <Ticket size={18} /> Book Tickets Now
                </Link>
                {heroMovie.trailerUrl && (
                  <a
                    href={heroMovie.trailerUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-secondary"
                    style={{ textDecoration: 'none', padding: '0.8rem 1.5rem', fontSize: '14px' }}
                  >
                    <Play size={16} fill="#ffffff" /> Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ================= CATALOG SECTION ================= */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem' }}>
        {/* Filter Controls Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clapperboard size={22} color="#e50914" />
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                {searchQuery ? `Search results for "${searchQuery}"` : `Now Showing in ${selectedCity}`}
              </h2>
            </div>
            <span style={{ fontSize: '13px', color: '#64748b' }}>
              {movies.length} {movies.length === 1 ? 'Movie' : 'Movies'} Available
            </span>
          </div>

          {/* Genre Filters Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.5rem',
              scrollbarWidth: 'none'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '0.2rem' }}>
              GENRE:
            </span>
            {genresList.map((g) => {
              const isActive = selectedGenre === g;
              return (
                <button
                  key={g}
                  onClick={() => setSelectedGenre(g)}
                  style={{
                    background: isActive ? '#e50914' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : '#cbd5e1',
                    border: isActive ? '1px solid #ff4b55' : '1px solid var(--border-subtle)',
                    borderRadius: '999px',
                    padding: '0.4rem 1rem',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {g}
                </button>
              );
            })}
          </div>

          {/* Format Filters Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              overflowX: 'auto',
              scrollbarWidth: 'none'
            }}
          >
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', marginRight: '0.2rem' }}>
              FORMAT:
            </span>
            {formatsList.map((f) => {
              const isActive = selectedFormat === f;
              return (
                <button
                  key={f}
                  onClick={() => setSelectedFormat(f)}
                  style={{
                    background: isActive ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    border: isActive ? '1px solid #38bdf8' : '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '0.35rem 0.8rem',
                    fontSize: '11px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        {/* Movies Grid */}
        {loading ? (
          <div
            style={{
              padding: '5rem 0',
              textAlign: 'center',
              color: '#94a3b8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                border: '3px solid rgba(229, 9, 20, 0.2)',
                borderTopColor: '#e50914',
                borderRadius: '50%',
                animation: 'spin 1s infinite linear'
              }}
            />
            <p style={{ fontSize: '14px' }}>Loading blockbuster films...</p>
          </div>
        ) : movies.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: '4rem 2rem',
              textAlign: 'center',
              borderRadius: '20px',
              maxWidth: '500px',
              margin: '2rem auto'
            }}
          >
            <Compass size={48} color="#e50914" style={{ margin: '0 auto 1rem', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f8fafc' }}>
              No Movies Found
            </h3>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '1.5rem' }}>
              We couldn't find any films matching your search filters in {selectedCity}. Try clearing filters or searching for another title.
            </p>
            <button
              onClick={() => {
                setSelectedGenre('All');
                setSelectedFormat('All');
              }}
              className="btn-secondary"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
              gap: '1.75rem'
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
