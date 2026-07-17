import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Shield, User, Users, Calendar, Image as ImageIcon, CreditCard } from 'lucide-react';

export default function AuditLogs() {
  const [activeFilter, setActiveFilter] = useState('Today');
  
  const logs = [
    { time: '09:45 AM', user: 'Super Admin', action: 'Created Family', module: 'Families', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { time: '10:02 AM', user: 'Admin', action: 'Added Member', module: 'Members', icon: User, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { time: '10:20 AM', user: 'Admin', action: 'Updated Event', module: 'Calendar', icon: Calendar, color: 'text-amber-600', bg: 'bg-amber-50' },
    { time: '11:15 AM', user: 'Member', action: 'Uploaded Photo', module: 'Gallery', icon: ImageIcon, color: 'text-blue-600', bg: 'bg-blue-50' },
    { time: '11:50 AM', user: 'Super Admin', action: 'Changed Plan', module: 'Subscription', icon: CreditCard, color: 'text-purple-600', bg: 'bg-purple-50' },
    { time: '12:30 PM', user: 'Admin', action: 'Approved Join Request', module: 'Members', icon: Shield, color: 'text-teal-600', bg: 'bg-teal-50' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
          <p className="text-sm text-gray-500 mt-1">Track system activity, administrator actions, and security events.</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
        
        {/* Actions Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex bg-slate-100 p-1 rounded-xl w-max">
            {['Today', 'Last 7 Days', 'Last Month'].map(filter => (
              <button 
                key={filter} 
                onClick={() => setActiveFilter(filter)} 
                className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${activeFilter === filter ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className="relative w-full md:w-96 flex bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
             <Search size={18} className="text-slate-400 mr-2 shrink-0 self-center" />
             <input type="text" placeholder="Search User, Family, or Action..." className="w-full bg-transparent text-sm outline-none text-slate-800 placeholder-slate-400 font-medium" />
             <Filter size={18} className="text-slate-400 ml-2 shrink-0 self-center cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6 font-semibold">Time</th>
                <th className="py-4 px-6 font-semibold">User</th>
                <th className="py-4 px-6 font-semibold">Action</th>
                <th className="py-4 px-6 font-semibold">Module</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((log, i) => (
                <tr key={i} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6 text-sm font-semibold text-slate-500 whitespace-nowrap">{log.time}</td>
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-800 text-sm bg-slate-100 px-2.5 py-1 rounded-md">{log.user}</span>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">{log.action}</td>
                  <td className="py-4 px-6">
                    <div className={`flex items-center gap-2 w-max px-3 py-1.5 rounded-lg ${log.bg} ${log.color}`}>
                      <log.icon size={16} />
                      <span className="text-xs font-bold tracking-wide uppercase">{log.module}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
