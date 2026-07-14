import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.login(formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
       <div className="w-full max-w-md bg-white dark:bg-slate-950 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 p-8 pt-10">
          <div className="mb-8 text-center">
             <div className="w-12 h-12 bg-blue-600 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             </div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Welcome back</h1>
             <p className="text-slate-500 text-sm font-medium">Please enter your details to sign in.</p>
          </div>
          
          {error && <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium text-center">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email</label>
               <input type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium dark:text-white" required />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Password</label>
               <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-transparent focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-sm font-medium dark:text-white" required />
             </div>
             <div className="flex items-center justify-between px-1">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500" />
                 <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Remember me</span>
               </label>
               <a href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
             </div>
             <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all mb-4">
               {loading ? 'Signing In...' : 'Sign In'}
             </button>
             <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
               Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:text-blue-700 transition-colors">Sign up</Link>
             </p>
          </form>
       </div>
    </div>
  )
}
