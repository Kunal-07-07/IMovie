import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Ticket } from 'lucide-react';

const MovieCard = ({ movie }) => {
  return (
    <div
      className="glass-card"
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Poster Image Container */}
      <div style={{ position: 'relative', paddingTop: '140%', overflow: 'hidden' }}>
        <img
          src={movie.posterUrl}
          alt={movie.title}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />

        {/* Gradient Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(14, 19, 34, 0.95) 0%, rgba(14, 19, 34, 0.2) 50%, transparent 100%)'
          }}
        />

        {/* Rating Badge */}
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(7, 9, 19, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            borderRadius: '8px',
            padding: '4px 8px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            fontWeight: 700,
            color: '#fbbf24'
          }}
        >
          <Star size={13} fill="#fbbf24" color="#fbbf24" />
          <span>{movie.rating ? movie.rating.toFixed(1) : '8.5'}</span>
        </div>

        {/* Format Badge */}
        {movie.formats && movie.formats.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              background: 'rgba(229, 9, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '10px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              color: '#ffffff',
              textTransform: 'uppercase'
            }}
          >
            {movie.formats[0]}
          </div>
        )}

        {/* Bottom Poster Info */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '11px',
            color: '#cbd5e1'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
            <Clock size={12} color="#94a3b8" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
          </span>
          <span style={{ fontWeight: 600, color: '#f8fafc' }}>{movie.language}</span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3
          style={{
            fontSize: '1.05rem',
            fontWeight: 700,
            color: '#f8fafc',
            marginBottom: '0.4rem',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
          title={movie.title}
        >
          {movie.title}
        </h3>

        {/* Genres */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          {movie.genres &&
            movie.genres.slice(0, 3).map((g) => (
              <span
                key={g}
                style={{
                  fontSize: '11px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '4px',
                  padding: '2px 6px',
                  color: '#94a3b8'
                }}
              >
                {g}
              </span>
            ))}
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto' }}>
          <Link
            to={`/movie/${movie._id}`}
            className="btn-primary"
            style={{
              width: '100%',
              textDecoration: 'none',
              fontSize: '13px',
              padding: '0.6rem 1rem'
            }}
          >
            <Ticket size={15} /> Book Tickets
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
