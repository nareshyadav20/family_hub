import { Bell as BellIcon, Search as SearchIcon, UserCircle as UserIcon, Settings as SettingsIcon, LogOut, Menu } from 'lucide-react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';

// Helper: read superadmin user from localStorage
function getSuperAdmin() {
  try {
    return JSON.parse(localStorage.getItem('superadmin_user') || '{}');
  } catch {
    return {};
  }
}

export default function TopNav({ setMobileMenuOpen }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [superAdmin, setSuperAdmin] = useState(getSuperAdmin);

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

  // Re-sync superAdmin data whenever localStorage is updated (e.g. after profile save)
  useEffect(() => {
    const onStorage = () => setSuperAdmin(getSuperAdmin());
    window.addEventListener('storage', onStorage);
    // Also poll every 2s to catch same-tab localStorage updates
    const interval = setInterval(() => setSuperAdmin(getSuperAdmin()), 2000);
    return () => {
      window.removeEventListener('storage', onStorage);
      clearInterval(interval);
    };
  }, []);

  const displayName = superAdmin.firstName
    ? `${superAdmin.firstName} ${superAdmin.lastName || ''}`.trim()
    : 'Super Admin';

  const initials = superAdmin.firstName
    ? (superAdmin.firstName[0] + (superAdmin.lastName?.[0] || '')).toUpperCase()
    : 'SA';

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 bg-white dark:bg-slate-900/70 backdrop-blur-xl border-b border-[#E2E8F0]/80 dark:border-slate-800/80 z-10 flex items-center justify-between px-4 sm:px-8 shadow-sm">
      <div className="flex items-center gap-3">
        <button className="lg:hidden text-gray-600 dark:text-slate-300 p-2 hover:bg-gray-100 dark:bg-slate-700 rounded-lg" onClick={() => setMobileMenuOpen?.(true)}>
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800 dark:text-slate-100 tracking-tight hidden sm:block">{currentTitle}</h1>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative group hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-4 w-4 text-gray-400 dark:text-slate-500 group-focus-within:text-purple-500 transition-colors" />
          </div>
          <input
            type="text"
            className="block w-64 pl-10 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-full leading-5 bg-gray-50 dark:bg-slate-800/50 placeholder-gray-400 focus:outline-none focus:bg-white dark:bg-slate-900 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all duration-200 sm:text-sm"
            placeholder="Search platform..."
          />
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/notifications')}
            className="relative p-2 text-gray-400 dark:text-slate-500 hover:text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:bg-slate-700 rounded-full transition-colors"
            title="Notifications"
          >
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-gray-200 mx-2"></div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:text-gray-900 dark:text-white transition-colors focus:outline-none"
            >
              {superAdmin.avatar || superAdmin.avatarUrl ? (
                <img
                  src={superAdmin.avatar || superAdmin.avatarUrl}
                  alt="Avatar"
                  className="h-8 w-8 rounded-full object-cover flex-shrink-0 shadow-sm border-2 border-white ring-1 ring-purple-200"
                />
              ) : (
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0 shadow-sm border-2 border-white">
                  {initials}
                </div>
              )}
              <span className="hidden lg:block">{displayName}</span>
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                <Link to="/profile" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:bg-slate-800 hover:text-purple-600 transition-colors">
                  <UserIcon className="h-4 w-4 mr-3" /> Profile
                </Link>
                <Link to="/settings" onClick={() => setIsProfileOpen(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:bg-slate-800 hover:text-purple-600 transition-colors">
                  <SettingsIcon className="h-4 w-4 mr-3" /> Settings
                </Link>
                <div className="h-px bg-gray-100 dark:bg-slate-700 my-2"></div>
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
