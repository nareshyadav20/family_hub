import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);



  const API_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, formData);
      const { user, token } = res.data;
      if (user.role?.toUpperCase() !== 'SUPER_ADMIN') {
        toast.error('Unauthorized access. Only Super Admins can log in here.');
        return;
      }
      localStorage.setItem('superadmin_token', token);
      localStorage.setItem('superadmin_user', JSON.stringify(user));
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 font-sans px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden animate-in fade-in slide-in-from-bottom-4">
        {/* Decorative Top Gradient */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>

        <div className="text-center mb-8 pt-4">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
            <ShieldAlert size={28} className="text-white" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight mb-2">Super Admin Portal</h2>
          <p className="text-slate-400 text-sm">Secure sign in to platform management</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="email" 
                required
                className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                placeholder="administrator@familyhub.os"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Admin Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="password"
                required 
                className="w-full bg-slate-950 text-white border border-slate-800 rounded-xl px-4 py-3 pl-11 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full mt-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-indigo-500/25 transition-all outline-none"
          >
            {loading ? 'Authenticating...' : 'Secure Authorization'}
          </button>
        </form>
        
        <p className="text-center text-sm text-slate-500 mt-8">
          Not a Super Admin? <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-4 decoration-indigo-400/30">Request Provisioning</Link>
        </p>
      </div>
    </div>
  );
}
