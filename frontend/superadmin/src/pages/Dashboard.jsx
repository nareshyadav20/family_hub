import { 
  Users, 
  ShieldCheck, 
  UserCircle, 
  CreditCard, 
  TrendingUp,
  Activity,
  HardDrive,
  Globe
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('superadmin_token');
        const res = await axios.get(`${API_URL}/api/v1/superadmin/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-64 pb-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  const { kpis: apiKpis, growthData, revenueData, recentActivity } = data;

  const kpis = [
    { name: 'Total Families', value: apiKpis.totalFamilies?.toLocaleString() || '0', change: '+12%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
    { name: 'Family Admins', value: apiKpis.totalAdmins?.toLocaleString() || '0', change: '+8%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Total Members', value: apiKpis.totalMembers?.toLocaleString() || '0', change: '+24%', icon: UserCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Monthly Revenue', value: apiKpis.monthlyRevenue, change: '+14%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: 'Active Subscriptions', value: apiKpis.activeSubscriptions?.toLocaleString() || '0', change: '+5%', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Storage Usage', value: apiKpis.storageUsage, change: '+12 GB', icon: HardDrive, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'API Requests', value: apiKpis.apiRequests, change: '+5%', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-100' },
    { name: 'Platform Health', value: apiKpis.platformHealth, change: 'Stable', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => (
          <motion.div
            key={kpi.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="card-premium p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{kpi.name}</p>
                <div className="flex items-baseline space-x-2">
                  <h3 className="text-2xl font-bold text-gray-900">{kpi.value}</h3>
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                    {kpi.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-2xl ${kpi.bg}`}>
                <kpi.icon className={`h-6 w-6 ${kpi.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card-premium p-6 lg:col-span-2"
        >
          <div className="flex items-center justify-between xl:items-start mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Platform Growth</h3>
              <p className="text-sm text-gray-500">Families & Members over time</p>
            </div>
            <select className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-purple-500 focus:border-purple-500 block p-2">
              <option>Last 7 months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFamilies" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="members" stroke="#2563EB" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                <Area type="monotone" dataKey="families" stroke="#7C3AED" strokeWidth={3} fillOpacity={1} fill="url(#colorFamilies)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card-premium p-6"
        >
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            <p className="text-sm text-gray-500">Latest platform events</p>
          </div>
          <div className="space-y-6">
            {recentActivity.map((activity, index) => (
              <div key={activity.id || index} className="flex relative">
                <div className="h-10 w-10 min-w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 mr-4 z-10 border-2 border-white shadow-sm">
                  {activity.user}
                </div>
                {index !== recentActivity.length - 1 && (
                  <div className="absolute top-10 left-5 w-px h-10 bg-gray-200"></div>
                )}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{activity.desc}</p>
                  <p className="text-xs text-purple-600 font-medium mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card-premium p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue Overview</h3>
              <p className="text-sm text-gray-500">Last 7 days revenue</p>
            </div>
            <h3 className="text-xl font-bold text-emerald-600">+{data.kpis.monthlyRevenue}</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="revenue" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
