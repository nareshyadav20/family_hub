import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CardSkeleton, GridSkeleton } from '../../components/loaders/SkeletonLoaders';
import { Calendar, Image, Bell, Heart, MessageSquare, Users, Gift, ChevronRight, Play, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Dashboard() {
  const [liked, setLiked] = useState(new Set());
  const [showBanner, setShowBanner] = useState(true);

  const API_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;
  const token = localStorage.getItem('token');

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['memberDashboard'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/member/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const activeUser = JSON.parse(localStorage.getItem('user')) || {};
  const firstName = activeUser.firstName || 'Family Member';
  const completion = typeof activeUser.profileCompletion === 'number' ? activeUser.profileCompletion : 25;

  const feedPosts = dashboardData?.feedPosts || [];
  const upcomingBirthdays = dashboardData?.upcomingBirthdays || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];
  const activityData = dashboardData?.activityData || [];
  const stats = dashboardData?.stats || { familyMembers: 0, myPhotos: 0, eventsThisMonth: 0, newMessages: 0 };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Welcome Banner */}
      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
        <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=300&fit=crop" className="w-full h-48 object-cover" alt="Family" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/70 to-transparent" />
        <div className="absolute inset-0 p-5 md:p-8 flex flex-col justify-center">
          <p className="text-indigo-200 text-xs md:text-sm font-medium mb-1">{greeting}, 👋</p>
          <h1 className="text-2xl md:text-3xl font-black text-white mb-2 leading-tight">Welcome, {firstName}!</h1>
          <p className="text-indigo-200 text-xs md:text-sm max-w-[250px] md:max-w-none">You have {upcomingBirthdays.length} upcoming birthdays and {upcomingEvents.length} events.</p>
          <div className="flex flex-wrap gap-2 md:gap-3 mt-4 md:mt-5">
            <Link to="/member/dashboard/events" className="flex items-center gap-1 md:gap-2 bg-white text-indigo-700 text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-[24px] hover:bg-[#FAF8FF] transition-all shadow-lg">
              <Calendar size={14} className="md:w-[15px] md:h-[15px]" /> View Events
            </Link>
            <Link to="/member/dashboard/gallery" className="flex items-center gap-1 md:gap-2 bg-white/10 backdrop-blur text-white text-xs md:text-sm font-bold px-3 md:px-4 py-2 rounded-[24px] border border-white/20 hover:bg-white/20 transition-all">
              <Image size={14} className="md:w-[15px] md:h-[15px]" /> Gallery
            </Link>
          </div>
        </div>
      </div>

      {/* Completion Banner */}
      {showBanner && completion < 100 && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl shadow-blue-600/20 gap-4">
          <div>
            <h2 className="text-white font-bold text-xl mb-1">Complete Your Profile</h2>
            <p className="text-indigo-200 text-sm">{completion}% Completed - Next: {completion < 50 ? 'Education & Career' : completion < 75 ? 'Personal Details' : 'Documents'}</p>
            <div className="w-full md:w-64 h-2 bg-indigo-900/40 rounded-full mt-3 overflow-hidden">
              <div className={`h-full bg-emerald-400 rounded-full`} style={{ width: `${completion}%` }}></div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0 w-full md:w-auto">
            <button onClick={() => setShowBanner(false)} className="text-indigo-100 text-sm font-semibold hover:text-white transition-colors cursor-pointer">Remind Me Later</button>
            <Link to="/member/dashboard/profile-setup" className="bg-white text-indigo-700 px-6 py-2.5 rounded-[24px] font-bold text-sm shadow-lg hover:shadow-xl transition-all">Continue Profile</Link>
          </div>
        </div>
      )}

      {/* Stats */}
      {isLoading ? (
        <div className="mb-4"><GridSkeleton count={4} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Family Members', value: stats.familyMembers, icon: Users, color: 'text-[#7C5CFC] bg-[#FAF8FF] ' },
            { label: 'My Photos', value: stats.myPhotos, icon: Image, color: 'text-violet-600 bg-violet-50 ' },
            { label: 'Events This Month', value: stats.eventsThisMonth, icon: Calendar, color: 'text-teal-600 bg-teal-50 ' },
            { label: 'New Messages', value: stats.newMessages, icon: MessageSquare, color: 'text-rose-600 bg-rose-50 ' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#E9E5F8] flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
              <div className={`w-12 h-12 rounded-[24px] flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon size={22} />
              </div>
              <div>
                <p className="text-slate-500 text-xs font-medium">{stat.label}</p>
                <h3 className="text-2xl font-black text-[#1F2430]">{isLoading ? '-' : stat.value}</h3>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-[#1F2430]">Family Feed</h2>

          {isLoading && (
            <div className="space-y-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          )}

          {!isLoading && feedPosts.length === 0 && (
            <div className="text-center py-20 text-slate-400 font-medium bg-white rounded-2xl border border-[#E9E5F8] shadow-sm">No activity recorded yet</div>
          )}

          {feedPosts.map(post => (
            <div key={post.id} className="bg-white rounded-2xl p-6 shadow-sm border border-[#E9E5F8] animate-in fade-in duration-300">
              <div className="flex items-center gap-3 mb-4">
                <img src={post.avatar} className="w-10 h-10 rounded-full object-cover border border-[#E9E5F8]" alt={post.author} />
                <div>
                  <div className="font-bold text-sm text-[#1F2430]">{post.author}</div>
                  <div className="text-xs text-slate-400">{post.time}</div>
                </div>
                {post.type === 'announcement' && (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-[#FAF8FF] text-[#7C5CFC]">Announcement</span>
                )}
                {post.type === 'memory' && (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600">Memory</span>
                )}
                {post.type === 'photo' && (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">Gallery</span>
                )}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{post.content}</p>
              {post.image && (
                <img src={post.image} alt="" className="w-full h-auto max-h-96 object-cover rounded-[24px] mb-3 shadow-sm border border-[#E9E5F8]" />
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-[#E9E5F8]">
                <button onClick={() => setLiked(p => { const n = new Set(p); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked.has(post.id) ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'}`}>
                  <Heart size={16} fill={liked.has(post.id) ? 'currentColor' : 'none'} />
                  {post.likes + (liked.has(post.id) ? 1 : 0)}
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-[#7C5CFC] transition-colors">
                  <MessageSquare size={16} /> {post.comments}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">

          {/* Profile Completion Tracking Card */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E9E5F8]">
            <h3 className="font-bold text-[#1F2430] text-base mb-4 flex items-center justify-between">
              <span>Profile Completion</span>
              <span className="text-emerald-500 font-black">{completion}%</span>
            </h3>

            <div className="flex gap-1 mb-4 h-1.5 w-full">
              <div className={`h-full flex-1 rounded-l-full ${completion >= 25 ? 'bg-emerald-500' : 'bg-[#FAF8FF] '}`}></div>
              <div className={`h-full flex-1 ${completion >= 50 ? 'bg-emerald-500' : 'bg-[#FAF8FF] '}`}></div>
              <div className={`h-full flex-1 ${completion >= 75 ? 'bg-emerald-500' : 'bg-[#FAF8FF] '}`}></div>
              <div className={`h-full flex-1 ${completion >= 100 ? 'bg-emerald-500 rounded-r-full' : 'bg-[#FAF8FF] rounded-r-full'}`}></div>
            </div>

            <div className="space-y-2 mb-5">
              <div className={`text-sm flex items-center justify-between font-semibold ${completion >= 25 ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${completion >= 25 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Basic Info</span>
                {completion >= 25 ? '✓' : 'Remaining'}
              </div>
              <div className={`text-sm flex items-center justify-between font-semibold ${completion >= 50 ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${completion >= 50 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Education & Career</span>
                {completion >= 50 ? '✓' : 'Remaining'}
              </div>
              <div className={`text-sm flex items-center justify-between font-semibold ${completion >= 75 ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${completion >= 75 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Personal Details</span>
                {completion >= 75 ? '✓' : 'Remaining'}
              </div>
              <div className={`text-sm flex items-center justify-between font-semibold ${completion >= 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span className="flex items-center gap-2"><div className={`w-1.5 h-1.5 rounded-full ${completion >= 100 ? 'bg-emerald-500' : 'bg-slate-300'}`}></div> Documents</span>
                {completion >= 100 ? '✓' : 'Remaining'}
              </div>
            </div>

            {completion < 100 ? (
              <Link to="/member/dashboard/profile-setup" className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-[#FAF8FF] text-[#7C5CFC] hover:bg-indigo-100 py-2.5 rounded-[24px] transition-colors">
                Continue Profile
              </Link>
            ) : (
              <div className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-emerald-50 text-emerald-600 py-2.5 rounded-[24px]">
                Profile Complete 🎉
              </div>
            )}
          </div>
          {/* Birthdays */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-5 border border-amber-100">
            <h3 className="font-bold text-[#1F2430] text-base mb-4 flex items-center gap-2">
              <Gift size={18} className="text-amber-500" /> Upcoming Birthdays
            </h3>
            <div className="space-y-3">
              {upcomingBirthdays.length === 0 && !isLoading && (
                <div className="text-xs font-semibold text-slate-500">No birthdays in the next 30 days.</div>
              )}
              {upcomingBirthdays.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={b.avatar} className="w-9 h-9 rounded-full object-cover" alt={b.name} />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-[#1F2430] line-clamp-1">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.date}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${b.daysLeft === 0 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {b.daysLeft === 0 ? 'Today 🎉' : `${b.daysLeft}d`}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E9E5F8]">
            <h3 className="font-bold text-[#1F2430] text-base mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" /> Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.length === 0 && !isLoading && (
                <div className="text-xs font-semibold text-slate-500">No upcoming events scheduled.</div>
              )}
              {upcomingEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-[24px] hover:bg-[#FCFBFF] transition-colors cursor-pointer">
                  <div style={{ width: 4, height: 48, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[#1F2430] truncate">{ev.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ev.date}</div>
                    <div className="text-xs text-slate-400">{ev.location}</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 mt-1" />
                </div>
              ))}
            </div>
            <Link to="/member/dashboard/events" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-[#7C5CFC] hover:text-indigo-700 pt-3 border-t border-[#E9E5F8] transition-colors">
              View All Events <ChevronRight size={14} />
            </Link>
          </div>

          {/* My Activity Chart */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#E9E5F8]">
            <h3 className="font-bold text-[#1F2430] text-base mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-emerald-500" /> My Activity
            </h3>
            <div className="h-28">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                  <Area type="monotone" dataKey="memories" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorPosts)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
