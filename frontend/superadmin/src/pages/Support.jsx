import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Eye, UserPlus, Reply, XCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/support';

export default function Support() {
  const [data, setData] = useState({ tickets: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupport = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data.success) {
           setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load support tickets');
      } finally {
        setLoading(false);
      }
    };
    fetchSupport();
  }, []);

  const statsData = [
    { name: 'Open', value: data.stats.open?.toString() || '0', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: 'Resolved', value: data.stats.resolved?.toString() || '0', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending', value: data.stats.pending?.toString() || '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Closed', value: data.stats.closed?.toString() || '0', icon: MessageSquare, color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-100 dark:bg-slate-800' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage family support inquiries and technical issues.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
           <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statsData.map((stat, idx) => (
              <motion.div 
                key={stat.name} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center gap-4"
              >
                <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
                  <stat.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.name}</p>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tickets Table */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto min-h-[300px]">
              {data.tickets.length === 0 ? (
                 <div className="flex flex-col justify-center items-center h-64 text-slate-500 dark:text-slate-400">
                    <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                    <p className="font-medium text-slate-700 dark:text-slate-200">Inbox Zero!</p>
                    <p className="text-sm">There are no support tickets in your database.</p>
                 </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300">
                      <th className="py-4 px-6">Ticket</th>
                      <th className="py-4 px-6">Family</th>
                      <th className="py-4 px-6">Subject</th>
                      <th className="py-4 px-6">Priority</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {data.tickets.map((ticket) => (
                      <tr key={ticket.id} className="hover:bg-slate-50 dark:bg-slate-900/50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm">#{ticket.id.substring(ticket.id.length - 6).toUpperCase()}</td>
                        <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-200">{ticket.family}</td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{ticket.subject}</td>
                        <td className="py-4 px-6">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            ticket.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                            ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`flex w-max items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            ticket.status === 'Open' ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                            ticket.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                              <Eye size={16} />
                            </button>
                            <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:bg-indigo-500/10 rounded-lg transition" title="Assign">
                              <UserPlus size={16} />
                            </button>
                            <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Reply">
                              <Reply size={16} />
                            </button>
                            <button className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Close">
                              <XCircle size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
