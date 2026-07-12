import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Bell, Search, Moon, Users } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function MainLayout({ navItems, bottomNav }) {
  const location = useLocation();

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
          <div className="flex items-center gap-4">
             <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
               <Moon size={20} />
             </button>
             <button className="relative text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
               <Bell size={20} />
             </button>
             
             <div className="w-8 h-8 rounded-full bg-[#129AAB] text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
                ME
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
