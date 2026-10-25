import React, { useState, useEffect } from 'react';
import { ShieldCheck, Plus, Trash2, Film, Calendar, DollarSign, Users, Ticket, Building, CheckCircle2 } from 'lucide-react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'movies' | 'shows' | 'bookings'

  // Platform metrics & data
  const [metrics, setMetrics] = useState({ totalRevenue: 0, totalBookings: 0 });
  const [bookings, setBookings] = useState([]);
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for adding movie
  const [newMovie, setNewMovie] = useState({
    title: '',
    description: '',
    genres: 'Action, Sci-Fi',
    language: 'English',
    duration: 150,
    rating: 8.5,
    posterUrl: '',
    backdropUrl: '',
    trailerUrl: '',
    director: '',
    cast: 'Actor A, Actor B',
    formats: 'IMAX 3D, 2D'
  });

  // Form states for scheduling show
  const [newShow, setNewShow] = useState({
    movie: '',
    theatre: '',
    screenName: 'Screen 1 - 4K Laser',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '06:30 PM',
    format: 'IMAX 3D',
    language: 'English',
    pricing: { vip: 450, premium: 320, standard: 220 }
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [bRes, mRes, tRes, sRes] = await Promise.all([
        api.get('/bookings'),
        api.get('/movies'),
        api.get('/theatres'),
        api.get('/shows')
      ]);

      if (bRes.data.success) {
        setBookings(bRes.data.data);
        setMetrics(bRes.data.metrics);
      }
      if (mRes.data.success) {
        setMovies(mRes.data.data);
        if (mRes.data.data.length > 0 && !newShow.movie) {
          setNewShow((prev) => ({ ...prev, movie: mRes.data.data[0]._id }));
        }
      }
      if (tRes.data.success) {
        setTheatres(tRes.data.data);
        if (tRes.data.data.length > 0 && !newShow.theatre) {
          setNewShow((prev) => ({ ...prev, theatre: tRes.data.data[0]._id }));
        }
      }
      if (sRes.data.success) {
        setShows(sRes.data.data);
      }
    } catch (err) {
      console.error('Admin data fetch error', err);
      toast.error('Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMovie = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/movies', newMovie);
      if (data.success) {
        toast.success(`Movie "${newMovie.title}" added successfully!`);
        setNewMovie({
          title: '',
          description: '',
          genres: 'Action, Sci-Fi',
          language: 'English',
          duration: 150,
          rating: 8.5,
          posterUrl: '',
          backdropUrl: '',
          trailerUrl: '',
          director: '',
          cast: '',
          formats: 'IMAX 3D, 2D'
        });
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating movie.');
    }
  };

  const handleDeleteMovie = async (id, title) => {
    if (!window.confirm(`Delete movie "${title}" and all its showtimes?`)) return;
    try {
      const { data } = await api.delete(`/movies/${id}`);
      if (data.success) {
        toast.info('Movie deleted.');
        fetchData();
      }
    } catch (err) {
      toast.error('Error deleting movie.');
    }
  };

  const handleScheduleShow = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/shows', newShow);
      if (data.success) {
        toast.success('New show scheduled with 64-seat interactive layout!');
        fetchData();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error scheduling show.');
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2.5rem 1.5rem 5rem' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div style={{ background: '#e50914', borderRadius: '8px', padding: '6px', display: 'flex' }}>
                <ShieldCheck size={22} color="#fff" />
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#f8fafc' }}>
                Cinema Administration Console
              </h1>
            </div>
            <p style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>
              Manage movies catalogue, schedule auditoriums, configure pricing, and view customer transactions.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px' }}>
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'movies', label: 'Movies & Catalog' },
              { id: 'shows', label: 'Show Schedules' },
              { id: 'bookings', label: 'All Bookings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  background: activeTab === tab.id ? '#e50914' : 'transparent',
                  color: activeTab === tab.id ? '#fff' : '#94a3b8',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.5rem 1rem',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ================= TAB 1: OVERVIEW METRICS ================= */}
        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#22c55e', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>Total Revenue</span>
                  <DollarSign size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc' }}>
                  ₹{metrics.totalRevenue?.toLocaleString()}
                </div>
                <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '4px' }}>
                  From confirmed ticket transactions
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#38bdf8', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>Total Bookings</span>
                  <Ticket size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc' }}>
                  {metrics.totalBookings}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  {metrics.totalConfirmed} confirmed • {metrics.totalCancelled} cancelled
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f59e0b', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>Active Movies</span>
                  <Film size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc' }}>
                  {movies.length}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  Across Hindi & English languages
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem', borderRadius: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#a855f7', marginBottom: '0.5rem' }}>
                  <span style={{ fontSize: '13px', fontWeight: 700, color: '#94a3b8' }}>Multiplex Partners</span>
                  <Building size={20} />
                </div>
                <div style={{ fontSize: '2rem', fontWeight: 900, color: '#f8fafc' }}>
                  {theatres.length}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  PVR, INOX & Cinépolis chains
                </div>
              </div>
            </div>

            {/* Recent Bookings preview */}
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
                Recent Platform Reservations
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#cbd5e1' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: '#94a3b8' }}>
                      <th style={{ padding: '0.75rem' }}>Booking ID</th>
                      <th style={{ padding: '0.75rem' }}>Customer</th>
                      <th style={{ padding: '0.75rem' }}>Movie</th>
                      <th style={{ padding: '0.75rem' }}>Seats</th>
                      <th style={{ padding: '0.75rem' }}>Total</th>
                      <th style={{ padding: '0.75rem' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 5).map((b) => (
                      <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{b.bookingId}</td>
                        <td style={{ padding: '0.75rem' }}>{b.user?.name || 'Customer'}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>{b.movie?.title}</td>
                        <td style={{ padding: '0.75rem', color: '#fbbf24' }}>{b.seats?.join(', ')}</td>
                        <td style={{ padding: '0.75rem', fontWeight: 700, color: '#22c55e' }}>₹{b.totalAmount}</td>
                        <td style={{ padding: '0.75rem' }}>
                          <span className={b.status === 'confirmed' ? 'badge-cyan' : 'badge-red'} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase' }}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MOVIES MANAGEMENT ================= */}
        {activeTab === 'movies' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            {/* Add Movie Form */}
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Plus size={18} color="#e50914" /> Add New Movie
              </h3>

              <form onSubmit={handleAddMovie} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '13px' }}>
                <div>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Movie Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gladiator II"
                    value={newMovie.title}
                    onChange={(e) => setNewMovie({ ...newMovie, title: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Description / Synopsis</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Overview of the movie storyline..."
                    value={newMovie.description}
                    onChange={(e) => setNewMovie({ ...newMovie, description: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Genres (comma-separated)</label>
                    <input
                      type="text"
                      value={newMovie.genres}
                      onChange={(e) => setNewMovie({ ...newMovie, genres: e.target.value })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Language</label>
                    <input
                      type="text"
                      value={newMovie.language}
                      onChange={(e) => setNewMovie({ ...newMovie, language: e.target.value })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Duration (minutes)</label>
                    <input
                      type="number"
                      value={newMovie.duration}
                      onChange={(e) => setNewMovie({ ...newMovie, duration: Number(e.target.value) })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Rating (out of 10)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newMovie.rating}
                      onChange={(e) => setNewMovie({ ...newMovie, rating: Number(e.target.value) })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Poster Image URL</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newMovie.posterUrl}
                    onChange={(e) => setNewMovie({ ...newMovie, posterUrl: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Backdrop Banner URL (optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={newMovie.backdropUrl}
                    onChange={(e) => setNewMovie({ ...newMovie, backdropUrl: e.target.value })}
                    style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                  <Plus size={16} /> Save & Publish Movie
                </button>
              </form>
            </div>

            {/* Movies List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                Existing Catalogue ({movies.length})
              </h3>
              {movies.map((m) => (
                <div
                  key={m._id}
                  className="glass-card"
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <img src={m.posterUrl} alt={m.title} style={{ width: '45px', height: '60px', borderRadius: '6px', objectFit: 'cover' }} />
                    <div>
                      <div style={{ fontWeight: 800, color: '#f8fafc' }}>{m.title}</div>
                      <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                        {m.genres?.join(', ')} • {m.duration} mins • ⭐ {m.rating}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteMovie(m._id, m.title)}
                    style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      color: '#ef4444',
                      borderRadius: '8px',
                      padding: '0.4rem 0.75rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '12px'
                    }}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: SHOW SCHEDULING ================= */}
        {activeTab === 'shows' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '2rem', alignItems: 'start' }}>
            <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={18} color="#e50914" /> Schedule Show & Generate Seating
              </h3>

              <form onSubmit={handleScheduleShow} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '13px' }}>
                <div>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Movie</label>
                  <select
                    value={newShow.movie}
                    onChange={(e) => setNewShow({ ...newShow, movie: e.target.value })}
                    style={{ width: '100%', background: '#0e1322', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                  >
                    {movies.map((m) => (
                      <option key={m._id} value={m._id}>{m.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Select Theatre</label>
                  <select
                    value={newShow.theatre}
                    onChange={(e) => setNewShow({ ...newShow, theatre: e.target.value })}
                    style={{ width: '100%', background: '#0e1322', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                  >
                    {theatres.map((t) => (
                      <option key={t._id} value={t._id}>{t.name} ({t.city})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Show Date</label>
                    <input
                      type="date"
                      required
                      value={newShow.showDate}
                      onChange={(e) => setNewShow({ ...newShow, showDate: e.target.value })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Show Time</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 07:15 PM"
                      value={newShow.showTime}
                      onChange={(e) => setNewShow({ ...newShow, showTime: e.target.value })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Auditorium / Screen</label>
                    <input
                      type="text"
                      value={newShow.screenName}
                      onChange={(e) => setNewShow({ ...newShow, screenName: e.target.value })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Format</label>
                    <input
                      type="text"
                      value={newShow.format}
                      onChange={(e) => setNewShow({ ...newShow, format: e.target.value })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.6rem', color: '#fff' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  <div>
                    <label style={{ color: '#fbbf24', fontSize: '11px', display: 'block', marginBottom: '3px' }}>VIP Price (₹)</label>
                    <input
                      type="number"
                      value={newShow.pricing.vip}
                      onChange={(e) => setNewShow({ ...newShow, pricing: { ...newShow.pricing, vip: Number(e.target.value) } })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#38bdf8', fontSize: '11px', display: 'block', marginBottom: '3px' }}>Premium (₹)</label>
                    <input
                      type="number"
                      value={newShow.pricing.premium}
                      onChange={(e) => setNewShow({ ...newShow, pricing: { ...newShow.pricing, premium: Number(e.target.value) } })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem', color: '#fff' }}
                    />
                  </div>
                  <div>
                    <label style={{ color: '#cbd5e1', fontSize: '11px', display: 'block', marginBottom: '3px' }}>Standard (₹)</label>
                    <input
                      type="number"
                      value={newShow.pricing.standard}
                      onChange={(e) => setNewShow({ ...newShow, pricing: { ...newShow.pricing, standard: Number(e.target.value) } })}
                      style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '0.5rem', color: '#fff' }}
                    />
                  </div>
                </div>

                <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem' }}>
                  <Plus size={16} /> Create Show (64 Seats Auto-Generated)
                </button>
              </form>
            </div>

            {/* Shows List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc' }}>
                Scheduled Shows ({shows.length})
              </h3>
              {shows.slice(0, 15).map((s) => (
                <div
                  key={s._id}
                  className="glass-card"
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 800, color: '#f8fafc' }}>{s.movie?.title}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                      {s.theatre?.name} • {s.showDate} ({s.showTime})
                    </div>
                    <div style={{ fontSize: '11px', color: '#22c55e', marginTop: '2px' }}>
                      {s.availableSeatsCount} / {s.totalSeats} seats open
                    </div>
                  </div>
                  <span className="badge-cyan" style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px' }}>
                    {s.format}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 4: ALL BOOKINGS ================= */}
        {activeTab === 'bookings' && (
          <div className="glass-card" style={{ padding: '1.75rem', borderRadius: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#f8fafc', marginBottom: '1.25rem' }}>
              All Customer Bookings ({bookings.length})
            </h3>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', color: '#cbd5e1' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: '#94a3b8' }}>
                    <th style={{ padding: '0.75rem' }}>ID</th>
                    <th style={{ padding: '0.75rem' }}>Customer</th>
                    <th style={{ padding: '0.75rem' }}>Movie & Theatre</th>
                    <th style={{ padding: '0.75rem' }}>Showtime</th>
                    <th style={{ padding: '0.75rem' }}>Seats</th>
                    <th style={{ padding: '0.75rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>{b.bookingId}</td>
                      <td style={{ padding: '0.75rem' }}>
                        <div>{b.user?.name || 'Customer'}</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{b.user?.email}</div>
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <div style={{ fontWeight: 600, color: '#f8fafc' }}>{b.movie?.title}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{b.theatre?.name}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontSize: '12px' }}>
                        <div>{b.show?.showDate}</div>
                        <div style={{ color: '#fbbf24' }}>{b.show?.showTime}</div>
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>
                        {b.seats?.join(', ')}
                      </td>
                      <td style={{ padding: '0.75rem', fontWeight: 700, color: '#22c55e' }}>
                        ₹{b.totalAmount}
                      </td>
                      <td style={{ padding: '0.75rem' }}>
                        <span className={b.status === 'confirmed' ? 'badge-cyan' : 'badge-red'} style={{ padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase' }}>
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
