import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, SlidersHorizontal, Map as MapIcon, Compass, X } from 'lucide-react';
import { Map } from '../components/Map';
import { AccommodationCard } from '../components/AccommodationCard';

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

  // Layout states
  const [showMap, setShowMap] = useState(true);
  const [sortBy, setSortBy] = useState('featured'); // 'priceAsc', 'priceDesc', 'starsDesc', 'featured'
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Suggestions states
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFromSuggestions, setSelectedFromSuggestions] = useState(false);

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

  const handleCityInput = async (e) => {
    const value = e.target.value;
    setFilters({ ...filters, city: value, lat: '', lng: '' });
    setSelectedFromSuggestions(false);
    
    if (value.length > 2) {
      setShowSuggestions(true);
      setSuggestionsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/locations/search?q=${encodeURIComponent(value)}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setSuggestionsLoading(false);
      }
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (suggestion) => {
    setFilters({ 
      ...filters, 
      city: suggestion.formattedAddress || suggestion.city, 
      lat: suggestion.latitude.toString(), 
      lng: suggestion.longitude.toString() 
    });
    setSelectedFromSuggestions(true);
    setShowSuggestions(false);
  };

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setIsMobileFiltersOpen(false);
    const queryParams = new URLSearchParams();
    if (filters.city) queryParams.append('city', filters.city);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.guests) queryParams.append('guests', filters.guests);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
    if (filters.checkIn) queryParams.append('checkIn', filters.checkIn);
    if (filters.checkOut) queryParams.append('checkOut', filters.checkOut);
    if (filters.lat) queryParams.append('lat', filters.lat);
    if (filters.lng) queryParams.append('lng', filters.lng);
    navigate(`/search?${queryParams.toString()}`);
  };

  const handleClearFilters = () => {
    const cleared = {
      city: '',
      type: 'all',
      checkIn: '',
      checkOut: '',
      guests: '1',
      minPrice: '',
      maxPrice: '',
      lat: '',
      lng: ''
    };
    setFilters(cleared);
    setSortBy('featured');
    setIsMobileFiltersOpen(false);
    navigate('/search');
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
        navigate(`/search?city=Near Me&lat=${latitude}&lng=${longitude}&type=${filters.type}`);
      },
      (error) => {
        setGeoLoading(false);
        if (error.code === error.PERMISSION_DENIED) {
          setGeoError('Location permission denied. Please allow location access.');
        } else {
          setGeoError('Could not retrieve your location.');
        }
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
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

      if (!response.ok) {
        throw new Error('Failed to toggle favorite');
      }

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

  // Client-side sorting logic
  const getSortedAccommodations = () => {
    let sorted = [...accommodations];
    if (sortBy === 'priceAsc') {
      sorted.sort((a, b) => {
        const pa = parseFloat(a.min_price || a.price || 120);
        const pb = parseFloat(b.min_price || b.price || 120);
        return pa - pb;
      });
    } else if (sortBy === 'priceDesc') {
      sorted.sort((a, b) => {
        const pa = parseFloat(a.min_price || a.price || 120);
        const pb = parseFloat(b.min_price || b.price || 120);
        return pb - pa;
      });
    } else if (sortBy === 'starsDesc') {
      sorted.sort((a, b) => (b.stars || 5) - (a.stars || 5));
    }
    return sorted;
  };

  const sortedList = getSortedAccommodations();

  // Shared Filters Form JSX
  const renderFiltersForm = () => (
    <form onSubmit={handleApplyFilters} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div className="form-group" style={{ marginBottom: 0 }}>
        <label htmlFor="city">Destination</label>
        <div style={{ position: 'relative' }}>
          <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            id="city" 
            name="city" 
            placeholder="Rabat, Marrakech..." 
            className="form-control" 
            style={{ paddingLeft: '34px' }}
            value={filters.city}
            onChange={handleCityInput}
            onFocus={() => { if(suggestions.length > 0) setShowSuggestions(true); }}
            autoComplete="off"
          />
          {showSuggestions && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              marginTop: '4px',
              boxShadow: 'var(--shadow-md)',
              zIndex: 100,
              maxHeight: '200px',
              overflowY: 'auto'
            }}>
              {suggestionsLoading ? (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading...</div>
              ) : suggestions.length > 0 ? (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {suggestions.map((s, idx) => (
                    <li 
                      key={idx}
                      onClick={() => handleSuggestionSelect(s)}
                      style={{
                        padding: '10px 12px',
                        cursor: 'pointer',
                        borderBottom: idx < suggestions.length - 1 ? '1px solid var(--border-color)' : 'none',
                        fontSize: '0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <MapPin size={12} style={{ flexShrink: 0, color: 'var(--text-muted)' }} />
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.formattedAddress}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div style={{ padding: '12px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>No locations found</div>
              )}
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
        <label htmlFor="checkIn">Check-In Date</label>
        <input 
          type="date" 
          id="checkIn" 
          name="checkIn" 
          className="form-control"
          value={filters.checkIn}
          onChange={handleFilterChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label htmlFor="checkOut">Check-Out Date</label>
        <input 
          type="date" 
          id="checkOut" 
          name="checkOut" 
          className="form-control"
          value={filters.checkOut}
          onChange={handleFilterChange}
        />
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label htmlFor="guests">Min Capacity (Guests)</label>
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label htmlFor="minPrice">Min Price ($)</label>
          <input 
            type="number" 
            id="minPrice" 
            name="minPrice" 
            placeholder="Min"
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
            placeholder="Max"
            className="form-control" 
            value={filters.maxPrice}
            onChange={handleFilterChange}
          />
        </div>
      </div>

      <div className="form-group" style={{ marginBottom: 0 }}>
        <label htmlFor="sortBy">Sort By</label>
        <select 
          id="sortBy" 
          className="form-control"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <option value="featured">Featured Stays</option>
          <option value="priceAsc">Price: Low to High</option>
          <option value="priceDesc">Price: High to Low</option>
          <option value="starsDesc">Guest Rating</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button 
          type="button" 
          onClick={handleFindNearMe} 
          className="btn btn-outline" 
          disabled={geoLoading}
          style={{ padding: '0 12px', flexGrow: 1, gap: '6px', fontSize: '0.8rem', height: '42px' }}
        >
          <Compass size={14} className={geoLoading ? 'spin-anim' : ''} />
          {geoLoading ? 'Locating...' : 'Near Me'}
        </button>

        <button 
          type="button" 
          onClick={handleClearFilters}
          className="btn btn-outline" 
          style={{ padding: '0 12px', flexGrow: 1, fontSize: '0.8rem', height: '42px' }}
        >
          Clear All
        </button>
      </div>

      <button 
        type="submit" 
        className="btn btn-primary" 
        style={{ width: '100%', height: '46px', gap: '6px', fontSize: '0.85rem', marginTop: '6px' }}
      >
        Apply Filters
      </button>

      {geoError && (
        <div style={{ color: 'var(--error)', fontSize: '0.78rem', marginTop: '4px', textAlign: 'left' }}>
          {geoError}
        </div>
      )}
    </form>
  );

  return (
    <div className="container" style={{ paddingTop: '40px', marginBottom: '80px', maxWidth: '1400px' }}>
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <p className="section-subtitle">Moroccan Escapes</p>
        <h2>Find Your Perfect Sanctuary</h2>
      </div>

      {/* Main Grid: Sidebar + Main Content Area */}
      <div className="search-page-grid">
        
        {/* Left Side: Desktop Filters Panel */}
        <aside className="search-filters-sidebar">
          <div style={{
            backgroundColor: 'var(--bg-card)', 
            border: '1px solid var(--border-color)', 
            borderRadius: '16px', 
            padding: '28px', 
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: '110px'
          }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <SlidersHorizontal size={18} style={{ color: 'var(--accent)' }} /> Search Filters
            </h3>
            {renderFiltersForm()}
          </div>
        </aside>

        {/* Right Side: Results + Map view */}
        <div style={{ flex: 1, minWidth: 0 }}>
          
          {/* Action Bar (Total Found + Map Toggle + Sort Dropdown + Mobile Filters Button) */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '28px',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.95rem' }}>
              Found <strong style={{ color: 'var(--primary)' }}>{sortedList.length}</strong> sanctuaries
            </p>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              {/* Mobile Filter Toggle */}
              <button 
                onClick={() => setIsMobileFiltersOpen(true)} 
                className="btn btn-outline mobile-filter-btn"
                style={{ gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                <SlidersHorizontal size={15} /> Filters
              </button>

              <button 
                onClick={() => setShowMap(!showMap)} 
                className="btn btn-outline"
                style={{ gap: '8px', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                <MapIcon size={15} />
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>

          {/* Results list & Map split */}
          <div style={{ display: 'flex', gap: '28px', flexWrap: 'wrap-reverse', alignItems: 'flex-start' }}>
            
            {/* List columns */}
            <div style={{ flex: '1 1 450px', minWidth: '290px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '80px 0' }}>
                  <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
                  <p>Curating your options...</p>
                </div>
              ) : error ? (
                <div className="alert alert-error">{error}</div>
              ) : sortedList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
                  <p style={{ fontSize: '1.05rem', color: 'var(--text-muted)' }}>No stays match your filters. Try clearing all filters.</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: showMap ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
                  {sortedList.map((property) => (
                    <AccommodationCard
                      key={property.id}
                      property={property}
                      showMap={showMap}
                      isFavorited={favoritesSet.has(property.id)}
                      onFavoriteToggle={handleFavoriteToggle}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Map pane */}
            {showMap && !loading && (
              <div style={{ flex: '1 1 380px', height: 'calc(100vh - 240px)', minHeight: '400px', position: 'sticky', top: '110px' }} className="search-map-wrapper">
                <Map accommodations={sortedList} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Drawer Overlay */}
      {isMobileFiltersOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(18, 19, 26, 0.7)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'flex-end',
          animation: 'fadeIn 0.25s ease'
        }} onClick={() => setIsMobileFiltersOpen(false)}>
          <div style={{
            width: '85%',
            maxWidth: '360px',
            height: '100%',
            backgroundColor: '#fff',
            padding: '30px 24px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            boxShadow: 'var(--shadow-lg)'
          }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem' }}>Filters</h3>
              <button 
                onClick={() => setIsMobileFiltersOpen(false)} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>
            {renderFiltersForm()}
          </div>
        </div>
      )}

      {/* Custom styles */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin-anim {
          animation: spin 1.5s linear infinite;
        }
        
        .search-page-grid {
          display: flex;
          gap: 32px;
        }

        .search-filters-sidebar {
          width: 320px;
          flex-shrink: 0;
        }

        .mobile-filter-btn {
          display: none;
        }

        @media (max-width: 1024px) {
          .search-filters-sidebar {
            display: none;
          }
          .mobile-filter-btn {
            display: inline-flex;
          }
        }
        
        @media (max-width: 768px) {
          .search-map-wrapper {
            position: relative !important;
            top: 0 !important;
            height: 350px !important;
            min-height: 350px !important;
            width: 100% !important;
            flex: 1 1 100% !important;
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
