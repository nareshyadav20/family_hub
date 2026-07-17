import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, User, Phone, ArrowLeft, Users, Shield, ArrowRight, Home } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [view, setView] = useState('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login Form State
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  // Admin Registration Form State
  const [adminForm, setAdminForm] = useState({ familyName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });

  // Member Registration Form State
  const [memberForm, setMemberForm] = useState({ inviteCode: '', name: '', email: '', phone: '', password: '', confirmPassword: '', relationship: '', branch: '' });

  const API_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginForm);
      const payload = res.data.success !== undefined ? res.data : res.data;
      
      localStorage.setItem('token', payload.token);
      if (payload.refreshToken) localStorage.setItem('refreshToken', payload.refreshToken);
      localStorage.setItem('user', JSON.stringify(payload.user));
      
      const role = payload.user.role?.toUpperCase();
      if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') {
         navigate('/admin/dashboard');
      } else {
         navigate('/member/dashboard');
      }
    } catch (err) {
      if (err.response?.status === 404 || err.response?.data?.error?.toLowerCase().includes('found') || err.response?.data?.error?.toLowerCase().includes('not exist')) {
          setErrorMsg('Account not found. Please register to join your family.');
      } else {
          setErrorMsg(err.response?.data?.error || 'Invalid credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdminRegister = async (e) => {
    e.preventDefault();
    if (adminForm.password !== adminForm.confirmPassword) return setErrorMsg('Passwords do not match');
    setErrorMsg('');
    setLoading(true);
    try {
      const nameParts = adminForm.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      await axios.post(`${API_URL}/auth/signup`, {
        firstName,
        lastName,
        email: adminForm.email,
        password: adminForm.password,
        phone: adminForm.phone,
        familyName: adminForm.familyName,
        role: 'ADMIN' // Requesting admin status + triggering family creation
      });
      setSuccessMsg('Family and Admin account created successfully! You can now log in.');
      setAdminForm({ familyName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
      setTimeout(() => { setSuccessMsg(''); setView('login'); }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to register admin profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleMemberRegister = async (e) => {
    e.preventDefault();
    if (memberForm.password !== memberForm.confirmPassword) return setErrorMsg('Passwords do not match');
    setErrorMsg('');
    setLoading(true);
    try {
      const nameParts = memberForm.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      await axios.post(`${API_URL}/auth/signup`, {
        firstName,
        lastName,
        email: memberForm.email,
        password: memberForm.password,
        phone: memberForm.phone,
        inviteCode: memberForm.inviteCode,
        relationship: memberForm.relationship,
        branch: memberForm.branch,
        role: 'MEMBER'
      });
      setSuccessMsg('Registration successful. Waiting for Admin Approval.');
      setMemberForm({ inviteCode: '', name: '', email: '', phone: '', password: '', confirmPassword: '', relationship: '', branch: '' });
      setTimeout(() => { setSuccessMsg(''); setView('login'); }, 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to request member access.');
    } finally {
      setLoading(false);
    }
  };

  // Render Left Promotional Panel
  const renderLeftPanel = () => (
    <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-[#4F46E5] to-[#7C3AED] text-white flex-col justify-between p-12 relative overflow-hidden">
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white/10 blur-3xl mix-blend-overlay"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#38BDF8]/20 blur-3xl mix-blend-overlay"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-16 relative z-20">
          <button 
             onClick={() => {
               if (view === 'register_admin' || view === 'register_member') setView('signup');
               else navigate('/');
             }} 
             className="w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all border border-white/20 shadow-lg cursor-pointer transform active:scale-95" 
             title={view === 'register_admin' || view === 'register_member' ? "Back to Options" : "Back to Home"}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 shadow-xl">
               <span className="text-2xl font-black text-white px-1">FH</span>
            </div>
            <span className="text-[22px] font-black tracking-tight">FamilyHub OS</span>
          </div>
        </div>
        
        <h1 className="text-[42px] font-black leading-[1.1] mb-6 tracking-tight">
          Your family's digital<br />home, secured<br />for generations.
        </h1>
        <p className="text-[17px] text-indigo-100/90 font-medium leading-relaxed max-w-sm mb-12">
          Connect your roots, preserve precious memories, manage assets, and communicate effortlessly in one unified portal.
        </p>

        <div className="space-y-4">
          {[
            { icon: Shield, text: "Bank-level encryption for family data" },
            { icon: Home, text: "Dedicated spaces for every family branch" },
            { icon: Users, text: "Seamless cross-generation networking" }
          ].map((feature, i) => (
            <div key={i} className="flex items-center gap-4 text-indigo-100">
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                <feature.icon size={18} />
              </div>
              <span className="text-[15px] font-bold">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="relative z-10 text-[13px] font-semibold text-indigo-200">
        &copy; {new Date().getFullYear()} FamilyHub Systems Inc.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 font-sans">
      
      {renderLeftPanel()}
      
      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 lg:px-20 relative h-screen overflow-y-auto w-full">
        <div className="w-full max-w-[460px] mx-auto relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Main Container */}
          <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none border border-slate-100 dark:border-slate-800 p-7 lg:p-10 pt-10 lg:pt-12 relative w-full">
            
            {/* Mobile Dynamic Back Arrow */}
            <button 
              onClick={() => {
                if (view === 'register_admin' || view === 'register_member') setView('signup');
                else navigate('/');
              }} 
              className="lg:hidden absolute top-6 left-6 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors bg-slate-50 dark:bg-slate-800/80 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md z-10"
              title={view === 'register_admin' || view === 'register_member' ? "Back to Options" : "Back to Home"}
            >
              <ArrowLeft size={18} />
            </button>

            <div className="text-center mb-8">
               {(view === 'login' || view === 'signup') && (
                  <div className="lg:hidden w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-xl font-black text-white px-1">FH</span>
                  </div>
               )}
               <h2 className="text-2xl lg:text-[30px] font-black text-slate-900 dark:text-white tracking-tight mb-2 leading-tight mt-4">
                 {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Join FamilyHub' : view === 'register_admin' ? 'Create a Family Hub' : 'Request Access'}
               </h2>
               <p className="text-slate-500 dark:text-slate-400 text-[15px] font-medium">
                 {view === 'login' ? 'Enter your details to sign in.' : view === 'signup' ? 'Choose your registration path below.' : 'Please fill in your details to continue.'}
               </p>
            </div>

            {/* Global Errors & Success Messages */}
            {errorMsg && (
               <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                 <p className="text-red-700 dark:text-red-400 text-[14px] font-bold m-0">{errorMsg}</p>
               </div>
            )}
            {successMsg && (
               <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 shadow-sm text-emerald-700 dark:text-emerald-400 text-[14px] font-bold text-center animate-in fade-in zoom-in-95 duration-200">
                  {successMsg}
               </div>
            )}

            {/* --- VIEW: LOGIN --- */}
            {view === 'login' && (
              <form onSubmit={handleLogin} className="space-y-5 animate-in slide-in-from-left-4 duration-300">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" required value={loginForm.email} onChange={e => setLoginForm({...loginForm, email: e.target.value})} className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold dark:text-white" placeholder="Enter your email" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1 flex justify-between">
                     Password
                     <a href="#" tabIndex="-1" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors outline-none cursor-pointer">Forgot?</a>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="password" required value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-sm font-semibold dark:text-white" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full mt-2 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-[15px] rounded-xl shadow-lg shadow-blue-500/25 transition-all outline-none disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]">
                  {loading ? 'Authenticating...' : 'Sign In'}
                </button>
              </form>
            )}

            {/* --- VIEW: SIGNUP (Role Selection) --- */}
            {view === 'signup' && (
              <div className="space-y-4 animate-in slide-in-from-right-4 duration-300 pb-2">
                 <button onClick={() => setView('register_admin')} className="w-full text-left p-6 rounded-[22px] border-2 border-slate-100 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-[0_4px_20px_rgba(37,99,235,0.1)] transition-all group outline-none focus:border-blue-500 cursor-pointer bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                         <Shield size={24} className="text-blue-600 dark:text-blue-400" />
                       </div>
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-[18px] mb-1">Register as Admin</h3>
                          <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Create a new FamilyHub, invite members, and manage roles.</p>
                       </div>
                       <ArrowRight size={22} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                 </button>
                 
                 <button onClick={() => setView('register_member')} className="w-full text-left p-6 rounded-[22px] border-2 border-slate-100 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-[0_4px_20px_rgba(79,70,229,0.1)] transition-all group outline-none focus:border-indigo-500 cursor-pointer bg-white dark:bg-slate-900">
                    <div className="flex items-center gap-5">
                       <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                         <User size={24} className="text-indigo-600 dark:text-indigo-400" />
                       </div>
                       <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white text-[18px] mb-1">Register as Member</h3>
                          <p className="text-[13px] text-slate-500 font-medium leading-relaxed">Request access or use an invite code to join a family.</p>
                       </div>
                       <ArrowRight size={22} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                 </button>
              </div>
            )}

            {/* --- VIEW: ADMIN REGISTRATION --- */}
            {view === 'register_admin' && (
              <form onSubmit={handleAdminRegister} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Family Name *</label>
                  <input type="text" required value={adminForm.familyName} onChange={e => setAdminForm({...adminForm, familyName: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="e.g. Smith Family" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name *</label>
                  <input type="text" required value={adminForm.name} onChange={e => setAdminForm({...adminForm, name: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="John Doe" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Email *</label>
                     <input type="email" required value={adminForm.email} onChange={e => setAdminForm({...adminForm, email: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="john@example.com" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Mobile *</label>
                     <input type="text" required value={adminForm.phone} onChange={e => setAdminForm({...adminForm, phone: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="+1234567890" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Password *</label>
                     <input type="password" required value={adminForm.password} onChange={e => setAdminForm({...adminForm, password: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm *</label>
                     <input type="password" required value={adminForm.confirmPassword} onChange={e => setAdminForm({...adminForm, confirmPassword: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-[15px] rounded-xl shadow-lg shadow-slate-900/20 dark:shadow-blue-500/20 transition-all disabled:opacity-70 transform active:scale-[0.98]">
                  {loading ? 'Processing...' : 'Create Family Hub'}
                </button>
              </form>
            )}

            {/* --- VIEW: MEMBER REGISTRATION --- */}
            {view === 'register_member' && (
              <form onSubmit={handleMemberRegister} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                <div className="space-y-1.5">
                  <label className="flex items-center justify-between text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">
                     Invitation Code <span className="text-slate-400 font-medium">(Optional)</span>
                  </label>
                  <input type="text" value={memberForm.inviteCode} onChange={e => setMemberForm({...memberForm, inviteCode: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 focus:border-indigo-500 focus:bg-indigo-50 dark:focus:bg-indigo-500/20 shadow-inner focus:outline-none focus:ring-4 focus:ring-indigo-500/20 transition-all text-[15px] font-bold text-indigo-700 dark:text-indigo-400 placeholder:font-semibold tracking-wide uppercase" placeholder="Enter invite code" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Full Name *</label>
                  <input type="text" required value={memberForm.name} onChange={e => setMemberForm({...memberForm, name: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="Jane Doe" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Email *</label>
                     <input type="email" required value={memberForm.email} onChange={e => setMemberForm({...memberForm, email: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="jane@example.com" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Mobile *</label>
                     <input type="text" required value={memberForm.phone} onChange={e => setMemberForm({...memberForm, phone: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="+1234567890" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Relationship *</label>
                     <input type="text" required value={memberForm.relationship} onChange={e => setMemberForm({...memberForm, relationship: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="e.g. Sister" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Family Branch *</label>
                     <input type="text" required value={memberForm.branch} onChange={e => setMemberForm({...memberForm, branch: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="e.g. Maternal" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-2">
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Password *</label>
                     <input type="password" required value={memberForm.password} onChange={e => setMemberForm({...memberForm, password: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="••••••••" />
                  </div>
                  <div className="space-y-1.5">
                     <label className="text-[13px] font-bold text-slate-700 dark:text-slate-300 ml-1">Confirm *</label>
                     <input type="password" required value={memberForm.confirmPassword} onChange={e => setMemberForm({...memberForm, confirmPassword: e.target.value})} className="w-full px-4 py-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-transparent focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-[14px] font-semibold dark:text-white" placeholder="••••••••" />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="w-full py-4 mt-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[15px] rounded-xl shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-70 transform active:scale-[0.98]">
                  {loading ? 'Sending Request...' : 'Request Access'}
                </button>
              </form>
            )}
            
          </div>
        </div>
      </div>
    </div>
  )
}
