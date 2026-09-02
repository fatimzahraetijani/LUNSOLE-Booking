import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// User-facing layout & pages
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Search } from './pages/Search';
import { AccommodationDetails } from './pages/AccommodationDetails';
import { Dashboard } from './pages/Dashboard';
import { Favorites } from './pages/Favorites';

// Admin
import { AdminLogin } from './pages/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminHotels } from './pages/AdminHotels';
import { AdminApartments } from './pages/AdminApartments';
import { AdminCategories } from './pages/AdminCategories';
import { AdminBookings } from './pages/AdminBookings';
import { AdminUsers } from './pages/AdminUsers';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ─── User Website ─── */}
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="search" element={<Search />} />
            <Route path="accommodations/:id" element={<AccommodationDetails />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="favorites" element={<Favorites />} />
          </Route>

          {/* ─── Admin Login (standalone — no Layout, no sidebar) ─── */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ─── Admin Panel (protected, separate layout) ─── */}
          <Route
            path="/admin"
            element={
              <AdminProtectedRoute>
                <AdminLayout />
              </AdminProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="hotels" element={<AdminHotels />} />
            <Route path="apartments" element={<AdminApartments />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
