import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';
import api from './services/api';
import { globalLogout } from './utils/auth';

/* --- ADMIN IMPORTS --- */
import AdminMainLayout from './layouts/MainLayout';
import AdminDashboard from './pages/Dashboard';
import Members from './pages/Members';
import AddMember from './pages/AddMember';
import InviteMember from './pages/InviteMember';
import Events from './pages/Events';
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
import FamilyGroups from './pages/FamilyGroups';

/* --- MEMBER IMPORTS --- */
import MemberMainLayout from './layouts/member/MainLayout';
import MemberDashboard from './pages/member/Dashboard';
import MemberFamily from './pages/member/Family';
import MemberGallery from './pages/member/Gallery';
import MemberEvents from './pages/member/Events';
import MemberFamilyTree from './pages/member/FamilyTree';
import MemberMessages from './pages/member/Messages';
import MemberAnnouncements from './pages/member/Announcements';
import MemberNotifications from './pages/member/Notifications';
import MemberDocuments from './pages/member/Documents';
import MemberAIAssistant from './pages/member/AIAssistant';
import MemberProfile from './pages/member/Profile';
import MemberProfileSetup from './pages/member/ProfileSetup';
import MemberSettings from './pages/member/Settings';
import MemberCalendarPage from './pages/member/Calendar';
import MemberFamilyGroups from './pages/member/FamilyGroups';

/* --- SHARED IMPORTS --- */
import Login from './pages/Login';
import Landing from './pages/Landing';

import {
  LayoutDashboard, Users, UserPlus, GitFork, CalendarDays, Calendar as CalIcon,
  Image as ImageIcon, Library, Megaphone, MessageSquare, BarChart,
  Bell, Folder, PieChart, FileText, UserCircle, Settings as SettingsIcon, LogOut,
  Vault, Briefcase, ShieldCheck, Sparkles, DollarSign, History, Users2
} from 'lucide-react';

const adminNavSidebarItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard size={18} /> },
  { title: "AI Assistant", href: "/admin/dashboard/assistant", icon: <Sparkles size={18} /> },
  { title: "Messages", href: "/admin/dashboard/messages", icon: <MessageSquare size={18} /> },
  { title: "Family Groups", href: "/admin/dashboard/groups", icon: <Users size={18} /> },
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

const memberNavSidebarItems = [
  { title: 'Dashboard', href: '/member/dashboard', icon: <LayoutDashboard size={18} /> },
  { title: 'Family', href: '/member/dashboard/family', icon: <Users size={18} /> },
  { title: 'Family Tree', href: '/member/dashboard/tree', icon: <Users2 size={18} /> },
  { title: 'Gallery', href: '/member/dashboard/gallery', icon: <ImageIcon size={18} /> },
  { title: 'Events', href: '/member/dashboard/events', icon: <CalendarDays size={18} /> },
  { title: 'Calendar', href: '/member/dashboard/calendar', icon: <CalIcon size={18} /> },
  { title: 'Messages', href: '/member/dashboard/messages', icon: <MessageSquare size={18} /> },
  { title: 'Family Groups', href: '/member/dashboard/groups', icon: <Users size={18} /> },
  { title: 'Announcements', href: '/member/dashboard/announcements', icon: <Megaphone size={18} /> },
  { title: 'Notifications', href: '/member/dashboard/notifications', icon: <Bell size={18} /> },
  { title: 'Documents', href: '/member/dashboard/documents', icon: <Folder size={18} /> },
  { title: 'AI Assistant', href: '/member/dashboard/ai', icon: <Sparkles size={18} /> },
];

const bottomNavItems = [
  { title: "Profile", href: "profile", icon: <UserCircle size={18} /> },
  { title: "Sign Out", href: "/login", icon: <LogOut size={18} /> },
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


import ChangePassword from './pages/ChangePassword';

function ProtectedAdminRoute({ children }) {
  const params = new URLSearchParams(window.location.search);
  const token = localStorage.getItem('token') || params.get('token');
  const userStr = localStorage.getItem('user') || params.get('user');
  let isValid = false;
  let role = null;
  let mustChange = false;
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user?.role?.toUpperCase();
      mustChange = user?.mustChangePassword === true;
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') {
        isValid = true;
      }
    } catch (e) {}
  }
  if (!isValid) return <Navigate to="/login" replace />;
  if (role === 'MEMBER' && !isValid) return <Navigate to="/member/dashboard" replace />;
  
  // Enforce First Login Flow
  if (mustChange) {
    return <Navigate to="/admin/change-password" replace />;
  }

  return children;
}

function ProtectedMemberRoute({ children }) {
  const params = new URLSearchParams(window.location.search);
  const token = localStorage.getItem('token') || params.get('token');
  const userStr = localStorage.getItem('user') || params.get('user');
  let isValid = false;
  let role = null;
  let mustChangePassword = false;
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user?.role?.toUpperCase();
      mustChangePassword = user?.mustChangePassword === true;
      if (role === 'MEMBER') {
        isValid = true;
      }
    } catch (e) {}
  }
  
  if (!isValid && (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN')) return <Navigate to="/admin/dashboard" replace />;
  if (!isValid) return <Navigate to="/login" replace />;
  if (mustChangePassword) return <Navigate to="/member/change-password" replace />;
  
  return children;
}

function AdminChangePasswordRoute({ children }) {
  const params = new URLSearchParams(window.location.search);
  const token = localStorage.getItem('token') || params.get('token');
  const userStr = localStorage.getItem('user') || params.get('user');
  let isValid = false;
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      const role = user?.role?.toUpperCase();
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') {
        isValid = true;
      }
    } catch (e) {}
  }
  if (!isValid) return <Navigate to="/login" replace />;
  return children;
}

function MemberChangePasswordRoute({ children }) {
  const params = new URLSearchParams(window.location.search);
  const token = localStorage.getItem('token') || params.get('token');
  const userStr = localStorage.getItem('user') || params.get('user');
  let isValid = false;
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      const role = user?.role?.toUpperCase();
      if (role === 'MEMBER') {
        isValid = true;
      }
    } catch (e) {}
  }
  if (!isValid) return <Navigate to="/login" replace />;
  return children;
}

function PublicRoute({ children }) {
  // Purposefully stripped of automatic redirect logic.
  // The system must explicitly force manual login as per strict architectural requirements.
  return children;
}

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const queryClient = new QueryClient();
window.__queryClient = queryClient;

function SessionWatcher() {
  const [showConflict, setShowConflict] = React.useState(false);

  React.useEffect(() => {
    // Current valid tokens initialized on mount for this specific tab's React tree
    let initialToken = localStorage.getItem('token');
    
    const handleStorageChange = (e) => {
      // If another tab wiped the token entirely (pure logout)
      if (e.key === 'token' && !e.newValue) {
        window.location.href = '/login';
        return;
      }
      
      // If another tab set a NEW active token (switched user/login)
      if (e.key === 'token' && e.newValue && e.newValue !== initialToken) {
        setShowConflict(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (!showConflict) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Session Changed</h2>
        <p className="text-sm text-slate-500 max-w-[300px] mb-6">
          Your account has been changed in another tab. 
          Please refresh to continue with the new session or log out completely.
        </p>
        <div className="flex gap-3 mt-6">
          <button onClick={() => {
             localStorage.removeItem('token');
             localStorage.removeItem('user');
             window.location.href = '/login';
          }} className="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition-colors">
            Logout
          </button>
          <button onClick={() => window.location.reload()} className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-lg shadow-blue-600/30">
            Refresh Session
          </button>
        </div>
      </div>
    </div>
  );
}

function AppLayer() {
  return (
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SessionWatcher />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<Navigate to="/login?mode=signup" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/member/login" element={<Navigate to="/login" replace />} />

          {/* FIRST LOGIN ROUTE */}
          <Route path="/admin/change-password" element={<AdminChangePasswordRoute><ChangePassword /></AdminChangePasswordRoute>} />
          <Route path="/member/change-password" element={<MemberChangePasswordRoute><ChangePassword /></MemberChangePasswordRoute>} />

          {/* ADMIN PORTAL */}
          <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminMainLayout navItems={adminNavSidebarItems} bottomNav={bottomNavItems} /></ProtectedAdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="assistant" element={<AIAssistant />} />
            <Route path="messages" element={<Messages />} />
            <Route path="groups" element={<FamilyGroups />} />
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
            <Route path="*" element={<ComingSoon title="Page Not Found" />} />
          </Route>

          {/* MEMBER PORTAL */}
          <Route path="/member/dashboard" element={<ProtectedMemberRoute><MemberMainLayout navItems={memberNavSidebarItems} bottomNav={bottomNavItems} /></ProtectedMemberRoute>}>
            <Route index element={<MemberDashboard />} />
            <Route path="family" element={<MemberFamily />} />
            <Route path="gallery" element={<MemberGallery />} />
            <Route path="events" element={<MemberEvents />} />
            <Route path="tree" element={<MemberFamilyTree />} />
            <Route path="messages" element={<MemberMessages />} />
            <Route path="groups" element={<MemberFamilyGroups />} />
            <Route path="announcements" element={<MemberAnnouncements />} />
            <Route path="notifications" element={<MemberNotifications />} />
            <Route path="documents" element={<MemberDocuments />} />
            <Route path="ai" element={<MemberAIAssistant />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="profile-setup" element={<MemberProfileSetup />} />
            <Route path="settings" element={<MemberSettings />} />
            <Route path="calendar" element={<MemberCalendarPage />} />
            <Route path="*" element={<ComingSoon title="Page Not Found" />} />
          </Route>
        </Routes>
      </BrowserRouter>
  );
}

function App() {
  // Execute synchronous extraction to prevent child components from firing Bearer Null 401 traps
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');
  const userStr = params.get('user');
  if (token && userStr) {
    localStorage.setItem('token', token);
    localStorage.setItem('user', userStr);
  }

  useEffect(() => {
    // Interceptor to handle session expiration (401 Unauthorized) globally
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          const url = error.config?.url || '';
          if (!url.includes('/auth/') && !url.includes('/login') && !url.includes('/signup')) {
             globalLogout();
          }
        }
        return Promise.reject(error);
      }
    );
    const interceptor2 = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
          const url = error.config?.url || '';
          if (!url.includes('/auth/') && !url.includes('/login') && !url.includes('/signup')) {
             globalLogout();
          }
        }
        return Promise.reject(error);
      }
    );

    if (token && userStr) {
      window.history.replaceState(null, '', window.location.pathname);
    }

    const socketURL = (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com');
    const socket = io(socketURL);
    window.__activeSocket = socket;
    socket.on('member.created', () => queryClient.invalidateQueries({ queryKey: ['members'] }));
    socket.on('member.invited', () => queryClient.invalidateQueries({ queryKey: ['members'] }));
    socket.on('member.updated', () => queryClient.invalidateQueries({ queryKey: ['members'] }));
    return () => {
        socket.disconnect();
        window.__activeSocket = null;
        axios.interceptors.response.eject(interceptor);
        api.interceptors.response.eject(interceptor2);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
       <AppLayer />
       <Toaster position="top-right" />
    </QueryClientProvider>
  );
}

export default App;
