import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search as SearchIcon, MapPin, Star, SlidersHorizontal, Map as MapIcon, Heart, Compass } from 'lucide-react';
import { Map } from '../components/Map';

export const Search = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Parse initial query params
  const getQueryParams = () => {
    const params = new URLSearchParams(location.search);
    return {
      city: params.get('city') || '',
      type: params.get('type') || 'all',
      checkIn: params.get('checkIn') || '',
      checkOut: params.get('checkOut') || '',
      guests: params.get('guests') || '1',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      lat: params.get('lat') || '',
      lng: params.get('lng') || ''
    };
  };

  const [filters, setFilters] = useState(getQueryParams());
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Geolocation states
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState('');

  // Favorites states
  const [favoritesSet, setFavoritesSet] = useState(new Set());

  // Map view toggle
  const [showMap, setShowMap] = useState(true);

  // Fetch favorites on mount if logged in
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
        const ids = new Set(data.map(fav => fav.id));
        setFavoritesSet(ids);
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
    }
  };

  const fetchAccommodations = async (searchFilters) => {
    setLoading(true);
    setError('');
    try {
      const queryParams = new URLSearchParams();
      if (searchFilters.city) queryParams.append('city', searchFilters.city);
      if (searchFilters.type && searchFilters.type !== 'all') queryParams.append('type', searchFilters.type);
      if (searchFilters.guests) queryParams.append('guests', searchFilters.guests);
      if (searchFilters.minPrice) queryParams.append('minPrice', searchFilters.minPrice);
      if (searchFilters.maxPrice) queryParams.append('maxPrice', searchFilters.maxPrice);
      if (searchFilters.lat) queryParams.append('lat', searchFilters.lat);
      if (searchFilters.lng) queryParams.append('lng', searchFilters.lng);

      const response = await fetch(`http://localhost:5000/api/accommodations?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch accommodations');
      }
      const data = await response.json();
      setAccommodations(data);
    } catch (err) {
      console.error(err);
      setError('Could not load accommodations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initFilters = getQueryParams();
    setFilters(initFilters);
    fetchAccommodations(initFilters);
    fetchFavorites();
  }, [location.search, user]);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Navigate with new search query parameters
    const queryParams = new URLSearchParams();
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.guests) queryParams.append('guests', filters.guests);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.lat) queryParams.append('lat', filters.lat);
    if (filters.lng) queryParams.append('lng', filters.lng);
    navigate(`/search?${queryParams.toString()}`);
  };

  const handleFindNearMe = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by your browser.');
      return;
    }

    setGeoLoading(true);
    setGeoError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setGeoLoading(false);
        const newFilters = {
          ...filters,
          lat: latitude.toString(),
          lng: longitude.toString(),
          city: 'Near Me'
        };
        setFilters(newFilters);
        // Trigger navigation
        navigate(`/search?city=Near Me&lat=${latitude}&lng=${longitude}&type=${filters.type}`);
      },
      (error) => {
        setGeoLoading(false);
        console.error(error);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please allow location access.');
        } else {
          setGeoError('Could not retrieve your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

      // Update local state Set
      const nextFavs = new Set(favoritesSet);
      if (isFav) {
        nextFavs.delete(accommodationId);
      } else {
        nextFavs.add(accommodationId);
      }
      setFavoritesSet(nextFavs);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '40px', marginBottom: '80px', maxWidth: '1400px' }}>
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <p className="section-subtitle">Bespoke Options</p>
        <h2>Find Your Perfect Sanctuary</h2>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', marginBottom: '32px', boxShadow: 'var(--shadow-sm)' }}>
        <form onSubmit={handleSearchSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', alignItems: 'flex-end' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="city">Destination</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  id="city" 
                  name="city" 
                  placeholder="e.g. Kyoto, Paris" 
                  className="form-control" 
                  style={{ paddingLeft: '34px' }}
                  value={filters.city}
                  onChange={handleFilterChange}
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="type">Property Type</label>
              <select 
                id="type" 
                name="type" 
                className="form-control"
                value={filters.type}
                onChange={handleFilterChange}
              >
                <option value="all">All Properties</option>
                <option value="hotel">Hotel</option>
                <option value="apartment">Apartment</option>
                <option value="villa">Villa</option>
                <option value="guesthouse">Guesthouse</option>
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="guests">Min Capacity</label>
              <input 
                type="number" 
                id="guests" 
                name="guests" 
                min="1"
                className="form-control" 
                value={filters.guests}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="minPrice">Min Price ($)</label>
              <input 
                type="number" 
                id="minPrice" 
                name="minPrice" 
                placeholder="Any"
                className="form-control" 
                value={filters.minPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label htmlFor="maxPrice">Max Price ($)</label>
              <input 
                type="number" 
                id="maxPrice" 
                name="maxPrice" 
                placeholder="Any"
                className="form-control" 
                value={filters.maxPrice}
                onChange={handleFilterChange}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button 
                type="button" 
                onClick={handleFindNearMe} 
                className="btn btn-outline" 
                disabled={geoLoading}
                style={{ height: '48px', padding: '0 16px', flexGrow: 1, gap: '6px', fontSize: '0.85rem' }}
              >
                <Compass size={16} className={geoLoading ? 'spin-anim' : ''} />
                {geoLoading ? 'Locating...' : 'Near Me'}
              </button>

              <button type="submit" className="btn btn-primary" style={{ height: '48px', padding: '0 16px', flexGrow: 1, gap: '6px', fontSize: '0.85rem' }}>
                <SlidersHorizontal size={16} /> Filters
              </button>
            </div>
          </div>
        </form>
        {geoError && (
          <div style={{ color: 'var(--error)', fontSize: '0.8rem', marginTop: '12px', textAlign: 'left' }}>
            {geoError}
          </div>
        )}
      </div>

      {/* Map Toggle & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <p style={{ color: 'var(--text-muted)' }}>Found {accommodations.length} sanctuaries</p>
        <button 
          onClick={() => setShowMap(!showMap)} 
          className="btn btn-outline"
          style={{ gap: '8px', padding: '8px 16px', fontSize: '0.85rem' }}
        >
          <MapIcon size={16} />
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>

      {/* Results grid & Map container */}
      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap-reverse', alignItems: 'flex-start' }}>
        
        {/* Accommodations list */}
        <div style={{ flex: '1 1 500px', minWidth: '350px' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
              <p>Curating your options...</p>
            </div>
          ) : error ? (
            <div className="alert alert-error">{error}</div>
          ) : accommodations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)' }}>No sanctuaries found.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: showMap ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {accommodations.map((property) => {
                const isFavorited = favoritesSet.has(property.id);
                return (
                  <div key={property.id} className="accommodation-card" style={{ flexDirection: showMap ? 'row' : 'column' }}>
                    <div className="card-img-wrapper" style={{ width: showMap ? '200px' : '100%', height: showMap ? '100%' : '200px', minHeight: '200px', flexShrink: 0 }}>
                      <img src={property.image_url} alt={property.name} className="card-img" />
                      <span className="card-badge" style={{ right: 'auto', left: '12px', top: '12px' }}>{property.type}</span>
                      
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

                    <div className="card-content" style={{ padding: '20px' }}>
                      <div className="card-location" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={14} />
                          <span>{property.city}, {property.country}</span>
                        </div>
                        {property.distance !== undefined && (
                          <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--accent-light)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent)', fontWeight: 'bold' }}>
                            {parseFloat(property.distance).toFixed(1)} km away
                          </span>
                        )}
                      </div>
                      <h3 className="card-title" style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{property.name}</h3>
                      
                      <div className="card-rating" style={{ marginBottom: '12px' }}>
                        {[...Array(property.stars)].map((_, i) => (
                          <Star key={i} className="star-icon" style={{ width: '14px', height: '14px' }} />
                        ))}
                      </div>

                      <p className="card-description" style={{ fontSize: '0.85rem', marginBottom: '16px' }}>{property.description}</p>
                      
                      <div className="card-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                        <div className="card-price" style={{ fontSize: '0.9rem' }}>
                          <span>${Math.round(property.min_price || property.price || 0)}</span> / night
                        </div>
                        <Link 
                          to={`/accommodations/${property.id}`} 
                          className="btn btn-outline" 
                          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                        >
                          View Suites
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leaflet map */}
        {showMap && (
          <div style={{ flex: '1 1 400px', height: 'calc(100vh - 250px)', minHeight: '400px', position: 'sticky', top: '110px' }}>
            <Map accommodations={accommodations} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1.5s linear infinite;
        }
      `}</style>
    </div>
  );
};
