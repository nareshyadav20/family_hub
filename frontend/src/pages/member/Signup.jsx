import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authService.signup({ ...formData, role: 'MEMBER' });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Signup failed, please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FCFBFF] p-4">
       <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-[#E9E5F8] p-8 pt-10">
          <div className="mb-8 text-center">
             <div className="w-12 h-12 bg-[#7C5CFC] rounded-[24px] mx-auto mb-4 flex items-center justify-center shadow-lg shadow-blue-500/30">
               <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
             </div>
             <h1 className="text-2xl font-bold text-[#1F2430] mb-2 tracking-tight">Create an account</h1>
             <p className="text-slate-500 text-sm font-medium">Join us and start managing your family.</p>
          </div>
          
          {error && <div className="mb-4 p-3 rounded-[24px] bg-red-50 border border-red-200 text-red-600 text-sm font-medium text-center">{error}</div>}

          <form className="space-y-4" onSubmit={handleSubmit}>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-sm font-bold text-slate-700 ml-1">First Name</label>
                 <input type="text" placeholder="First" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 rounded-[24px] bg-[#FCFBFF] border border-transparent focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all text-sm font-medium" required />
               </div>
               <div className="space-y-1.5">
                 <label className="text-sm font-bold text-slate-700 ml-1">Last Name</label>
                 <input type="text" placeholder="Last" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 rounded-[24px] bg-[#FCFBFF] border border-transparent focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all text-sm font-medium" required />
               </div>
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
               <input type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 rounded-[24px] bg-[#FCFBFF] border border-transparent focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all text-sm font-medium" required />
             </div>
             <div className="space-y-1.5">
               <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
               <input type="password" placeholder="Create a password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 rounded-[24px] bg-[#FCFBFF] border border-transparent focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20 transition-all text-sm font-medium" required />
             </div>
             <button type="submit" disabled={loading} className="w-full py-3.5 px-4 bg-[#7C5CFC] hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-[24px] shadow-lg shadow-blue-600/30 transition-all mt-4 mb-4">
               {loading ? 'Creating account...' : 'Sign Up'}
             </button>
             <p className="text-center text-sm font-medium text-slate-600">
               Already have an account? <Link to="/login" className="text-[#7C5CFC] font-bold hover:text-[#2E1E6B] transition-colors">Sign in</Link>
             </p>
          </form>
       </div>
    </div>
  )
}
