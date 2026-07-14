import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Moon, Sun, Users, LogOut, Settings as SettingsIcon, UserCircle } from 'lucide-react';
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
    const socket = io('http://localhost:5000');
    socket.on('notification.created', (notif) => {
       queryClient.invalidateQueries(['header_notifications']);
    });
    return () => socket.disconnect();
  }, [queryClient]);
  
  const { data: notifications = [] } = useQuery({
     queryKey: ['header_notifications'],
     queryFn: async () => {
        const res = await axios.get('http://localhost:5000/api/v1/notifications', {
           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        return res.data;
     },
     refetchInterval: 30000
  });

  const { data: memberData } = useQuery({
    queryKey: ['memberProfile'],
    queryFn: async () => {
      const res = await axios.get('http://localhost:5000/api/v1/member/profile', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  const handleLogout = () => {
     localStorage.clear();
     sessionStorage.clear();
     navigate('/member/login');
  };

  return (
    <div className="flex h-screen w-full bg-[#F4F7FB] dark:bg-slate-900 overflow-hidden font-sans text-slate-800 dark:text-slate-200">
      
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-white dark:bg-slate-950 flex flex-col z-20 border-r border-slate-100 dark:border-slate-800">
        
        {/* Logo Section */}
        <div className="h-[76px] flex items-center px-6 shrink-0 mt-2">
           <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/20 text-white">
                 <Users size={20} />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-[17px] text-slate-900 dark:text-white tracking-tight">FamilyHub</span>
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase">MEMBER PORTAL</span>
              </div>
           </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-none pb-4 relative flex flex-col">
          <div className="space-y-1">
            {navItems.map((item, idx) => {
              const isActive = item.href === '/member/dashboard' ? (location.pathname === '/member/dashboard' || location.pathname === '/member/dashboard/') : location.pathname.startsWith(item.href);
              return (
                <Link 
                  key={idx} 
                  to={item.href} 
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-medium transition-all duration-200",
                    isActive 
                      ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/20" 
                      : "text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
                  )}
                >
                  {React.cloneElement(item.icon, { className: isActive ? "opacity-100" : "opacity-60" })}
                  {item.title}
                </Link>
              )
            })}
          </div>
          
          {/* Bottom Actions */}
          <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-1 shrink-0">
            {bottomNav.map((item, idx) => (
               <Link 
                 key={idx} 
                 to={item.href} 
                 onClick={(e) => { if (item.title === 'Sign Out') { e.preventDefault(); localStorage.clear(); sessionStorage.clear(); window.location.href = '/member/login'; } }}
                 className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[14px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
               >
                 {React.cloneElement(item.icon, { className: "opacity-60" })}
                 {item.title}
               </Link>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header */}
        <header className="h-[76px] bg-white dark:bg-slate-950 flex items-center justify-between px-8 shrink-0 z-10 border-b border-transparent shadow-[0_2px_10px_rgba(0,0,0,0.015)]">
          
          <div className="flex items-center gap-4 flex-1">
             <div className="relative w-full max-w-sm hidden md:block">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
               <input 
                 placeholder="Search family..." 
                 className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 rounded-full text-sm border-transparent focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
               />
             </div>
          </div>
          
          {/* Header Right Actions */}
          <div className="flex items-center gap-5">
             <button onClick={toggleTheme} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
               {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <div className="relative">
                <button onClick={() => setShowNotifs(!showNotifs)} className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors pt-1 cursor-pointer">
                  <Bell size={20} />
                  {notifications.filter(n => !n.isRead && !localStorage.getItem(`notif_read_${n.id}`)).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-[16px] h-[16px] bg-[#EF4444] text-[9px] font-bold text-white rounded-full flex items-center justify-center border-2 border-white dark:border-slate-950">
                       {notifications.filter(n => !n.isRead && !localStorage.getItem(`notif_read_${n.id}`)).length}
                    </span>
                  )}
                </button>
                {showNotifs && (
                   <div className="absolute top-10 right-0 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden outline-none">
                      <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-slate-800">
                         <span className="font-bold text-sm">Notifications</span>
                         <Link to="/member/dashboard/notifications" onClick={() => setShowNotifs(false)} className="text-xs text-blue-600 font-semibold cursor-pointer">View</Link>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                         {notifications.slice(0, 5).map((n, i) => (
                           <Link to="/member/dashboard/notifications" onClick={() => setShowNotifs(false)} key={i} className="block px-4 py-3 text-sm border-b border-slate-50 dark:border-slate-800 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
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
                      <Link to="/member/dashboard/notifications" onClick={() => setShowNotifs(false)} className="block w-full text-center text-[13px] font-bold bg-slate-50 dark:bg-slate-800/50 py-3 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                         View All Notifications
                      </Link>
                   </div>
                )}
             </div>
             
             <div className="relative">
                <button onClick={() => setShowAvatarMenu(!showAvatarMenu)} className="w-9 h-9 rounded-full bg-[#129AAB] text-white flex items-center justify-center font-bold text-sm uppercase shadow-sm cursor-pointer hover:ring-2 hover:ring-offset-2 hover:ring-[#129AAB] transition-all overflow-hidden relative">
                   {memberData?.user?.avatar ? (
                      <img src={memberData.user.avatar} className="w-full h-full object-cover" alt="Profile" />
                   ) : (
                      memberData?.user?.firstName ? memberData.user.firstName.charAt(0) : "ME"
                   )}
                </button>
                {showAvatarMenu && (
                   <div className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col pt-2">
                       <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col">
                           <span className="font-bold text-slate-900 dark:text-white truncate">
                              {memberData?.user ? `${memberData.user.firstName} ${memberData.user.lastName}` : "Loading..."}
                           </span>
                           <span className="text-xs text-slate-500 truncate">{memberData?.user?.email || "No Email Associated"}</span>
                       </div>
                       <Link to="/member/dashboard/profile" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-medium transition-colors">
                          <UserCircle size={18} className="text-slate-400" /> My Profile
                       </Link>
                       <Link to="/member/dashboard/settings" onClick={() => setShowAvatarMenu(false)} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-sm font-medium transition-colors">
                          <SettingsIcon size={18} className="text-slate-400" /> Settings
                       </Link>
                       <button onClick={handleLogout} className="flex items-center w-full gap-3 px-5 py-3 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 text-sm font-bold border-t border-slate-100 dark:border-slate-800 transition-colors">
                          <LogOut size={18} /> Logout
                       </button>
                   </div>
                )}
             </div>
          </div>
        </header>

        {/* Page Scrollable Content */}
        <div className="flex-1 overflow-y-auto w-full pt-8 pb-20 px-6 md:px-10">
           <div className="max-w-[1200px] h-full mx-auto">
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
