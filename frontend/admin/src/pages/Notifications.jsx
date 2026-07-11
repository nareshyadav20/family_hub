import React, { useState } from 'react';
import { Bell, CheckCheck, Trash2, CalendarDays, MessageSquare, Users, Megaphone, AlertCircle, Filter } from 'lucide-react';

const allNotifications = [
  { id: 1, type: 'join', icon: <Users size={16} />, iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20', title: 'Join Request from Priya Mehta', desc: 'Priya Mehta has requested to join the family as Daughter-in-law.', time: '2 hours ago', read: false },
  { id: 2, type: 'announcement', icon: <Megaphone size={16} />, iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20', title: 'New Announcement Posted', desc: 'Sarah Smith posted "Grandpa Robert Turns 80 – Birthday Celebration!" to all members.', time: '5 hours ago', read: false },
  { id: 3, type: 'event', icon: <CalendarDays size={16} />, iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20', title: 'Event Reminder: Annual Reunion', desc: 'The Annual Family Reunion is scheduled in 5 days. 12 members have confirmed attendance.', time: '8 hours ago', read: false },
  { id: 4, type: 'message', icon: <MessageSquare size={16} />, iconColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20', title: 'New Message from Emily Smith', desc: '"Hi admin, can you update the event location for the reunion? The venue has changed."', time: '1 day ago', read: true },
  { id: 5, type: 'join', icon: <Users size={16} />, iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20', title: 'Join Request from Kiran Sharma', desc: 'Kiran Sharma has requested to join the family as Nephew.', time: '1 day ago', read: true },
  { id: 6, type: 'alert', icon: <AlertCircle size={16} />, iconColor: 'bg-red-100 text-red-600 dark:bg-red-500/20', title: 'Action Required: 3 Pending Requests', desc: 'There are 3 join requests awaiting your approval. Please review them.', time: '2 days ago', read: true },
  { id: 7, type: 'event', icon: <CalendarDays size={16} />, iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20', title: 'New Event Created', desc: 'Arjun Mehta created "10th Anniversary Dinner" on October 12, 2026 at The Ritz Carlton.', time: '2 days ago', read: true },
  { id: 8, type: 'announcement', icon: <Megaphone size={16} />, iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20', title: 'Announcement: Document Vault Launch', desc: 'The secure Family Document Vault is now live. Notify members to start uploading.', time: '3 days ago', read: true },
  { id: 9, type: 'message', icon: <MessageSquare size={16} />, iconColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20', title: 'Group Message in Family Chat', desc: 'James Smith: "Can\'t wait for the reunion! Who else is bringing their children?"', time: '4 days ago', read: true },
];

export default function Notifications() {
  const [notifications, setNotifications] = useState(allNotifications);
  const [filter, setFilter] = useState('all');

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const deleteNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const unreadCount = notifications.filter(n => !n.read).length;
  const filtered = filter === 'all' ? notifications : filter === 'unread' ? notifications.filter(n => !n.read) : notifications.filter(n => n.type === filter);

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: `Unread (${unreadCount})` },
    { key: 'join', label: 'Join' },
    { key: 'event', label: 'Events' },
    { key: 'announcement', label: 'Updates' },
    { key: 'message', label: 'Messages' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">{unreadCount > 0 ? `You have ${unreadCount} unread notifications` : 'All caught up!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${filter === tab.key ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {filtered.map(notif => (
          <div key={notif.id} onClick={() => markRead(notif.id)}
            className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all group ${notif.read ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800' : 'bg-blue-50 dark:bg-slate-800/70 border border-blue-100 dark:border-blue-800/40'}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${notif.iconColor}`}>
              {notif.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <p className={`text-sm font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{notif.title}</p>
                {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
              </div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{notif.desc}</p>
              <p className="text-[11px] font-semibold text-slate-400 mt-1.5">{notif.time}</p>
            </div>
            <button onClick={(e) => { e.stopPropagation(); deleteNotif(notif.id); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
              <Trash2 size={14} />
            </button>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Bell className="mx-auto mb-3 opacity-30" size={40} />
            <p className="font-medium">No notifications here</p>
          </div>
        )}
      </div>
    </div>
  );
}
