import React, { useState, useEffect, useCallback } from 'react';
import { CalendarCheck, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { adminFetch } from '../utils/adminApi';
import '../components/admin/admin.css';

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed'];

const STATUS_COLORS = {
  pending:   { bg: 'rgba(245,158,11,0.12)', color: '#b45309', border: 'rgba(245,158,11,0.25)' },
  confirmed: { bg: 'rgba(16,185,129,0.12)', color: '#047857', border: 'rgba(16,185,129,0.25)' },
  cancelled: { bg: 'rgba(239,68,68,0.12)',  color: '#b91c1c', border: 'rgba(239,68,68,0.25)' },
  completed: { bg: 'rgba(59,130,246,0.12)', color: '#1d4ed8', border: 'rgba(59,130,246,0.25)' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      borderRadius: 100,
      fontSize: '0.72rem',
      fontWeight: 700,
      textTransform: 'capitalize',
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      letterSpacing: '0.03em',
    }}>
      {status}
    </span>
  );
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const formatCurrency = (v) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v || 0);

export const AdminBookings = () => {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [updating, setUpdating]   = useState({});

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/bookings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load bookings');
      setBookings(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleStatusChange = async (bookingId, newStatus) => {
    setUpdating(prev => ({ ...prev, [bookingId]: true }));
    try {
      const res = await adminFetch(`/bookings/${bookingId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setBookings(prev => prev.map(b =>
          b.booking_id === bookingId ? { ...b, status: newStatus } : b
        ));
      }
    } catch { /* silent */ }
    finally {
      setUpdating(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const filtered = bookings.filter(b => {
    const matchSearch =
      `${b.first_name} ${b.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      (b.accommodation_name || '').toLowerCase().includes(search.toLowerCase()) ||
      String(b.booking_id).includes(search);
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <h1>Reservations & Bookings</h1>
          <p>Monitor guest bookings, confirm pending reservations, or adjust status flags in real-time.</p>
        </div>
        <button className="admin-btn admin-btn-outline" onClick={fetchBookings}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Summary status filter buttons */}
      {!loading && (
        <div className="status-pills-row">
          {['all', ...STATUS_OPTIONS].map(s => {
            const count = s === 'all' ? bookings.length : bookings.filter(b => b.status === s).length;
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`status-pill ${active ? 'active' : ''}`}
              >
                {s === 'all' ? 'All Bookings' : s} <span className="pill-count">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">Booking Records ({filtered.length})</span>
          <div className="admin-search">
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search by guest name, property, ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><CalendarCheck size={26} /></div>
            <h3>{search || filterStatus !== 'all' ? 'No matching bookings found' : 'No reservations recorded'}</h3>
            <p>{search ? 'Try adjusting your search criteria' : 'Guest reservations will automatically populate here.'}</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>Guest Name</th>
                  <th>Property</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Guests</th>
                  <th>Total</th>
                  <th>Current Status</th>
                  <th>Manage Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.booking_id}>
                    <td className="col-id">#{b.booking_id}</td>
                    <td>
                      <div className="col-name">{b.first_name} {b.last_name}</div>
                      <div className="col-muted" style={{ fontSize: '0.75rem' }}>{b.email}</div>
                    </td>
                    <td className="col-muted">{b.accommodation_name || '—'}</td>
                    <td className="col-muted">{b.room_name || '—'}</td>
                    <td className="col-muted">{formatDate(b.check_in)}</td>
                    <td className="col-muted">{formatDate(b.check_out)}</td>
                    <td style={{ textAlign: 'center' }}>{b.guests_count}</td>
                    <td className="col-price">{formatCurrency(b.total_price)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select
                          className="status-select"
                          value={b.status}
                          disabled={updating[b.booking_id]}
                          onChange={e => handleStatusChange(b.booking_id, e.target.value)}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s}</option>
                          ))}
                        </select>
                        {updating[b.booking_id] && (
                          <span style={{
                            position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                            width: 12, height: 12, border: '2px solid rgba(197,168,128,0.3)',
                            borderTopColor: '#c5a880', borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                          }} />
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
