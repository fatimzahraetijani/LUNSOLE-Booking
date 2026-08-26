import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-col">
            <h3>LUNSOLE<span>.</span></h3>
            <p>
              Luxury stays across Morocco. Experience the pinnacle of heritage and modern comfort in our curated collection of five-star Riads, apartments, and beach resorts.
            </p>
            <div style={{ display: 'flex', gap: '16px' }}>
              {/* Instagram SVG */}
              <a href="#" aria-label="Instagram" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
              {/* Facebook SVG */}
              <a href="#" aria-label="Facebook" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </a>
              {/* Twitter SVG */}
              <a href="#" aria-label="Twitter" style={{ color: 'rgba(255,255,255,0.7)', transition: 'color 0.3s' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                </svg>
              </a>
            </div>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#">About Us</a></li>
              <li><a href="#accommodations">Our Properties</a></li>
              <li><a href="#features">Services & Amenities</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Support</h4>
            <ul className="footer-links">
              <li><a href="#">FAQ</a></li>
              <li><a href="#">Booking Guide</a></li>
              <li><a href="#">Terms & Conditions</a></li>
              <li><a href="#">Privacy Policy</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Contact Info</h4>
            <ul className="footer-contact">
              <li>
                <MapPin size={18} />
                <span>Rabat, Morocco</span>
              </li>
              <li>
                <Mail size={18} />
                <span>fatimzahrae.tijani1@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} LUNSOLE. All rights reserved. Created by Fatim Zahrae Tijani.</p>
          <p>Rabat, Morocco</p>
        </div>
      </div>
    </footer>
  );
};
