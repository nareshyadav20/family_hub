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

const kpis = [
  { name: 'Total Families', value: '1,248', change: '+12%', icon: Users, color: 'text-purple-600', bg: 'bg-purple-100' },
  { name: 'Family Admins', value: '1,190', change: '+8%', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-100' },
  { name: 'Total Members', value: '8,439', change: '+24%', icon: UserCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  { name: 'Monthly Revenue', value: '$42,500', change: '+14%', icon: TrendingUp, color: 'text-rose-600', bg: 'bg-rose-100' },
  { name: 'Active Subscriptions', value: '984', change: '+5%', icon: CreditCard, color: 'text-amber-600', bg: 'bg-amber-100' },
  { name: 'Storage Usage', value: '842 GB', change: '+12 GB', icon: HardDrive, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  { name: 'API Requests', value: '1.2M', change: '+5%', icon: Globe, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  { name: 'Platform Health', value: '99.9%', change: 'Stable', icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
];

const growthData = [
  { name: 'Jan', families: 400, members: 2400 },
  { name: 'Feb', families: 450, members: 2800 },
  { name: 'Mar', families: 520, members: 3200 },
  { name: 'Apr', families: 610, members: 3900 },
  { name: 'May', families: 780, members: 4800 },
  { name: 'Jun', families: 940, members: 6100 },
  { name: 'Jul', families: 1248, members: 8439 },
];

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 2000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 1890 },
  { name: 'Sat', revenue: 2390 },
  { name: 'Sun', revenue: 3490 },
];

const recentActivity = [
  { id: 1, type: 'registration', title: 'New Family Registered', desc: 'The Smith Family created an account', time: '10 mins ago', user: 'SS' },
  { id: 2, type: 'payment', title: 'Subscription Renewed', desc: 'Premium Plan renewed for $49.99', time: '2 hours ago', user: 'JP' },
  { id: 3, type: 'alert', title: 'High Storage Notice', desc: 'Database usage exceeded 800GB', time: '5 hours ago', user: 'SYS' },
  { id: 4, type: 'support', title: 'Support Ticket #492', desc: 'Login issue reported by member', time: '1 day ago', user: 'JD' },
];

export default function Dashboard() {
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
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex relative">
                <div className="h-10 w-10 min-w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-600 mr-4 z-10 border-2 border-white shadow-sm">
                  {activity.user}
                </div>
                {activity.id !== recentActivity.length && (
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
            <h3 className="text-xl font-bold text-emerald-600">+$21.5k</h3>
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
