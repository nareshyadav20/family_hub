import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function MainLayout({ portalName = "Admin", navItems, bottomNav }) {
  const location = useLocation();

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100 font-sans">
      {/* Sidebar */}
      <aside className="w-[260px] flex-shrink-0 bg-white dark:bg-slate-950 flex flex-col z-20 border-r border-slate-100 dark:border-slate-800 transition-all font-sans">
        <div className="h-[76px] flex items-center px-6 shrink-0 mt-2">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-slate-900 dark:bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#12b0ad" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                </div>
             </div>
             <div className="flex flex-col leading-tight pt-1">
               <span className="font-bold text-[17px] text-slate-900 dark:text-white tracking-tight">FamilyHub OS</span>
               <span className="text-[12.5px] font-medium text-slate-500 mt-0.5">Family Admin</span>
             </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto pt-2 pb-6 px-4 space-y-[2px] scrollbar-none">
          {navItems.map((item, idx) => {
            const isActive = item.href === '/admin/dashboard' ? (location.pathname === '/admin/dashboard' || location.pathname === '/admin/dashboard/') : location.pathname.startsWith(item.href);
            return (
              <Link 
                key={idx} 
                to={item.href} 
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
        </nav>
        
        {/* User Card at bottom */}
        <div className="p-4 px-4 pb-4 mt-auto border-t border-slate-100 dark:border-slate-800">
           <div className="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-4 flex flex-col gap-4 border border-slate-100 dark:border-slate-800 shadow-sm">
              <div className="flex items-center gap-3 relative">
                 <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 relative">
                    <img src="https://i.pravatar.cc/150?u=a04258" className="w-full h-full rounded-full object-cover" alt="Profile" />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#10B981] border-2 border-white dark:border-slate-900 rounded-full"></span>
                 </div>
                 <div className="flex-1 min-w-0">
                    <h4 className="text-[14px] font-bold text-slate-900 dark:text-white truncate leading-tight">Arjun Mehta</h4>
                    <p className="text-[12px] text-slate-500 truncate mt-0.5">Family Admin</p>
                 </div>
                 <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                 </button>
              </div>
              <div className="h-[1px] w-full bg-slate-200 dark:bg-slate-800"></div>
              <button onClick={() => { localStorage.clear(); sessionStorage.clear(); window.location.href = '/admin/login' }} className="flex items-center gap-2.5 text-[14px] font-medium text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors">
                 <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                 Logout
              </button>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl flex items-center justify-between px-8 shrink-0 z-10 sticky top-0">
          <div className="relative w-64">
             <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
             <input type="text" placeholder="Search family, events..." className="w-full h-9 pl-9 pr-4 rounded-full bg-slate-100 dark:bg-slate-800 border-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" />
          </div>
          
          <div className="flex items-center gap-4">
             <button className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300">
               <Bell className="h-5 w-5" />
               <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 border border-white dark:border-slate-950"></span>
             </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
           <div className="max-w-7xl mx-auto h-full">
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
