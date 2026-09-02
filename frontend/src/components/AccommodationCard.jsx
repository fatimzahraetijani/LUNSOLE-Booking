import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPin, Star, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AccommodationCard = ({ property, showMap = false, isFavorited = false, onFavoriteToggle = () => {} }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handleFavToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      navigate('/login');
      return;
    }
    
    onFavoriteToggle(property.id);
  };
  
  return (
    <div className="accommodation-card" style={{ flexDirection: showMap ? 'row' : 'column' }}>
      <div className="card-img-wrapper" style={showMap ? { width: '200px', height: '100%', minHeight: '200px', flexShrink: 0 } : {}}>
        <img
          src={property.image_url}
          alt={property.name}
          className="card-img"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=600&q=80';
          }}
        />
        <span className="card-badge" style={showMap ? { right: 'auto', left: '12px', top: '12px' } : {}}>
          {property.type}
          {property.source === 'external' && ' • External'}
        </span>
        
        <button 
          onClick={handleFavToggle}
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
      <div className="card-content" style={showMap ? { padding: '20px' } : {}}>
        <div className="card-location" style={showMap ? { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } : {}}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <MapPin size={14} />
            <span>{property.city}, {property.country}</span>
          </div>
          {showMap && property.distance !== undefined && (
            <span style={{ fontSize: '0.8rem', backgroundColor: 'var(--accent-light)', padding: '2px 8px', borderRadius: '4px', color: 'var(--accent)', fontWeight: 'bold' }}>
              {parseFloat(property.distance).toFixed(1)} km away
            </span>
          )}
        </div>
        <h3 className="card-title" style={showMap ? { fontSize: '1.25rem', marginBottom: '8px' } : {}}>{property.name}</h3>
        <div className="card-rating" style={showMap ? { marginBottom: '12px' } : {}}>
          {property.stars ? (
            <>
              {[...Array(property.stars)].map((_, i) => (
                <Star key={i} className="star-icon" style={showMap ? { width: '14px', height: '14px' } : {}} />
              ))}
              {!showMap && (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                  ({property.stars}.0 Stars)
                </span>
              )}
            </>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Rating unavailable</span>
          )}
        </div>
        <p className="card-description" style={showMap ? { fontSize: '0.85rem', marginBottom: '16px' } : {}}>{property.description}</p>
        <div className="card-footer" style={showMap ? { borderTop: '1px solid var(--border-color)', paddingTop: '12px' } : {}}>
          <div className="card-price" style={showMap ? { fontSize: '0.9rem' } : {}}>
          {property.min_price || property.price ? (
            <><span>${Math.round(property.min_price || property.price)}</span> / night</>
          ) : (
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Price unavailable</span>
          )}
          </div>
          <Link 
            to={`/accommodations/${property.id}`} 
            className="btn btn-outline" 
            style={showMap ? { padding: '6px 12px', fontSize: '0.8rem' } : { padding: '8px 16px', fontSize: '0.85rem' }}
          >
            {showMap ? 'View Suites' : 'View Details'}
          </Link>
        </div>
      </div>
    </div>
  );
};
