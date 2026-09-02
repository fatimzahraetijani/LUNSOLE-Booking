import React from 'react';

/**
 * StatCard — Luxury statistic metric card
 * Props:
 *  - icon: Lucide React component
 *  - label: string
 *  - value: number | string
 *  - colorClass: 'gold' | 'dark' | 'green' | 'blue' | 'purple'
 *  - sub: optional subtitle string
 *  - trend: optional growth indicator string (e.g. '+12% this month')
 */
export const StatCard = ({ icon: Icon, label, value, colorClass = 'gold', sub, trend }) => {
  return (
    <div className={`stat-card stat-card-${colorClass}`}>
      <div className="stat-card-header">
        <div className={`stat-card-icon ${colorClass}`}>
          <Icon size={20} />
        </div>
        {trend && <span className="stat-card-trend">{trend}</span>}
      </div>
      <div className="stat-card-info">
        <div className="stat-card-value">{value ?? '0'}</div>
        <div className="stat-card-label">{label}</div>
        {sub && <div className="stat-card-sub">{sub}</div>}
      </div>
    </div>
  );
};
