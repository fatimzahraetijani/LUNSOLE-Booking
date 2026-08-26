import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, Calendar, Users, Home as HomeIcon, MapPin, Star, Shield, Award, Sparkles, Heart } from 'lucide-react';

const TOP_DESTINATIONS = [
  {
    city: 'Rabat',
    image: 'https://images.unsplash.com/photo-1554497342-9027fe087837?auto=format&fit=crop&w=600&q=80',
    description: 'Morocco\'s coastal capital, blending colonial architecture and historic landmarks.',
    stays: 2
  },
  {
    city: 'Marrakech',
    image: 'https://images.unsplash.com/photo-1597887730406-8850bb5543c7?auto=format&fit=crop&w=600&q=80',
    description: 'The legendary Red City, famous for its bustling medina, historic palaces, and Riads.',
    stays: 2
  },
  {
    city: 'Casablanca',
    image: 'https://images.unsplash.com/photo-1559511259-22254e39bd08?auto=format&fit=crop&w=600&q=80',
    description: 'The modern economic hub, home to the monumental Hassan II Mosque by the sea.',
    stays: 2
  },
  {
    city: 'Tangier',
    image: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80',
    description: 'The gateway to Africa, overlooking the scenic Straits of Gibraltar.',
    stays: 1
  },
  {
    city: 'Agadir',
    image: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=600&q=80',
    description: 'Sun-drenched beaches, luxury resorts, and a modern vibrant seafront.',
    stays: 1
  },
  {
    city: 'Chefchaouen',
    image: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',
    description: 'The dreamy Blue Pearl of the Rif Mountains, painted in beautiful indigo hues.',
    stays: 1
  }
];

export const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favoritesSet, setFavoritesSet] = useState(new Set());
  
  const [searchQuery, setSearchQuery] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    guests: '1',
    type: 'all'
  });

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
    navigate(`/search?city=${searchQuery.city}&type=${searchQuery.type}&checkIn=${searchQuery.checkIn}&checkOut=${searchQuery.checkOut}&guests=${searchQuery.guests}`);
  };

  const handleDestinationClick = (city) => {
    navigate(`/search?city=${city}&type=all`);
  };

  const handleFavoriteToggle = async (accommodationId, e) => {
    e.preventDefault();
    e.stopPropagation();

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
      {/* Hero Section */}
      <section 
        className="hero-section" 
        style={{ backgroundImage: `linear-gradient(to bottom, rgba(18,19,26,0.3), rgba(18,19,26,0.7)), url('https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=1200&q=80')`, backgroundPosition: 'center 40%' }}
      >
        <div className="container hero-content">
          <p className="hero-subtitle">Bespoke Moroccan Sanctuaries</p>
          <h1 className="hero-title">Discover your next stay in Morocco</h1>
          <p className="hero-description">
            Experience the legendary hospitality of Morocco. Book handpicked luxury riads, coastal resorts, and urban penthouses.
          </p>
        </div>
      </section>

      {/* Booking / Search Form Widget */}
      <div className="search-widget-container">
        <form onSubmit={handleSearchSubmit} className="search-widget">
          <div className="search-grid">
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="city">Destination</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  id="city" 
                  name="city" 
                  placeholder="Rabat, Marrakech, Agadir..." 
                  className="form-control" 
                  style={{ paddingLeft: '38px' }}
                  value={searchQuery.city}
                  onChange={handleSearchChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="checkIn">Check In</label>
              <input 
                type="date" 
                id="checkIn" 
                name="checkIn" 
                className="form-control" 
                value={searchQuery.checkIn}
                onChange={handleSearchChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="checkOut">Check Out</label>
              <input 
                type="date" 
                id="checkOut" 
                name="checkOut" 
                className="form-control" 
                value={searchQuery.checkOut}
                onChange={handleSearchChange}
              />
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
                <option value="guesthouse">Guesthouse</option>
              </select>
            </div>

            <button type="submit" className="btn btn-accent" style={{ height: '48px', width: '100%', gap: '8px' }}>
              <Search size={18} /> Search
            </button>
          </div>
        </form>
      </div>

      {/* Top Destinations */}
      <section className="container" style={{ margin: '80px auto' }}>
        <div className="section-header">
          <p className="section-subtitle">Morocco\'s Finest</p>
          <h2>Top Destinations</h2>
          <p>Immerse yourself in history, culture, and absolute relaxation across Morocco.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {TOP_DESTINATIONS.map((dest) => (
            <div 
              key={dest.city} 
              onClick={() => handleDestinationClick(dest.city)}
              style={{ 
                borderRadius: '12px', 
                overflow: 'hidden', 
                position: 'relative', 
                height: '350px', 
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'transform 0.4s ease, box-shadow 0.4s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <img src={dest.image} alt={dest.city} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ 
                position: 'absolute', 
                top: 0, left: 0, right: 0, bottom: 0, 
                background: 'linear-gradient(to top, rgba(18,19,26,0.95) 10%, rgba(18,19,26,0.3) 50%, rgba(18,19,26,0) 80%)',
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'flex-end', 
                padding: '24px',
                color: '#fff'
              }}>
                <h3 style={{ color: '#fff', fontSize: '1.75rem', fontFamily: 'var(--font-serif)', marginBottom: '8px' }}>{dest.city}</h3>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.4', marginBottom: '12px' }}>{dest.description}</p>
                <span style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 'bold', textTransform: 'uppercase' }}>
                  {dest.stays} Stays Available &rarr;
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
          <p>Handpicked boutique Riads, coastal hideaways, and central apartments.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            <p>Gathering our luxury collection...</p>
          </div>
        ) : accommodations.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No stays found in the database. Run database setup & seeding.</p>
        ) : (
          <div className="accommodations-grid">
            {accommodations.map((property) => {
              const isFavorited = favoritesSet.has(property.id);
              return (
                <div key={property.id} className="accommodation-card">
                  <div className="card-img-wrapper">
                    <img src={property.image_url} alt={property.name} className="card-img" />
                    <span className="card-badge">{property.type}</span>
                    
                    {/* Heart Button */}
                    <button 
                      onClick={(e) => handleFavoriteToggle(property.id, e)}
                      style={{ 
                        position: 'absolute', 
                        top: '12px', 
                        right: '12px', 
                        background: 'rgba(18,19,26,0.6)', 
                        border: 'none', 
                        borderRadius: '50%', 
                        width: '32px', 
                        height: '32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: isFavorited ? '#ff4444' : '#fff', 
                        cursor: 'pointer',
                        transition: 'var(--transition)'
                      }}
                    >
                      <Heart size={16} fill={isFavorited ? '#ff4444' : 'none'} />
                    </button>
                  </div>
                  <div className="card-content">
                    <div className="card-location">
                      <MapPin size={14} />
                      <span>{property.city}, {property.country}</span>
                    </div>
                    <h3 className="card-title">{property.name}</h3>
                    <div className="card-rating">
                      {[...Array(property.stars)].map((_, i) => (
                        <Star key={i} className="star-icon" />
                      ))}
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        ({property.stars}.0 Stars)
                      </span>
                    </div>
                    <p className="card-description">{property.description}</p>
                    <div className="card-footer">
                      <div className="card-price">
                        <span>${Math.round(property.min_price || property.price || 120)}</span> / night
                      </div>
                      <Link 
                        to={`/accommodations/${property.id}`} 
                        className="btn btn-outline" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Popular Offers Section */}
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
              src="https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80" 
              alt="Marrakech Patio Pool" 
              style={{ width: '100%', height: '400px', objectFit: 'cover', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }} 
            />
          </div>
        </div>
      </section>

      {/* Services / Why Choose Us */}
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
