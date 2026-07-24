import React, { useState, useEffect, Suspense } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu, X, UserCircle, SettingsIcon, LogOut } from 'lucide-react';
import { cn } from '@/utils/cn';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { globalLogout } from '../../utils/auth';
import PageLoader from '../../components/loaders/PageLoader';

export default function MainLayout({ navItems, bottomNav }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const queryClient = useQueryClient();
  useEffect(() => {
    const socket = io(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}`);
    socket.on('notification.created', (notif) => {
      queryClient.invalidateQueries(['header_notifications']);
    });
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: notifications = [] } = useQuery({
    queryKey: ['header_notifications'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    },
    refetchInterval: 30000
  });

  const { data: memberData } = useQuery({
    queryKey: ['memberProfile'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/member/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const handleGlobalSearch = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      navigate(`/member/dashboard/family?search=${encodeURIComponent(e.target.value.trim())}`);
    }
  };

  const activeUser = memberData?.user || JSON.parse(localStorage.getItem('user')) || {};
  const fullName = `${activeUser.firstName || 'Family'} ${activeUser.lastName || 'Member'}`.trim();
  const userRole = 'Member';

  return (
    <div className="flex h-screen w-full bg-[#FCFBFF] overflow-hidden text-[#1F2430] font-sans">

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-[270px] bg-white flex flex-col z-50 border-r border-[#E9E5F8] transition-transform duration-300 font-sans m-4 mr-0 rounded-3xl shadow-sm",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>

        {/* Logo Section */}
        <div className="h-[76px] flex items-center justify-between px-6 shrink-0 mt-4 border-b border-[#E9E5F8] pb-4 mb-4">
          <Link to="/member/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
            <img src="/logo.png" alt="Family Hub Logo" className="w-12 h-12 shrink-0 object-contain rounded-xl" />
            <div className="flex flex-col leading-none">
              <div className="flex items-center gap-1">
                <span className="font-bold text-[20px] text-[#2E1E6B] tracking-tight">Family</span>
                <span className="font-bold text-[20px] text-[#7C5CFC] tracking-tight">Hub</span>
              </div>
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Member Portal</span>
            </div>
          </Link>
          <button className="lg:hidden text-[#6B7280] p-1" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 overflow-y-auto px-1 py-2 scrollbar-none relative flex flex-col justify-between">
          <div className="space-y-1.5">
            {navItems.map((item, index) => {
              const isActive = item.href === '/member/dashboard' ? (location.pathname === '/member/dashboard' || location.pathname === '/member/dashboard/') : location.pathname.startsWith(item.href);
              return (
                <Link key={index} to={item.href} onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-[14px] transition-all font-semibold text-[13px] mx-3",
                    isActive
                      ? "bg-[#FAF8FF] text-[#7C5CFC] shadow-[0_2px_10px_rgb(124,92,252,0.08)]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <div className={cn("p-1.5 rounded-xl flex items-center justify-center shrink-0 transition-all", isActive ? "bg-white text-[#7C5CFC] shadow-sm border border-[#E9E5F8]" : "text-slate-400")}>{item.icon}</div>
                  {item.title}
                </Link>
              );
            })}
          </div>

          <div className="px-4 py-4 mt-8 border-t border-[#E9E5F8] mx-2">
            {bottomNav.map((item, index) => (
              <Link key={index} to={item.href}
                onClick={(e) => {
                  if (item.title === 'Sign Out') {
                    e.preventDefault();
                    globalLogout();
                  }
                }}
                className="flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold text-[#6B7280] hover:bg-[#FAF8FF] hover:text-[#7C5CFC] transition-colors"
              >
                {React.cloneElement(item.icon, { size: 20, className: "text-[#6B7280]", strokeWidth: 2 })}
                <span className="mt-0.5">{item.title}</span>
              </Link>
            ))}
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">

        {/* Top Header */}
        <header className="h-20 bg-transparent flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0 gap-3 mt-4">
          <div className="bg-white rounded-3xl shadow-sm border border-[#E9E5F8] w-full h-full flex items-center justify-between px-6">
            <div className="flex items-center gap-3 flex-1">
              <button className="lg:hidden text-[#6B7280] hover:bg-[#FAF8FF] p-2 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu size={22} />
              </button>

              {isSearchOpen ? (
                <div className="relative w-full max-w-[300px] animate-in fade-in slide-in-from-right-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input autoFocus onBlur={() => setIsSearchOpen(false)} onKeyDown={handleGlobalSearch} placeholder="Search family..." className="w-full pl-9 pr-4 py-2 bg-[#FAF8FF] rounded-xl text-sm border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all font-semibold text-[#1F2430]" />
                </div>
              ) : (
                <div className="relative w-full max-w-sm hidden md:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                  <input onKeyDown={handleGlobalSearch} placeholder="Search family..." className="w-full pl-9 pr-4 py-2 bg-[#FAF8FF] rounded-xl text-sm border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all font-semibold text-[#1F2430]" />
                </div>
              )}
            </div>

            {/* Header Right Actions */}
            <div className="flex items-center gap-3 md:gap-5 shrink-0">
              {!isSearchOpen && (
                <button onMouseDown={(e) => { e.preventDefault(); setIsSearchOpen(true); }} className="md:hidden text-[#6B7280] hover:text-[#7C5CFC] hover:bg-[#FAF8FF] p-2 rounded-xl transition-all">
                  <Search size={20} />
                </button>
              )}
              <div className="relative">
                <button onClick={() => navigate('/member/dashboard/notifications')} className="relative text-[#6B7280] hover:text-[#7C5CFC] hover:bg-[#FAF8FF] p-2 rounded-xl transition-all">
                  <Bell size={20} />
                  {notifications.filter(n => !n.isRead && !localStorage.getItem(`notif_read_${n.id}`)).length > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full shadow-[0_0_0_2px_#fff]"></span>
                  )}
                </button>
                {showNotifs && (
                  <div className="absolute top-14 right-0 w-80 bg-white border border-[#E9E5F8] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden outline-none">
                    <div className="flex items-center justify-between p-4 border-b border-[#E9E5F8] bg-[#FAF8FF]">
                      <span className="font-bold text-sm text-[#1F2430]">Notifications</span>
                      <Link to="/member/dashboard/notifications" onClick={() => setShowNotifs(false)} className="text-xs text-[#7C5CFC] hover:text-[#6B49F6] font-bold cursor-pointer transition-colors">View All</Link>
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.slice(0, 5).map((n, i) => (
                        <Link to="/member/dashboard/notifications" onClick={() => setShowNotifs(false)} key={i} className="block px-4 py-3 text-sm border-b border-[#E9E5F8] last:border-b-0 hover:bg-[#FAF8FF] transition-colors cursor-pointer">
                          <p className="font-bold text-[#1F2430] mb-0.5">{n.title}</p>
                          <p className="text-[13px] text-slate-500 font-medium line-clamp-2">{n.message}</p>
                        </Link>
                      ))}
                      {notifications.length === 0 && (
                        <div className="px-4 py-8 text-center text-[13px] font-semibold text-slate-400">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-[1px] h-8 bg-[#E9E5F8] hidden sm:block mx-1"></div>

              <div className="relative">
                <button onClick={() => setShowAvatarMenu(!showAvatarMenu)} className="flex items-center gap-3 hover:opacity-80 transition-opacity pl-2">
                  <div className="text-right hidden sm:block">
                    <p className="text-[13px] font-bold text-[#1F2430] leading-none mb-1">{fullName}</p>
                    <p className="text-[11px] font-bold text-[#7C5CFC] uppercase tracking-wider">{userRole}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#7C5CFC] to-[#A088FF] text-white flex items-center justify-center font-bold text-sm shadow-md shadow-purple-500/20 shrink-0">
                    {activeUser.avatarUrl ? (
                      <img src={activeUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span>{activeUser.firstName?.[0] || ''}{activeUser.lastName?.[0] || ''}</span>
                    )}
                  </div>
                </button>

                {showAvatarMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAvatarMenu(false)}></div>
                    <div className="absolute right-0 top-14 w-56 bg-white border border-[#E9E5F8] rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 p-2 animate-in fade-in zoom-in duration-200">
                      <Link to="/member/dashboard/profile" onClick={() => setShowAvatarMenu(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-[#1F2430] hover:bg-[#FAF8FF] hover:text-[#7C5CFC] rounded-xl transition-colors">
                        <UserCircle size={16} /> My Profile
                      </Link>
                      <Link to="/member/dashboard/settings" onClick={() => setShowAvatarMenu(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-semibold text-[#1F2430] hover:bg-[#FAF8FF] hover:text-[#7C5CFC] rounded-xl transition-colors">
                        <SettingsIcon size={16} /> Settings
                      </Link>
                      <div className="h-[1px] bg-[#E9E5F8] my-1 mx-2"></div>
                      <button onClick={(e) => { e.preventDefault(); globalLogout(); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[13px] font-bold text-[#EF4444] hover:bg-red-50 rounded-xl transition-colors">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full pt-6 pb-20 px-4 md:px-10">
          <div className="max-w-[1200px] h-full mx-auto w-full">
            <Suspense fallback={<div className="pt-20"><PageLoader /></div>}>
              <Outlet />
            </Suspense>
          </div>
          {/* Page Content */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 scroll-smooth scrollbar-thin scrollbar-thumb-[#E9E5F8] scrollbar-track-transparent">
            <Outlet context={{ memberData }} />
          </div>
      </main>

    </div>
  );
}
