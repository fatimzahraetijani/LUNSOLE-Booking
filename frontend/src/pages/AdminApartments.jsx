import React, { useState, useEffect, useCallback } from 'react';
import { Building2, Plus, Edit2, Trash2, Search, RefreshCw, AlertCircle, Image as ImgIcon } from 'lucide-react';
import { AdminModal } from '../components/admin/AdminModal';
import { ConfirmModal } from '../components/admin/ConfirmModal';
import { adminFetch } from '../utils/adminApi';
import '../components/admin/admin.css';

const EMPTY_FORM = {
  name: '', description: '', type: 'apartment',
  country: 'Morocco', city: '', address: '',
  latitude: '', longitude: '', stars: 0, image_url: '',
};

export const AdminApartments = () => {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [search, setSearch]         = useState('');

  const [showForm, setShowForm]       = useState(false);
  const [editItem, setEditItem]       = useState(null);
  const [formData, setFormData]       = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]     = useState('');

  const [confirmId, setConfirmId]       = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchApartments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/accommodations');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load');
      setApartments(Array.isArray(data) ? data.filter(a => a.type === 'apartment') : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApartments(); }, [fetchApartments]);

  const openAdd = () => {
    setEditItem(null);
    setFormData(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditItem(item);
    setFormData({
      name: item.name || '', description: item.description || '',
      type: 'apartment', country: item.country || 'Morocco',
      city: item.city || '', address: item.address || '',
      latitude: item.latitude || '', longitude: item.longitude || '',
      stars: item.stars || 0, image_url: item.image_url || '',
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
      const payload = { ...formData, type: 'apartment' };
      const endpoint = editItem ? `/accommodations/${editItem.id}` : '/accommodations';
      const method = editItem ? 'PUT' : 'POST';
      const res = await adminFetch(endpoint, { method, body: JSON.stringify(payload) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Operation failed');
      setShowForm(false);
      fetchApartments();
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
      fetchApartments();
    } catch { /* silent */ }
    finally { setDeleteLoading(false); }
  };

  const filtered = apartments.filter(a =>
    a.name?.toLowerCase().includes(search.toLowerCase()) ||
    a.city?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <h1>Apartment Residences</h1>
          <p>Manage private luxury apartments, suites, and residential accommodation listings.</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="admin-btn admin-btn-outline" onClick={fetchApartments}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="admin-btn admin-btn-gold" onClick={openAdd}>
            <Plus size={16} /> Add Apartment
          </button>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={16} />{error}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">All Apartment Listings ({apartments.length})</span>
          <div className="admin-search">
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search by apartment name or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><Building2 size={26} /></div>
            <h3>{search ? 'No matching apartments found' : 'No apartment listings recorded'}</h3>
            <p>{search ? 'Try adjusting your search query' : 'Click "Add Apartment" to list your first residence.'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Preview</th>
                  <th>Apartment Name</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id}>
                    <td className="col-id">#{a.id}</td>
                    <td>
                      {a.image_url ? (
                        <img src={a.image_url} alt={a.name} className="admin-img-preview" onError={e => e.target.style.display='none'} />
                      ) : (
                        <div className="admin-img-placeholder"><ImgIcon size={16} /></div>
                      )}
                    </td>
                    <td>
                      <div className="col-name">{a.name}</div>
                    </td>
                    <td className="col-muted">{a.city}</td>
                    <td className="col-muted">{a.country}</td>
                    <td className="col-muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.address}</td>
                    <td>
                      <div className="table-actions">
                        <button className="admin-btn admin-btn-sm admin-btn-outline admin-btn-icon" onClick={() => openEdit(a)} title="Edit Apartment">
                          <Edit2 size={14} />
                        </button>
                        <button className="admin-btn admin-btn-sm admin-btn-danger admin-btn-icon" onClick={() => setConfirmId(a.id)} title="Delete Apartment">
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
        title={editItem ? `Edit Apartment: ${editItem.name}` : 'Add New Apartment Residence'}
        size="lg"
        footer={
          <>
            <button className="admin-btn admin-btn-outline" onClick={() => setShowForm(false)} disabled={formLoading}>
              Cancel
            </button>
            <button className="admin-btn admin-btn-gold" onClick={handleFormSubmit} disabled={formLoading}>
              {formLoading ? 'Saving...' : editItem ? 'Save Changes' : 'Add Apartment'}
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
              <label className="admin-form-label">Apartment Name <span className="required">*</span></label>
              <input className="admin-form-input" name="name" value={formData.name} onChange={handleFormChange} required placeholder="e.g. Luxury City Penthouse Apartment" />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">City <span className="required">*</span></label>
              <input className="admin-form-input" name="city" value={formData.city} onChange={handleFormChange} required placeholder="e.g. Casablanca" />
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
              <textarea className="admin-form-textarea" name="description" value={formData.description} onChange={handleFormChange} required placeholder="Apartment amenities & description..." rows={3} />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Image URL</label>
              <input className="admin-form-input" name="image_url" value={formData.image_url} onChange={handleFormChange} placeholder="https://..." />
            </div>
            <div className="admin-form-group">
              <label className="admin-form-label">Stars / Quality Level (0–5)</label>
              <select className="admin-form-select" name="stars" value={formData.stars} onChange={handleFormChange}>
                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n} Star{n !== 1 ? 's' : ''}</option>)}
              </select>
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

      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Apartment Residence"
        message="Are you sure you want to delete this apartment listing? All associated rooms and guest bookings will also be removed."
        confirmLabel="Delete Apartment"
        loading={deleteLoading}
      />
    </div>
  );
};
