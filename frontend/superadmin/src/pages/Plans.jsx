import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, Clock, IndianRupee, Plus, Edit2, Power, Eye, CheckCircle2, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/subscriptions/plans';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    dbName: '',
    price: '',
    storage: '',
    features: '',
    status: 'Active'
  });

  const fetchPlans = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to fetch plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.storage) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await axios.post(API_URL, formData);
      if (res.data.success) {
        toast.success('Plan created successfully!');
        setIsModalOpen(false);
        setFormData({ name: '', dbName: '', price: '', storage: '', features: '', status: 'Active' });
        fetchPlans();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating plan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { name: 'Total Plans', value: plans.length.toString(), icon: Layers, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Active Subscribers', value: plans.reduce((acc, p) => acc + (p.families || 0), 0).toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Trial Users', value: '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' }, 
    { name: 'Monthly Revenue', value: '₹0', icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Plans</h2>
          <p className="text-sm text-gray-500 mt-1">Configure plan tiers, features, member limits, and pricing.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-md font-medium text-sm">
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
          {loading ? (
             <div className="flex justify-center items-center h-48">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
             </div>
          ) : plans.length === 0 ? (
             <div className="flex justify-center flex-col items-center h-48 text-gray-500">
               <p className="mb-4">No plans found</p>
               <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-100 transition font-medium text-sm">
                 <Plus size={18} /> Create Plan
               </button>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-sm font-semibold text-slate-600">
                  <th className="py-4 px-6">Plan</th>
                  <th className="py-4 px-6">Price</th>
                  <th className="py-4 px-6 text-center">Families</th>
                  <th className="py-4 px-6">Storage</th>
                  <th className="py-4 px-6">Features</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {plans.map((plan) => (
                  <tr key={plan.id || plan.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900">{plan.name}</td>
                    <td className="py-4 px-6 font-medium text-slate-700">{plan.price}</td>
                    <td className="py-4 px-6 text-center text-slate-600">{plan.families || 0}</td>
                    <td className="py-4 px-6 text-slate-600">{plan.storage}</td>
                    <td className="py-4 px-6 text-slate-500 text-sm">{plan.features || 'Standard Features'}</td>
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
          )}
        </div>
      </motion.div>

      {/* ADD PLAN MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
               onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white rounded-2xl shadow-xl w-full max-w-lg z-10 overflow-hidden flex flex-col"
            >
              <form onSubmit={handleCreatePlan} className="flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                  <h3 className="text-lg font-bold text-gray-900">Add New Plan</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name *</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. Pro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">DB Match Name</label>
                      <input type="text" name="dbName" value={formData.dbName} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. Premium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input required type="text" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. ₹999/month" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Storage *</label>
                      <input required type="text" name="storage" value={formData.storage} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. 100 GB" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Features (Comma separated)</label>
                    <input type="text" name="features" value={formData.features} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. Basic, Gallery, Calendar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                      <option>Active</option>
                      <option>Draft</option>
                      <option>Archived</option>
                    </select>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto">
                  <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isSubmitting ? 'Creating...' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
