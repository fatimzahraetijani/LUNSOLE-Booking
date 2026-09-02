import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Hotel, Building2, CalendarCheck, DollarSign,
  Tag, TrendingUp, ArrowRight, RefreshCw, AlertCircle,
  Clock, CheckCircle2, XCircle, Star, MapPin, Sparkles, BedDouble
} from 'lucide-react';
import { StatCard } from '../components/admin/StatCard';
import { adminFetch } from '../utils/adminApi';
import '../components/admin/admin.css';

const formatCurrency = (val) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

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
      background: s.bg,
      color: s.color,
      border: `1px solid ${s.border}`,
      letterSpacing: '0.04em',
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  );
};

export const AdminDashboard = () => {
  const [stats, setStats]         = useState(null);
  const [bookings, setBookings]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [accoms, setAccoms]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [sR, bR, uR, aR] = await Promise.all([
        adminFetch('/stats'),
        adminFetch('/bookings'),
        adminFetch('/users'),
        adminFetch('/accommodations'),
      ]);

      if (!sR.ok) throw new Error('Failed to load stats');
      const [s, b, u, a] = await Promise.all([sR.json(), bR.json(), uR.json(), aR.json()]);

      setStats(s);
      setBookings(Array.isArray(b) ? b.slice(0, 6) : []);
      setUsers(Array.isArray(u) ? u.slice(0, 5) : []);
      setAccoms(Array.isArray(a) ? a.slice(0, 5) : []);
    } catch (e) {
      setError(e.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Statistics counts
  const totalAccoms = accoms.length;
  const hotelCount  = accoms.filter(a => a.type === 'hotel').length;
  const apartCount  = accoms.filter(a => a.type === 'apartment').length;
  const bookingCount = stats?.totalBookings || 0;
  const userCount    = stats?.totalUsers || 0;

  // Booking status percentages for overview
  const totalBookingsNum = bookingCount || 1;
  const statusData = stats ? [
    { key: 'confirmed', label: 'Confirmed', count: stats.statusCounts?.confirmed || 0, cls: 'confirmed' },
    { key: 'pending',   label: 'Pending',   count: stats.statusCounts?.pending   || 0, cls: 'pending' },
    { key: 'cancelled', label: 'Cancelled', count: stats.statusCounts?.cancelled || 0, cls: 'cancelled' },
  ] : [];

  if (loading) return (
    <div className="admin-loading">
      <div className="admin-spinner" />
      <p style={{ color: '#6b6d76', fontSize: '0.875rem' }}>Loading executive dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="admin-alert admin-alert-error" style={{ marginTop: 32 }}>
      <AlertCircle size={18} style={{ flexShrink: 0 }} />
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <span><strong>Error:</strong> {error}</span>
        <button className="admin-btn admin-btn-sm admin-btn-outline" onClick={fetchAll}>
          <RefreshCw size={13} /> Retry
        </button>
      </div>
    </div>
  );

  return (
    <div>
      {/* ─── Hero / Page Header ─── */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <div className="dashboard-hero-badge">
            <Sparkles size={13} color="#c5a880" /> Executive Portal
          </div>
          <h1>Welcome back, Admin</h1>
          <p>Overview of LUNSOLE luxury hotels, guest apartments, reservations, and overall performance.</p>
        </div>
        <div className="dashboard-hero-actions">
          <button className="admin-btn admin-btn-gold" onClick={fetchAll}>
            <RefreshCw size={14} /> Refresh Data
          </button>
        </div>
      </div>

      {/* ─── 5 Statistics Cards ─── */}
      <div className="admin-stats-grid">
        <StatCard
          icon={BedDouble}
          label="Total Accommodations"
          value={totalAccoms}
          colorClass="gold"
          sub="Hotels & Apartments"
        />
        <StatCard
          icon={Hotel}
          label="Hotels"
          value={hotelCount}
          colorClass="dark"
          sub="Luxury Stays"
        />
        <StatCard
          icon={Building2}
          label="Apartments"
          value={apartCount}
          colorClass="blue"
          sub="Private Residences"
        />
        <StatCard
          icon={CalendarCheck}
          label="Bookings"
          value={bookingCount}
          colorClass="green"
          sub="Total Reservations"
        />
        <StatCard
          icon={Users}
          label="Users"
          value={userCount}
          colorClass="purple"
          sub="Registered Accounts"
        />
      </div>

      {/* ─── Top Destinations (Real Photographic Images) ─── */}
      <div className="admin-card" style={{ marginBottom: 32 }}>
        <div className="admin-card-header">
          <div className="admin-card-title-group">
            <MapPin size={18} className="card-title-icon" />
            <div>
              <span className="admin-card-title">Featured Moroccan Destinations</span>
              <span className="admin-card-subtitle">Visual highlights of key destination hubs</span>
            </div>
          </div>
        </div>
        <div className="admin-card-body" style={{ padding: 24 }}>
          <div className="destinations-grid">
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1597212618440-806262de4f6b?auto=format&fit=crop&w=800&q=80"
                alt="Marrakech"
              />
              <div className="dest-card-overlay">
                <div className="dest-badge">Morocco</div>
                <div className="dest-title">Marrakech</div>
                <div className="dest-sub">The Ochre Imperial City</div>
              </div>
            </div>
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1539020140153-e479b8c22e70?auto=format&fit=crop&w=800&q=80"
                alt="Casablanca"
              />
              <div className="dest-card-overlay">
                <div className="dest-badge">Atlantic Coast</div>
                <div className="dest-title">Casablanca</div>
                <div className="dest-sub">Economic & Modern Hub</div>
              </div>
            </div>
            <div className="dest-card">
              <img
                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"
                alt="Rabat"
              />
              <div className="dest-card-overlay">
                <div className="dest-badge">Capital City</div>
                <div className="dest-title">Rabat</div>
                <div className="dest-sub">Cultural & Historic Heart</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Dashboard Activity Grid ─── */}
      <div className="admin-dashboard-grid">

        {/* ── Recent Bookings ── */}
        <div className="admin-card full-width">
          <div className="admin-card-header">
            <div className="admin-card-title-group">
              <CalendarCheck size={18} className="card-title-icon" />
              <div>
                <span className="admin-card-title">Recent Bookings</span>
                <span className="admin-card-subtitle">Latest reservation activities across properties</span>
              </div>
            </div>
            <Link to="/admin/bookings" className="admin-btn admin-btn-sm admin-btn-outline">
              View All Bookings <ArrowRight size={13} />
            </Link>
          </div>
          <div className="admin-table-wrap">
            {bookings.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><CalendarCheck size={24} /></div>
                <h3>No bookings recorded yet</h3>
                <p>Guest reservations will appear here automatically.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#ID</th>
                    <th>Guest Name</th>
                    <th>Property</th>
                    <th>Check-in</th>
                    <th>Check-out</th>
                    <th>Total Price</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.booking_id}>
                      <td className="col-id">#{b.booking_id}</td>
                      <td className="col-name">{b.first_name} {b.last_name}</td>
                      <td className="col-muted">{b.accommodation_name || '—'}</td>
                      <td className="col-muted">{formatDate(b.check_in)}</td>
                      <td className="col-muted">{formatDate(b.check_out)}</td>
                      <td className="col-price">{formatCurrency(b.total_price)}</td>
                      <td><StatusBadge status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Booking Status Overview ── */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title-group">
              <TrendingUp size={18} className="card-title-icon" />
              <div>
                <span className="admin-card-title">Booking Analytics</span>
                <span className="admin-card-subtitle">Status breakdown & estimated revenue</span>
              </div>
            </div>
          </div>
          <div className="admin-card-body">
            {statusData.length === 0 ? (
              <p style={{ color: '#6b6d76', fontSize: '0.875rem' }}>No reservation breakdown available</p>
            ) : (
              <div className="status-bar-wrap">
                {statusData.map(({ key, label, count, cls }) => (
                  <div className="status-bar-item" key={key}>
                    <span className="status-bar-label">{label}</span>
                    <div className="status-bar-track">
                      <div
                        className={`status-bar-fill ${cls}`}
                        style={{ width: `${Math.round((count / totalBookingsNum) * 100)}%` }}
                      />
                    </div>
                    <span className="status-bar-count">{count}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="summary-metrics-grid">
              {[
                { icon: CheckCircle2, label: 'Confirmed', val: stats?.statusCounts?.confirmed || 0, color: '#10b981' },
                { icon: Clock,        label: 'Pending',   val: stats?.statusCounts?.pending   || 0, color: '#f59e0b' },
                { icon: XCircle,      label: 'Cancelled', val: stats?.statusCounts?.cancelled || 0, color: '#ef4444' },
                { icon: DollarSign,   label: 'Est. Revenue', val: formatCurrency(stats?.estimatedRevenue || 0), color: '#c5a880' },
              ].map(({ icon: Icon, label, val, color }) => (
                <div key={label} className="summary-metric-card">
                  <Icon size={18} style={{ color }} />
                  <div>
                    <div className="summary-metric-label">{label}</div>
                    <div className="summary-metric-val">{val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recent Users ── */}
        <div className="admin-card">
          <div className="admin-card-header">
            <div className="admin-card-title-group">
              <Users size={18} className="card-title-icon" />
              <div>
                <span className="admin-card-title">Recent Users</span>
                <span className="admin-card-subtitle">Newly registered accounts</span>
              </div>
            </div>
            <Link to="/admin/users" className="admin-btn admin-btn-sm admin-btn-outline">
              All Users <ArrowRight size={13} />
            </Link>
          </div>
          <div className="admin-table-wrap">
            {users.length === 0 ? (
              <div className="admin-empty"><p>No users found</p></div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map(u => (
                    <tr key={u.id}>
                      <td className="col-name">{u.first_name} {u.last_name}</td>
                      <td className="col-muted" style={{ fontSize: '0.8rem' }}>{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>{u.role}</span>
                      </td>
                      <td className="col-muted">{formatDate(u.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── Recent Accommodations ── */}
        <div className="admin-card full-width">
          <div className="admin-card-header">
            <div className="admin-card-title-group">
              <Hotel size={18} className="card-title-icon" />
              <div>
                <span className="admin-card-title">Recent Accommodations</span>
                <span className="admin-card-subtitle">Latest listed hotels & luxury apartments</span>
              </div>
            </div>
            <Link to="/admin/hotels" className="admin-btn admin-btn-sm admin-btn-outline">
              Manage All <ArrowRight size={13} />
            </Link>
          </div>
          <div className="admin-table-wrap">
            {accoms.length === 0 ? (
              <div className="admin-empty">
                <div className="admin-empty-icon"><Hotel size={24} /></div>
                <h3>No accommodations added yet</h3>
                <p>Add your first hotel or apartment to populate this list.</p>
              </div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Property Name</th>
                    <th>Type</th>
                    <th>City</th>
                    <th>Country</th>
                    <th>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {accoms.map(a => (
                    <tr key={a.id}>
                      <td className="col-name">{a.name}</td>
                      <td><span className={`badge badge-${a.type}`}>{a.type}</span></td>
                      <td className="col-muted">{a.city}</td>
                      <td className="col-muted">{a.country}</td>
                      <td className="col-muted">
                        <div style={{ display: 'flex', gap: 2 }}>
                          {Array.from({ length: a.stars || 0 }).map((_, i) => (
                            <Star key={i} size={13} style={{ color: '#c5a880', fill: '#c5a880' }} />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
