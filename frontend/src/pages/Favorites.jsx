import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Heart, Compass, AlertCircle } from 'lucide-react';

export const Favorites = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/login');
    }
  }, [user, authLoading, navigate]);

  const fetchFavorites = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('lunsole_token');
      if (!token) {
        setLoading(false);
        navigate('/login');
        return;
      }

      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('lunsole_token');
        localStorage.removeItem('lunsole_user');
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Unable to retrieve your favorite accommodations at this time.');
      }

      const data = await response.json();
      setFavorites(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error('Fetch favorites error:', err);
      setError(err.message || 'Could not retrieve favorites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (accommodationId, e) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      const token = localStorage.getItem('lunsole_token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/favorites/${accommodationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Update local state
      setFavorites(prev => prev.filter(fav => fav.id !== accommodationId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || (user && loading)) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p style={{ color: 'var(--text-muted)' }}>Curating your luxury collection...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <p className="section-subtitle">Your Collection</p>
        <h2>Favorited Sanctuaries</h2>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!error && favorites.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '70px 24px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          maxWidth: '560px',
          margin: '0 auto'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(197, 168, 128, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: 'var(--accent)'
          }}>
            <Heart size={30} fill="none" color="var(--accent)" />
          </div>
          <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '10px', color: 'var(--primary)' }}>
            No favorites yet
          </h3>
          <p style={{ fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '28px', lineHeight: '1.6' }}>
            Explore our curated luxury accommodations across Morocco and click the heart icon to save your favorite stays.
          </p>
          <Link to="/search" className="btn btn-primary" style={{ padding: '12px 28px', gap: '8px', display: 'inline-flex', alignItems: 'center' }}>
            <Compass size={18} /> Explore Stays
          </Link>
        </div>
      ) : (
        <div className="accommodations-grid">
          {favorites.map((property) => (
            <div key={property.id} className="accommodation-card">
              <div className="card-img-wrapper">
                <img src={property.image_url} alt={property.name} className="card-img" />
                <span className="card-badge">{property.type}</span>
                <button 
                  onClick={(e) => handleRemoveFavorite(property.id, e)}
                  title="Remove from favorites"
                  style={{ 
                    position: 'absolute', 
                    top: '16px', 
                    left: '16px', 
                    background: 'rgba(18,19,26,0.65)', 
                    backdropFilter: 'blur(4px)',
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '36px', 
                    height: '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ff4444', 
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1.0)'}
                >
                  <Heart size={18} fill="#ff4444" />
                </button>
              </div>
              <div className="card-content">
                <div className="card-location">
                  <MapPin size={14} />
                  <span>{property.city}, {property.country}</span>
                </div>
                <h3 className="card-title">{property.name}</h3>
                <div className="card-rating">
                  {[...Array(property.stars || 5)].map((_, i) => (
                    <Star key={i} className="star-icon" />
                  ))}
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    ({property.stars || 5}.0 Stars)
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
                    View Suites
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
