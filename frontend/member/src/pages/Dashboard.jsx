import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Image, Bell, Heart, MessageSquare, Users, Gift, ChevronRight, Play, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const activityData = [
  { month: 'Jan', posts: 4, memories: 8 },
  { month: 'Feb', posts: 6, memories: 12 },
  { month: 'Mar', posts: 5, memories: 10 },
  { month: 'Apr', posts: 9, memories: 15 },
  { month: 'May', posts: 7, memories: 13 },
  { month: 'Jun', posts: 11, memories: 18 },
  { month: 'Jul', posts: 8, memories: 14 },
];

const feedPosts = [
  { id: 1, author: 'Emily Smith', avatar: 'https://i.pravatar.cc/50?img=25', time: '2 hours ago', content: "Just uploaded 24 beautiful photos from our last family hike! Check them out in the gallery 🌿📸", image: 'https://images.unsplash.com/photo-1502780809386-d4d374f0ef09?w=400&h=250&fit=crop', likes: 18, comments: 6, type: 'photo' },
  { id: 2, author: 'James Smith', avatar: 'https://i.pravatar.cc/50?img=53', time: '5 hours ago', content: "Reminder: Summer Reunion 2026 is exactly 35 days away! Don't forget to RSVP if you haven't already. We need final headcount by July 30th. 🎉", likes: 32, comments: 12, type: 'announcement' },
  { id: 3, author: 'Martha Smith', avatar: 'https://i.pravatar.cc/50?img=45', time: '1 day ago', content: "Found these beautiful old photos from our 1985 family vacation in Hawaii! What memories 🌺❤️", image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=250&fit=crop', likes: 47, comments: 23, type: 'memory' },
];

const upcomingBirthdays = [
  { name: 'Grandpa Robert', date: 'July 14', avatar: 'https://i.pravatar.cc/50?img=60', daysLeft: 3 },
  { name: 'Emily Smith', date: 'July 28', avatar: 'https://i.pravatar.cc/50?img=25', daysLeft: 17 },
];

const upcomingEvents = [
  { title: 'Summer Reunion', date: 'Aug 15, 2026', location: 'Central Park, NY', color: '#4F46E5', attendees: 45 },
  { title: "Grandma's 75th Birthday", date: 'Sep 2, 2026', location: 'Family Home', color: '#7C3AED', attendees: 88 },
];

export default function Dashboard() {
  const [liked, setLiked] = useState(new Set());

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl overflow-hidden">
        <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=300&fit=crop" className="w-full h-48 object-cover" alt="Family" />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 via-indigo-900/70 to-transparent" />
        <div className="absolute inset-0 p-8 flex flex-col justify-center">
          <p className="text-indigo-200 text-sm font-medium mb-1">{greeting}, 👋</p>
          <h1 className="text-3xl font-black text-white mb-2">Welcome, Arjun!</h1>
          <p className="text-indigo-200 text-sm">You have 2 upcoming birthdays, 3 events, and 8 new messages.</p>
          <div className="flex gap-3 mt-5">
            <Link to="/events" className="flex items-center gap-2 bg-white text-indigo-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-indigo-50 transition-all shadow-lg">
              <Calendar size={15} /> View Events
            </Link>
            <Link to="/gallery" className="flex items-center gap-2 bg-white/10 backdrop-blur text-white text-sm font-bold px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition-all">
              <Image size={15} /> Gallery
            </Link>
          </div>
        </div>
      </div>

      {/* Completion Banner for Stage 2/3/4 */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 md:px-8 flex flex-col md:flex-row items-start md:items-center justify-between shadow-xl shadow-blue-600/20 gap-4">
         <div>
            <h2 className="text-white font-bold text-xl mb-1">Complete Your Profile</h2>
            <p className="text-indigo-200 text-sm">25% Completed - Next: Education & Career</p>
            <div className="w-full md:w-64 h-2 bg-indigo-900/40 rounded-full mt-3 overflow-hidden">
               <div className="h-full bg-emerald-400 w-1/4 rounded-full"></div>
            </div>
         </div>
         <div className="flex gap-4 shrink-0">
            <button className="text-indigo-100 text-sm font-semibold hover:text-white transition-colors">Remind Me Later</button>
            <Link to="/member/dashboard/profile-setup" className="bg-white text-indigo-700 px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl transition-all">Continue Profile</Link>
         </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Family Members', value: '247', icon: Users, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/10' },
          { label: 'My Photos', value: '384', icon: Image, color: 'text-violet-600 bg-violet-50 dark:bg-violet-500/10' },
          { label: 'Events This Month', value: '6', icon: Calendar, color: 'text-teal-600 bg-teal-50 dark:bg-teal-500/10' },
          { label: 'New Messages', value: '12', icon: MessageSquare, color: 'text-rose-600 bg-rose-50 dark:bg-rose-500/10' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.color}`}>
              <stat.icon size={22} />
            </div>
            <div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Family Feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Family Feed</h2>
          {feedPosts.map(post => (
            <div key={post.id} className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <img src={post.avatar} className="w-10 h-10 rounded-full object-cover" alt={post.author} />
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white">{post.author}</div>
                  <div className="text-xs text-slate-400">{post.time}</div>
                </div>
                {post.type === 'announcement' && (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600">Announcement</span>
                )}
                {post.type === 'memory' && (
                  <span className="ml-auto text-xs font-bold px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600">Memory</span>
                )}
              </div>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">{post.content}</p>
              {post.image && (
                <img src={post.image} alt="" className="w-full h-48 object-cover rounded-xl mb-3" />
              )}
              <div className="flex items-center gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button onClick={() => setLiked(p => { const n = new Set(p); n.has(post.id) ? n.delete(post.id) : n.add(post.id); return n; })} className={`flex items-center gap-2 text-sm font-semibold transition-colors ${liked.has(post.id) ? 'text-rose-600' : 'text-slate-400 hover:text-rose-600'}`}>
                  <Heart size={16} fill={liked.has(post.id) ? 'currentColor' : 'none'} />
                  {post.likes + (liked.has(post.id) ? 1 : 0)}
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-indigo-600 transition-colors">
                  <MessageSquare size={16} /> {post.comments}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar widgets */}
        <div className="space-y-4">
          
          {/* Profile Completion Tracking Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center justify-between">
               <span>Profile Completion</span>
               <span className="text-emerald-500 font-black">25%</span>
            </h3>
            
            <div className="flex gap-1 mb-4 h-1.5 w-full">
               <div className="bg-emerald-500 h-full flex-1 rounded-l-full"></div>
               <div className="bg-slate-100 dark:bg-slate-800 h-full flex-1"></div>
               <div className="bg-slate-100 dark:bg-slate-800 h-full flex-1"></div>
               <div className="bg-slate-100 dark:bg-slate-800 h-full flex-1 rounded-r-full"></div>
            </div>

            <div className="space-y-2 mb-5">
               <div className="text-sm flex items-center justify-between font-semibold text-emerald-600">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> Basic Info</span>
                  ✓
               </div>
               <div className="text-sm flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Education</span>
                  Remaining
               </div>
               <div className="text-sm flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Documents</span>
                  Remaining
               </div>
               <div className="text-sm flex items-center justify-between text-slate-500">
                  <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div> Privacy</span>
                  Remaining
               </div>
            </div>
            
            <Link to="/member/dashboard/profile-setup" className="w-full flex items-center justify-center gap-2 text-sm font-bold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 py-2.5 rounded-xl transition-colors">
              Continue Profile
            </Link>
          </div>
          {/* Birthdays */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl p-5 border border-amber-100 dark:border-amber-500/20">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Gift size={18} className="text-amber-500" /> Upcoming Birthdays
            </h3>
            <div className="space-y-3">
              {upcomingBirthdays.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <img src={b.avatar} className="w-9 h-9 rounded-full object-cover" alt={b.name} />
                  <div className="flex-1">
                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">{b.name}</div>
                    <div className="text-xs text-slate-500">{b.date}</div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${b.daysLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-700'}`}>
                    {b.daysLeft}d
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-indigo-500" /> Upcoming Events
            </h3>
            <div className="space-y-3">
              {upcomingEvents.map((ev, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                  <div style={{ width: 4, height: 48, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{ev.title}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{ev.date}</div>
                    <div className="text-xs text-slate-400">{ev.location}</div>
                  </div>
                  <ChevronRight size={14} className="text-slate-300 mt-1" />
                </div>
              ))}
            </div>
            <Link to="/events" className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 pt-3 border-t border-slate-100 dark:border-slate-800 transition-colors">
              View All Events <ChevronRight size={14} />
            </Link>
          </div>

          {/* My Activity Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
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
