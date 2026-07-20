import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Shield, User, Users, Calendar, Image as ImageIcon, CreditCard, Activity, Settings, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/audit-logs';

export default function AuditLogs() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get(API_URL);
        if (res.data.success) {
           setLogs(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getIcon = (moduleName) => {
    switch(moduleName?.toLowerCase()) {
       case 'families': return <Users size={16} />;
       case 'members': return <User size={16} />;
       case 'calendar': return <Calendar size={16} />;
       case 'gallery': return <ImageIcon size={16} />;
       case 'subscription': return <CreditCard size={16} />;
       case 'system': return <Settings size={16} />;
       case 'security': return <Shield size={16} />;
       default: return <Activity size={16} />;
    }
  };

  const getColorClass = (moduleName) => {
    switch(moduleName?.toLowerCase()) {
       case 'families': return 'text-indigo-600 bg-indigo-50 border border-indigo-100';
       case 'members': return 'text-emerald-600 bg-emerald-50 border border-emerald-100';
       case 'calendar': return 'text-amber-600 bg-amber-50 border border-amber-100';
       case 'gallery': return 'text-blue-600 bg-blue-50 border border-blue-100';
       case 'subscription': return 'text-purple-600 bg-purple-50 border border-purple-100';
       default: return 'text-slate-600 bg-slate-100 border border-slate-200';
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true });
  }

  const filteredLogs = logs.filter(log => {
      const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.action.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.module.toLowerCase().includes(searchTerm.toLowerCase());
      
      const today = new Date();
      const logDate = new Date(log.createdAt);
      const diffTime = Math.abs(today - logDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      let matchesFilter = true;
      if (activeFilter === 'Today') {
          matchesFilter = diffDays <= 1;
      } else if (activeFilter === 'Last 7 Days') {
          matchesFilter = diffDays <= 7;
      } else if (activeFilter === 'Last Month') {
          matchesFilter = diffDays <= 30;
      }

      return matchesSearch && matchesFilter;
  });

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
          <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl w-max">
            {['All', 'Today', 'Last 7 Days', 'Last Month'].map(filter => (
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
             <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search User, Family, or Action..." 
                className="w-full bg-transparent text-sm outline-none text-slate-800 placeholder-slate-400 font-medium" 
             />
             <Filter size={18} className="text-slate-400 ml-2 shrink-0 self-center cursor-pointer hover:text-indigo-600 transition-colors" />
          </div>
        </div>

        {/* Activity Logs Table */}
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
             <div className="flex items-center justify-center h-48">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
             </div>
          ) : filteredLogs.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                <Shield size={32} className="text-slate-300 mb-3" />
                <p>No audit logs found.</p>
             </div>
          ) : (
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
                 {filteredLogs.map((log) => (
                   <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                     <td className="py-4 px-6 text-sm font-semibold text-slate-500 whitespace-nowrap">{formatTime(log.createdAt)}</td>
                     <td className="py-4 px-6">
                       <span className="font-bold text-slate-800 text-sm bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">{log.user}</span>
                     </td>
                     <td className="py-4 px-6 text-sm font-medium text-slate-700">
                        {log.action}
                        {log.details && <span className="block text-xs font-normal text-slate-400 mt-0.5">{log.details}</span>}
                     </td>
                     <td className="py-4 px-6">
                       <div className={`flex items-center gap-2 w-max px-3 py-1.5 rounded-lg ${getColorClass(log.module)}`}>
                         {getIcon(log.module)}
                         <span className="text-xs font-bold tracking-wide uppercase">{log.module}</span>
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
