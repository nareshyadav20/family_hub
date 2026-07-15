import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

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
import Signup from './pages/Signup';

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

function RedirectExternal({ to }) {
  React.useEffect(() => {
    window.location.replace(to);
  }, [to]);
  return null;
}

function LogoutAndRedirect() {
  React.useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.replace('http://localhost:5174/login?join=true');
  }, []);
  return null;
}

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isValid = false;
  let role = null;
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user?.role;
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') {
        isValid = true;
      }
    } catch (e) {}
  }
  if (role === 'MEMBER' && !isValid) return <RedirectExternal to="http://localhost:5173/member/dashboard" />;
  if (!isValid) return <RedirectExternal to="http://localhost:5174/login?join=true" />;
  return children;
}

function ProtectedMemberRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  let isValid = false;
  let role = null;
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      role = user?.role;
      if (role === 'MEMBER') {
        isValid = true;
      }
    } catch (e) {}
  }
  if (!isValid && (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN')) return <RedirectExternal to="http://localhost:5173/admin/dashboard" />;
  if (!isValid) return <RedirectExternal to="http://localhost:5174/login?join=true" />;
  return children;
}

function PublicRoute({ children }) {
  // Purposefully stripped of automatic redirect logic.
  // The system must explicitly force manual login as per strict architectural requirements.
  return children;
}

import { QueryClient, QueryClientProvider, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { useEffect } from 'react';

const queryClient = new QueryClient();

function AppLayer() {
  return (
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<RedirectExternal to="http://localhost:5174/login?join=true" />} />
          <Route path="/login" element={<LogoutAndRedirect />} />
          <Route path="/signup" element={<RedirectExternal to="http://localhost:5174/login?join=true" />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/member" element={<Navigate to="/member/dashboard" replace />} />
          <Route path="/admin/login" element={<Navigate to="/login" replace />} />
          <Route path="/member/login" element={<Navigate to="/login" replace />} />

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
  useEffect(() => {
    // Intercept auth tokens passed from the website portal
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userStr = params.get('user');
    if (token && userStr) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', userStr);
      window.history.replaceState(null, '', window.location.pathname);
    }

    const socketURL = (window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com');
    const socket = io(socketURL);
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
