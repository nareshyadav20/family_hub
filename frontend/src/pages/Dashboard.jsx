import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserPlus, CalendarDays, Gift, CheckCircle, Image as ImageIcon, 
  Bell, TrendingUp, Activity, Plus, Link, Check, FileText
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Button } from '../components/ui/Button';

const timeAgo = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

const API_URL =  `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('onboarding') === 'true') {
      setShowWelcome(true);
    }
  }, []);

  const closeWelcome = () => {
    setShowWelcome(false);
    navigate('/admin/dashboard', { replace: true });
  };

  const copyInviteLink = () => {
    navigator.clipboard.writeText("http://localhost:5173/login?mode=signup");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Socket setup
  useEffect(() => {
    const socket = io(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}`);
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
        case 'member': return { icon: <UserPlus size={16}/>, color: 'bg-[#EEE8FF] text-[#7C5CFC]' };
        case 'event': return { icon: <CalendarDays size={16}/>, color: 'bg-[#EEE8FF] text-[#7C5CFC]' };
        case 'document': return { icon: <ImageIcon size={16}/>, color: 'bg-[#2EB67D]/10 text-[#2EB67D]' };
        default: return { icon: <Activity size={16}/>, color: 'bg-[#FAF8FF] text-[#6B7280]' };
     }
  };

  const kpis = stats ? [
    { label: 'Total Members', value: stats.totalMembers, icon: <Users size={20}/>, color: 'text-[#7C5CFC] bg-[#EEE8FF]' },
    { label: 'Pending Requests', value: stats.pendingRequests, icon: <UserPlus size={20}/>, color: 'text-[#F6B93B] bg-[#F6B93B]/10' },
    { label: 'Upcoming Events', value: stats.upcomingEvents, icon: <CalendarDays size={20}/>, color: 'text-[#7C5CFC] bg-[#EEE8FF]' },
    { label: "Today's Birthdays", value: stats.todaysBirthdays, icon: <Gift size={20}/>, color: 'text-[#7C5CFC] bg-[#EEE8FF]' },
    { label: 'Active Members', value: stats.activeMembers, icon: <CheckCircle size={20}/>, color: 'text-[#2EB67D] bg-[#2EB67D]/10' },
    { label: 'Gallery Uploads', value: stats.galleryUploads, icon: <ImageIcon size={20}/>, color: 'text-[#7C5CFC] bg-[#EEE8FF]' },
    { label: 'Notifications', value: stats.notifications, icon: <Bell size={20}/>, color: 'text-[#EF5350] bg-[#EF5350]/10' },
    { label: 'Monthly Activity', value: `+${stats.monthlyGrowth}%`, icon: <TrendingUp size={20}/>, color: 'text-[#7C5CFC] bg-[#EEE8FF]' },
  ] : Array(8).fill({ skeleton: true });

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1F2430] mb-1 tracking-tight">Family Admin Dashboard</h1>
          <p className="text-[#6B7280] font-semibold text-sm">Overview of your family's activities and engagement.</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => navigate('/admin/dashboard/events/create')} variant="outline" className="flex items-center gap-2">
             <CalendarDays size={18} /> Schedule Event
          </Button>
          <Button onClick={() => navigate('/admin/dashboard/members/invite')} variant="success" className="flex items-center gap-2">
             <Link size={18} /> Invite Member
          </Button>
          <Button onClick={() => navigate('/admin/dashboard/members/add')} variant="default" className="flex items-center gap-2">
             <Plus size={18} /> Add Member
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((stat, i) => (
          <div key={i} className="bg-white rounded-[24px] p-5 shadow-sm border border-[#E9E5F8] flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
             {stat.skeleton ? (
                <div className="flex items-center gap-4 w-full animate-pulse">
                   <div className="w-12 h-12 bg-slate-100 rounded-xl shrink-0"></div>
                   <div className="space-y-2 w-full">
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      <div className="h-6 bg-slate-100 rounded w-1/4"></div>
                   </div>
                </div>
             ) : (
                <>
                   <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 ${stat.color} font-bold`}>
                      {stat.icon}
                   </div>
                   <div>
                     <p className="text-[#6B7280] text-sm font-semibold">{stat.label}</p>
                     <h3 className="text-2xl font-bold text-[#1F2430] leading-tight">{stat.value}</h3>
                   </div>
                </>
             )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Charts */}
        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 shadow-sm border border-[#E9E5F8]">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-[#1F2430]">Growth & Engagement</h3>
              <select className="bg-[#FAF8FF] border border-[#E9E5F8] rounded-[12px] px-3.5 py-2 text-sm font-semibold text-[#7C5CFC] outline-none transition-all focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] cursor-pointer">
                <option>Last 6 Months</option>
              </select>
           </div>
           
           <div className="h-[300px] w-full">
             {chartLoading ? (
                  <div className="w-full h-full bg-[#FAF8FF] rounded-xl animate-pulse"></div>
             ) : chartData && chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7C5CFC" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#7C5CFC" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2EB67D" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#2EB67D" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E9E5F8" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#6B7280', fontSize: 12, fontWeight: 600}} />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: '1px solid #E9E5F8', boxShadow: '0 4px 20px rgba(124,92,252,0.06)' }} />
                      <Area type="monotone" dataKey="members" stroke="#7C5CFC" strokeWidth={3} fillOpacity={1} fill="url(#colorMembers)" />
                      <Area type="monotone" dataKey="events" stroke="#2EB67D" strokeWidth={3} fillOpacity={1} fill="url(#colorEvents)" />
                    </AreaChart>
                  </ResponsiveContainer>
             ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#6B7280] text-sm font-semibold">No activity data available</div>
             )}
           </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-[24px] p-6 shadow-sm border border-[#E9E5F8] flex flex-col max-h-[400px]">
           <h3 className="text-lg font-bold text-[#1F2430] mb-6 shrink-0">Recent Activity</h3>
           
           <div className="space-y-6 overflow-y-auto pr-2 flex-1 scrollbar-none">
              {activityLoading ? (
                 Array(4).fill(0).map((_, i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0"></div>
                        <div className="space-y-2 flex-1">
                           <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                           <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                        </div>
                    </div>
                 ))
              ) : recentActivity.length === 0 ? (
                 <div className="text-[#6B7280] text-sm font-semibold text-center py-10">No recent activity</div>
              ) : (
                recentActivity.map((act) => {
                  const style = getActivityIcon(act.type);
                  return (
                    <div key={act.id} className="flex gap-4">
                       <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${style.color} mt-0.5`}>
                          {style.icon}
                       </div>
                       <div>
                         <p className="text-sm font-bold text-[#1F2430] leading-tight">{act.title}</p>
                         <p className="text-sm font-semibold text-[#6B7280] mt-0.5">{act.description}</p>
                         <p className="text-xs font-bold text-[#7C5CFC] mt-1 uppercase tracking-wider">{timeAgo(act.timestamp)}</p>
                       </div>
                    </div>
                  );
                })
              )}
           </div>
        </div>
      </div>

      <AnimatePresence>
        {showWelcome && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-[24px] shadow-2xl relative w-full max-w-md overflow-hidden z-10 p-8 border border-[#E9E5F8]"
            >
               <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[#EEE8FF] mb-6">
                 <CheckCircle className="h-8 w-8 text-[#7C5CFC]" />
               </div>
               <div className="text-center mb-8">
                 <h2 className="text-2xl font-bold text-[#1F2430] mb-2">Welcome to FamilyHub OS!</h2>
                 <p className="text-[#6B7280] font-semibold">Your administrator account is now active.</p>
               </div>
               
               <div className="mb-8">
                 <h3 className="text-sm font-bold text-[#1F2430] uppercase tracking-wider mb-4">Next Steps</h3>
                 <ul className="space-y-3">
                    <li className="flex items-center text-[#6B7280] font-semibold"><Check className="w-5 h-5 text-[#2EB67D] mr-3 shrink-0" /> Complete Family Profile</li>
                    <li className="flex items-center text-[#6B7280] font-semibold"><Check className="w-5 h-5 text-[#2EB67D] mr-3 shrink-0" /> Add Family Members</li>
                    <li className="flex items-center text-[#6B7280] font-semibold"><Check className="w-5 h-5 text-[#2EB67D] mr-3 shrink-0" /> Create Family Tree</li>
                    <li className="flex items-center text-[#6B7280] font-semibold"><Check className="w-5 h-5 text-[#2EB67D] mr-3 shrink-0" /> Schedule Your First Event</li>
                 </ul>
               </div>

               <Button 
                 onClick={closeWelcome}
                 className="w-full"
               >
                 Go to Dashboard
               </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
