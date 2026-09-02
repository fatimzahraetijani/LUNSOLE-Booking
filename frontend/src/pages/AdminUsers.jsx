import React, { useState, useEffect, useCallback } from 'react';
import { Users, Trash2, Search, RefreshCw, AlertCircle, Shield, UserCircle, Crown } from 'lucide-react';
import { ConfirmModal } from '../components/admin/ConfirmModal';
import { useAuth } from '../context/AuthContext';
import { adminFetch } from '../utils/adminApi';
import '../components/admin/admin.css';

const formatDate = (d) => d
  ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  : '—';

export const AdminUsers = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [search, setSearch]       = useState('');
  const [filterRole, setFilterRole] = useState('all');

  const [confirmId, setConfirmId]         = useState(null);
  const [confirmName, setConfirmName]     = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminFetch('/users');
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to load users');
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      const res = await adminFetch(`/users/${confirmId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setUsers(prev => prev.filter(u => u.id !== confirmId));
        setConfirmId(null);
      }
    } catch { /* silent */ }
    finally { setDeleteLoading(false); }
  };

  const filtered = users.filter(u => {
    const matchSearch =
      `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const adminCount = users.filter(u => u.role === 'admin').length;
  const userCount  = users.filter(u => u.role === 'user').length;

  return (
    <div>
      <div className="admin-page-header">
        <div className="admin-page-header-left">
          <h1>User Management</h1>
          <p>Manage user credentials, executive administrators, and guest accounts.</p>
        </div>
        <button className="admin-btn admin-btn-outline" onClick={fetchUsers}>
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error">
          <AlertCircle size={16} />{error}
        </div>
      )}

      {/* Summary metric cards */}
      {!loading && (
        <div className="user-summary-grid">
          {[
            { label: 'Total Registered', val: users.length, icon: Users, color: '#12131a', bg: 'rgba(18,19,26,0.07)' },
            { label: 'Administrators',  val: adminCount,   icon: Shield, color: '#c5a880', bg: 'rgba(197,168,128,0.14)' },
            { label: 'Guest Members',   val: userCount,    icon: UserCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
          ].map(({ label, val, icon: Icon, color, bg }) => (
            <div key={label} className="user-summary-card">
              <div className="user-summary-icon" style={{ background: bg }}>
                <Icon size={20} style={{ color }} />
              </div>
              <div>
                <div className="user-summary-val">{val}</div>
                <div className="user-summary-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Role filter buttons */}
      {!loading && (
        <div className="status-pills-row" style={{ marginBottom: 20 }}>
          {['all', 'admin', 'user'].map(r => (
            <button
              key={r}
              onClick={() => setFilterRole(r)}
              className={`status-pill ${filterRole === r ? 'active' : ''}`}
            >
              {r === 'all' ? 'All Accounts' : r === 'admin' ? 'Admins' : 'Guests'}
              {' '}<span className="pill-count">({r === 'all' ? users.length : users.filter(u => u.role === r).length})</span>
            </button>
          ))}
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <span className="admin-card-title">User Accounts ({filtered.length})</span>
          <div className="admin-search">
            <Search size={14} className="admin-search-icon" />
            <input
              className="admin-search-input"
              placeholder="Search by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon"><Users size={26} /></div>
            <h3>No matching users found</h3>
            <p>Try adjusting your search query or filter selection.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#ID</th>
                  <th>User Profile</th>
                  <th>Email Address</th>
                  <th>Role</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id}>
                      <td className="col-id">#{u.id}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div className={`user-avatar-circle ${u.role === 'admin' ? 'admin' : ''}`}>
                            {(u.first_name?.[0] || '') + (u.last_name?.[0] || '')}
                          </div>
                          <div>
                            <span className="col-name">{u.first_name} {u.last_name}</span>
                            {isSelf && (
                              <span className="user-self-badge">Your Account</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="col-muted">{u.email}</td>
                      <td>
                        <span className={`badge badge-${u.role}`}>
                          {u.role === 'admin' ? <><Crown size={12} style={{ marginRight: 4 }} /> Admin</> : 'Guest Member'}
                        </span>
                      </td>
                      <td className="col-muted">{formatDate(u.created_at)}</td>
                      <td>
                        {isSelf ? (
                          <span style={{ fontSize: '0.78rem', color: '#c5a880', fontStyle: 'italic', fontWeight: 600 }}>Active Session</span>
                        ) : (
                          <button
                            className="admin-btn admin-btn-sm admin-btn-danger admin-btn-icon"
                            onClick={() => {
                              setConfirmId(u.id);
                              setConfirmName(`${u.first_name} ${u.last_name}`);
                            }}
                            title="Delete User Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete User Account"
        message={`Are you sure you want to delete the account for "${confirmName}"? All associated reservations and personal data will be permanently removed.`}
        confirmLabel="Delete User"
        loading={deleteLoading}
      />
    </div>
  );
};
