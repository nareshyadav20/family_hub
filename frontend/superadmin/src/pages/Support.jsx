import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, CheckCircle, Clock, AlertTriangle, Eye, UserPlus, Reply, XCircle } from 'lucide-react';

export default function Support() {
  const stats = [
    { name: 'Open', value: '6', icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
    { name: 'Resolved', value: '18', icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Pending', value: '3', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Closed', value: '44', icon: MessageSquare, color: 'text-slate-600', bg: 'bg-slate-100' },
  ];

  const tickets = [
    { id: '#1001', family: 'Sharma', subject: 'Cannot login', priority: 'High', status: 'Open' },
    { id: '#1002', family: 'Reddy', subject: 'Calendar Sync', priority: 'Medium', status: 'Pending' },
    { id: '#1003', family: 'Patel', subject: 'Payment Issue', priority: 'High', status: 'Open' },
    { id: '#1004', family: 'Kumar', subject: 'Gallery Upload', priority: 'Low', status: 'Closed' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Support Tickets</h2>
        <p className="text-sm text-gray-500 mt-1">Manage family support inquiries and technical issues.</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <motion.div 
            key={stat.name} 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
          >
            <div className={`p-4 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500">{stat.name}</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tickets Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="py-4 px-6">Ticket</th>
                <th className="py-4 px-6">Family</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{ticket.id}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{ticket.family}</td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{ticket.subject}</td>
                  <td className="py-4 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.priority === 'High' ? 'bg-rose-50 text-rose-600' :
                      ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`flex w-max items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      ticket.status === 'Open' ? 'bg-indigo-50 text-indigo-600' :
                      ticket.status === 'Pending' ? 'bg-amber-50 text-amber-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-1.5">
                      <button className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Assign">
                        <UserPlus size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Reply">
                        <Reply size={16} />
                      </button>
                      <button className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Close">
                        <XCircle size={16} />
                      </button>
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
