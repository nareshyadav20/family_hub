import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { IndianRupee, TrendingUp, Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/revenue';

export default function Revenue() {
  const [data, setData] = useState({ transactions: [], summary: {}, chartData: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to loading revenue data.');
      } finally {
        setLoading(false);
      }
    };
    fetchRevenue();
  }, []);

  const summaryData = [
    { name: "Today's Revenue", value: `₹${data.summary.today?.toLocaleString() || 0}`, icon: IndianRupee, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'This Month', value: `₹${data.summary.thisMonth?.toLocaleString() || 0}`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'This Year', value: `₹${data.summary.thisYear?.toLocaleString() || 0}`, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Payments', value: `₹${data.summary.pending?.toLocaleString() || 0}`, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-100' },
  ];

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Revenue</h2>
        <p className="text-sm text-gray-500 mt-1">Detailed financial reports and revenue breakdown.</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
           <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <>
          {/* Revenue Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {summaryData.map((item, idx) => (
              <motion.div 
                key={item.name} 
                initial={{ opacity: 0, y: 15 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4"
              >
                <div className={`p-4 rounded-xl ${item.bg} ${item.color}`}>
                  <item.icon size={24} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">{item.name}</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{item.value}</h3>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Simple Revenue Chart */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-[420px] flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Revenue Overview</h3>
              <div className="flex-1 w-full relative -left-4">
                {data.chartData && data.chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dx={-10} tickFormatter={(val) => `₹${val/1000}k`} />
                      <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Bar dataKey="revenue" fill="#4f46e5" radius={[6, 6, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-500 text-sm">No chart data available.</div>
                )}
              </div>
            </motion.div>

            {/* Recent Transactions */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50">
                <h3 className="text-lg font-bold text-slate-800">Recent Transactions</h3>
              </div>
              <div className="overflow-x-auto flex-1 h-full min-h-[300px]">
                {data.transactions.length === 0 ? (
                   <div className="flex justify-center items-center h-full text-slate-500 p-8 text-sm text-center">
                     No actual transactions matching the plan records found.
                   </div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/20 border-b border-slate-100 text-[13px] font-semibold text-slate-500 uppercase tracking-wider">
                        <th className="px-6 py-3">Family & Plan</th>
                        <th className="px-6 py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.transactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-slate-800 text-sm">{tx.family}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">{tx.plan}</span>
                              <span className="text-xs text-slate-500">{formatDate(tx.createdAt)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <p className="font-bold text-slate-900">₹{tx.amount}</p>
                            <span className={`text-[11px] font-bold uppercase tracking-wider mt-1 block ${tx.status === 'Paid' ? 'text-emerald-500' : 'text-amber-500'}`}>
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
