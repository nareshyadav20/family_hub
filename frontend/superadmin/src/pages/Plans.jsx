import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Users, Clock, IndianRupee, Plus, Edit2, Power, Eye, CheckCircle2 } from 'lucide-react';

export default function Plans() {
  const stats = [
    { name: 'Total Plans', value: '4', icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Active Subscribers', value: '40', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Trial Users', value: '18', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Monthly Revenue', value: '₹23,500', icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  const plans = [
    { name: 'Free', price: '₹0/month', families: 12, storage: '5 GB', features: 'Basic Features', status: 'Active' },
    { name: 'Basic', price: '₹499/month', families: 18, storage: '50 GB', features: 'Calendar, Gallery', status: 'Active' },
    { name: 'Premium', price: '₹999/month', families: 8, storage: '200 GB', features: 'AI, Vault, Analytics', status: 'Active' },
    { name: 'Enterprise', price: 'Custom', families: 2, storage: 'Unlimited', features: 'Everything', status: 'Active' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-sm text-gray-500 mt-1">Configure plan tiers, features, member limits, and pricing.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-md font-medium text-sm">
          <Plus size={18} />
          Add Plan
        </button>
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

      {/* Plans Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                <th className="py-4 px-6">Plan</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Families</th>
                <th className="py-4 px-6">Storage</th>
                <th className="py-4 px-6">Features</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((plan) => (
                <tr key={plan.name} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-slate-900">{plan.name}</td>
                  <td className="py-4 px-6 font-medium text-slate-700">{plan.price}</td>
                  <td className="py-4 px-6 text-slate-600">{plan.families}</td>
                  <td className="py-4 px-6 text-slate-600">{plan.storage}</td>
                  <td className="py-4 px-6 text-slate-500 text-sm">{plan.features}</td>
                  <td className="py-4 px-6">
                    <span className="flex items-center gap-1.5 text-xs font-bold bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full w-max">
                      <CheckCircle2 size={14} /> {plan.status}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="Edit Plan">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition" title="Enable/Disable">
                        <Power size={16} />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" title="View Subscribers">
                        <Eye size={16} />
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
