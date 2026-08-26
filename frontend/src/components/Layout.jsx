import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AIAssistant } from './AIAssistant';

export const Layout = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Scroll to top of page on route change
    window.scrollTo(0, 0);
  }, [pathname]);

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
