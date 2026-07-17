import React from 'react';
import { TrendingUp, Users, CalendarDays, Image as ImageIcon, MessageSquare, Folder, BarChart, PieChart, Activity } from 'lucide-react';
import { AreaChart, Area, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePieChart, Pie, Cell, Legend } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function Analytics() {
  const token = localStorage.getItem('token');
  
  const { data: analyticsData, isLoading } = useQuery({
     queryKey: ['admin_analytics'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/dashboard/analytics`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     }
  });

  if (isLoading) {
     return <div className="p-10 font-bold text-slate-500 text-center">Loading analytics data...</div>;
  }

  const { stats: fetchedStats = {}, memberGrowth = [], activityData = [], roleData = [] } = analyticsData || {};

  const stats = [
    { label: 'Total Members', value: fetchedStats.totalMembers || 0, change: `${fetchedStats.membersChange >= 0 ? '+' : ''}${fetchedStats.membersChange || 0} this month`, up: fetchedStats.membersChange >= 0, icon: <Users size={20} />, color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' },
    { label: 'Events This Year', value: fetchedStats.eventsThisYear || 0, change: `${fetchedStats.eventsChange >= 0 ? '+' : ''}${fetchedStats.eventsChange || 0} this month`, up: fetchedStats.eventsChange >= 0, icon: <CalendarDays size={20} />, color: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10' },
    { label: 'Gallery Photos', value: fetchedStats.galleryPhotos || 0, change: `${fetchedStats.photosChange >= 0 ? '+' : ''}${fetchedStats.photosChange || 0} this month`, up: fetchedStats.photosChange >= 0, icon: <ImageIcon size={20} />, color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' },
    { label: 'Messages Sent', value: fetchedStats.messagesSent || 0, change: `${fetchedStats.messagesChange >= 0 ? '+' : ''}${fetchedStats.messagesChange || 0} this month`, up: fetchedStats.messagesChange >= 0, icon: <MessageSquare size={20} />, color: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Track your family's engagement and growth over time.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>{s.icon}</div>
            <div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">{s.label}</p>
              <p className={`text-[11px] font-bold mt-1 ${s.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{s.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Member Growth Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Member Growth</h3>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memberGrowth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="memberGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
                <Area type="monotone" dataKey="members" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#memberGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Breakdown Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Member Roles</h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {roleData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '10px', border: 'none' }} />
              </RePieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {roleData.map((r, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: r.color }} />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{r.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
        <h3 className="font-bold text-slate-900 dark:text-white mb-6">Platform Activity (Events, Photos, Messages)</h3>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <ReBarChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={10} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={8} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }} />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
              <Bar dataKey="events" name="Events" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="photos" name="Photos" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="messages" name="Messages" fill="#10b981" radius={[4, 4, 0, 0]} />
            </ReBarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
