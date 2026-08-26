import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Calendar, Users, Check, ArrowRight } from 'lucide-react';

export const AccommodationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Booking details state
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guestsCount, setGuestsCount] = useState(1);

  // Booking transaction state
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookedDetails, setBookedDetails] = useState(null);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState('0.0');
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    const fetchDetailsAndReviews = async () => {
      try {
        // Fetch accommodation details
        const accResponse = await fetch(`http://localhost:5000/api/accommodations/${id}`);
        if (!accResponse.ok) {
          throw new Error('Accommodation not found');
        }
        const accData = await accResponse.json();
        setAccommodation(accData);

        // Fetch reviews
        const revResponse = await fetch(`http://localhost:5000/api/accommodations/${id}/reviews`);
        if (revResponse.ok) {
          const revData = await revResponse.json();
          setReviews(revData.reviews);
          setAvgRating(revData.avgRating);
          setReviewsCount(revData.reviewsCount);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || 'Could not load details');
      } finally {
        setLoading(false);
        setReviewLoading(false);
      }
    };
    fetchDetailsAndReviews();
  }, [id]);

  // Calculate nights count
  const getNightsCount = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) return 0;
    const diff = end - start;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const nights = getNightsCount();

  const handleBookRoom = async (room) => {
    if (!user) {
      // Save current page state to redirect back later if desired
      navigate('/login');
      return;
    }

    if (!checkIn || !checkOut) {
      setBookingError('Please select both Check-In and Check-Out dates.');
      window.scrollTo({ top: document.getElementById('booking-config').offsetTop - 100, behavior: 'smooth' });
      return;
    }

    if (nights <= 0) {
      setBookingError('Check-Out date must be after Check-In date.');
      return;
    }

    if (guestsCount > room.capacity) {
      setBookingError(`Guests count (${guestsCount}) exceeds room capacity (${room.capacity}).`);
      return;
    }

    setBookingLoading(true);
    setBookingError('');

    try {
      const token = localStorage.getItem('lunsole_token');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          roomId: room.id,
          checkIn,
          checkOut,
          guestsCount: parseInt(guestsCount, 10)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to complete booking');
      }

      setBookedDetails({
        bookingId: data.bookingId,
        roomName: room.name,
        totalPrice: data.totalPrice,
        nights: data.nights
      });
      setBookingSuccess(true);
    } catch (err) {
      setBookingError(err.message || 'Server error creating booking.');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment || reviewComment.trim() === '') {
      setReviewError('Please write a review comment.');
      return;
    }
    setReviewSubmitLoading(true);
    setReviewError('');
    setReviewSuccess(false);

    try {
      const token = localStorage.getItem('lunsole_token');
      const response = await fetch(`http://localhost:5000/api/accommodations/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit review');
      }

      setReviewSuccess(true);
      setReviewComment('');
      setReviewRating(5);
      
      // Refresh reviews list
      const refreshResponse = await fetch(`http://localhost:5000/api/accommodations/${id}/reviews`);
      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        setReviews(refreshData.reviews);
        setAvgRating(refreshData.avgRating);
        setReviewsCount(refreshData.reviewsCount);
      }
    } catch (err) {
      setReviewError(err.message || 'Server error submitting review.');
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p>Opening sanctuary brochure...</p>
      </div>
    );
  }

  if (error || !accommodation) {
    return (
      <div className="container" style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div className="alert alert-error" style={{ justifyContent: 'center', marginBottom: '24px' }}>
          {error || 'Accommodation not found'}
        </div>
        <Link to="/" className="btn btn-primary">Return Home</Link>
      </div>
    );
  }

  return (
    <div style={{ paddingBottom: '80px' }}>
      {/* Hero Header */}
      <div 
        style={{ 
          height: '45vh', 
          position: 'relative', 
          background: `linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6)), url(${accommodation.image_url}) center/cover no-repeat`
        }}
      >
        <div className="container" style={{ position: 'absolute', bottom: '32px', left: '50%', transform: 'translateX(-50%)', color: '#fff', width: '100%' }}>
          <span className="card-badge" style={{ position: 'static', display: 'inline-block', marginBottom: '12px' }}>{accommodation.type}</span>
          <h1 style={{ color: '#fff', fontSize: '3rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>{accommodation.name}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem' }}>
              <MapPin size={16} />
              <span>{accommodation.address}, {accommodation.city}, {accommodation.country}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                {[...Array(Math.round(parseFloat(avgRating) || accommodation.stars))].map((_, i) => (
                  <Star key={i} size={16} className="star-icon" style={{ fill: '#ffb300', color: '#ffb300' }} />
                ))}
              </div>
              <span style={{ fontSize: '0.95rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                {avgRating !== '0.0' ? `${avgRating} (${reviewsCount} reviews)` : `(${accommodation.stars}.0 Stars)`}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '48px' }}>
        {/* Success Modal Overlay */}
        {bookingSuccess && bookedDetails && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(18,19,26,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyItems: 'center', padding: '24px' }}>
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '16px', maxWidth: '500px', width: '100%', margin: 'auto', padding: '40px', textAlign: 'center', boxShadow: 'var(--shadow-lg)', border: '1px solid var(--border-color)' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: 'rgba(46,125,50,0.1)', color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Check size={36} />
              </div>
              <h2 style={{ fontSize: '2rem', marginBottom: '12px' }}>Booking Confirmed</h2>
              <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>
                Your luxury stay in the <strong>{bookedDetails.roomName}</strong> has been secured successfully. Reference ID: #{bookedDetails.bookingId}.
              </p>
              
              <div style={{ backgroundColor: 'var(--bg-main)', borderRadius: '8px', padding: '16px', marginBottom: '32px', textAlign: 'left', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                  <span>Nights Count:</span>
                  <strong>{bookedDetails.nights} nights</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 'bold' }}>
                  <span>Total Amount Paid:</span>
                  <span style={{ color: 'var(--accent)' }}>${bookedDetails.totalPrice}</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <Link to="/dashboard" className="btn btn-primary" style={{ width: '100%' }}>Go to My Dashboard</Link>
                <button onClick={() => setBookingSuccess(false)} className="btn btn-outline" style={{ width: '100%' }}>Book Another Stay</button>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '48px' }}>
          {/* Left Details */}
          <div>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '1.8rem', marginBottom: '16px' }}>About the Sanctuary</h2>
              <p style={{ fontSize: '1.05rem', color: 'var(--text-main)', lineHeight: '1.8' }}>{accommodation.description}</p>
            </div>

            <h2 style={{ fontSize: '1.8rem', marginBottom: '24px' }}>Available Suites</h2>
            
            {accommodation.rooms && accommodation.rooms.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No suites currently listed for this accommodation.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {accommodation.rooms.map((room) => (
                  <div key={room.id} style={{ display: 'flex', backgroundColor: 'var(--bg-card)', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
                    <div style={{ width: '250px', position: 'relative', flexShrink: 0 }}>
                      <img src={room.image_url || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80'} alt={room.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <span className="card-badge" style={{ position: 'absolute', top: '12px', left: '12px' }}>{room.type}</span>
                    </div>

                    <div style={{ padding: '24px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div>
                        <h3 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>{room.name}</h3>
                        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '12px' }}>{room.description}</p>
                        
                        {/* Amenities */}
                        {room.amenities && Array.isArray(room.amenities) && (
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                            {room.amenities.map((amenity, idx) => (
                              <span key={idx} style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                {amenity}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max Capacity: {room.capacity} guests</div>
                          <div style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>
                            ${room.price_per_night} <span style={{ fontSize: '0.9rem', fontWeight: 'normal', color: 'var(--text-muted)' }}>/ night</span>
                          </div>
                        </div>

                        <div>
                          {nights > 0 ? (
                            <div style={{ textAlign: 'right', marginRight: '16px', display: 'inline-block', verticalAlign: 'middle' }}>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block' }}>
                                Total: {nights} nights
                              </span>
                              <strong style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>
                                ${room.price_per_night * nights}
                              </strong>
                            </div>
                          ) : null}

                          <button 
                            onClick={() => handleBookRoom(room)} 
                            className="btn btn-primary" 
                            disabled={bookingLoading}
                            style={{ gap: '6px' }}
                          >
                            {bookingLoading ? 'Securing...' : 'Book Suite'} <ArrowRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Reviews Section */}
            <div style={{ marginTop: '56px', paddingTop: '40px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-serif)' }}>Guest Reviews</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--primary)' }}>{avgRating}</span>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={14} 
                          style={{ 
                            fill: i < Math.round(parseFloat(avgRating)) ? '#ffb300' : 'none', 
                            color: i < Math.round(parseFloat(avgRating)) ? '#ffb300' : '#e5e5e0' 
                          }} 
                        />
                      ))}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Based on {reviewsCount} reviews</span>
                  </div>
                </div>
              </div>

              {/* Submit Review Form */}
              <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', marginBottom: '40px', boxShadow: 'var(--shadow-sm)' }}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '16px', fontFamily: 'var(--font-serif)' }}>Share Your Experience</h3>
                
                {reviewSuccess && (
                  <div className="alert alert-success" style={{ marginBottom: '20px' }}>
                    Thank you! Your luxury review has been published.
                  </div>
                )}

                {reviewError && (
                  <div className="alert alert-error" style={{ marginBottom: '20px' }}>
                    {reviewError}
                  </div>
                )}

                {user ? (
                  <form onSubmit={handleReviewSubmit}>
                    <div className="form-group">
                      <label style={{ display: 'block', marginBottom: '8px' }}>Your Rating</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setReviewRating(star)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                          >
                            <Star 
                              size={28} 
                              style={{ 
                                fill: star <= reviewRating ? '#ffb300' : 'none', 
                                color: star <= reviewRating ? '#ffb300' : 'var(--border-color)',
                                transition: 'var(--transition)'
                              }} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="reviewComment">Review Comment</label>
                      <textarea
                        id="reviewComment"
                        className="form-control"
                        rows="4"
                        placeholder="Tell us about the service, design, comfort, and details..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        style={{ resize: 'vertical' }}
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary" 
                      disabled={reviewSubmitLoading}
                      style={{ padding: '10px 24px' }}
                    >
                      {reviewSubmitLoading ? 'Submitting...' : 'Post Review'}
                    </button>
                  </form>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px', backgroundColor: 'var(--bg-main)', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Please <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Sign In</Link> to share your experience with other guests.
                  </div>
                )}
              </div>

              {/* Reviews List */}
              {reviewLoading && reviews.length === 0 ? (
                <p>Loading guest reviews...</p>
              ) : reviews.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', italic: 'true', textAlign: 'center', padding: '24px 0' }}>No reviews have been posted for this sanctuary yet. Be the first to share your thoughts.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {reviews.map((rev) => (
                    <div key={rev.id} style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '24px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <div>
                          <strong style={{ fontSize: '0.95rem', color: 'var(--text-main)' }}>{rev.first_name} {rev.last_name}</strong>
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>
                            {new Date(rev.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                          </span>
                        </div>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={12} 
                              style={{ 
                                fill: i < rev.rating ? '#ffb300' : 'none', 
                                color: i < rev.rating ? '#ffb300' : '#e5e5e0' 
                              }} 
                            />
                          ))}
                        </div>
                      </div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{rev.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Booking Control Card */}
          <div id="booking-config">
            <div style={{ position: 'sticky', top: '110px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', boxShadow: 'var(--shadow-md)' }}>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '24px', fontFamily: 'var(--font-serif)' }}>Select Dates</h3>
              
              {bookingError && (
                <div className="alert alert-error" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>
                  {bookingError}
                </div>
              )}

              {!user && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', backgroundColor: 'var(--accent-light)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                  You will need to <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Sign In</Link> to complete your luxury reservation.
                </div>
              )}

              <div className="form-group">
                <label htmlFor="checkIn">Check-In</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="date" 
                    id="checkIn" 
                    className="form-control" 
                    style={{ paddingLeft: '36px' }} 
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="checkOut">Check-Out</label>
                <div style={{ position: 'relative' }}>
                  <Calendar size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="date" 
                    id="checkOut" 
                    className="form-control" 
                    style={{ paddingLeft: '36px' }} 
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: '24px' }}>
                <label htmlFor="guestsCount">Guests Count</label>
                <div style={{ position: 'relative' }}>
                  <Users size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <select 
                    id="guestsCount" 
                    className="form-control" 
                    style={{ paddingLeft: '36px' }}
                    value={guestsCount}
                    onChange={(e) => setGuestsCount(e.target.value)}
                  >
                    <option value={1}>1 Guest</option>
                    <option value={2}>2 Guests</option>
                    <option value={3}>3 Guests</option>
                    <option value={4}>4 Guests</option>
                  </select>
                </div>
              </div>

              {nights > 0 ? (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-main)', fontWeight: 'bold' }}>Stay Duration:</span>
                  <span style={{ fontSize: '1rem', color: 'var(--accent)', fontWeight: 'bold' }}>{nights} Nights</span>
                </div>
              ) : (
                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Set valid check-in and check-out dates to compute totals.
                </div>
              )}
            </div>
          </div>
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
