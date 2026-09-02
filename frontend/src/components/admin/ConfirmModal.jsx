import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * ConfirmModal — generic delete/action confirmation dialog
 * Props:
 *  - isOpen: boolean
 *  - onClose: fn
 *  - onConfirm: fn
 *  - title: string
 *  - message: string
 *  - confirmLabel: string (default: 'Delete')
 *  - loading: boolean
 */
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmLabel = 'Delete',
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <span className="admin-modal-title">{title}</span>
          <button className="admin-modal-close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className="admin-modal-body">
          <div className="confirm-modal-icon">
            <AlertTriangle size={28} />
          </div>
          <div className="confirm-modal-text">
            <h3>{title}</h3>
            <p>{message}</p>
          </div>
        </div>
        <div className="admin-modal-footer">
          <button className="admin-btn admin-btn-outline" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="admin-btn admin-btn-danger"
            onClick={onConfirm}
            disabled={loading}
            style={{ background: '#c62828', color: '#fff', borderColor: '#c62828' }}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
