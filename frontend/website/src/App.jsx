import React from 'react';
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
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
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
  );
}
