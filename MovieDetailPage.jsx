import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, Clock, Calendar, MapPin, Play, Ticket, ChevronRight, Sparkles, Film } from 'lucide-react';
import api from '../services/api';

const MovieDetailPage = ({ selectedCity }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  const [availableDates, setAvailableDates] = useState([]);

  // Generate 4 upcoming dates
  useEffect(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 4; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : d.toLocaleDateString('en-US', { weekday: 'short' });
      const dateNum = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      dates.push({ iso, dayName, dateNum });
    }
    setAvailableDates(dates);
    if (dates.length > 0) {
      setSelectedDate(dates[0].iso);
    }
  }, []);

  // Fetch movie details
  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const { data } = await api.get(`/movies/${id}`);
        if (data.success) {
          setMovie(data.data);
        }
      } catch (err) {
        console.error('Error fetching movie details', err);
      }
    };
    fetchMovie();
  }, [id]);

  // Fetch shows for this movie, date, and city
  useEffect(() => {
    if (!selectedDate || !id) return;
    const fetchShows = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/shows', {
          params: {
            movieId: id,
            date: selectedDate,
            city: selectedCity
          }
        });
        if (data.success) {
          setShows(data.data);
        }
      } catch (err) {
        console.error('Error fetching shows', err);
      } finally {
        setLoading(false);
      }
    };
    fetchShows();
  }, [id, selectedDate, selectedCity]);

  if (!movie) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}>
        Loading cinema experience...
      </div>
    );
  }

  // Group shows by Theatre
  const theatreMap = {};
  shows.forEach((show) => {
    if (!show.theatre) return;
    const tId = show.theatre._id;
    if (!theatreMap[tId]) {
      theatreMap[tId] = {
        theatre: show.theatre,
        shows: []
      };
    }
    theatreMap[tId].shows.push(show);
  });
  const groupedTheatres = Object.values(theatreMap);

  return (
    <div style={{ minHeight: '100vh', paddingBottom: '4rem' }}>
      {/* ================= HERO BACKDROP ================= */}
      <div
        style={{
          position: 'relative',
          minHeight: '440px',
          background: `url(${movie.backdropUrl || movie.posterUrl}) center top / cover no-repeat`,
          display: 'flex',
          alignItems: 'flex-end',
          paddingBottom: '2.5rem'
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #070913 15%, rgba(7, 9, 19, 0.85) 60%, rgba(7, 9, 19, 0.4) 100%)'
          }}
        />

        <div
          style={{
            position: 'relative',
            maxWidth: '1280px',
            margin: '0 auto',
            padding: '0 1.5rem',
            width: '100%',
            display: 'flex',
            gap: '2.5rem',
            alignItems: 'flex-end',
            flexWrap: 'wrap'
          }}
        >
          {/* Poster Card */}
          <div
            style={{
              width: '190px',
              height: '270px',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 15px 35px rgba(0, 0, 0, 0.8)',
              border: '2px solid rgba(255, 255, 255, 0.1)',
              flexShrink: 0
            }}
          >
            <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>

          {/* Details */}
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.6rem' }}>
              {movie.formats?.map((fmt) => (
                <span key={fmt} className="badge-cyan" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                  {fmt}
                </span>
              ))}
              <span className="badge-red" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                {movie.language}
              </span>
            </div>

            <h1 style={{ fontSize: 'clamp(2rem, 4vw, 2.8rem)', fontWeight: 900, color: '#f8fafc', marginBottom: '0.6rem' }}>
              {movie.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#cbd5e1', fontSize: '13px', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#fbbf24', fontWeight: 700 }}>
                <Star size={16} fill="#fbbf24" />
                <span>{movie.rating.toFixed(1)}/10</span>
                <span style={{ color: '#94a3b8', fontWeight: 400 }}>({movie.votesCount?.toLocaleString()} votes)</span>
              </div>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} color="#94a3b8" /> {Math.floor(movie.duration / 60)}h {movie.duration % 60}m
              </span>
              <span>•</span>
              <span>{movie.genres?.join(', ')}</span>
            </div>

            <p style={{ color: '#94a3b8', fontSize: '13.5px', lineHeight: 1.6, maxWidth: '750px', marginBottom: '1.25rem' }}>
              {movie.description}
            </p>

            {/* Cast & Director */}
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', fontSize: '12.5px' }}>
              {movie.director && (
                <div>
                  <span style={{ color: '#64748b' }}>Director: </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{movie.director}</span>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span style={{ color: '#64748b' }}>Starring: </span>
                  <span style={{ color: '#f8fafc', fontWeight: 600 }}>{movie.cast.slice(0, 4).join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= SHOWTIMES SECTION ================= */}
      <div style={{ maxWidth: '1280px', margin: '2.5rem auto 0', padding: '0 1.5rem' }}>
        {/* Date Selector Bar */}
        <div
          className="glass-panel"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '2.5rem',
            overflowX: 'auto',
            scrollbarWidth: 'none'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f8fafc', fontWeight: 700, fontSize: '13px', paddingRight: '1rem', borderRight: '1px solid var(--border-subtle)' }}>
            <Calendar size={18} color="#e50914" />
            <span>Select Date</span>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {availableDates.map((dateObj) => {
              const isSelected = selectedDate === dateObj.iso;
              return (
                <button
                  key={dateObj.iso}
                  onClick={() => setSelectedDate(dateObj.iso)}
                  style={{
                    background: isSelected ? 'linear-gradient(135deg, #e50914 0%, #b80710 100%)' : 'rgba(255, 255, 255, 0.05)',
                    color: isSelected ? '#ffffff' : '#cbd5e1',
                    border: isSelected ? '1px solid #ff4b55' : '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: '0.5rem 1.25rem',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: isSelected ? '0 4px 15px rgba(229, 9, 20, 0.4)' : 'none'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', opacity: 0.85 }}>
                    {dateObj.dayName}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 800 }}>{dateObj.dateNum}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Theatres & Showtimes List */}
        <div>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Film size={20} color="#e50914" /> Available Cinemas in {selectedCity}
          </h2>

          {loading ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Finding theatre schedules...
            </div>
          ) : groupedTheatres.length === 0 ? (
            <div
              className="glass-panel"
              style={{
                padding: '3rem 2rem',
                textAlign: 'center',
                borderRadius: '16px',
                color: '#94a3b8'
              }}
            >
              <MapPin size={36} color="#e50914" style={{ margin: '0 auto 0.75rem', opacity: 0.7 }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.4rem' }}>
                No Showtimes Found
              </h3>
              <p style={{ fontSize: '13px' }}>
                There are no scheduled shows for {movie.title} in {selectedCity} on this date. Please try another date or switch city in the top bar.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {groupedTheatres.map(({ theatre, shows: tShows }) => (
                <div
                  key={theatre._id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    borderRadius: '16px'
                  }}
                >
                  {/* Theatre Header */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      justifyContent: 'space-between',
                      borderBottom: '1px solid var(--border-subtle)',
                      paddingBottom: '1rem',
                      marginBottom: '1.25rem',
                      gap: '1rem',
                      flexWrap: 'wrap'
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.2rem' }}>
                        {theatre.name}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#94a3b8' }}>
                        <MapPin size={13} color="#e50914" />
                        <span>{theatre.location}, {theatre.city}</span>
                      </div>
                    </div>

                    {/* Facilities Tags */}
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      {theatre.facilities?.slice(0, 3).map((f) => (
                        <span
                          key={f}
                          style={{
                            fontSize: '11px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid var(--border-subtle)',
                            color: '#cbd5e1',
                            padding: '2px 8px',
                            borderRadius: '6px'
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Showtimes Pills */}
                  <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap' }}>
                    {tShows.map((show) => (
                      <button
                        key={show._id}
                        onClick={() => navigate(`/booking/${show._id}`)}
                        className="glass-panel"
                        style={{
                          padding: '0.75rem 1.25rem',
                          borderRadius: '12px',
                          border: '1px solid rgba(56, 189, 248, 0.3)',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.25rem',
                          transition: 'all 0.2s',
                          background: 'rgba(56, 189, 248, 0.04)'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = '#e50914';
                          e.currentTarget.style.background = 'rgba(229, 9, 20, 0.12)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.3)';
                          e.currentTarget.style.background = 'rgba(56, 189, 248, 0.04)';
                        }}
                      >
                        <span style={{ fontSize: '14px', fontWeight: 800, color: '#f8fafc' }}>
                          {show.showTime}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ fontSize: '10px', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                            {show.format || '2D'}
                          </span>
                          <span style={{ fontSize: '10px', color: '#64748b' }}>•</span>
                          <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 600 }}>
                            {show.availableSeatsCount} seats left
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieDetailPage;
