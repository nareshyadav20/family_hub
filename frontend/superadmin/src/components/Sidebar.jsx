import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  WalletCards,
  CircleDollarSign,
  BarChart3, 
  LifeBuoy, 
  ClipboardList, 
  Settings, 
  Bell,
  User,
  LogOut,
  X 
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard',         href: '/dashboard',     icon: LayoutDashboard },
  { name: 'Families',          href: '/families',       icon: Users },
  { name: 'Subscriptions',     href: '/subscriptions',  icon: CreditCard },
  { name: 'Plans',             href: '/plans',          icon: WalletCards },
  { name: 'Revenue',           href: '/revenue',        icon: CircleDollarSign },
  { name: 'Analytics',         href: '/analytics',      icon: BarChart3 },
  { name: 'Support Tickets',   href: '/support',        icon: LifeBuoy },
  { name: 'Audit Logs',        href: '/audit',          icon: ClipboardList },
  { name: 'Platform Settings', href: '/settings',       icon: Settings },
  { name: 'Notifications',     href: '/notifications',  icon: Bell },
  { name: 'Profile',           href: '/profile',        icon: User },
];

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_user');
    navigate('/login');
  };

  return (
    <aside className={`w-64 flex-shrink-0 h-screen fixed inset-y-0 left-0 bg-white dark:bg-slate-900/70 backdrop-blur-xl border-r border-[#E2E8F0] shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-40 transition-transform duration-300 lg:translate-x-0 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#E2E8F0]/60">
        <Link to="/dashboard" className="flex items-center gap-2 hover:opacity-90 transition-opacity" onClick={() => setMobileMenuOpen?.(false)}>
           <img src="/logo.png" alt="Family Hub Logo" className="w-12 h-12 shrink-0 object-contain rounded-xl" />
           <div className="flex flex-col leading-none">
             <div className="flex items-center gap-1">
               <span className="font-bold text-[20px] text-[#2E1E6B] tracking-tight">Family</span>
               <span className="font-bold text-[20px] text-[#7C5CFC] tracking-tight">Hub</span>
             </div>
             <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mt-0.5">Superadmin</span>
           </div>
        </Link>
        <button className="lg:hidden text-gray-500 dark:text-slate-400" onClick={() => setMobileMenuOpen?.(false)}>
          <X size={24} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-5 py-6 space-y-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="px-3 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3">Platform</p>

        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            onClick={() => setMobileMenuOpen?.(false)}
            className={({ isActive }) =>
              `relative group flex items-center px-4 py-3.5 text-[15px] font-semibold rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:bg-slate-800 hover:text-gray-900 dark:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  size={22}
                  className={`flex-shrink-0 mr-4 transition-colors duration-200 ${
                    isActive ? 'text-purple-600' : 'text-gray-400 dark:text-slate-500 group-hover:text-gray-600 dark:text-slate-300'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-purple-600"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-5 pb-6 pt-3 border-t border-[#E2E8F0]/60">
        <button
          onClick={handleLogout}
          className="flex w-full items-center px-4 py-3.5 text-[15px] font-semibold rounded-2xl text-gray-600 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 group"
        >
          <LogOut size={22} className="flex-shrink-0 mr-4 text-gray-400 dark:text-slate-500 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
