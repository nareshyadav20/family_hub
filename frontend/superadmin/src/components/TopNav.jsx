import { Bell as BellIcon, Search as SearchIcon, UserCircle as UserIcon, Settings as SettingsIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function TopNav() {
  const location = useLocation();
  
  // Format path for title
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) 
    : 'Dashboard';

  return (
    <header className="fixed top-0 right-0 left-64 h-16 bg-white/70 backdrop-blur-xl border-b border-[#E2E8F0]/80 z-10 hidden md:flex items-center justify-between px-8 shadow-sm">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold text-gray-800 tracking-tight">{currentTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-6">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50/50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 sm:text-sm"
            placeholder="Search platform..."
          />
        </div>

        <div className="flex items-center space-x-3">
          <button className="relative p-2 text-gray-400 hover:text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>
          
          <div className="h-6 w-px bg-gray-200 mx-2"></div>
          
          <button className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm border-2 border-white">
              SA
            </div>
            <span className="hidden lg:block">Super Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
}
