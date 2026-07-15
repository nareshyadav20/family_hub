import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Moon, Sun, Settings as SettingsIcon, UserCircle, LogOut, Menu, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import axios from 'axios';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

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
    const socket = io(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}`);
    socket.on('notification.created', (notif) => {
       queryClient.invalidateQueries(['header_notifications']);
    });
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: notifications = [] } = useQuery({
     queryKey: ['header_notifications'],
     queryFn: async () => {
        const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/notifications`, {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return res.data;
     },
     refetchInterval: 30000
  });

  const { data: memberData } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/member/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
     localStorage.clear();
     sessionStorage.clear();
     navigate('/login');
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
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 w-[260px] bg-white dark:bg-slate-950 flex flex-col z-50 border-r border-slate-100 dark:border-slate-800 transition-transform duration-300 font-sans",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-[76px] flex items-center justify-between px-6 shrink-0 mt-2 border-b border-slate-100 dark:border-slate-800/60 pb-2 mb-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#12b0ad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
             </div>
             <div className="flex flex-col leading-tight pt-1">
               <span className="font-bold text-[17px] text-slate-900 dark:text-white tracking-tight">FamilyHub OS</span>
               <span className="text-[12.5px] font-medium text-slate-500 mt-0.5">Admin Portal</span>
             </div>
          </div>
          <button className="lg:hidden text-slate-500 p-1" onClick={() => setIsMobileMenuOpen(false)}>
             <X size={20} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-4 space-y-[2px] scrollbar-none pb-6">
          {navItems.map((item, idx) => {
            const isActive = item.href === '/admin/dashboard' ? (location.pathname === '/admin/dashboard' || location.pathname === '/admin/dashboard/') : location.pathname.startsWith(item.href);
            return (
              <Link 
                key={idx} 
                to={item.href} 
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200 group relative",
                  isActive 
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/20" 
                    : "text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                )}
              >
                {React.cloneElement(item.icon, { 
                  className: isActive ? "opacity-100" : "opacity-60", 
                  size: 20, 
                  strokeWidth: 2 
                })}
                <span className="mt-0.5">{item.title}</span>
                {item.title === 'Join Requests' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-[22px] h-[22px] bg-[#EF4444] text-white text-[11px] font-bold rounded-full flex items-center justify-center">
                    8
                  </span>
                )}
              </Link>
            )
          })}

          <div className="pt-4 mt-6 border-t border-slate-100 dark:border-slate-800 space-y-[2px]">
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
                  className="flex items-center gap-3.5 px-4 py-3 rounded-xl text-[14px] font-medium text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors"
                >
                  {React.cloneElement(item.icon, { size: 20, className: "opacity-60", strokeWidth: 2 })}
                  <span className="mt-0.5">{item.title}</span>
                </Link>
             ))}
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="h-20 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 sticky top-0 gap-3">
          
          <div className="flex items-center gap-3 flex-1">
             <button className="lg:hidden text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 p-2 rounded-lg" onClick={() => setIsMobileMenuOpen(true)}>
               <Menu size={22} />
             </button>
             
             {isSearchOpen ? (
                <div className="relative w-full max-w-[300px] animate-in fade-in slide-in-from-right-4">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input autoFocus onBlur={() => setIsSearchOpen(false)} onKeyDown={handleGlobalSearch} placeholder="Search..." className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50 dark:bg-slate-900 border-none text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#12b0ad]/10 transition-all" />
                </div>
             ) : (
                <div className="relative w-72 hidden md:block">
                   <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <input autoFocus={false} onKeyDown={handleGlobalSearch} placeholder="Search family, events..." className="w-full h-10 pl-10 pr-4 rounded-full bg-slate-50 dark:bg-slate-900 border-none text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-[#12b0ad]/10 transition-all text-slate-700 dark:text-slate-300" />
                </div>
             )}
          </div>
          
          <div className="flex items-center gap-1 md:gap-5 shrink-0">
             {!isSearchOpen && (
                <button onMouseDown={(e) => { e.preventDefault(); setIsSearchOpen(true); }} className="md:hidden text-slate-500 hover:text-slate-800 p-2">
                  <Search size={20} />
                </button>
             )}
             <button onClick={toggleTheme} className="hidden sm:block text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors p-2 outline-none cursor-pointer border border-transparent">
               {theme === 'dark' ? <Sun size={20} strokeWidth={2} /> : <Moon size={20} strokeWidth={2} />}
             </button>
             
             <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 transition-colors outline-none pt-1 cursor-pointer">
                  <Bell size={20} strokeWidth={2.5} />
                  {notifications.filter(n => !n.isRead && !localStorage.getItem(`notif_read_${n.id}`)).length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-[#EF4444] text-[10px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950 shadow-sm">
                       {notifications.filter(n => !n.isRead && !localStorage.getItem(`notif_read_${n.id}`)).length}
                    </span>
                  )}
                </button>
                {showNotifs && (
                   <div className="absolute top-10 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden outline-none">
                      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                         <span className="font-bold text-sm">Notifications</span>
                         <Link to="/admin/dashboard/notifications" onClick={() => setShowNotifs(false)} className="text-xs text-blue-600 font-semibold cursor-pointer">View</Link>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                         {notifications.slice(0, 5).map((n, i) => (
                           <Link to="/admin/dashboard/notifications" onClick={() => setShowNotifs(false)} key={i} className="block px-4 py-3 text-sm border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                             <p className="font-bold text-slate-900 dark:text-white mb-0.5">{n.title}</p>
                             <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{n.message}</p>
                           </Link>
                         ))}
                         {notifications.length === 0 && (
                            <div className="px-4 py-6 text-center text-xs text-slate-500">
                               No new notifications
                            </div>
                         )}
                      </div>
                      <Link to="/admin/dashboard/notifications" onClick={() => setShowNotifs(false)} className="block w-full text-center text-[13px] font-bold bg-slate-50/50 dark:bg-slate-800/50 py-3 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                         View All Notifications
                      </Link>
                   </div>
                )}
             </div>
             
             {/* Dynamic Auth Header */}
             <div className="relative pl-1 md:pl-3 border-l border-transparent md:border-slate-200 dark:md:border-slate-800">
                <button onClick={() => setShowAvatarMenu(!showAvatarMenu)} className="flex items-center gap-2 md:gap-3 cursor-pointer outline-none hover:opacity-90 transition-opacity p-1">
                   <div className="w-9 h-9 md:w-10 md:h-10 rounded-full overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm relative shrink-0">
                      <img src={activeUser.avatar || "https://i.pravatar.cc/150?u=4242"} className="w-full h-full object-cover" alt="Profile" />
                      <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                   </div>
                   <div className="hidden sm:flex flex-col items-start leading-[1.2]">
                      <span className="font-bold text-[15px] text-slate-900 dark:text-white capitalize tracking-tight">{fullName}</span>
                      <span className="text-[12px] font-medium text-slate-500">{userRole}</span>
                   </div>
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="hidden sm:block text-slate-400 ml-1 mt-1"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>

                {showAvatarMenu && (
                   <div className="absolute top-14 right-0 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col pt-1 outline-none">
                       <Link to="/admin/dashboard/profile" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[13px] font-bold text-slate-700 dark:text-slate-300 transition-colors">
                          <UserCircle size={18} className="text-slate-400" /> My Profile
                       </Link>
                       <Link to="/admin/dashboard/settings" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-[13px] font-bold text-slate-700 dark:text-slate-300 transition-colors">
                          <SettingsIcon size={18} className="text-slate-400" /> Settings
                       </Link>
                       <div className="h-px bg-slate-100 dark:bg-slate-800 my-1"></div>
                       <button onClick={handleLogout} className="flex items-center w-full gap-3 px-5 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-[13px] font-bold transition-colors">
                          <LogOut size={18} /> Logout
                       </button>
                   </div>
                )}
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-10 md:py-10 bg-[#F8FAFC] dark:bg-slate-950/50 w-full">
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
