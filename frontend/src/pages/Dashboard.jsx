import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Calendar, DollarSign, MapPin, XCircle, LogOut } from 'lucide-react';

export const Dashboard = () => {
  const { user, loading: authLoading, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [error, setError] = useState('');
  const [cancelLoadingId, setCancelLoadingId] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchBookings = async () => {
    if (!user) return;
    setLoadingBookings(true);
    try {
      const token = localStorage.getItem('lunsole_token');
      const response = await fetch('http://localhost:5000/api/bookings/my-bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      console.error(err);
      setError('Unable to load your reservations.');
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this luxury stay reservation?')) {
      return;
    }

    setCancelLoadingId(bookingId);
    try {
      const token = localStorage.getItem('lunsole_token');
      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Could not cancel booking');
      }

      // Refresh bookings
      fetchBookings();
    } catch (err) {
      alert(err.message);
    } finally {
      setCancelLoadingId(null);
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/');
  };

  if (authLoading || (user && loadingBookings && bookings.length === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p>Opening your private portfolio...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '40px' }}>
        
        {/* Left Side: Profile Information */}
        <div>
          <div style={{ backgroundColor: 'var(--primary)', color: '#fff', borderRadius: '12px', padding: '32px', textAlign: 'center', boxShadow: 'var(--shadow-md)' }}>
            <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--accent-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <User size={40} />
            </div>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '4px', fontFamily: 'var(--font-serif)' }}>
              {user.first_name} {user.last_name}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', marginBottom: '24px' }}>{user.email}</p>
            
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', marginBottom: '32px', textAlign: 'left', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Role:</span>
                <span style={{ textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--accent)' }}>{user.role}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'rgba(255,255,255,0.4)' }}>Member Since:</span>
                <span>{new Date(user.created_at || Date.now()).toLocaleDateString(undefined, { year: 'numeric', month: 'long' })}</span>
              </div>
            </div>

            <button onClick={handleLogoutClick} className="btn btn-outline" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.2)', color: '#fff', gap: '8px' }}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>

        {/* Right Side: Bookings Listing */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-serif)' }}>Your Luxury Reservations</h2>
            <Link to="/search" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.9rem' }}>Book New Sanctuary</Link>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '24px' }}>
              {error}
            </div>
          )}

          {loadingBookings && bookings.length === 0 ? (
            <p>Loading reservations...</p>
          ) : bookings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '20px' }}>You do not have any bookings registered yet.</p>
              <Link to="/" className="btn btn-accent">Explore Stays</Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {bookings.map((booking) => {
                const isCancelled = booking.status === 'cancelled';
                const isUpcoming = new Date(booking.check_in) > new Date();

                // Style for status badge
                let badgeStyle = {
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  textTransform: 'uppercase'
                };
                if (booking.status === 'confirmed') {
                  badgeStyle = { ...badgeStyle, backgroundColor: 'rgba(46,125,50,0.1)', color: 'var(--success)' };
                } else if (booking.status === 'pending') {
                  badgeStyle = { ...badgeStyle, backgroundColor: 'rgba(255,179,0,0.1)', color: '#ffb300' };
                } else {
                  badgeStyle = { ...badgeStyle, backgroundColor: 'rgba(198,40,40,0.1)', color: 'var(--error)' };
                }

                return (
                  <div key={booking.booking_id} style={{ display: 'flex', backgroundColor: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ width: '220px', flexShrink: 0 }}>
                      <img src={booking.accommodation_image || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80'} alt={booking.accommodation_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>

                    <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <span style={badgeStyle}>{booking.status}</span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                            Booked on {new Date(booking.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{booking.accommodation_name}</h3>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                          <MapPin size={14} />
                          <span>{booking.address}, {booking.city}, {booking.country}</span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', backgroundColor: 'var(--bg-main)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', marginBottom: '16px' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Suite</span>
                            <strong>{booking.room_name} ({booking.room_type})</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Guests</span>
                            <strong>{booking.guests_count} Guests</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Check-In</span>
                            <strong>{new Date(booking.check_in).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.8rem', textTransform: 'uppercase' }}>Check-Out</span>
                            <strong>{new Date(booking.check_out).toLocaleDateString(undefined, { dateStyle: 'medium' })}</strong>
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Cost:</span>
                          <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                            ${booking.total_price}
                          </div>
                        </div>

                        <div>
                          {!isCancelled && isUpcoming && (
                            <button
                              onClick={() => handleCancelBooking(booking.booking_id)}
                              disabled={cancelLoadingId === booking.booking_id}
                              className="btn btn-outline"
                              style={{ 
                                borderColor: 'rgba(198, 40, 40, 0.3)', 
                                color: 'var(--error)', 
                                padding: '8px 16px', 
                                fontSize: '0.85rem', 
                                gap: '6px'
                              }}
                            >
                              <XCircle size={16} />
                              {cancelLoadingId === booking.booking_id ? 'Cancelling...' : 'Cancel Booking'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
