import React, { useState, useEffect, useCallback } from 'react';
import { Hotel, Plus, Edit2, Trash2, Search, RefreshCw, AlertCircle, Image as ImgIcon, Star } from 'lucide-react';
import { AdminModal } from '../components/admin/AdminModal';
import { ConfirmModal } from '../components/admin/ConfirmModal';
import { adminFetch } from '../utils/adminApi';
import '../components/admin/admin.css';

const EMPTY_FORM = {
  name: '', description: '', type: 'hotel',
  country: 'Morocco', city: '', address: '',
  latitude: '', longitude: '', stars: 4, image_url: '',
};

export const AdminHotels = () => {
  const [hotels, setHotels]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');

  // Modal states
  const [showForm, setShowForm]         = useState(false);
  const [editItem, setEditItem]         = useState(null);
  const [formData, setFormData]         = useState(EMPTY_FORM);
  const [formLoading, setFormLoading]   = useState(false);
  const [formError, setFormError]       = useState('');

  // Confirm delete
  const [confirmId, setConfirmId]       = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchHotels = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/accommodations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load accommodations');
      setHotels(Array.isArray(data) ? data.filter(a => a.type === 'hotel') : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHotels(); }, [fetchHotels]);

  const openAdd = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      type: 'hotel',
      country: item.country || 'Morocco',
      city: item.city || '',
      address: item.address || '',
      latitude: item.latitude || '',
      longitude: item.longitude || '',
      stars: item.stars || 4,
      image_url: item.image_url || '',
    });
    setFormError('');
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');
    try {
      const payload = { ...formData, type: 'hotel' };
      const endpoint = editItem ? `/accommodations/${editItem.id}` : '/accommodations';
      const method = editItem ? 'PUT' : 'POST';
      const res = await adminFetch(endpoint, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');
      setShowForm(false);
      fetchHotels();
    } catch (e) {
      setFormError(e.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await adminFetch(`/accommodations/${confirmId}`, { method: 'DELETE' });
      setConfirmId(null);
      fetchHotels();
    } catch {
      // silent
    } finally {
      setDeleteLoading(false);
    }
  };

  const filtered = hotels.filter(h =>
    h.name?.toLowerCase().includes(search.toLowerCase()) ||
    h.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <h1>Hotel Properties</h1>
          <p>Manage your luxury hotel listings, rooms, location data, and star ratings.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="admin-btn admin-btn-outline" onClick={fetchHotels}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="admin-btn admin-btn-gold" onClick={openAdd}>
            <Plus size={16} /> Add New Hotel
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Table Card */}
      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">All Hotel Properties ({hotels.length})</span>
          <div className="admin-search">
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search by hotel name or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><Hotel size={26} /></div>
            <h3>{search ? 'No matching hotels found' : 'No hotel listings recorded'}</h3>
            <p>{search ? 'Try adjusting your search query' : 'Click "Add New Hotel" to create your first luxury hotel.'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Image</th>
                  <th>Hotel Name</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(h => (
                  <tr key={h.id}>
                    <td className="col-id">#{h.id}</td>
                    <td>
                      {h.image_url ? (
                        <img src={h.image_url} alt={h.name} className="admin-img-preview" onError={e => e.target.style.display='none'} />
                      ) : (
                        <div className="admin-img-placeholder"><ImgIcon size={16} /></div>
                      )}
                    </td>
                    <td>
                      <div className="col-name">{h.name}</div>
                      <div className="col-muted" style={{ fontSize: '0.78rem' }}>{h.address}</div>
                    </td>
                    <td className="col-muted">{h.city}</td>
                    <td className="col-muted">{h.country}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 2 }}>
                        {Array.from({ length: h.stars || 0 }).map((_, i) => (
                          <Star key={i} size={13} style={{ color: '#c5a880', fill: '#c5a880' }} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button
                          className="admin-btn admin-btn-sm admin-btn-outline admin-btn-icon"
                          onClick={() => openEdit(h)}
                          title="Edit Hotel"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="admin-btn admin-btn-sm admin-btn-danger admin-btn-icon"
                          onClick={() => setConfirmId(h.id)}
                          title="Delete Hotel"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AdminModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title={editItem ? `Edit Hotel: ${editItem.name}` : 'Add New Hotel Property'}
        size="lg"
        footer={
          <>
            <button className="admin-btn admin-btn-outline" onClick={() => setShowForm(false)} disabled={formLoading}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-gold" onClick={handleFormSubmit} disabled={formLoading}>
              {formLoading ? 'Saving...' : editItem ? 'Save Changes' : 'Add Hotel'}
            </button>
          </>
        }
      >
        {formError && (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: 16 }}>
            <AlertCircle size={15} />{formError}
          </div>
        )}
        <form onSubmit={handleFormSubmit}>
          <div className="admin-form-grid">
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Hotel Name <span className="required">*</span></label>
              <input className="admin-form-input" name="name" value={formData.name} onChange={handleFormChange} required placeholder="e.g. Royal Mansour Marrakech" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">City <span className="required">*</span></label>
              <input className="admin-form-input" name="city" value={formData.city} onChange={handleFormChange} required placeholder="e.g. Marrakech" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Country <span className="required">*</span></label>
              <input className="admin-form-input" name="country" value={formData.country} onChange={handleFormChange} required placeholder="e.g. Morocco" />
            </div>
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Address <span className="required">*</span></label>
              <input className="admin-form-input" name="address" value={formData.address} onChange={handleFormChange} required placeholder="Full street address" />
            </div>
            <div className="admin-form-group full-width">
              <label className="admin-form-label">Description <span className="required">*</span></label>
              <textarea className="admin-form-textarea" name="description" value={formData.description} onChange={handleFormChange} required placeholder="Detailed hotel description..." rows={3} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Stars Rating (0–5)</label>
              <select className="admin-form-select" name="stars" value={formData.stars} onChange={handleFormChange}>
                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Image URL</label>
              <input className="admin-form-input" name="image_url" value={formData.image_url} onChange={handleFormChange} placeholder="https://..." />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Latitude</label>
              <input className="admin-form-input" name="latitude" type="number" step="any" value={formData.latitude} onChange={handleFormChange} placeholder="0.000000" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Longitude</label>
              <input className="admin-form-input" name="longitude" type="number" step="any" value={formData.longitude} onChange={handleFormChange} placeholder="0.000000" />
            </div>
          </div>
        </form>
      </AdminModal>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Hotel Listing"
        message="Are you sure you want to delete this hotel? All associated rooms and reservations will also be permanently removed. This action cannot be undone."
        confirmLabel="Delete Hotel"
        loading={deleteLoading}
      />
    </div>
  );
};
