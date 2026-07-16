import { Bell as BellIcon, Search as SearchIcon, UserCircle as UserIcon, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

export default function TopNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  // Format path for title
  const pathParts = location.pathname.split('/').filter(Boolean);
  const currentTitle = pathParts.length > 0 
    ? pathParts[0].charAt(0).toUpperCase() + pathParts[0].slice(1) 
    : 'Dashboard';

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_user');
    navigate('/login');
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownRef]);

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
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors focus:outline-none"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm border-2 border-white">
                SA
              </div>
              <span className="hidden lg:block">Super Admin</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white border border-gray-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors">
                  <UserIcon className="h-4 w-4 mr-3" /> Profile
                </Link>
                <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-600 transition-colors">
                  <SettingsIcon className="h-4 w-4 mr-3" /> Settings
                </Link>
                <div className="h-px bg-gray-100 my-2"></div>
                <button onClick={() => { setIsProfileOpen(false); handleLogout(); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                  <LogOut className="h-4 w-4 mr-3" /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
