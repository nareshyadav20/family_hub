import React from 'react';
import { Bell, ImageIcon, Users, MessageSquare, CalendarDays, CheckCircle2 } from 'lucide-react';

export default function Notifications() {
  const notifications = [
    {
      id: 1,
      title: "New Photo Album Shared",
      description: "Sarah uploaded 24 photos to 'Summer Vacation 2026' album. Check them out!",
      time: "2 hours ago",
      icon: <ImageIcon size={20} className="text-white" />,
      color: "bg-blue-500",
      unread: true,
    },
    {
      id: 2,
      title: "Family Reunion Event Update",
      description: "The time for the Annual Family Reunion has been changed to 11:00 AM.",
      time: "5 hours ago",
      icon: <CalendarDays size={20} className="text-white" />,
      color: "bg-purple-500",
      unread: true,
    },
    {
      id: 3,
      title: "New Member Joined",
      description: "David Smith has accepted your invitation to join FamilyHub.",
      time: "1 day ago",
      icon: <Users size={20} className="text-white" />,
      color: "bg-emerald-500",
      unread: false,
    },
    {
      id: 4,
      title: "New Message from Mom",
      description: "Don't forget to call grandma today! She is expecting your call.",
      time: "2 days ago",
      icon: <MessageSquare size={20} className="text-white" />,
      color: "bg-orange-500",
      unread: false,
    },
    {
      id: 5,
      title: "System Update",
      description: "FamilyHub OS has been updated to version 2.0 with new features.",
      time: "1 week ago",
      icon: <Bell size={20} className="text-white" />,
      color: "bg-slate-500",
      unread: false,
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-1">
             <Bell className="text-blue-600" /> Notifications
           </h1>
           <p className="text-slate-500 text-sm font-medium">Stay updated with your family's latest activities</p>
        </div>
        <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-lg">
          <CheckCircle2 size={16} /> Mark all as read
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 dark:border-slate-800 overflow-hidden">
        <div className="divide-y divide-slate-50 dark:divide-slate-800">
           {notifications.map((notif) => (
             <div 
               key={notif.id} 
               className={`flex items-start gap-4 p-5 md:px-6 md:py-5 transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 ${notif.unread ? 'bg-blue-50/30 dark:bg-blue-900/10' : ''}`}
             >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${notif.color}`}>
                   {notif.icon}
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-start mb-0.5 max-sm:flex-col">
                      <h3 className={`text-[15px] ${notif.unread ? 'font-bold text-slate-900 dark:text-white' : 'font-semibold text-slate-700 dark:text-slate-200'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-[12px] font-medium text-slate-500 shrink-0 mt-0.5">{notif.time}</span>
                   </div>
                   <p className="text-[14px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                     {notif.description}
                   </p>
                </div>
                {notif.unread && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0 mt-2"></div>
                )}
             </div>
           ))}
        </div>
      </div>
    </div>
  )
}
