import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldCheck, 
  UserCircle, 
  CreditCard, 
  WalletCards,
  CircleDollarSign,
  BarChart3, 
  LifeBuoy, 
  ClipboardList, 
  Settings, 
  Bell,
  User,
  LogOut 
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Families', href: '/families', icon: Users },

  { name: 'Subscriptions', href: '/subscriptions', icon: CreditCard },
  { name: 'Plans', href: '/plans', icon: WalletCards },
  { name: 'Revenue', href: '/revenue', icon: CircleDollarSign },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Support Tickets', href: '/support', icon: LifeBuoy },
  { name: 'Audit Logs', href: '/audit', icon: ClipboardList },
  { name: 'Platform Settings', href: '/settings', icon: Settings },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Profile', href: '/profile', icon: User },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('superadmin_user');
    navigate('/login');
  };

  return (
    <aside className="w-64 flex-shrink-0 h-screen fixed inset-y-0 left-0 bg-white/70 backdrop-blur-xl border-r border-[#E2E8F0] shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex flex-col z-20">
      <div className="h-16 flex items-center px-6 border-b border-[#E2E8F0]/60">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-500 flex items-center justify-center mr-3 shadow-md">
          <span className="text-white font-bold text-lg">F</span>
        </div>
        <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-blue-700">Hub OS</span>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto hide-scrollbar">
        <p className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Platform</p>
        
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 transition-colors duration-200 ${
                    isActive ? 'text-purple-600' : 'text-gray-400 group-hover:text-gray-600'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.name}</span>
                {isActive && (
                  <motion.div 
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 w-1 rounded-r-full h-8 bg-purple-600"
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

      <div className="p-4 border-t border-[#E2E8F0]/60">
        <button onClick={handleLogout} className="flex w-full items-center px-3 py-2.5 text-sm font-medium rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 group">
          <LogOut className="flex-shrink-0 -ml-1 mr-3 h-5 w-5 text-gray-400 group-hover:text-red-500" />
          Logout
        </button>
      </div>
    </aside>
  );
}
