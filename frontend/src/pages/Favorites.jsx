import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MapPin, Star, Heart } from 'lucide-react';

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
    try {
      const token = localStorage.getItem('lunsole_token');
      const response = await fetch('http://localhost:5000/api/favorites', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load favorites');
      }
      const data = await response.json();
      setFavorites(data);
    } catch (err) {
      console.error(err);
      setError('Could not retrieve favorites.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user]);

  const handleRemoveFavorite = async (accommodationId, e) => {
    e.preventDefault(); // Prevent navigating if wrapped in a link or button
    e.stopPropagation();

    try {
      const token = localStorage.getItem('lunsole_token');
      const response = await fetch(`http://localhost:5000/api/favorites/${accommodationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove favorite');
      }

      // Update local state
      setFavorites(favorites.filter(fav => fav.id !== accommodationId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || (user && loading && favorites.length === 0)) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
        <p>Curating your luxury collection...</p>
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
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '20px' }}>No properties in your favorites catalog yet.</p>
          <Link to="/search" className="btn btn-primary">Browse Properties</Link>
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
                  style={{ 
                    position: 'absolute', 
                    top: '16px', 
                    left: '16px', 
                    background: 'rgba(18,19,26,0.6)', 
                    border: 'none', 
                    borderRadius: '50%', 
                    width: '36px', 
                    height: '36px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    color: '#ff4444', 
                    cursor: 'pointer',
                    transition: 'var(--transition)'
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
                    <span>${Math.round(property.min_price)}</span> / night
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
