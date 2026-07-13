import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, CalendarDays, Gift, CheckCircle, Image as ImageIcon, 
  Bell, TrendingUp, Activity, Plus, Link, Check
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

const data = [
  { name: 'Jan', members: 4, events: 1 },
  { name: 'Feb', members: 4, events: 2 },
  { name: 'Mar', members: 5, events: 1 },
  { name: 'Apr', members: 7, events: 4 },
  { name: 'May', members: 7, events: 2 },
  { name: 'Jun', members: 8, events: 5 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyInviteLink = () => {
    navigator.clipboard.writeText("http://localhost:5174/invite");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1 tracking-tight">Family Admin Dashboard</h1>
          <p className="text-slate-500 font-medium">Overview of your family's activities and engagement.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl font-medium transition-all shadow-sm">
             <CalendarDays size={18} /> Schedule Event
          </button>
          <button onClick={() => navigate('/admin/dashboard/members/invite')} className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-emerald-500/30">
             <Link size={18} /> Invite Link
          </button>
          <button onClick={() => navigate('/admin/dashboard/members/add')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-blue-500/30">
             <Plus size={18} /> Add Member
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Members', value: '8', icon: <Users size={20}/>, color: 'text-blue-600 bg-blue-50 dark:bg-blue-500/10' },
          { label: 'Pending Requests', value: '2', icon: <UserPlus size={20}/>, color: 'text-orange-600 bg-orange-50 dark:bg-orange-500/10' },
          { label: 'Upcoming Events', value: '5', icon: <CalendarDays size={20}/>, color: 'text-purple-600 bg-purple-50 dark:bg-purple-500/10' },
          { label: "Today's Birthdays", value: '0', icon: <Gift size={20}/>, color: 'text-pink-600 bg-pink-50 dark:bg-pink-500/10' },
          { label: 'Active Members', value: '6', icon: <CheckCircle size={20}/>, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10' },
          { label: 'Gallery Uploads', value: '124', icon: <ImageIcon size={20}/>, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-500/10' },
          { label: 'Notifications', value: '12', icon: <Bell size={20}/>, color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10' },
          { label: 'Monthly Activity', value: '+24%', icon: <TrendingUp size={20}/>, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4">
             <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
                {stat.icon}
             </div>
             <div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">{stat.value}</h3>
             </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Growth & Engagement</h3>
              <select className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 text-sm font-medium">
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
           </div>
           <div className="h-[300px] w-full">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                 <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
                 <Area type="monotone" dataKey="members" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                 <Area type="monotone" dataKey="events" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
           <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Recent Activity</h3>
           <div className="space-y-6">
              {[
                { title: 'New Member Joined', desc: 'Emily joined the family', time: '2h ago', icon: <UserPlus size={16}/>, color: 'bg-blue-100 text-blue-600' },
                { title: 'Gallery Uploaded', desc: 'Sarah added 24 photos', time: '5h ago', icon: <ImageIcon size={16}/>, color: 'bg-emerald-100 text-emerald-600' },
                { title: 'Event Created', desc: 'Annual Reunion scheduled', time: '1d ago', icon: <CalendarDays size={16}/>, color: 'bg-purple-100 text-purple-600' },
                { title: 'Poll Created', desc: 'Vote for vacation destination', time: '2d ago', icon: <Activity size={16}/>, color: 'bg-orange-100 text-orange-600' },
              ].map((act, i) => (
                <div key={i} className="flex gap-4">
                   <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${act.color} mt-0.5`}>
                      {act.icon}
                   </div>
                   <div>
                     <p className="text-sm font-bold text-slate-900 dark:text-white">{act.title}</p>
                     <p className="text-sm font-medium text-slate-500">{act.desc}</p>
                     <p className="text-xs font-semibold text-slate-400 mt-1">{act.time}</p>
                   </div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  )
}
