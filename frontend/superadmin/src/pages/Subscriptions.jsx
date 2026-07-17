import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { X, CheckCircle, Crown, Diamond } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_URL + '';

export default function Subscriptions() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPlan, setEditPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', storage: '' });

  const fetchPlans = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await axios.get(`${API_URL}/api/v1/superadmin/subscriptions/plans`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setPlans(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openEditModal = (plan) => {
    setEditPlan(plan);
    setFormData({ name: plan.name, price: plan.price, storage: plan.storage });
  };

  const closeEditModal = () => {
    setEditPlan(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await axios.put(`${API_URL}/api/v1/superadmin/subscriptions/plans/${editPlan.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success('Plan updated successfully!');
        setEditPlan(null);
        fetchPlans();
      }
    } catch (err) {
      toast.error('Failed to update plan');
    }
  };

  const getPlanIcon = (planName) => {
    const p = planName.toLowerCase();
    if (p.includes('premium')) return <Crown className="w-8 h-8 text-purple-600" />;
    if (p.includes('enterprise')) return <Diamond className="w-8 h-8 text-blue-600" />;
    return <CheckCircle className="w-8 h-8 text-emerald-600" />;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Subscriptions</h2>
        <p className="text-sm text-gray-500 mt-2">Manage platform pricing plans and track active family subscriptions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, i) => (
          <motion.div 
            key={plan.id} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={`card-premium p-8 flex flex-col relative overflow-hidden group ${plan.id === 'premium' ? 'ring-2 ring-purple-600 shadow-xl shadow-purple-900/10' : ''}`}
          >
            {plan.id === 'premium' && (
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase tracking-wider">
                Most Popular
              </div>
            )}
            
            <div className={`p-4 inline-flex rounded-2xl w-max mb-6 ${plan.id === 'premium' ? 'bg-purple-100' : plan.id === 'enterprise' ? 'bg-blue-100' : 'bg-emerald-100'}`}>
              {getPlanIcon(plan.name)}
            </div>
            
            <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name} Plan</h3>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
            </div>

            <div className="flex-1 space-y-4 mb-8">
              <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-3"></span>
                <strong className="text-gray-900 mr-1">{plan.families?.toLocaleString() || '0'}</strong> active families
              </div>
              <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-3"></span>
                <strong className="text-gray-900 mr-1">{plan.storage}</strong> cloud storage
              </div>
            </div>

            <button 
              onClick={() => openEditModal(plan)}
              className={`w-full py-3 px-4 font-semibold rounded-xl transition-all duration-200 ${
                plan.id === 'premium' 
                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5' 
                : 'bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-800 hover:bg-gray-50'
              }`}
            >
              Edit Plan
            </button>
          </motion.div>
        ))}
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editPlan && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
            >
              <button onClick={closeEditModal} className="absolute right-6 top-6 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 rounded-full p-2">
                <X size={20} />
              </button>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit {editPlan.name} Plan</h3>
              
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pricing Display</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="e.g. $49/mo or Free"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Limit</label>
                  <input
                    type="text"
                    value={formData.storage}
                    onChange={(e) => setFormData({...formData, storage: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    placeholder="e.g. 50 GB"
                    required
                  />
                </div>
                
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={closeEditModal} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Save Changes
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
