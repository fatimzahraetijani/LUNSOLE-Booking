import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Users, Home, Calendar, DollarSign, Edit, Trash2, CheckCircle, XCircle, Plus, RefreshCw, BarChart2, Star, ListFilter } from 'lucide-react';

export const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Route security check
  useEffect(() => {
    if (!authLoading) {
      if (!user || user.role !== 'admin') {
        navigate('/');
      }
    }
  }, [user, authLoading, navigate]);

  // Tab state
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'users', 'accommodations', 'rooms', 'bookings', 'reviews'

  // Data states
  const [stats, setStats] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [accommodationsList, setAccommodationsList] = useState([]);
  const [roomsList, setRoomsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [reviewsList, setReviewsList] = useState([]);

  // Loadings & Errors
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Form states (Add/Edit Accommodation)
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'hotel',
    country: 'Morocco',
    city: '',
    address: '',
    latitude: 0,
    longitude: 0,
    stars: 5,
    image_url: ''
  });

  // Form states (Add/Edit Room)
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [editRoomId, setEditRoomId] = useState(null);
  const [roomFormData, setRoomFormData] = useState({
    accommodation_id: '',
    name: '',
    type: 'single',
    price_per_night: '',
    capacity: 1,
    description: '',
    amenities: '', // comma-separated
    image_url: ''
  });

  const getHeaders = () => {
    const token = localStorage.getItem('lunsole_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch statistics
      const statsRes = await fetch('http://localhost:5000/api/admin/stats', { headers: getHeaders() });
      if (!statsRes.ok) throw new Error('Failed to load stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      if (activeTab === 'users') {
        const usersRes = await fetch('http://localhost:5000/api/admin/users', { headers: getHeaders() });
        if (usersRes.ok) setUsersList(await usersRes.json());
      } else if (activeTab === 'accommodations') {
        const accRes = await fetch('http://localhost:5000/api/admin/accommodations', { headers: getHeaders() });
        if (accRes.ok) setAccommodationsList(await accRes.json());
      } else if (activeTab === 'rooms') {
        const roomsRes = await fetch('http://localhost:5000/api/admin/rooms', { headers: getHeaders() });
        if (roomsRes.ok) setRoomsList(await roomsRes.json());
        // Also fetch accommodations for the select dropdown
        const accRes = await fetch('http://localhost:5000/api/admin/accommodations', { headers: getHeaders() });
        if (accRes.ok) setAccommodationsList(await accRes.json());
      } else if (activeTab === 'bookings') {
        const bookRes = await fetch('http://localhost:5000/api/admin/bookings', { headers: getHeaders() });
        if (bookRes.ok) setBookingsList(await bookRes.json());
      } else if (activeTab === 'reviews') {
        const revRes = await fetch('http://localhost:5000/api/admin/reviews', { headers: getHeaders() });
        if (revRes.ok) setReviewsList(await revRes.json());
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error pulling data. Verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchData();
    }
  }, [activeTab, user]);

  // Operations: Users
  const handleDeleteUser = async (id) => {
    if (!window.confirm('Delete this user account? All their bookings will be cascade deleted.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Delete user failed');
      }
      setUsersList(usersList.filter(u => u.id !== id));
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Operations: Accommodations
  const handleDeleteAccommodation = async (id) => {
    if (!window.confirm('Delete this accommodation listing? All its rooms and reservations will be deleted.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/accommodations/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Delete accommodation failed');
      setAccommodationsList(accommodationsList.filter(a => a.id !== id));
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editId 
        ? `http://localhost:5000/api/admin/accommodations/${editId}`
        : 'http://localhost:5000/api/admin/accommodations';
      const method = editId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save accommodation data');

      setShowForm(false);
      setEditId(null);
      setFormData({
        name: '',
        description: '',
        type: 'hotel',
        country: 'Morocco',
        city: '',
        address: '',
        latitude: 0,
        longitude: 0,
        stars: 5,
        image_url: ''
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (acc) => {
    setEditId(acc.id);
    setFormData({
      name: acc.name,
      description: acc.description,
      type: acc.type,
      country: acc.country,
      city: acc.city,
      address: acc.address,
      latitude: acc.latitude,
      longitude: acc.longitude,
      stars: acc.stars,
      image_url: acc.image_url
    });
    setShowForm(true);
  };

  // Operations: Rooms
  const handleDeleteRoom = async (id) => {
    if (!window.confirm('Delete this room listing? All bookings on this room will be cascade deleted.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/rooms/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Delete room failed');
      setRoomsList(roomsList.filter(r => r.id !== id));
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRoomFormSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const url = editRoomId 
        ? `http://localhost:5000/api/admin/rooms/${editRoomId}`
        : 'http://localhost:5000/api/admin/rooms';
      const method = editRoomId ? 'PUT' : 'POST';

      const payload = {
        ...roomFormData,
        price_per_night: parseFloat(roomFormData.price_per_night) || 0,
        capacity: parseInt(roomFormData.capacity, 10) || 1,
        amenities: typeof roomFormData.amenities === 'string' 
          ? roomFormData.amenities.split(',').map(a => a.trim()).filter(a => a !== '')
          : roomFormData.amenities
      };

      const res = await fetch(url, {
        method,
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to save room details');

      setShowRoomForm(false);
      setEditRoomId(null);
      setRoomFormData({
        accommodation_id: '',
        name: '',
        type: 'single',
        price_per_night: '',
        capacity: 1,
        description: '',
        amenities: '',
        image_url: ''
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const startEditRoom = (room) => {
    setEditRoomId(room.id);
    setRoomFormData({
      accommodation_id: room.accommodation_id,
      name: room.name,
      type: room.type,
      price_per_night: room.price_per_night.toString(),
      capacity: room.capacity,
      description: room.description || '',
      amenities: Array.isArray(room.amenities) ? room.amenities.join(', ') : '',
      image_url: room.image_url || ''
    });
    setShowRoomForm(true);
  };

  // Operations: Bookings
  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/bookings/${bookingId}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('Update booking failed');
      setBookingsList(bookingsList.map(b => b.booking_id === bookingId ? { ...b, status: newStatus } : b));
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Operations: Reviews
  const handleDeleteReview = async (id) => {
    if (!window.confirm('Delete this user review? This action cannot be undone.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (!res.ok) throw new Error('Delete review failed');
      setReviewsList(reviewsList.filter(r => r.id !== id));
      fetchData();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || !user || user.role !== 'admin') return null;

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', maxWidth: '1400px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div>
          <p className="section-subtitle">System Portal</p>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem' }}>Administration Panel</h2>
        </div>
        <button onClick={fetchData} className="btn btn-outline" style={{ gap: '8px' }}>
          <RefreshCw size={16} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Admin Tab Navigation */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '32px', gap: '4px', flexWrap: 'wrap' }}>
        {[
          { id: 'stats', label: 'Stats Overview', icon: <BarChart2 size={16} /> },
          { id: 'users', label: 'Manage Users', icon: <Users size={16} /> },
          { id: 'accommodations', label: 'Accommodations', icon: <Home size={16} /> },
          { id: 'rooms', label: 'Rooms Inventory', icon: <ListFilter size={16} /> },
          { id: 'bookings', label: 'Guest Bookings', icon: <Calendar size={16} /> },
          { id: 'reviews', label: 'Reviews Moderation', icon: <Star size={16} /> }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => { 
              setActiveTab(tab.id); 
              setShowForm(false); 
              setShowRoomForm(false); 
              setEditId(null); 
              setEditRoomId(null); 
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--text-main)',
              border: 'none',
              borderTopLeftRadius: '8px',
              borderTopRightRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '0.85rem',
              transition: 'var(--transition)',
              borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : 'none'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div className="spinner" style={{ border: '4px solid rgba(0,0,0,0.1)', borderLeftColor: 'var(--accent)', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
          <p>Querying administrative reports...</p>
        </div>
      ) : (
        <div>
          {/* STATS TAB */}
          {activeTab === 'stats' && stats && (
            <div>
              {/* Stat Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '40px' }}>
                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(197, 168, 128, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Users</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalUsers}</h3>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(197, 168, 128, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Home size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Properties / Rooms</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalAccommodations} / {stats.totalRooms}</h3>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', padding: '24px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(197, 168, 128, 0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Calendar size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Bookings</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{stats.totalBookings}</h3>
                  </div>
                </div>

                <div style={{ backgroundColor: 'var(--primary)', borderRadius: '12px', padding: '24px', color: '#fff', display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Est. Revenue</span>
                    <h3 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: 'var(--accent)' }}>${stats.estimatedRevenue}</h3>
                  </div>
                </div>
              </div>

              {/* Breakdown details */}
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '32px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', marginBottom: '24px' }}>Reservations Status Distribution</h3>
                <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--success)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Confirmed Stay</span>
                    <h4 style={{ fontSize: '2rem', margin: '8px 0 0' }}>{stats.statusCounts.confirmed}</h4>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: '#ffb300', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Pending Payments</span>
                    <h4 style={{ fontSize: '2rem', margin: '8px 0 0' }}>{stats.statusCounts.pending}</h4>
                  </div>
                  <div style={{ flex: 1, minWidth: '200px', backgroundColor: 'var(--bg-main)', padding: '20px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <span style={{ color: 'var(--error)', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Cancelled Bookings</span>
                    <h4 style={{ fontSize: '2rem', margin: '8px 0 0' }}>{stats.statusCounts.cancelled}</h4>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', overflowX: 'auto', padding: '24px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Name</th>
                    <th style={{ padding: '12px' }}>Email</th>
                    <th style={{ padding: '12px' }}>Role</th>
                    <th style={{ padding: '12px' }}>Registered</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map((usr) => (
                    <tr key={usr.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{usr.first_name} {usr.last_name}</td>
                      <td style={{ padding: '16px 12px' }}>{usr.email}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          fontSize: '0.8rem', 
                          fontWeight: 'bold', 
                          backgroundColor: usr.role === 'admin' ? 'rgba(197, 168, 128, 0.15)' : 'rgba(0,0,0,0.05)',
                          color: usr.role === 'admin' ? 'var(--accent)' : 'var(--text-main)'
                        }}>
                          {usr.role}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px' }}>{new Date(usr.created_at).toLocaleDateString()}</td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteUser(usr.id)}
                          disabled={usr.id === user.id || actionLoading}
                          style={{ background: 'none', border: 'none', color: usr.id === user.id ? '#ccc' : 'var(--error)', cursor: usr.id === user.id ? 'default' : 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ACCOMMODATIONS TAB */}
          {activeTab === 'accommodations' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Property Directory</h3>
                {!showForm && (
                  <button onClick={() => setShowForm(true)} className="btn btn-primary" style={{ gap: '6px', padding: '10px 20px', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Accommodation
                  </button>
                )}
              </div>

              {/* Form Container */}
              {showForm && (
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '20px' }}>
                    {editId ? 'Edit Accommodation Listing' : 'Add Accommodation'}
                  </h4>
                  <form onSubmit={handleFormSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>Accommodation Name</label>
                        <input type="text" className="form-control" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Property Type</label>
                        <select className="form-control" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                          <option value="hotel">Hotel</option>
                          <option value="apartment">Apartment</option>
                          <option value="villa">Villa</option>
                          <option value="guesthouse">Guesthouse</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea className="form-control" rows="3" required value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>Country</label>
                        <input type="text" className="form-control" required value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>City</label>
                        <input type="text" className="form-control" required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                      </div>
                      <div className="form-group">
                        <label>Address</label>
                        <input type="text" className="form-control" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>Latitude</label>
                        <input type="number" step="any" className="form-control" required value={formData.latitude} onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="form-group">
                        <label>Longitude</label>
                        <input type="number" step="any" className="form-control" required value={formData.longitude} onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="form-group">
                        <label>Stars Rating (1-5)</label>
                        <input type="number" min="1" max="5" className="form-control" required value={formData.stars} onChange={(e) => setFormData({ ...formData, stars: parseInt(e.target.value, 10) || 5 })} />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Image URL</label>
                      <input type="url" className="form-control" placeholder="https://..." value={formData.image_url} onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button type="submit" className="btn btn-primary" disabled={actionLoading}>Save Changes</button>
                      <button type="button" onClick={() => { setShowForm(false); setEditId(null); }} className="btn btn-outline">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Listing Table */}
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Property</th>
                      <th style={{ padding: '12px' }}>Type</th>
                      <th style={{ padding: '12px' }}>Location</th>
                      <th style={{ padding: '12px' }}>Stars</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accommodationsList.map((acc) => (
                      <tr key={acc.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                        <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{acc.name}</td>
                        <td style={{ padding: '16px 12px', textTransform: 'capitalize' }}>{acc.type}</td>
                        <td style={{ padding: '16px 12px' }}>{acc.city}, {acc.country}</td>
                        <td style={{ padding: '16px 12px' }}>{acc.stars} ★</td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <button onClick={() => startEdit(acc)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginRight: '16px' }}>
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteAccommodation(acc.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROOMS TAB */}
          {activeTab === 'rooms' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem' }}>Rooms Inventory</h3>
                {!showRoomForm && (
                  <button onClick={() => setShowRoomForm(true)} className="btn btn-primary" style={{ gap: '6px', padding: '10px 20px', fontSize: '0.85rem' }}>
                    <Plus size={16} /> Add Room
                  </button>
                )}
              </div>

              {/* Room Form */}
              {showRoomForm && (
                <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '32px', marginBottom: '32px' }}>
                  <h4 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.25rem', marginBottom: '20px' }}>
                    {editRoomId ? 'Edit Room Listing' : 'Add Room'}
                  </h4>
                  <form onSubmit={handleRoomFormSubmit}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>Belongs to Accommodation</label>
                        <select 
                          className="form-control" 
                          required 
                          value={roomFormData.accommodation_id} 
                          onChange={(e) => setRoomFormData({ ...roomFormData, accommodation_id: e.target.value })}
                        >
                          <option value="">Select Property...</option>
                          {accommodationsList.map(a => (
                            <option key={a.id} value={a.id}>{a.name} ({a.city})</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Room Name / Title</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="e.g. Royal Ocean Penthouse" 
                          required 
                          value={roomFormData.name} 
                          onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })} 
                        />
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                      <div className="form-group">
                        <label>Suite Type</label>
                        <select className="form-control" value={roomFormData.type} onChange={(e) => setRoomFormData({ ...roomFormData, type: e.target.value })}>
                          <option value="single">Single Suite</option>
                          <option value="double">Double Suite</option>
                          <option value="suite">Luxury Suite</option>
                          <option value="family">Family Residence</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Price Per Night ($)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          required 
                          value={roomFormData.price_per_night} 
                          onChange={(e) => setRoomFormData({ ...roomFormData, price_per_night: e.target.value })} 
                        />
                      </div>
                      <div className="form-group">
                        <label>Guest Capacity</label>
                        <input 
                          type="number" 
                          min="1" 
                          className="form-control" 
                          required 
                          value={roomFormData.capacity} 
                          onChange={(e) => setRoomFormData({ ...roomFormData, capacity: parseInt(e.target.value, 10) || 1 })} 
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Amenities (comma-separated)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="WiFi, Air Conditioning, Private Pool, Butler Service" 
                        value={roomFormData.amenities} 
                        onChange={(e) => setRoomFormData({ ...roomFormData, amenities: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Description</label>
                      <textarea 
                        className="form-control" 
                        rows="3" 
                        value={roomFormData.description} 
                        onChange={(e) => setRoomFormData({ ...roomFormData, description: e.target.value })} 
                      />
                    </div>

                    <div className="form-group">
                      <label>Room Image URL</label>
                      <input 
                        type="url" 
                        className="form-control" 
                        placeholder="https://..." 
                        value={roomFormData.image_url} 
                        onChange={(e) => setRoomFormData({ ...roomFormData, image_url: e.target.value })} 
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                      <button type="submit" className="btn btn-primary" disabled={actionLoading}>Save Room</button>
                      <button type="button" onClick={() => { setShowRoomForm(false); setEditRoomId(null); }} className="btn btn-outline">Cancel</button>
                    </div>
                  </form>
                </div>
              )}

              {/* Rooms List Table */}
              <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px' }}>Suite Name</th>
                      <th style={{ padding: '12px' }}>Belongs To</th>
                      <th style={{ padding: '12px' }}>Type</th>
                      <th style={{ padding: '12px' }}>Capacity</th>
                      <th style={{ padding: '12px' }}>Price / Night</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roomsList.map((room) => (
                      <tr key={room.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                        <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{room.name}</td>
                        <td style={{ padding: '16px 12px' }}>{room.accommodation_name}</td>
                        <td style={{ padding: '16px 12px', textTransform: 'capitalize' }}>{room.type}</td>
                        <td style={{ padding: '16px 12px' }}>{room.capacity} Guests</td>
                        <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>${room.price_per_night}</td>
                        <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                          <button onClick={() => startEditRoom(room)} style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginRight: '16px' }}>
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteRoom(room.id)} style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}>
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BOOKINGS TAB */}
          {activeTab === 'bookings' && (
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Ref ID</th>
                    <th style={{ padding: '12px' }}>Guest</th>
                    <th style={{ padding: '12px' }}>Sanctuary / Suite</th>
                    <th style={{ padding: '12px' }}>Dates</th>
                    <th style={{ padding: '12px' }}>Amount</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookingsList.map((book) => (
                    <tr key={book.booking_id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px 12px' }}>#{book.booking_id}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{book.first_name} {book.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{book.email}</div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{book.accommodation_name}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{book.room_name} ({book.guests_count} Guests)</div>
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        {new Date(book.check_in).toLocaleDateString()} &rarr; {new Date(book.check_out).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold', color: 'var(--primary)' }}>${book.total_price}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <span style={{
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'uppercase',
                          backgroundColor: book.status === 'confirmed' ? 'rgba(46,125,50,0.1)' : book.status === 'pending' ? 'rgba(255,179,0,0.1)' : 'rgba(198,40,40,0.1)',
                          color: book.status === 'confirmed' ? 'var(--success)' : book.status === 'pending' ? '#ffb300' : 'var(--error)'
                        }}>
                          {book.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <select
                          value={book.status}
                          disabled={actionLoading}
                          onChange={(e) => handleUpdateBookingStatus(book.booking_id, e.target.value)}
                          className="form-control"
                          style={{ width: '130px', padding: '4px 8px', fontSize: '0.85rem', display: 'inline-block' }}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'reviews' && (
            <div style={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase' }}>
                    <th style={{ padding: '12px' }}>Guest</th>
                    <th style={{ padding: '12px' }}>Sanctuary</th>
                    <th style={{ padding: '12px' }}>Rating</th>
                    <th style={{ padding: '12px' }}>Review Comment</th>
                    <th style={{ padding: '12px' }}>Date</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reviewsList.map((rev) => (
                    <tr key={rev.id} style={{ borderBottom: '1px solid var(--border-color)', fontSize: '0.95rem' }}>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ fontWeight: 'bold' }}>{rev.first_name} {rev.last_name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{rev.email}</div>
                      </td>
                      <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>{rev.accommodation_name}</td>
                      <td style={{ padding: '16px 12px' }}>
                        <div style={{ display: 'flex', gap: '2px', color: '#ffb300' }}>
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} size={14} style={{ fill: '#ffb300' }} />
                          ))}
                        </div>
                      </td>
                      <td style={{ padding: '16px 12px', maxWidth: '300px', wordBreak: 'break-word', color: 'var(--text-main)', fontSize: '0.9rem' }}>
                        {rev.comment}
                      </td>
                      <td style={{ padding: '16px 12px' }}>
                        {new Date(rev.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '16px 12px', textAlign: 'right' }}>
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          disabled={actionLoading}
                          style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer' }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
