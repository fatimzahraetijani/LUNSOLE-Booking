import React, { useState, useEffect, useCallback } from 'react';
import { Tag, Hotel, Building2, Home, TreePine, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { adminFetch } from '../utils/adminApi';
import '../components/admin/admin.css';

const CATEGORY_META = {
  hotel:      { icon: Hotel,     label: 'Hotel',      color: '#c5a880', bg: 'rgba(197,168,128,0.12)', border: 'rgba(197,168,128,0.3)' },
  apartment:  { icon: Building2, label: 'Apartment',  color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  border: 'rgba(59,130,246,0.25)' },
  villa:      { icon: Home,      label: 'Villa',      color: '#10b981', bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.25)' },
  guesthouse: { icon: TreePine,  label: 'Guesthouse', color: '#8b5cf6', bg: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
};

export const AdminCategories = () => {
  const [accommodations, setAccommodations] = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/accommodations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load accommodations');
      setAccommodations(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Group by type
  const grouped = accommodations.reduce((acc, a) => {
    const key = a.type || 'hotel';
    if (!acc[key]) acc[key] = [];
    acc[key].push(a);
    return acc;
  }, {});

  const types = Object.keys(CATEGORY_META);

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <h1>Accommodation Categories</h1>
          <p>Structural categorization of LUNSOLE luxury portfolios across hotels, apartments, villas, and guesthouses.</p>
        </div>
        <button className="admin-btn admin-btn-outline" onClick={fetchData}>
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Info note */}
      <div className="category-info-card">
        <Sparkles size={18} style={{ color: '#c5a880', flexShrink: 0, marginTop: 2 }} />
        <div>
          <p className="info-title">
            Property Classification System
          </p>
          <p className="info-desc">
            All listed properties are categorized dynamically into <strong>Hotel</strong>, <strong>Apartment</strong>, <strong>Villa</strong>, or <strong>Guesthouse</strong> classifications.
            Use the Hotels or Apartments management panels to update individual accommodation categories.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /></div>
      ) : (
        <>
          {/* Category Cards */}
          <div className="category-cards-grid">
            {types.map(type => {
              const meta = CATEGORY_META[type];
              const Icon = meta.icon;
              const count = (grouped[type] || []).length;
              return (
                <div key={type} className="category-card" style={{ borderColor: meta.border }}>
                  <div className="category-card-icon" style={{ background: meta.bg }}>
                    <Icon size={24} style={{ color: meta.color }} />
                  </div>
                  <div className="category-card-count">{count}</div>
                  <div className="category-card-label">{meta.label} Listings</div>
                  <div className="category-card-sub">
                    {count === 0 ? 'No active listings' : `${count} verified property record${count > 1 ? 's' : ''}`}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Breakdown per type */}
          {types.map(type => {
            const list = grouped[type] || [];
            if (list.length === 0) return null;
            const meta = CATEGORY_META[type];
            const Icon = meta.icon;
            return (
              <div key={type} className="admin-card" style={{ marginBottom: 24 }}>
                <div className="admin-card-header">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={16} style={{ color: meta.color }} />
                    </div>
                    <span className="admin-card-title">{meta.label} Collection ({list.length})</span>
                  </div>
                </div>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>#ID</th>
                        <th>Property Name</th>
                        <th>City</th>
                        <th>Country</th>
                        <th>Stars</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map(item => (
                        <tr key={item.id}>
                          <td className="col-id">#{item.id}</td>
                          <td className="col-name">{item.name}</td>
                          <td className="col-muted">{item.city}</td>
                          <td className="col-muted">{item.country}</td>
                          <td className="col-muted">{item.stars || 0} ★</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
};
