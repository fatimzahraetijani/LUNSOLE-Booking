import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, Users, Home as HomeIcon, MapPin, Star, Shield, Award, Sparkles, Heart, Compass } from 'lucide-react';
import { AccommodationCard } from '../components/AccommodationCard';

const TOP_DESTINATIONS = [
  {
    city: 'Marrakech',
    image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80',
    description: 'The legendary Ochre Imperial City, renowned for historic Riads, vibrant medinas, and palatial architecture.',
    badge: 'Imperial Sanctuary',
    stays: 12
  },
  {
    city: 'Casablanca',
    image: 'https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80',
    description: 'Morocco’s modern economic and coastal metropolis, featuring grand oceanfront views and the Hassan II Mosque.',
    badge: 'Coastal Metropolis',
    stays: 8
  },
  {
    city: 'Rabat',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    description: "Morocco's refined coastal capital, blending heritage monuments, royal gardens, and modern elegance.",
    badge: 'Capital Heritage',
    stays: 4
  },
  {
    city: 'Tangier',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    description: 'The historic gateway to Africa, overlooking the scenic Straits of Gibraltar and white-washed medina.',
    badge: 'Mediterranean Gateway',
    stays: 5
  }
];

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesSet, setFavoritesSet] = useState(new Set());
  const [hoveredCard, setHoveredCard] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState({
    city: '',
    type: 'all',
    minPrice: '',
    maxPrice: '',
    guests: '1'
  });

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [gpsCoords, setGpsCoords] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFromSuggestions, setSelectedFromSuggestions] = useState(false);

  useEffect(() => {
    if (selectedFromSuggestions) {
      setSelectedFromSuggestions(false);
      return;
    }

    if (!searchQuery.city || searchQuery.city.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/locations/search?q=${encodeURIComponent(searchQuery.city)}`);
        if (response.ok) {
          const data = await response.json();
          setSuggestions(data);
          setShowSuggestions(true);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery.city]);

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation unsupported');
      return;
    }

    setLocationStatus('Locating...');
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setGpsCoords({ lat: latitude, lng: longitude });
        try {
          const response = await fetch(`http://localhost:5000/api/locations/reverse?lat=${latitude}&lon=${longitude}`);
          if (response.ok) {
            const data = await response.json();
            if (data.city) {
              setSearchQuery(prev => ({ ...prev, city: data.city }));
              setSelectedFromSuggestions(true);
              setLocationStatus(`Near ${data.city}, ${data.country || ''}`);
            } else {
              setLocationStatus('Location obtained');
            }
          } else {
            setLocationStatus('Location obtained');
          }
        } catch (err) {
          setLocationStatus('Location obtained');
        }
      },
      (error) => {
        setLocationStatus('Permission denied');
      }
    );
  };

  const fetchAccommodations = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/accommodations');
      if (response.ok) {
        const data = await response.json();
        // Limit to 4 featured stays on Home
        setAccommodations(data.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching accommodations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const token = localStorage.getItem('lunsole_token');
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setFavoritesSet(new Set(data.map(fav => fav.id)));
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  useEffect(() => {
    fetchAccommodations();
    fetchFavorites();
  }, [user]);

  const handleSearchChange = (e) => {
    setSearchQuery({ ...searchQuery, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.city) params.append('city', searchQuery.city);
    if (searchQuery.type && searchQuery.type !== 'all') params.append('type', searchQuery.type);
    if (searchQuery.minPrice) params.append('minPrice', searchQuery.minPrice);
    if (searchQuery.maxPrice) params.append('maxPrice', searchQuery.maxPrice);
    if (searchQuery.guests) params.append('guests', searchQuery.guests);
    if (gpsCoords) {
      params.append('lat', gpsCoords.lat);
      params.append('lng', gpsCoords.lng);
    }
    navigate(`/search?${params.toString()}`);
  };

  const handleDestinationClick = (city) => {
    navigate(`/search?city=${encodeURIComponent(city)}&type=all`);
  };

  const handleFavoriteToggle = async (accommodationId) => {
    if (!user) {
      navigate('/login');
      return;
    }

    const isFav = favoritesSet.has(accommodationId);
    const method = isFav ? 'DELETE' : 'POST';
    
    try {
      const token = localStorage.getItem('lunsole_token');
      const response = await fetch(`http://localhost:5000/api/favorites/${accommodationId}`, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const nextFavs = new Set(favoritesSet);
        if (isFav) {
          nextFavs.delete(accommodationId);
        } else {
          nextFavs.add(accommodationId);
        }
        setFavoritesSet(nextFavs);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* ─── Hero Section ─── */}
      <section 
        className="hero-section" 
        style={{
          backgroundImage: `linear-gradient(to bottom, rgba(18,19,26,0.45) 0%, rgba(18,19,26,0.85) 100%), url('https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=1600&q=80')`,
          backgroundPosition: 'center 40%',
          backgroundSize: 'cover'
        }}
      >
        <div className="container hero-content">
          <p className="hero-subtitle">Bespoke Moroccan Sanctuaries</p>
          <h1 className="hero-title">Discover your next stay in Morocco</h1>
          <p className="hero-description">
            Experience the legendary hospitality of Morocco. Book handpicked luxury riads, coastal resorts, and urban penthouses in Marrakech, Casablanca, and beyond.
          </p>
        </div>
      </section>

      {/* ─── Search Form Widget ─── */}
      <div className="search-widget-container">
        <form onSubmit={handleSearchSubmit} className="search-widget">
          <div className="search-grid">
            <div className="form-group" style={{ marginBottom: 0, position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label htmlFor="city">
                  Destination {locationStatus && <span style={{ fontSize: '0.7rem', color: '#c5a880', fontWeight: 'bold', marginLeft: '6px' }}>({locationStatus})</span>}
                </label>
                <button 
                  type="button" 
                  onClick={handleGeolocation} 
                  style={{ background: 'none', border: 'none', color: '#c5a880', fontSize: '0.75rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
                >
                  <MapPin size={12} /> Use my location
                </button>
              </div>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 3 }} />
                <input 
                  type="text" 
                  id="city" 
                  name="city" 
                  placeholder="Marrakech, Casablanca, Rabat..." 
                  className="form-control" 
                  style={{ paddingLeft: '38px' }}
                  value={searchQuery.city}
                  onChange={handleSearchChange}
                  onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                  onBlur={() => { setTimeout(() => setShowSuggestions(false), 200); }}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#fff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 999,
                    marginTop: '4px',
                    maxHeight: '240px',
                    overflowY: 'auto'
                  }}>
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setSearchQuery(prev => ({ ...prev, city: item.city }));
                          setGpsCoords({ lat: item.latitude, lng: item.longitude });
                          setSelectedFromSuggestions(true);
                          setShowSuggestions(false);
                        }}
                        style={{
                          padding: '10px 14px',
                          cursor: 'pointer',
                          borderBottom: idx === suggestions.length - 1 ? 'none' : '1px solid #f0efeb',
                          fontSize: '0.85rem',
                          color: 'var(--text-main)',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--accent-light)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <strong style={{ color: 'var(--primary)' }}>{item.city}</strong>, {item.country}
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.formattedAddress}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="type">Property Type</label>
              <select 
                id="type" 
                name="type" 
                className="form-control"
                value={searchQuery.type}
                onChange={handleSearchChange}
              >
                <option value="all">All Properties</option>
                <option value="hotel">Hotel</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="guesthouse">Guesthouse</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="minPrice">Min Price ($/night)</label>
              <input 
                type="number" 
                id="minPrice" 
                name="minPrice" 
                placeholder="Any" 
                className="form-control" 
                value={searchQuery.minPrice}
                onChange={handleSearchChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="maxPrice">Max Price ($/night)</label>
              <input 
                type="number" 
                id="maxPrice" 
                name="maxPrice" 
                placeholder="Any" 
                className="form-control" 
                value={searchQuery.maxPrice}
                onChange={handleSearchChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="guests">Guests</label>
              <input 
                type="number" 
                id="guests" 
                name="guests"
                min="1"
                placeholder="1"
                className="form-control" 
                value={searchQuery.guests}
                onChange={handleSearchChange}
              />
            </div>

            <button type="submit" className="btn btn-accent" style={{ height: '48px', width: '100%', gap: '8px' }}>
              <Search size={18} /> Search
            </button>
          </div>
        </form>
      </div>

      {/* ─── Top Destination Visual Showcase (Featuring Marrakech & Casablanca) ─── */}
      <section className="container" style={{ margin: '80px auto' }}>
        <div className="section-header">
          <p className="section-subtitle">Morocco's Finest Destinational Hubs</p>
          <h2>Top Moroccan Destinations</h2>
          <p>Immerse yourself in history, palatial architecture, and seaside coastal elegance.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px' }}>
          {TOP_DESTINATIONS.map((dest) => (
            <div 
              key={dest.city} 
              onClick={() => handleDestinationClick(dest.city)}
              onMouseEnter={() => setHoveredCard(dest.city)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ 
                borderRadius: '18px', 
                overflow: 'hidden', 
                position: 'relative', 
                height: '430px', 
                cursor: 'pointer',
                boxShadow: hoveredCard === dest.city ? '0 20px 40px rgba(18, 19, 26, 0.28)' : '0 6px 20px rgba(18, 19, 26, 0.08)',
                transform: hoveredCard === dest.city ? 'translateY(-10px)' : 'translateY(0)',
                transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                border: '1px solid rgba(197, 168, 128, 0.2)'
              }}
            >
              <img
                src={dest.image}
                alt={dest.city}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'; }}
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  objectFit: 'cover',
                  transform: hoveredCard === dest.city ? 'scale(1.08)' : 'scale(1)',
                  transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
              
              {/* Glassmorphism Badge */}
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(18, 19, 26, 0.55)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(197, 168, 128, 0.3)',
                borderRadius: '30px',
                padding: '6px 14px',
                fontSize: '0.72rem',
                fontWeight: '700',
                color: '#c5a880',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                zIndex: 2
              }}>
                {dest.badge}
              </div>

              {/* Text Content with Dark Charcoal & Gold Gradient Overlay */}
              <div style={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                background: hoveredCard === dest.city
                  ? 'linear-gradient(to top, rgba(11,12,16,0.95) 0%, rgba(11,12,16,0.55) 50%, rgba(11,12,16,0.15) 100%)'
                  : 'linear-gradient(to top, rgba(11,12,16,0.85) 0%, rgba(11,12,16,0.4) 50%, rgba(11,12,16,0) 100%)',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'flex-end', 
                padding: '32px 28px',
                color: '#fff',
                transition: 'background 0.5s ease',
                zIndex: 1
              }}>
                <h3 style={{ 
                  color: '#fff', 
                  fontSize: '2.1rem', 
                  fontFamily: 'var(--font-serif)', 
                  marginBottom: '8px',
                  fontWeight: '700',
                  letterSpacing: '0.02em',
                  textShadow: '0 2px 4px rgba(0,0,0,0.4)'
                }}>
                  {dest.city}
                </h3>
                
                <p style={{ 
                  fontSize: '0.88rem', 
                  color: 'rgba(255,255,255,0.85)', 
                  lineHeight: '1.5', 
                  marginBottom: '18px',
                  opacity: hoveredCard === dest.city ? 1 : 0.85,
                  transition: 'opacity 0.3s ease'
                }}>
                  {dest.description}
                </p>
                
                <span style={{ 
                  fontSize: '0.78rem', 
                  color: '#c5a880', 
                  fontWeight: '700', 
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  Explore {dest.city} Stays
                  <span style={{
                    transform: hoveredCard === dest.city ? 'translateX(6px)' : 'translateX(0)',
                    transition: 'transform 0.3s ease'
                  }}>
                    &rarr;
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Accommodations */}
      <section id="accommodations" className="container" style={{ marginBottom: '80px' }}>
        <div className="section-header">
          <p className="section-subtitle">Exquisite Destinations</p>
          <h2>Featured Moroccan Stays</h2>
          <p>Handpicked boutique Riads, coastal hideaways, and central penthouses.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p style={{ color: 'var(--text-muted)' }}>Gathering our luxury collection...</p>
          </div>
        ) : accommodations.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stays found in the database. Run database setup & seeding.</p>
        ) : (
          <div className="accommodations-grid">
            {accommodations.map((property) => {
              const isFavorited = favoritesSet.has(property.id);
              return (
                <AccommodationCard
                  key={property.id}
                  property={property}
                  isFavorited={isFavorited}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Seasonal Promotion Section */}
      <section style={{ backgroundColor: 'var(--accent-light)', padding: '80px 0', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <span style={{ textTransform: 'uppercase', color: 'var(--accent)', fontWeight: 'bold', fontSize: '0.85rem', display: 'block', marginBottom: '8px' }}>Seasonal Promotion</span>
            <h2 style={{ fontSize: '2.5rem', fontFamily: 'var(--font-serif)', marginBottom: '20px', lineHeight: '1.2' }}>Experience Imperial Suites In Marrakech</h2>
            <p style={{ color: 'var(--text-main)', fontSize: '1.05rem', lineHeight: '1.8', marginBottom: '32px' }}>
              Escape to the magical city of Marrakech. Book our top-rated Palais Riad LUNSOLE and receive complimentary hammam therapy, traditional Moroccan breakfast served on the garden patio, and private airport transfers.
            </p>
            <Link to="/accommodations/3" className="btn btn-primary" style={{ padding: '14px 28px' }}>Book Imperial Riad Stays</Link>
          </div>
          <div>
            <img 
              src="https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80" 
              alt="Marrakech Luxury Riad" 
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }} 
            />
          </div>
        </div>
      </section>

      {/* Services / Exclusive Benefits */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <p className="section-subtitle" style={{ color: 'var(--accent-hover)' }}>Exclusive Benefits</p>
            <h2>Uncompromising Luxury</h2>
            <p>Elevate your experience with signature services curated just for you.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Award size={36} />
              </div>
              <h3>Premium Quality Stays</h3>
              <p>Every single riad, apartment, and resort meets our rigorous design, comfort, and service audits.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Sparkles size={36} />
              </div>
              <h3>Secure Escrow Booking</h3>
              <p>LUNSOLE provides verified check-in policies, secure online payments, and local customer support.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Shield size={36} />
              </div>
              <h3>Moroccan Local Experts</h3>
              <p>Specialized itineraries, personal tour arrangements, and chef-catered dining inside your private stay.</p>
            </div>
          </div>
        </div>
      </section>
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
