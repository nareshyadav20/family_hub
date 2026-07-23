import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Users, Clock, IndianRupee, Plus, Edit2, Power, Eye, CheckCircle2, X, Loader2, Trash2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/subscriptions/plans';

export default function Plans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // View Subscribers Modal State
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(false);
  const [selectedPlanName, setSelectedPlanName] = useState('');
  
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

  const handleEditClick = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      dbName: plan.dbName || plan.name,
      price: plan.price,
      storage: plan.storage,
      features: plan.features || '',
      status: plan.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingPlan(null);
    setFormData({ name: '', dbName: '', price: '', storage: '', features: '', status: 'Active' });
  };

  const handleCreateOrUpdatePlan = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.storage) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (editingPlan) {
        const res = await axios.put(`${API_URL}/${editingPlan.id}`, formData);
        if (res.data.success) {
          toast.success('Plan updated successfully!');
          handleCloseModal();
          fetchPlans();
        }
      } else {
        const res = await axios.post(API_URL, formData);
        if (res.data.success) {
          toast.success('Plan created successfully!');
          handleCloseModal();
          fetchPlans();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || `Error ${editingPlan ? 'updating' : 'creating'} plan`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePlanStatus = async (plan) => {
    const newStatus = plan.status === 'Active' ? 'Archived' : 'Active';
    const loadingToast = toast.loading('Updating plan status...');
    try {
      const res = await axios.put(`${API_URL}/${plan.id}`, { status: newStatus });
      if (res.data.success) {
        toast.success(`Plan status changed to ${newStatus} successfully!`, { id: loadingToast });
        fetchPlans();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error updating plan status', { id: loadingToast });
    }
  };

  const deletePlan = async (planId) => {
    if (!window.confirm('Are you SURE you want to delete this plan? This action cannot be undone.')) {
      return;
    }
    const loadingToast = toast.loading('Deleting plan...');
    try {
      const res = await axios.delete(`${API_URL}/${planId}`);
      if (res.data.success) {
        toast.success('Plan deleted successfully!', { id: loadingToast });
        fetchPlans();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete plan', { id: loadingToast });
    }
  };

  const viewSubscribers = async (plan) => {
    setSelectedPlanName(plan.name);
    setIsSubscribersModalOpen(true);
    setLoadingSubscribers(true);
    try {
      const res = await axios.get(import.meta.env.VITE_API_URL + '/api/v1/superadmin/families');
      if (res.data.success) {
        const matchNames = [plan.name.toLowerCase(), (plan.dbName || '').toLowerCase()].filter(Boolean);
        const planFamilies = res.data.data.filter(f => 
          f.plan && matchNames.includes(f.plan.toLowerCase())
        );
        setSubscribers(planFamilies);
      }
    } catch (err) {
      toast.error('Failed to fetch subscribers.');
    } finally {
      setLoadingSubscribers(false);
    }
  };

  const stats = [
    { name: 'Total Plans', value: plans.length.toString(), icon: Layers, color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-100' },
    { name: 'Active Subscribers', value: plans.reduce((acc, p) => acc + (p.families || 0), 0).toString(), icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Trial Users', value: '0', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' }, 
    { name: 'Monthly Revenue', value: '₹0', icon: IndianRupee, color: 'text-blue-600', bg: 'bg-blue-100' },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Plans</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure plan tiers, features, member limits, and pricing.</p>
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

      {/* Plans Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
             <div className="flex justify-center items-center h-48">
               <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
             </div>
          ) : plans.length === 0 ? (
             <div className="flex justify-center flex-col items-center h-48 text-gray-500 dark:text-slate-400">
               <p className="mb-4">No plans found</p>
               <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-lg hover:bg-indigo-100 transition font-medium text-sm">
                 <Plus size={18} /> Create Plan
               </button>
             </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300">
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
                  <tr key={plan.id || plan.name} className="hover:bg-slate-50 dark:bg-slate-900/50/50 transition-colors">
                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{plan.name}</td>
                    <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-200">{plan.price}</td>
                    <td className="py-4 px-6 text-center text-slate-600 dark:text-slate-300">{plan.families || 0}</td>
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">{plan.storage}</td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400 text-sm">{plan.features || 'Standard Features'}</td>
                    <td className="py-4 px-6">
                      <span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full w-max ${plan.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        <CheckCircle2 size={14} /> {plan.status || 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => handleEditClick(plan)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:bg-indigo-500/10 rounded-lg transition" 
                          title="Edit Plan"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => togglePlanStatus(plan)}
                          className={`p-2 rounded-lg transition ${plan.status === 'Active' ? 'text-emerald-500 hover:text-red-500 hover:bg-red-50' : 'text-slate-400 dark:text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'}`}
                          title={plan.status === 'Active' ? 'Disable Plan' : 'Enable Plan'}
                        >
                          <Power size={16} />
                        </button>
                        <button 
                          onClick={() => viewSubscribers(plan)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition" 
                          title="View Subscribers"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => deletePlan(plan.id)}
                          className="p-2 text-slate-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition" 
                          title="Delete Plan"
                        >
                          <Trash2 size={16} />
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
               onClick={() => !isSubmitting && handleCloseModal()}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg z-10 overflow-hidden flex flex-col"
            >
              <form onSubmit={handleCreateOrUpdatePlan} className="flex flex-col">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50/50">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{editingPlan ? 'Edit Plan' : 'Add New Plan'}</h3>
                  <button type="button" onClick={handleCloseModal} disabled={isSubmitting} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Plan Name *</label>
                      <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. Pro" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">DB Match Name</label>
                      <input type="text" name="dbName" value={formData.dbName} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. Premium" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Price *</label>
                      <input required type="text" name="price" value={formData.price} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. ₹999/month" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Storage *</label>
                      <input required type="text" name="storage" value={formData.storage} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. 100 GB" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Features (Comma separated)</label>
                    <input type="text" name="features" value={formData.features} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none" placeholder="e.g. Basic, Gallery, Calendar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 bg-white dark:bg-slate-900 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                      <option>Active</option>
                      <option>Draft</option>
                      <option>Archived</option>
                    </select>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end gap-3 mt-auto">
                  <button type="button" disabled={isSubmitting} onClick={handleCloseModal} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-900/50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 flex items-center gap-2 shadow-sm">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingPlan ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
                    {isSubmitting ? 'Saving...' : (editingPlan ? 'Save Changes' : 'Create Plan')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* VIEW SUBSCRIBERS MODAL */}
      <AnimatePresence>
        {isSubscribersModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
               onClick={() => setIsSubscribersModalOpen(false)}
            />
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
               className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-lg z-10 overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 dark:border-slate-800 flex justify-between items-center bg-gray-50 dark:bg-slate-900/50/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPlanName} Subscribers</h3>
                <button type="button" onClick={() => setIsSubscribersModalOpen(false)} className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:text-slate-300">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto flex-1">
                {loadingSubscribers ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
                  </div>
                ) : subscribers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-slate-400">
                    No active subscribers on this plan.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {subscribers.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:bg-slate-900/50 transition-colors">
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{sub.name}</div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{sub.code}</div>
                        </div>
                        <div className="text-right">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-150">
                            {sub.status || 'Active'}
                          </span>
                          <div className="text-xs text-slate-400 dark:text-slate-500 mt-1">Created: {sub.date}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-900/50 flex justify-end">
                <button type="button" onClick={() => setIsSubscribersModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-gray-300 rounded-lg hover:bg-gray-50 dark:bg-slate-900/50">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
