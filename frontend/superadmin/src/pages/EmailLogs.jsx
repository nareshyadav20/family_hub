import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, XCircle, Clock, AlertCircle, RefreshCw, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function EmailLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStats, setFilterStats] = useState({ total: 0, pending: 0, sent: 0, failed: 0 });
  
  const [status, setStatus] = useState('All');
  const [timeframe, setTimeframe] = useState('Today');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/superadmin/email-logs?status=${status}&timeframe=${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        
        const s = { total: data.data.length, pending: 0, sent: 0, failed: 0 };
        data.data.forEach(log => {
          if (log.status === 'SENT') s.sent++;
          else if (['PENDING', 'PROCESSING', 'RETRYING'].includes(log.status)) s.pending++;
          else if (log.status === 'FAILED') s.failed++;
        });
        setFilterStats(s);
      }
    } catch (error) {
      toast.error('Failed to fetch email logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [status, timeframe]);

  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'SENT': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'FAILED': return <XCircle className="w-4 h-4 text-rose-500" />;
      case 'PENDING':
      case 'PROCESSING': 
      case 'RETRYING': return <RefreshCw className="w-4 h-4 text-amber-500 animate-spin-slow" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusStyle = (s) => {
    if (s === 'SENT') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (s === 'FAILED') return 'bg-rose-50 text-rose-700 border-rose-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">Email Logs Pipeline</h2>
          <p className="text-sm text-gray-500 mt-1">Monitor all transactional email deliveries across the platform.</p>
        </div>
        <button 
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Pipeline
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Logged', value: filterStats.total, icon: Mail, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Sent', value: filterStats.sent, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Pending / Retrying', value: filterStats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Failed', value: filterStats.failed, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={22} strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['All', 'PENDING', 'SENT', 'FAILED'].map(s => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  status === s ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['Today', 'Last 7 Days', 'Last Month', 'All Time'].map(t => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                  timeframe === t ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50/50 text-slate-500 font-medium border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Template</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4">Attempts</th>
                <th className="px-6 py-4">Error / Trace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-slate-500">
                    No email logs found for this filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-400" />
                        <span className="font-medium text-slate-900">{log.recipient}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{log.template}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyle(log.status)}`}>
                        <StatusIcon status={log.status} />
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {log.attempts} / {log.maxRetries}
                    </td>
                    <td className="px-6 py-4 text-slate-500 max-w-xs truncate" title={log.errorMessage || ''}>
                      {log.errorMessage ? (
                         <span className="text-rose-600">{log.errorMessage}</span>
                      ) : (
                         <span className="text-emerald-600">--</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
