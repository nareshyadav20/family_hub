import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Events from './pages/Events';
import Login from './pages/Login';
import Signup from './pages/Signup';
import FamilyTree from './pages/FamilyTree';
import FamilyHistory from './pages/FamilyHistory';
import JoinRequests from './pages/JoinRequests';
import Gallery from './pages/Gallery';
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
  { title: "Dashboard", href: "/", icon: <LayoutDashboard size={18} /> },
  { title: "AI Assistant", href: "/assistant", icon: <Sparkles size={18} /> },
  { title: "Messages", href: "/messages", icon: <MessageSquare size={18} /> },
  { title: "Members", href: "/members", icon: <Users size={18} /> },
  { title: "Join Requests", href: "/requests", icon: <UserPlus size={18} /> },
  { title: "Family Tree", href: "/tree", icon: <GitFork size={18} /> },
  { title: "Family History", href: "/history", icon: <History size={18} /> },
  { title: "Events", href: "/events", icon: <CalendarDays size={18} /> },
  { title: "Calendar", href: "/calendar", icon: <CalIcon size={18} /> },
  { title: "Gallery", href: "/gallery", icon: <ImageIcon size={18} /> },
  { title: "Finance", href: "/finance", icon: <DollarSign size={18} /> },
  { title: "Assets", href: "/assets", icon: <Briefcase size={18} /> },
  { title: "Digital Vault", href: "/vault", icon: <Folder size={18} /> },
  { title: "Documents", href: "/documents", icon: <FileText size={18} /> },
  { title: "Announcements", href: "/announcements", icon: <Megaphone size={18} /> },
  { title: "Polls", href: "/polls", icon: <BarChart size={18} /> },
  { title: "Analytics", href: "/analytics", icon: <PieChart size={18} /> },
  { title: "Notifications", href: "/notifications", icon: <Bell size={18} /> },
  { title: "Settings", href: "/settings", icon: <SettingsIcon size={18} /> },
];

const bottomNavItems = [
  { title: "Profile", href: "/profile", icon: <UserCircle size={18} /> },
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

function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/" element={<MainLayout navItems={navSidebarItems} bottomNav={bottomNavItems} />}>
          <Route index element={<Dashboard />} />
          <Route path="assistant" element={<AIAssistant />} />
          <Route path="messages" element={<Messages />} />
          <Route path="members" element={<Members />} />
          <Route path="requests" element={<JoinRequests />} />
          <Route path="tree" element={<FamilyTree />} />
          <Route path="history" element={<FamilyHistory />} />
          <Route path="events" element={<Events />} />
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

export default App;

