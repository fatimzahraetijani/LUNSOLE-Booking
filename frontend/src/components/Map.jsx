import React, { useEffect, useRef } from 'react';

export const Map = ({ accommodations }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    // Check if Leaflet is loaded
    if (!window.L || !mapContainerRef.current) return;

    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Default center (e.g. Europe/Paris) or first accommodation's coords
    let center = [48.8566, 2.3522];
    let zoom = 4;

    if (accommodations && accommodations.length > 0) {
      const validCoords = accommodations.find(a => a.latitude && a.longitude);
      if (validCoords) {
        center = [parseFloat(validCoords.latitude), parseFloat(validCoords.longitude)];
        zoom = 10;
      }
    }

    // Initialize Leaflet map
    const map = window.L.map(mapContainerRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    // Add OpenStreetMap tile layer
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Clean up markers ref
    markersRef.current = [];

    // Add markers for each accommodation
    if (accommodations && accommodations.length > 0) {
      const bounds = [];

      accommodations.forEach(acc => {
        if (!acc.latitude || !acc.longitude) return;

        const lat = parseFloat(acc.latitude);
        const lng = parseFloat(acc.longitude);
        bounds.push([lat, lng]);

        const marker = window.L.marker([lat, lng]).addTo(map);

        // Popup content with detail links
        const popupContent = `
          <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 150px; padding: 4px;">
            <img src="${acc.image_url}" style="width: 100%; height: 90px; object-fit: cover; border-radius: 4px; margin-bottom: 8px;" />
            <h4 style="font-family: 'Playfair Display', serif; font-size: 1.05rem; margin-bottom: 4px;">${acc.name}</h4>
            <p style="font-size: 0.8rem; color: #6b6d76; margin-bottom: 8px;">${acc.city}, ${acc.country}</p>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #e5e5e0; padding-top: 8px;">
              <span style="font-weight: bold; color: #12131a;">$${Math.round(acc.min_price || acc.price || 0)}/night</span>
              <a href="/accommodations/${acc.id}" style="color: #c5a880; font-weight: 600; text-decoration: none; font-size: 0.8rem;">Details &rarr;</a>
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
        markersRef.current.push(marker);
      });

      // Fit map bounds to show all markers if there are multiple
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [accommodations]);

  return (
    <div 
      ref={mapContainerRef} 
      style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '400px', 
        borderRadius: '12px', 
        border: '1px solid var(--border-color)', 
        boxShadow: 'var(--shadow-sm)',
        zIndex: 1 
      }} 
    />
  );
};
