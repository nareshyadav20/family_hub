import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Moon, Sun, Settings as SettingsIcon, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import { globalLogout } from '../utils/auth';

export default function MainLayout({ navItems, bottomNav }) {
  const location = useLocation();
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [showAvatarMenu, setShowAvatarMenu] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

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
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/member/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
     globalLogout();
  };

  const handleGlobalSearch = (e) => {
     if (e.key === 'Enter' && e.target.value.trim()) {
        navigate(`/admin/dashboard/members?search=${encodeURIComponent(e.target.value.trim())}`);
     }
  };

  const activeUser = memberData?.user || JSON.parse(localStorage.getItem('user')) || {};
  const fullName = `${activeUser.firstName || 'System'} ${activeUser.lastName || 'Admin'}`.trim();
  const userRole = activeUser.role === 'SUPER_ADMIN' ? 'Super Admin' : activeUser.role === 'ADMIN' ? 'Family Admin' : 'Admin';

  return (
    <div className="flex h-screen w-full bg-[#FCFBFF] overflow-hidden text-[#1F2430] font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-[280px] bg-white flex flex-col z-50 border-r border-[#E9E5F8] transition-transform duration-300 font-sans lg:m-4 lg:mr-0 lg:rounded-3xl shadow-2xl lg:shadow-sm",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-[76px] flex items-center justify-between px-6 shrink-0 mt-2 lg:mt-4 border-b border-[#E9E5F8] pb-4 mb-4">
          <Link to="/admin/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              {/* Cropped Heart-shaped Family Tree Logo Image */}
              <img src="/logo.png" alt="Family Hub Logo" className="w-12 h-12 shrink-0 object-contain rounded-xl" />
             <div className="flex flex-col leading-none">
               <div className="flex items-center gap-1">
                 <span className="font-bold text-[20px] text-[#2E1E6B] tracking-tight">Family</span>
                 <span className="font-bold text-[20px] text-[#7C5CFC] tracking-tight">Hub</span>
               </div>
               <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Admin Portal</span>
             </div>
          </Link>
          <button className="lg:hidden text-[#6B7280] p-1" onClick={() => setIsMobileMenuOpen(false)}>
             <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 space-y-1.5 scrollbar-none pb-6">
          {navItems.map((item, idx) => {
            const isActive = item.href === '/admin/dashboard' ? (location.pathname === '/admin/dashboard' || location.pathname === '/admin/dashboard/') : location.pathname.startsWith(item.href);
            return (
              <Link 
                key={idx} 
                to={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-[14px] font-semibold transition-all duration-200 group relative",
                  isActive 
                    ? "bg-[#EEE8FF] text-[#7C5CFC] shadow-sm before:content-[''] before:absolute before:left-0 before:top-3 before:bottom-3 before:w-1 before:bg-[#7C5CFC] before:rounded-r-full" 
                    : "text-[#6B7280] hover:bg-[#FAF8FF] hover:text-[#7C5CFC]"
                )}
              >
                {React.cloneElement(item.icon, { 
                  className: isActive ? "text-[#7C5CFC]" : "text-[#6B7280]", 
                  size: 20, 
                  strokeWidth: 2 
                })}
                <span className="mt-0.5">{item.title}</span>
              </Link>
            )
          })}

          <div className="pt-4 mt-6 border-t border-[#E9E5F8] space-y-1.5">
             {bottomNav.map((item, idx) => (
                <Link 
                  key={idx}
                  to={item.href}
                  onClick={(e) => { 
                    if (item.title === 'Sign Out') { 
                      e.preventDefault(); 
                      handleLogout(); 
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

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="admin-header-outer h-16 lg:h-20 bg-transparent flex items-center justify-between px-2 lg:px-4 md:px-8 shrink-0 z-10 sticky top-0 gap-3 mt-0 lg:mt-4">
          <div className="admin-header-inner bg-white lg:rounded-3xl shadow-sm border-b lg:border border-[#E9E5F8] w-full h-full flex items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-3 flex-1">
               <button className="lg:hidden text-[#6B7280] hover:bg-[#FAF8FF] p-2 rounded-xl" onClick={() => setIsMobileMenuOpen(true)}>
                 <Menu size={22} />
               </button>
               
               {isSearchOpen ? (
                  <div className="relative w-full max-w-[300px] animate-in fade-in slide-in-from-right-4">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                    <input autoFocus onBlur={() => setIsSearchOpen(false)} onKeyDown={handleGlobalSearch} placeholder="Search..." className="w-full h-10 pl-10 pr-4 rounded-2xl bg-[#FAF8FF] border border-[#E9E5F8] text-[13px] font-semibold text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all" />
                  </div>
               ) : (
                  <div className="relative w-72 hidden md:block">
                     <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
                     <input autoFocus={false} onKeyDown={handleGlobalSearch} placeholder="Search family, events..." className="w-full h-10 pl-10 pr-4 rounded-2xl bg-[#FAF8FF] border border-[#E9E5F8] text-[13px] font-semibold text-[#1F2430] focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all" />
                  </div>
               )}
            </div>
            
            <div className="flex items-center gap-1 md:gap-5 shrink-0">
               {!isSearchOpen && (
                  <button onMouseDown={(e) => { e.preventDefault(); setIsSearchOpen(true); }} className="md:hidden text-[#6B7280] hover:text-[#7C5CFC] p-2">
                    <Search size={20} />
                  </button>
               )}
               
               <div className="relative">
                   <button onClick={() => navigate('/admin/dashboard/notifications')} className="relative text-[#6B7280] hover:text-[#7C5CFC] transition-colors outline-none pt-1 cursor-pointer">
                     <Bell size={20} strokeWidth={2.5} />
                     {notifications.filter(n => !n.isRead && !localStorage.getItem(`notif_read_${n.id}`)).length > 0 && (
                       <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[#EF5350] text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                          {notifications.filter(n => !n.isRead && !localStorage.getItem(`notif_read_${n.id}`)).length}
                       </span>
                     )}
                   </button>
               </div>
               
               {/* Dynamic Auth Header */}
               <div className="relative pl-1 md:pl-3 lg:border-l border-[#E9E5F8]">
                  <button onClick={() => setShowAvatarMenu(!showAvatarMenu)} className="flex items-center gap-2 md:gap-3 cursor-pointer outline-none hover:opacity-90 transition-opacity p-1">
                     <div className="w-8 h-8 lg:w-10 lg:h-10 rounded-full overflow-hidden border-2 border-white shadow-md relative shrink-0">
                        <img src={activeUser.avatar || "https://i.pravatar.cc/150?u=4242"} className="w-full h-full object-cover" alt="Profile" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#2EB67D] border-2 border-white rounded-full"></span>
                     </div>
                     <div className="hidden sm:flex flex-col items-start leading-[1.2]">
                        <span className="font-bold text-[15px] text-[#1F2430] capitalize tracking-tight">{fullName}</span>
                        <span className="text-[12px] font-semibold text-[#6B7280]">{userRole}</span>
                     </div>
                     <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block text-[#6B7280] ml-1 mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                  </button>

                  {showAvatarMenu && (
                     <div className="avatar-menu-dropdown absolute top-14 right-0 w-56 bg-white border border-[#E9E5F8] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col pt-1 outline-none">
                         <Link to="/admin/dashboard/profile" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAF8FF] text-[13px] font-bold text-[#1F2430] transition-colors">
                            <UserCircle size={18} className="text-[#6B7280]" /> My Profile
                         </Link>
                         <Link to="/admin/dashboard/settings" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-[#FAF8FF] text-[13px] font-bold text-[#1F2430] transition-colors">
                            <SettingsIcon size={18} className="text-[#6B7280]" /> Settings
                         </Link>
                         <div className="h-px bg-[#E9E5F8] my-1"></div>
                         <button onClick={handleLogout} className="flex items-center w-full gap-3 px-5 py-3 text-[#EF5350] hover:bg-[#FAF8FF] text-[13px] font-bold transition-colors">
                            <LogOut size={18} /> Logout
                         </button>
                     </div>
                  )}
               </div>
            </div>
          </div>
        </header>

        <div className="admin-content-area flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-10 bg-[#FAF8FF] w-full lg:rounded-tl-[32px] mt-0 lg:mt-4 border-t lg:border-l border-[#E9E5F8] shadow-inner">
           <div className="max-w-[1400px] h-full w-full mx-auto">
              <Outlet />
           </div>
        </div>
      </main>
      
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-none::-webkit-scrollbar { display: none; }
        .scrollbar-none { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
