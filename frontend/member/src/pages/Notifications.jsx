import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, CalendarDays, MessageSquare, Users, Megaphone, AlertCircle, Action } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const getIconData = (type) => {
  switch(type) {
    case 'event': return { icon: <CalendarDays size={16} />, iconColor: 'bg-amber-100 text-amber-600 dark:bg-amber-500/20' };
    case 'announcement': return { icon: <Megaphone size={16} />, iconColor: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20' };
    case 'member':
    case 'join': return { icon: <Users size={16} />, iconColor: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' };
    case 'alert': return { icon: <AlertCircle size={16} />, iconColor: 'bg-red-100 text-red-600 dark:bg-red-500/20' };
    case 'message': return { icon: <MessageSquare size={16} />, iconColor: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20' };
    default: return { icon: <Bell size={16} />, iconColor: 'bg-slate-100 text-slate-600 dark:bg-slate-500/20' };
  }
};

const formatTimeOptions = (dStr) => {
  const d = new Date(dStr);
  const diff = Date.now() - d.getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return 'Just now';
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h/24)}d ago`;
};

export default function Notifications() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const socket = io('http://localhost:5000');
    socket.on('notification.created', () => {
       queryClient.invalidateQueries(['notifications']);
    });
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: notifications = [], isLoading } = useQuery({
     queryKey: ['notifications'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/notifications`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     refetchInterval: 30000
  });

  const readMutation = useMutation({
     mutationFn: async (id) => {
        await axios.put(`${API_URL}/notifications/${id}/read`, {}, {
           headers: { Authorization: `Bearer ${token}` }
        });
     },
     onSuccess: () => queryClient.invalidateQueries(['notifications'])
  });

  const markRead = (id, currentReadStatus) => {
     if (!currentReadStatus) {
         readMutation.mutate(id);
         localStorage.setItem(`notif_read_${id}`, 'true'); 
     }
  };

  const markReactLocalRead = (id) => {
     return notifications.find(n => n.id === id)?.isRead || localStorage.getItem(`notif_read_${id}`);
  };

  const markAllRead = () => {
     notifications.forEach(n => {
        if (!markReactLocalRead(n.id)) markRead(n.id, false);
     });
  };
  
  const mappedNotifs = notifications.map(n => ({
     ...n,
     read: markReactLocalRead(n.id)
  }));

  const unreadCount = mappedNotifs.filter(n => !n.read).length;
  const filtered = filter === 'all' 
     ? mappedNotifs 
     : filter === 'unread' 
       ? mappedNotifs.filter(n => !n.read) 
       : mappedNotifs.filter(n => n.type === filter);

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
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Inbox & Notifications</h1>
          <p className="text-slate-500 text-sm mt-1">{unreadCount > 0 ? `You have ${unreadCount} unread pings` : 'Your inbox is clear!'}</p>
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
            <CheckCheck size={16} /> Mark all as read
          </button>
        )}
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setFilter(tab.key)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${filter === tab.key ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {isLoading && <div className="p-8 text-center text-slate-500">Loading inbox...</div>}
        
        {filtered.map(notif => {
          const { icon, iconColor } = getIconData(notif.type);
          
          return (
            <div key={notif.id} onClick={() => markRead(notif.id, notif.read)}
              className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all ${notif.read ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800' : 'bg-blue-50 dark:bg-slate-800/70 border border-blue-100 dark:border-blue-800/40'}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconColor}`}>
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className={`text-sm font-bold ${notif.read ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{notif.title}</p>
                  {!notif.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>}
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{notif.message}</p>
                <p className="text-[11px] font-semibold text-slate-400 mt-1.5">{formatTimeOptions(notif.createdAt)}</p>
              </div>
            </div>
          );
        })}
        
        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Bell className="mx-auto mb-3 opacity-30" size={40} />
            <p className="font-medium">No pings over here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
