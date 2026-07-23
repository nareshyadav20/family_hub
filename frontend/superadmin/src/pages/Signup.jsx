import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { User, Mail, Lock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'SUPER_ADMIN' });
  const [loading, setLoading] = useState(false);

  const API_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/signup`, formData);
      toast.success('Super Admin Provisioned Successfully!');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to provision account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500"></div>

        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-teal-500/20">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Provision Super Admin</h2>
          <p className="text-slate-400 dark:text-slate-500 text-sm">Register a new global infrastructure manager</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex gap-4">
             <div className="flex-1">
               <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">First Name</label>
               <div className="relative">
                 <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
                 <input type="text" required className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-600 dark:text-slate-300" placeholder="Alpha" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
               </div>
             </div>
             <div className="flex-1">
               <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Last Name</label>
               <input type="text" className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-600 dark:text-slate-300" placeholder="Admin" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
             </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
              <input type="email" required className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-600 dark:text-slate-300" placeholder="administrator@familyhub.os" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Master Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400" size={18} />
              <input type="password" required className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all placeholder:text-slate-600 dark:text-slate-300" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-teal-500/25 transition-all outline-none"
          >
            {loading ? 'Provisioning...' : 'Provision Account'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-8">
          Already Provisioned? <Link to="/login" className="text-teal-400 hover:text-teal-300 font-semibold underline underline-offset-4 decoration-teal-400/30">Secure Sign In</Link>
        </p>
      </div>
    </div>
  );
}
