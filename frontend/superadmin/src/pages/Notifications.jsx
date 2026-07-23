import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Loader2, Info, AlertTriangle, CheckCircle, Shield } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/notifications';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data.success) {
          setNotifications(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const getIcon = (type) => {
    switch(type) {
      case 'alert': return <AlertTriangle className="text-rose-500" size={20} />;
      case 'system': return <Shield className="text-indigo-500" size={20} />;
      case 'success': return <CheckCircle className="text-emerald-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">System alerts, updates, and platform messages.</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
        {loading ? (
           <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
           </div>
        ) : notifications.length === 0 ? (
           <div className="flex flex-col justify-center items-center h-64 text-slate-500 dark:text-slate-400 text-center px-4">
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full mb-3">
                 <Bell className="w-8 h-8 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="font-semibold text-slate-700 dark:text-slate-200">Empty Inbox</p>
              <p className="text-sm mt-1">You have no new platform notifications.</p>
           </div>
        ) : (
           <div className="divide-y divide-slate-100">
             {notifications.map((notif, idx) => (
                <motion.div 
                   key={notif.id}
                   initial={{ opacity: 0, x: -10 }} 
                   animate={{ opacity: 1, x: 0 }} 
                   transition={{ delay: idx * 0.05 }}
                   className={`p-5 flex gap-4 transition-colors hover:bg-slate-50 dark:bg-slate-900/50 ${!notif.isRead ? 'bg-indigo-50 dark:bg-indigo-500/10/30' : ''}`}
                >
                   <div className="mt-1 shrink-0 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                      {getIcon(notif.type)}
                   </div>
                   <div>
                      <div className="flex items-center gap-2 mb-1">
                         <h4 className="font-bold text-slate-800 dark:text-slate-100">{notif.title}</h4>
                         {!notif.isRead && <span className="w-2 h-2 rounded-full bg-indigo-600"></span>}
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-sm mb-2">{notif.message}</p>
                      <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{formatDate(notif.createdAt)}</p>
                   </div>
                </motion.div>
             ))}
           </div>
        )}
      </motion.div>
    </div>
  );
}
