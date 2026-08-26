import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Search } from './pages/Search';
import { AccommodationDetails } from './pages/AccommodationDetails';
import { Dashboard } from './pages/Dashboard';
import { Favorites } from './pages/Favorites';
import { AdminDashboard } from './pages/AdminDashboard';
import { AdminLogin } from './pages/AdminLogin';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="search" element={<Search />} />
            <Route path="accommodations/:id" element={<AccommodationDetails />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="admin/login" element={<AdminLogin />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
