import React, { useState } from 'react';
import { Mail, Lock, User, Shield, ArrowRight, ArrowLeft, Eye, EyeOff, MessageSquare, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

let rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
if (rawApiUrl.endsWith('/')) rawApiUrl = rawApiUrl.slice(0, -1);
const API_URL = rawApiUrl.endsWith('/api/v1') ? rawApiUrl : `${rawApiUrl}/api/v1`;

export default function Login() {
  const [view, setView] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [adminForm, setAdminForm] = useState({ familyName: '', name: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [memberForm, setMemberForm] = useState({ inviteCode: '', name: '', email: '', phone: '', password: '', confirmPassword: '', relationship: '', branch: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [forceResetForm, setForceResetForm] = useState({ newPassword: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, loginForm);
      if (res.data.requirePasswordChange) {
        localStorage.setItem('tempToken', res.data.token);
        setView('force_reset');
      } else {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));

        const role = res.data.user?.role?.toUpperCase();
        if (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/member/dashboard');
        }
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email: forgotEmail });
      setSuccessMsg('Temporary password sent to your email.');
      setForgotEmail('');
      setTimeout(() => { setSuccessMsg(''); setView('login'); }, 4000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to process request.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceReset = async (e) => {
    e.preventDefault();
    if (forceResetForm.newPassword !== forceResetForm.confirmPassword) {
      return setErrorMsg('Passwords do not match');
    }
    setErrorMsg('');
    setLoading(true);
    try {
      const tempToken = localStorage.getItem('tempToken');
      await axios.post(`${API_URL}/auth/reset-password`,
        { newPassword: forceResetForm.newPassword },
        { headers: { Authorization: `Bearer ${tempToken}` } }
      );
      localStorage.removeItem('tempToken');
      setSuccessMsg('Password updated successfully. Please login.');
      setTimeout(() => { setSuccessMsg(''); setView('login'); }, 3000);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to update password');
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

      const res = await axios.post(`${API_URL}/auth/signup`, {
        firstName,
        lastName,
        email: adminForm.email,
        password: adminForm.password,
        phone: adminForm.phone,
        familyName: adminForm.familyName,
        role: 'ADMIN'
      });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/admin/dashboard');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Registration failed');
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

  return (
    <div className="min-h-screen w-full flex flex-col bg-white p-4 lg:p-8 font-sans relative overflow-x-hidden overflow-y-auto">

      {/* Max Width Wrapper for Content - FULL SCREEN WIDE */}
      <div className="w-full max-w-[1250px] mx-auto flex flex-col min-h-[calc(100vh-4rem)]">

        {/* Top Header Row */}
        <div className="flex items-center gap-2 mb-2 lg:mb-4 flex-none">
          <button
            onClick={() => {
              if (view === 'login' || view === 'signup') navigate('/');
              else if (view === 'register_admin' || view === 'register_member') setView('signup');
              else if (view === 'forgot') setView('login');
              else navigate('/');
            }}
            className="text-[#6B7280] hover:text-[#7C5CFC] transition-colors flex items-center justify-center cursor-pointer shrink-0 mr-1"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <img src="/logo.png" alt="Family Hub Logo" className="w-10 h-10 object-contain rounded-xl shrink-0 shadow-[0_2px_10px_rgb(0,0,0,0.08)]" />
          <div className="flex items-center gap-2 leading-none ml-1">
            <span className="font-bold text-[20px] text-slate-800 tracking-tight">FamilyHub OS</span>
          </div>
        </div>

        {/* Main Grid: Left Content & Right Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center flex-1 py-4">

          {/* Left Panel: Content & Constellation Illustration */}
          <div className="lg:col-span-7 text-left flex flex-col justify-center pr-4">
            <h1 className="text-[38px] lg:text-[50px] font-bold leading-[1.1] mb-4 text-slate-900 tracking-tight">
              Let's Build Your<br />
              <span className="text-[#7C5CFC]">Family Hub</span>
            </h1>
            <p className="text-[16px] lg:text-[17px] text-slate-600 font-medium leading-relaxed max-w-lg mb-6">
              We're here to help you get started on your family journey. Connect all your loved ones in one place.
            </p>

            {/* Constellation Family Illustration - Extended with more members & sparkles */}
            <div className="w-full flex justify-start mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 260" className="w-full max-w-[500px] h-auto drop-shadow-xl">

                {/* Connecting Constellation Lines (Purple theme) */}
                <g stroke="#7C5CFC" strokeWidth="1.5" opacity="0.4">
                  <line x1="60" y1="110" x2="135" y2="100" />
                  <line x1="135" y1="100" x2="210" y2="115" />
                  <line x1="210" y1="115" x2="290" y2="95" />
                  <line x1="290" y1="95" x2="350" y2="120" />

                  <line x1="135" y1="100" x2="95" y2="160" />
                  <line x1="135" y1="100" x2="165" y2="175" />
                  <line x1="210" y1="115" x2="165" y2="175" />
                  <line x1="210" y1="115" x2="245" y2="165" />
                  <line x1="290" y1="95" x2="245" y2="165" />
                  <line x1="290" y1="95" x2="320" y2="170" />

                  <line x1="60" y1="110" x2="95" y2="160" />
                  <line x1="350" y1="120" x2="320" y2="170" />
                </g>

                {/* Constellation Dots (Purple/Dark) */}
                <g fill="#0A1A30" opacity="0.9">
                  <circle cx="60" cy="110" r="3.5" />
                  <circle cx="135" cy="100" r="4.5" />
                  <circle cx="210" cy="115" r="5" />
                  <circle cx="290" cy="95" r="4.5" />
                  <circle cx="350" cy="120" r="3.5" />
                  <circle cx="95" cy="160" r="3" />
                  <circle cx="165" cy="175" r="3.5" />
                  <circle cx="245" cy="165" r="3" />
                  <circle cx="320" cy="170" r="3" />
                </g>

                {/* Additional Sparkles / Stars */}
                <g fill="#A892FC" opacity="0.9">
                  <polygon points="40,50 42,56 48,57 43,61 45,67 40,63 35,67 37,61 32,57 38,56" />
                  <polygon points="180,30 181.5,34.5 186,35 182.5,38 184,42.5 180,39.5 176,42.5 177.5,38 174,35 178.5,34.5" />
                  <polygon points="380,60 382,64 386,65 383,68 384,72 380,69 376,72 377,68 374,65 378,64" />
                </g>
                <g fill="#5B8DEF" opacity="0.7">
                  <polygon points="90,200 91.5,204.5 96,205 92.5,208 94,212.5 90,209.5 86,212.5 87.5,208 84,205 88.5,204.5" />
                  <polygon points="330,210 331,213 334,213.5 331.5,215.5 332.5,218.5 330,216.5 327.5,218.5 328.5,215.5 326,213.5 329,213" />
                  <polygon points="250,50 251,53 254,53.5 251.5,55.5 252.5,58.5 250,56.5 247.5,58.5 248.5,55.5 246,53.5 249,53" />
                </g>
                <g fill="#F6B93B" opacity="0.8">
                  <circle cx="110" cy="60" r="4" />
                  <circle cx="310" cy="40" r="3" />
                  <circle cx="200" cy="190" r="4" />
                  <circle cx="390" cy="150" r="5" />
                  <circle cx="30" cy="140" r="4" />
                </g>
                <g fill="#EF5350" opacity="0.6">
                  <circle cx="150" cy="45" r="3" />
                  <circle cx="270" cy="205" r="4" />
                  <circle cx="410" cy="100" r="3" />
                </g>

                {/* --- FAMILY MEMBERS --- */}

                <g transform="translate(45, 80)">
                  <circle cx="15" cy="15" r="9" fill="#E8C39E" />
                  <path d="M6 10 H24" stroke="#D1D5DB" strokeWidth="3" />
                  <path d="M6 35 L24 35 L22 20 L8 20 Z" fill="#475569" />
                  <rect x="8" y="35" width="5" height="25" fill="#1E293B" />
                  <rect x="17" y="35" width="5" height="25" fill="#1E293B" />
                </g>

                <g transform="translate(120, 70)">
                  <circle cx="15" cy="15" r="11" fill="#E8C39E" />
                  <path d="M4 13 H26" stroke="#1E293B" strokeWidth="2.5" />
                  <path d="M2 55 L28 55 L24 25 L6 25 Z" fill="#3F388E" />
                  <rect x="6" y="55" width="6" height="35" fill="#2E285F" />
                  <rect x="18" y="55" width="6" height="35" fill="#2E285F" />
                </g>

                <g transform="translate(195, 85)">
                  <circle cx="15" cy="15" r="10.5" fill="#E8C39E" />
                  <path d="M5 25 Q15 0 25 25" fill="#78350F" />
                  <path d="M2 55 L28 55 L24 25 L6 25 Z" fill="#2563EB" />
                  <path d="M0 70 L30 70 L28 55 L2 55 Z" fill="#1E3A8A" />
                  <rect x="6" y="70" width="5" height="20" fill="#E8C39E" />
                  <rect x="19" y="70" width="5" height="20" fill="#E8C39E" />
                </g>

                <g transform="translate(275, 65)">
                  <circle cx="15" cy="15" r="9" fill="#E8C39E" />
                  <circle cx="15" cy="10" r="8" fill="#D1D5DB" />
                  <path d="M4 45 L26 45 L22 20 L8 20 Z" fill="#9333EA" />
                  <path d="M2 65 L28 65 L26 45 L4 45 Z" fill="#581C87" />
                  <rect x="8" y="65" width="4" height="15" fill="#E8C39E" />
                  <rect x="18" y="65" width="4" height="15" fill="#E8C39E" />
                </g>

                <g transform="translate(335, 90)">
                  <circle cx="15" cy="15" r="9" fill="#E8C39E" />
                  <path d="M5 40 L25 40 L22 22 L8 22 Z" fill="#059669" />
                  <rect x="8" y="40" width="5" height="25" fill="#064E3B" />
                  <rect x="17" y="40" width="5" height="25" fill="#064E3B" />
                </g>

                <g transform="translate(85, 145)">
                  <circle cx="10" cy="10" r="7.5" fill="#E8C39E" />
                  <path d="M2 32 L18 32 L15 17 L5 17 Z" fill="#DC2626" />
                  <rect x="4" y="32" width="4" height="18" fill="#E8C39E" />
                  <rect x="12" y="32" width="4" height="18" fill="#E8C39E" />
                </g>

                <g transform="translate(155, 160)">
                  <circle cx="10" cy="10" r="7.5" fill="#E8C39E" />
                  <path d="M1 32 L19 32 L15 17 L5 17 Z" fill="#D97706" />
                  <rect x="4" y="32" width="4" height="18" fill="#E8C39E" />
                  <rect x="12" y="32" width="4" height="18" fill="#E8C39E" />
                </g>

                <g transform="translate(235, 150)">
                  <circle cx="10" cy="10" r="6.5" fill="#E8C39E" />
                  <path d="M3 28 L17 28 L14 15 L6 15 Z" fill="#2563EB" />
                  <rect x="5" y="28" width="3" height="15" fill="#E8C39E" />
                  <rect x="12" y="28" width="3" height="15" fill="#E8C39E" />
                </g>

                <g transform="translate(310, 155)">
                  <circle cx="10" cy="10" r="8" fill="#E8C39E" />
                  <path d="M1 34 L19 34 L15 17 L5 17 Z" fill="#14B8A6" />
                  <rect x="4" y="34" width="4" height="20" fill="#0F766E" />
                  <rect x="12" y="34" width="4" height="20" fill="#0F766E" />
                </g>

              </svg>
            </div>
          </div>

          {/* Right Panel: White Card Form */}
          <div className="lg:col-span-5 w-full max-w-md mx-auto">
            <div className="bg-white rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-slate-100 p-6 lg:p-9 relative w-full text-left text-slate-800">



              <div className="text-center mb-6">
                <h2 className="text-[25px] font-bold text-slate-800 tracking-tight mb-1.5 leading-tight">
                  {view === 'login' ? 'Welcome back' : view === 'signup' ? 'Join FamilyHub' : view === 'register_admin' ? 'Create a Family Hub' : view === 'forgot' ? 'Forgot Password' : view === 'force_reset' ? 'Update Password' : 'Request Access'}
                </h2>
                <p className="text-[#6B7280] text-sm font-semibold">
                  {view === 'login' ? 'Enter your details to sign in.' : view === 'signup' ? 'Choose your registration path below.' : view === 'forgot' ? 'We will send a temporary password.' : view === 'force_reset' ? 'You must create a new password.' : 'Please fill in your details to continue.'}
                </p>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-700 text-xs font-bold m-0">{errorMsg}</p>
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold text-center">
                  {successMsg}
                </div>
              )}

              {/* --- VIEW: LOGIN --- */}
              {view === 'login' && (
                <form onSubmit={handleLogin} autoComplete="off" className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input type="email" autoComplete="off" required value={loginForm.email} onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] transition-all font-semibold" placeholder="Enter your email" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 ml-1 flex justify-between">
                      Password
                      <a onClick={() => setView('forgot')} className="text-[#7C5CFC] hover:text-[#6B49F6] transition-colors outline-none cursor-pointer">Forgot?</a>
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input type={showPassword ? "text" : "password"} autoComplete="new-password" required value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} className="w-full pl-10 pr-11 py-3 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] transition-all font-semibold" placeholder="••••••••" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#7C5CFC] transition-colors focus:outline-none">
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-3 bg-[#383084] hover:bg-[#2C266F] text-white font-bold text-sm rounded-xl shadow-md transition-all outline-none disabled:opacity-70">
                    {loading ? 'Authenticating...' : 'Sign In'}
                  </button>

                </form>
              )}

              {/* --- VIEW: FORGOT PASSWORD --- */}
              {view === 'forgot' && (
                <form onSubmit={handleForgotPassword} autoComplete="off" className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 ml-1">Registered Email</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input type="email" autoComplete="off" required value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] transition-all font-semibold" placeholder="Enter your email" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading || !forgotEmail} className="w-full mt-2 py-3 bg-[#383084] hover:bg-[#2C266F] text-white font-bold text-sm rounded-xl shadow-md transition-all outline-none disabled:opacity-70">
                    {loading ? 'Sending...' : 'Send Temporary Password'}
                  </button>
                  <div className="text-center mt-4">
                    <button type="button" onClick={() => setView('login')} className="text-xs font-bold text-[#6B7280] hover:text-[#7C5CFC] transition-colors">
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* --- VIEW: FORCE RESET PASSWORD --- */}
              {view === 'force_reset' && (
                <form onSubmit={handleForceReset} autoComplete="off" className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 ml-1">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input type="password" required autoComplete="new-password" value={forceResetForm.newPassword} onChange={e => setForceResetForm({ ...forceResetForm, newPassword: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] transition-all font-semibold" placeholder="••••••••" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 ml-1">Confirm New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                      <input type="password" required autoComplete="new-password" value={forceResetForm.confirmPassword} onChange={e => setForceResetForm({ ...forceResetForm, confirmPassword: e.target.value })} className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-[#6B7280]/50 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] transition-all font-semibold" placeholder="••••••••" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full mt-2 py-3 bg-[#2EB67D] hover:bg-[#2EB67D]/95 text-white font-bold text-sm rounded-xl shadow-md transition-all outline-none disabled:opacity-70">
                    {loading ? 'Updating...' : 'Set New Password & Login'}
                  </button>
                </form>
              )}

              {/* --- VIEW: SIGNUP --- */}
              {view === 'signup' && (
                <div className="space-y-3 pb-2 text-left">
                  <button onClick={() => setView('register_admin')} className="w-full text-left p-4 rounded-2xl border border-[#E9E5F8] hover:border-[#7C5CFC] hover:shadow-sm transition-all group outline-none focus:border-[#7C5CFC] cursor-pointer bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-[#FAF8FF] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Shield size={20} className="text-[#7C5CFC]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-[15px] mb-0.5">Register as Admin</h3>
                        <p className="text-[11px] text-[#6B7280] font-semibold leading-normal">Create a new FamilyHub, invite members, and manage roles.</p>
                      </div>
                      <ArrowRight size={18} className="text-[#6B7280]/60 group-hover:text-[#7C5CFC] transition-colors" />
                    </div>
                  </button>

                  <button onClick={() => setView('register_member')} className="w-full text-left p-4 rounded-2xl border border-[#E9E5F8] hover:border-[#7C5CFC] hover:shadow-sm transition-all group outline-none focus:border-[#7C5CFC] cursor-pointer bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 bg-[#FAF8FF] rounded-full flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <User size={20} className="text-[#7C5CFC]" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-800 text-[15px] mb-0.5">Register as Member</h3>
                        <p className="text-[11px] text-[#6B7280] font-semibold leading-normal">Request access or use an invite code to join a family.</p>
                      </div>
                      <ArrowRight size={18} className="text-[#6B7280]/60 group-hover:text-[#7C5CFC] transition-colors" />
                    </div>
                  </button>
                  <div className="text-center mt-4">
                    <span className="text-xs font-semibold text-[#6B7280]">Already have an account? </span>
                    <button type="button" onClick={() => setView('login')} className="text-xs font-bold text-[#7C5CFC] hover:text-[#6B49F6] transition-colors">Sign In</button>
                  </div>
                </div>
              )}

              {/* --- VIEW: ADMIN REGISTRATION --- */}
              {view === 'register_admin' && (
                <form onSubmit={handleAdminRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 ml-1">Family Name *</label>
                    <input type="text" required value={adminForm.familyName} onChange={e => setAdminForm({ ...adminForm, familyName: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="e.g. Smith Family" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 ml-1">Full Name *</label>
                    <input type="text" required value={adminForm.name} onChange={e => setAdminForm({ ...adminForm, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="John Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Email *</label>
                      <input type="email" required value={adminForm.email} onChange={e => setAdminForm({ ...adminForm, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="john@example.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Mobile *</label>
                      <input type="text" required value={adminForm.phone} onChange={e => setAdminForm({ ...adminForm, phone: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="+123456" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Password *</label>
                      <input type="password" required value={adminForm.password} onChange={e => setAdminForm({ ...adminForm, password: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="••••••••" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Confirm *</label>
                      <input type="password" required value={adminForm.confirmPassword} onChange={e => setAdminForm({ ...adminForm, confirmPassword: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="••••••••" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-[#383084] hover:bg-[#2C266F] text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70">
                    {loading ? 'Processing...' : 'Create Family Hub'}
                  </button>
                </form>
              )}

              {/* --- VIEW: MEMBER REGISTRATION --- */}
              {view === 'register_member' && (
                <form onSubmit={handleMemberRegister} className="space-y-3">
                  <div className="space-y-1">
                    <label className="flex items-center justify-between text-xs font-bold text-slate-800 ml-1">
                      Invitation Code <span className="text-[#6B7280] font-semibold text-[10px]">(Optional)</span>
                    </label>
                    <input type="text" value={memberForm.inviteCode} onChange={e => setMemberForm({ ...memberForm, inviteCode: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 shadow-inner transition-all text-xs font-bold text-[#7C5CFC] placeholder:font-semibold uppercase tracking-wider" placeholder="Enter invite code" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-800 ml-1">Full Name *</label>
                    <input type="text" required value={memberForm.name} onChange={e => setMemberForm({ ...memberForm, name: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="Jane Doe" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Email *</label>
                      <input type="email" required value={memberForm.email} onChange={e => setMemberForm({ ...memberForm, email: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="jane@example.com" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Mobile *</label>
                      <input type="text" required value={memberForm.phone} onChange={e => setMemberForm({ ...memberForm, phone: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="+123456" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Relationship *</label>
                      <input type="text" required value={memberForm.relationship} onChange={e => setMemberForm({ ...memberForm, relationship: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="Sister" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Family Branch *</label>
                      <input type="text" required value={memberForm.branch} onChange={e => setMemberForm({ ...memberForm, branch: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="Maternal" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pb-1">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Password *</label>
                      <input type="password" required value={memberForm.password} onChange={e => setMemberForm({ ...memberForm, password: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="••••••••" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-800 ml-1">Confirm *</label>
                      <input type="password" required value={memberForm.confirmPassword} onChange={e => setMemberForm({ ...memberForm, confirmPassword: e.target.value })} className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8FF] border border-[#E9E5F8] focus:border-[#7C5CFC] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 transition-all text-xs font-semibold text-[#1F2430]" placeholder="••••••••" />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-3 mt-2 bg-[#383084] hover:bg-[#2C266F] text-white font-bold text-sm rounded-xl shadow-md disabled:opacity-70">
                    {loading ? 'Sending Request...' : 'Request Access'}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>

        {/* Bottom Horizontal Contacts Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 lg:pt-6 border-t border-slate-200 mt-6 lg:mt-8 mb-2 flex-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C5CFC] flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
              <MessageSquare size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-slate-800 leading-tight">Live Chat</span>
              <span className="text-[11px] font-semibold text-slate-500 leading-tight">We're online</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C5CFC] flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
              <Phone size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-slate-800 leading-tight">WhatsApp</span>
              <span className="text-[11px] font-semibold text-slate-500 leading-tight">+91 99763-42010</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#7C5CFC] flex items-center justify-center shrink-0 border border-purple-100 shadow-sm">
              <Mail size={18} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[13px] font-bold text-slate-800 leading-tight">Email</span>
              <span className="text-[11px] font-semibold text-slate-500 leading-tight">support@familyhub.com</span>
            </div>
          </div>
        </div>

      </div>

      {/* Footer Copy */}
      <div className="text-[12px] font-semibold text-slate-500 text-center mt-4 mb-2 flex-none">
        &copy; {new Date().getFullYear()} FamilyHub Systems Inc.
      </div>
    </div>
  );
}
