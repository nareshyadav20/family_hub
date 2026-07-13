import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import AddMember from './pages/AddMember';
import InviteMember from './pages/InviteMember';
import Events from './pages/Events';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FamilyTree from './pages/FamilyTree';
import FamilyHistory from './pages/FamilyHistory';
import JoinRequests from './pages/JoinRequests';
import Gallery from './pages/Gallery';
import CreateEvent from './pages/events/CreateEvent';
import Announcements from './pages/Announcements';
import Polls from './pages/Polls';
import Notifications from './pages/Notifications';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import Calendar from './pages/Calendar';
import DigitalVault from './pages/DigitalVault';
import Assets from './pages/Assets';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import Finance from './pages/Finance';
import Messages from './pages/Messages';
import Profile from './pages/Profile';

import {
  LayoutDashboard, Users, UserPlus, GitFork, CalendarDays, Calendar as CalIcon,
  Image as ImageIcon, Library, Megaphone, MessageSquare, BarChart,
  Bell, Folder, PieChart, FileText, UserCircle, Settings as SettingsIcon, LogOut,
  Vault, Briefcase, ShieldCheck, Sparkles, DollarSign, History
} from 'lucide-react';

const navSidebarItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { title: "AI Assistant", href: "/admin/dashboard/assistant", icon: <Sparkles size={18} /> },
  { title: "Messages", href: "/admin/dashboard/messages", icon: <MessageSquare size={18} /> },
  { title: "Members", href: "/admin/dashboard/members", icon: <Users size={18} /> },
  { title: "Join Requests", href: "/admin/dashboard/requests", icon: <UserPlus size={18} /> },
  { title: "Family Tree", href: "/admin/dashboard/tree", icon: <GitFork size={18} /> },
  { title: "Family History", href: "/admin/dashboard/history", icon: <History size={18} /> },
  { title: "Events", href: "/admin/dashboard/events", icon: <CalendarDays size={18} /> },
  { title: "Calendar", href: "/admin/dashboard/calendar", icon: <CalIcon size={18} /> },
  { title: "Gallery", href: "/admin/dashboard/gallery", icon: <ImageIcon size={18} /> },
  { title: "Finance", href: "/admin/dashboard/finance", icon: <DollarSign size={18} /> },
  { title: "Assets", href: "/admin/dashboard/assets", icon: <Briefcase size={18} /> },
  { title: "Digital Vault", href: "/admin/dashboard/vault", icon: <Folder size={18} /> },
  { title: "Documents", href: "/admin/dashboard/documents", icon: <FileText size={18} /> },
  { title: "Announcements", href: "/admin/dashboard/announcements", icon: <Megaphone size={18} /> },
  { title: "Polls", href: "/admin/dashboard/polls", icon: <BarChart size={18} /> },
  { title: "Analytics", href: "/admin/dashboard/analytics", icon: <PieChart size={18} /> },
  { title: "Notifications", href: "/admin/dashboard/notifications", icon: <Bell size={18} /> },
  { title: "Settings", href: "/admin/dashboard/settings", icon: <SettingsIcon size={18} /> },
];

const bottomNavItems = [
  { title: "Profile", href: "/admin/dashboard/profile", icon: <UserCircle size={18} /> },
  { title: "Sign Out", href: "/admin/login", icon: <LogOut size={18} /> },
];

function ComingSoon({ title }) {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <FileText size={24} className="text-slate-300" />
      </div>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-2">{title}</h2>
      <p className="text-sm text-slate-400 max-w-xs">This section is under construction and will be available soon.</p>
    </div>
  );
}

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isValid = false;
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN')) {
        isValid = true;
      }
    } catch (e) {}
  }
  
  if (!isValid) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/admin/dashboard" replace />;
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
          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/admin/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/admin/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          <Route path="/admin/dashboard" element={<ProtectedAdminRoute><MainLayout navItems={navSidebarItems} bottomNav={bottomNavItems} /></ProtectedAdminRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="messages" element={<Messages />} />
            <Route path="members" element={<Members />} />
            <Route path="members/add" element={<AddMember />} />
            <Route path="members/invite" element={<InviteMember />} />
            <Route path="requests" element={<JoinRequests />} />
            <Route path="tree" element={<FamilyTree />} />
            <Route path="history" element={<FamilyHistory />} />
            <Route path="events" element={<Events />} />
            <Route path="events/create" element={<CreateEvent />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="finance" element={<Finance />} />
            <Route path="assets" element={<Assets />} />
            <Route path="vault" element={<DigitalVault />} />
            <Route path="documents" element={<Documents />} />
            <Route path="announcements" element={<Announcements />} />
            <Route path="polls" element={<Polls />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />

            <Route path="albums" element={<ComingSoon title="Albums" />} />
            <Route path="reports" element={<ComingSoon title="Reports" />} />
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

