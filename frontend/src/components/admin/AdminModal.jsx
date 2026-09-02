import React from 'react';
import { X } from 'lucide-react';

/**
 * AdminModal — generic modal wrapper for forms
 * Props:
 *  - isOpen: boolean
 *  - onClose: fn
 *  - title: string
 *  - children: ReactNode
 *  - footer: ReactNode (optional — for custom footer buttons)
 *  - size: 'default' | 'lg'
 */
export const AdminModal = ({ isOpen, onClose, title, children, footer, size = 'default' }) => {
  if (!isOpen) return null;

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div
        className="admin-modal"
        style={{ maxWidth: size === 'lg' ? 720 : 560 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="admin-modal-header">
          <span className="admin-modal-title">{title}</span>
          <button className="admin-modal-close" onClick={onClose} aria-label="Close modal">
            <X size={16} />
          </button>
        </div>
        <div className="admin-modal-body">{children}</div>
        {footer && <div className="admin-modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
