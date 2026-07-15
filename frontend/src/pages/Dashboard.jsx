import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, CalendarDays, Gift, CheckCircle, Image as ImageIcon, 
  Bell, TrendingUp, Activity, Plus, Link, Check, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

const API_URL =  `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const copyInviteLink = () => {
    navigator.clipboard.writeText("http://localhost:5173/login?mode=signup");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Socket setup
  useEffect(() => {
    const socket = io(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}`);
    const refresh = () => {
       queryClient.invalidateQueries(['dashboard_stats']);
       queryClient.invalidateQueries(['monthly_activity']);
       queryClient.invalidateQueries(['recent_activity']);
    };
    
    socket.on('member.created', refresh);
    socket.on('member.invited', refresh);
    socket.on('member.updated', refresh);
    socket.on('event.created', refresh);
    socket.on('document.uploaded', refresh);
    socket.on('notification.created', refresh);

    return () => socket.disconnect();
  }, [queryClient]);

  // Fetch Stats
  const { data: stats, isLoading: statsLoading } = useQuery({
     queryKey: ['dashboard_stats'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/dashboard/stats`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     refetchInterval: 60000 // auto refresh every 60s
  });

  // Fetch Chart Data
  const { data: chartData, isLoading: chartLoading } = useQuery({
     queryKey: ['monthly_activity'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/dashboard/monthly-activity`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     refetchInterval: 60000
  });

  // Fetch Recent Activity
  const { data: recentActivity = [], isLoading: activityLoading } = useQuery({
     queryKey: ['recent_activity'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/dashboard/recent-activity`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     refetchInterval: 60000
  });

  const getActivityIcon = (type) => {
     switch(type) {
        case 'member': return { icon: <UserPlus size={16}/>, color: 'bg-blue-100 text-blue-600' };
        case 'event': return { icon: <CalendarDays size={16}/>, color: 'bg-purple-100 text-purple-600' };
        case 'document': return { icon: <ImageIcon size={16}/>, color: 'bg-emerald-100 text-emerald-600' };
        default: return { icon: <Activity size={16}/>, color: 'bg-slate-100 text-slate-600' };
     }
  };

  const kpis = stats ? [
    { label: 'Total Members', value: stats.totalMembers, icon: <Users size={20}/>, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: <UserPlus size={20}/>, color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: <CalendarDays size={20}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' },
    { label: "Today's Birthdays", value: stats.todaysBirthdays, icon: <Gift size={20}/>, color: 'text-pink-600 bg-pink-50 dark:bg-pink-500/10' },
    { label: 'Active Members', value: stats.activeMembers, icon: <CheckCircle size={20}/>, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Gallery Uploads', value: stats.galleryUploads, icon: <ImageIcon size={20}/>, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10' },
    { label: 'Notifications', value: stats.notifications, icon: <Bell size={20}/>, color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10' },
    { label: 'Monthly Activity', value: `+${stats.monthlyGrowth}%`, icon: <TrendingUp size={20}/>, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' },
  ] : Array(8).fill({ skeleton: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Family Admin Dashboard</h1>
          <p className="text-slate-500 font-medium">Overview of your family's activities and engagement.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/admin/dashboard/events/create')} className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm">
             <CalendarDays size={18} /> Schedule Event
          </button>
          <button onClick={() => navigate('/admin/dashboard/members/invite')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
             <Link size={18} /> Invite Member
          </button>
          <button onClick={() => navigate('/admin/dashboard/members/add')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30">
             <Plus size={18} /> Add Member
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
             {stat.skeleton ? (
                <div className="flex items-center gap-4 w-full animate-pulse">
                   <div className="w-12 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl shrink-0"></div>
                   <div className="space-y-2 w-full">
                      <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                   </div>
                </div>
             ) : (
                <>
                   <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                      {stat.icon}
                   </div>
                   <div>
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
                     <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{stat.value}</h3>
                   </div>
                </>
             )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Growth & Engagement</h3>
              <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm font-medium outline-none">
                <option>Last 6 Months</option>
              </select>
           </div>
           
           <div className="h-[300px] w-full">
             {chartLoading ? (
                 <div className="w-full h-full bg-slate-50 dark:bg-slate-800/50 rounded-xl animate-pulse"></div>
             ) : chartData && chartData.length > 0 ? (
                 <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                     <defs>
                       <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                         <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                         <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                       </linearGradient>
                     </defs>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                     <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                     <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                     <Area type="monotone" dataKey="members" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                     <Area type="monotone" dataKey="events" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" />
                   </AreaChart>
                 </ResponsiveContainer>
             ) : (
                 <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm font-medium">No activity data available</div>
             )}
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col max-h-[400px]">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 shrink-0">Recent Activity</h3>
           
           <div className="space-y-6 overflow-y-auto pr-2 flex-1">
              {activityLoading ? (
                 Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 shrink-0"></div>
                        <div className="space-y-2 flex-1">
                           <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
                           <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                        </div>
                    </div>
                 ))
              ) : recentActivity.length === 0 ? (
                 <div className="text-slate-500 text-sm font-medium text-center py-10">No recent activity</div>
              ) : (
                recentActivity.map((act) => {
                  const style = getActivityIcon(act.type);
                  return (
                    <div key={act.id} className="flex gap-4">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.color} mt-0.5`}>
                          {style.icon}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{act.title}</p>
                         <p className="text-sm font-medium text-slate-500 mt-0.5">{act.description}</p>
                         <p className="text-xs font-semibold text-slate-400 mt-1 uppercase tracking-wider">{timeAgo(act.timestamp)}</p>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
