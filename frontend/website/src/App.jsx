import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import About from './pages/About';
import FamilyTree from './pages/FamilyTree';
import Gallery from './pages/Gallery';
import Events from './pages/Events';
import Stories from './pages/Stories';
import Contact from './pages/Contact';
import Login from './pages/Login';
import PrivateDashboard from './pages/private/Dashboard';
import PrivateGallery from './pages/private/PrivateGallery';
import PrivateEvents from './pages/private/PrivateEvents';
import MemberDirectory from './pages/private/MemberDirectory';
import Documents from './pages/private/Documents';
import Announcements from './pages/private/Announcements';

// Auth context (simple mock)
const AuthContext = React.createContext(null);
export const useAuth = () => React.useContext(AuthContext);

function PublicLayout({ children }) {
  return (
    <>
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  );
}

function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fh_user')); } catch { return null; }
  });

  const login = (userData) => {
    localStorage.setItem('fh_user', JSON.stringify(userData));
    setUser(userData);
  };
  const logout = () => {
    localStorage.removeItem('fh_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/about" element={<PublicLayout><About /></PublicLayout>} />
          <Route path="/tree" element={<PublicLayout><FamilyTree /></PublicLayout>} />
          <Route path="/gallery" element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/events" element={<PublicLayout><Events /></PublicLayout>} />
          <Route path="/stories" element={<PublicLayout><Stories /></PublicLayout>} />
          <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
          <Route path="/login" element={<Login />} />

          {/* Private Routes */}
          <Route path="/private" element={<PrivateRoute><PrivateDashboard /></PrivateRoute>} />
          <Route path="/private/gallery" element={<PrivateRoute><PrivateGallery /></PrivateRoute>} />
          <Route path="/private/events" element={<PrivateRoute><PrivateEvents /></PrivateRoute>} />
          <Route path="/private/members" element={<PrivateRoute><MemberDirectory /></PrivateRoute>} />
          <Route path="/private/documents" element={<PrivateRoute><Documents /></PrivateRoute>} />
          <Route path="/private/announcements" element={<PrivateRoute><Announcements /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
