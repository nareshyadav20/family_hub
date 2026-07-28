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
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBFF] p-4 font-sans">
       <div className="w-full max-w-md bg-white rounded-[24px] shadow-sm border border-[#E9E5F8] p-8 pt-10">
          <div className="mb-8 text-center">
             <div className="w-12 h-12 bg-[#EEE8FF] rounded-[24px] mx-auto mb-4 flex items-center justify-center">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C5CFC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             </div>
             <h1 className="text-2xl font-bold text-[#1F2430] mb-2 tracking-tight">Welcome back</h1>
             <p className="text-[#6B7280] text-sm font-semibold">Please enter your details to sign in.</p>
          </div>
          
          {error && <div className="mb-4 p-3 rounded-[24px] bg-red-50 border border-red-200 text-red-600 text-sm font-semibold text-center">{error}</div>}

          <form className="space-y-5" onSubmit={handleSubmit}>
             <div className="space-y-1.5">
               <label className="text-sm font-bold text-[#1F2430] ml-1">Email</label>
               <input type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-[16px] bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-sm font-semibold text-[#1F2430]" required />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-bold text-[#1F2430] ml-1">Password</label>
               <input type="password" placeholder="••••••••" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 rounded-[16px] bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-sm font-semibold text-[#1F2430]" required />
             </div>
             <div className="flex items-center justify-between px-1">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="checkbox" className="rounded text-[#7C5CFC] focus:ring-[#7C5CFC]" />
                 <span className="text-sm font-semibold text-[#6B7280]">Remember me</span>
               </label>
               <a href="#" className="text-sm font-bold text-[#7C5CFC] hover:text-[#6B49F6] transition-colors">Forgot password?</a>
             </div>
             <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-[#7C5CFC] hover:bg-[#6B49F6] disabled:bg-[#7C5CFC]/50 text-white font-bold rounded-[16px] shadow-lg shadow-[#7C5CFC]/20 transition-all mb-4">
               {loading ? 'Signing In...' : 'Sign In'}
             </button>
          </form>
       </div>
    </div>
  )
}
