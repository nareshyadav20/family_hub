import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Gallery from './pages/Gallery';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Notifications from './pages/Notifications';
import FamilyTree from './pages/FamilyTree';
import Family from './pages/Family';
import Events from './pages/Events';
import Messages from './pages/Messages';
import Announcements from './pages/Announcements';
import Documents from './pages/Documents';
import AIAssistant from './pages/AIAssistant';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Settings from './pages/Settings';
import ProfileSetup from './pages/ProfileSetup';
import CalendarPage from './pages/Calendar';

import {
  LayoutDashboard, Users, Users2, Image as ImageIcon, CalendarDays, Calendar,
  MessageSquare, Megaphone, Bell, Folder, Sparkles, UserCircle, Settings as SettingsIcon, LogOut
} from 'lucide-react';

const navSidebarItems = [
  { title: 'Dashboard', href: '/member/dashboard', icon: <LayoutDashboard size={18} /> },
  { title: 'Family', href: '/member/dashboard/family', icon: <Users size={18} /> },
  { title: 'Family Tree', href: '/member/dashboard/tree', icon: <Users2 size={18} /> },
  { title: 'Gallery', href: '/member/dashboard/gallery', icon: <ImageIcon size={18} /> },
  { title: 'Events', href: '/member/dashboard/events', icon: <CalendarDays size={18} /> },
  { title: 'Calendar', href: '/member/dashboard/calendar', icon: <Calendar size={18} /> },
  { title: 'Messages', href: '/member/dashboard/messages', icon: <MessageSquare size={18} /> },
  { title: 'Announcements', href: '/member/dashboard/announcements', icon: <Megaphone size={18} /> },
  { title: 'Notifications', href: '/member/dashboard/notifications', icon: <Bell size={18} /> },
  { title: 'Documents', href: '/member/dashboard/documents', icon: <Folder size={18} /> },
  { title: 'AI Assistant', href: '/member/dashboard/ai', icon: <Sparkles size={18} /> },
];

const bottomNavItems = [
  { title: 'Profile', href: '/member/dashboard/profile', icon: <UserCircle size={18} /> },
  { title: 'Settings', href: '/member/dashboard/settings', icon: <SettingsIcon size={18} /> },
  { title: 'Sign Out', href: '/member/login', icon: <LogOut size={18} /> },
];

function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Calendar size={24} className="text-slate-300" />
      </div>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">{title}</h2>
      <p className="text-sm text-slate-400 max-w-xs">This section is coming soon.</p>
    </div>
  );
}

function ProtectedMemberRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isValid = false;
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && (user.role === 'MEMBER' || user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        isValid = true;
      }
    } catch (e) {}
  }
  
  if (!isValid) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/member/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/member/dashboard" replace />;
  }
  return children;
}

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useEffect } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppLayer() {
  return (
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<Navigate to="/member/dashboard" replace />} />
          <Route path="/member" element={<Navigate to="/member/dashboard" replace />} />
          <Route path="/member/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/member/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/member/invite" element={<PublicRoute><Onboarding /></PublicRoute>} />
          <Route path="/member/dashboard" element={<ProtectedMemberRoute><MainLayout navItems={navSidebarItems} bottomNav={bottomNavItems} /></ProtectedMemberRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="family" element={<Family />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="events" element={<Events />} />
            <Route path="tree" element={<FamilyTree />} />
            <Route path="messages" element={<Messages />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="documents" element={<Documents />} />
            <Route path="ai" element={<AIAssistant />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile-setup" element={<ProfileSetup />} />
            <Route path="settings" element={<Settings />} />
            <Route path="calendar" element={<CalendarPage />} />
            <Route path="*" element={<ComingSoon title="Page Not Found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

function App() {
  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('member.created', () => queryClient.invalidateQueries({ queryKey: ['members'] }));
    socket.on('member.invited', () => queryClient.invalidateQueries({ queryKey: ['members'] }));
    socket.on('member.updated', () => queryClient.invalidateQueries({ queryKey: ['members'] }));
    return () => socket.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
       <AppLayer />
    </QueryClientProvider>
  );
}

export default App;
