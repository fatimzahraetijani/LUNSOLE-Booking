import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AIAssistant } from './AIAssistant';

export const Layout = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    // Only scroll to top when there is no hash anchor
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      // Scroll to the anchor element after a brief render delay
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [pathname, hash]);

  return (
    <>
      <Navbar />
      <main className="content">
        <Outlet />
      </main>
      <AIAssistant />
      <Footer />
    </>
  );
};
