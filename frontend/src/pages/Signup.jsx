import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Users, ArrowLeft, ArrowRight, Eye, EyeOff, ShieldCheck, UserCheck, Smartphone, Check, Briefcase, Bell, Phone } from 'lucide-react';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

export default function Signup() {
  const navigate = useNavigate();
  const [step, setStep] = useState('select'); // 'select', 'admin', 'member'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e, role) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    
    // Split full name for legacy backend compat
    const parts = formData.fullName.split(' ');
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ') || '';

    setLoading(true);
    try {
      const payload = {
        firstName,
        lastName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: role
      };
      
      const res = await authService.signup(payload);
      const data = res.data.success !== undefined ? res.data : res;
      
      localStorage.setItem('token', data.token);
      if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      toast.success("Account created successfully!");
      
      if (data.user.role === 'SUPER_ADMIN' || data.user.role === 'ADMIN' || data.user.role === 'FAMILY_ADMIN') {
         navigate('/admin/dashboard');
      } else {
         navigate('/member/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between w-full mb-8">
      {step !== 'select' ? (
        <button onClick={() => setStep('select')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft size={16} /> Back to Role Selection
        </button>
      ) : (
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
             <Users size={16} />
           </div>
           <span className="font-bold text-slate-800 tracking-tight">FamilyHub OS</span>
        </div>
      )}
      <div className="text-sm font-semibold text-slate-500">
        Already have an account? <Link to="/login" className="text-blue-600 hover:text-blue-700">Login</Link>
      </div>
    </div>
  );

  const renderSelectStep = () => (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center animate-in fade-in zoom-in-95 duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-black tracking-tight text-slate-900 mb-3">Create Your Account</h1>
        <p className="text-slate-500 text-lg">Join your family community and stay connected.</p>
        <p className="text-sm font-bold mt-8 text-slate-400 uppercase tracking-widest">Choose how you want to register</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 w-full max-w-3xl">
        {/* Admin Card */}
        <div className="relative group p-8 rounded-[2rem] bg-white border-2 border-transparent hover:border-[#7C3AED] shadow-xl shadow-slate-200/50 hover:shadow-purple-500/20 transition-all duration-300 flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-50 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-20 h-20 bg-[#7C3AED] text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Shield size={36} />
            </div>
            <h2 className="text-2xl font-bold text-[#7C3AED] mb-3">Register as Admin</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">Admins can manage the family, invite members and handle settings.</p>
            
            <ul className="text-left space-y-3 w-full max-w-[200px] mb-10 text-sm font-semibold text-slate-600">
              <li className="flex items-center gap-3"><Check size={16} className="text-[#7C3AED]"/> Manage Family Members</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-[#7C3AED]"/> Create & Manage Events</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-[#7C3AED]"/> Manage Announcements</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-[#7C3AED]"/> Access All Features</li>
            </ul>

            <button onClick={() => setStep('admin')} className="w-full py-4 px-6 bg-[#7C3AED] text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 mt-auto">
              Register as Admin <ArrowRight size={20} />
            </button>
          </div>
        </div>

        {/* Member Card */}
        <div className="relative group p-8 rounded-[2rem] bg-white border-2 border-transparent hover:border-[#059669] shadow-xl shadow-slate-200/50 hover:shadow-green-500/20 transition-all duration-300 flex flex-col items-center text-center">
          <div className="absolute inset-0 bg-gradient-to-bl from-emerald-50 to-transparent rounded-[2rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="w-20 h-20 bg-[#059669] text-white rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
              <Users size={36} />
            </div>
            <h2 className="text-2xl font-bold text-[#059669] mb-3">Register as Member</h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed px-4">Members can connect with family, view updates and participate.</p>
            
            <ul className="text-left space-y-3 w-full max-w-[200px] mb-10 text-sm font-semibold text-slate-600">
              <li className="flex items-center gap-3"><Check size={16} className="text-[#059669]"/> View Family Updates</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-[#059669]"/> Participate in Events</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-[#059669]"/> Access Shared Albums</li>
              <li className="flex items-center gap-3"><Check size={16} className="text-[#059669]"/> Stay Connected</li>
            </ul>

            <button onClick={() => setStep('member')} className="w-full py-4 px-6 bg-[#059669] text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2 mt-auto">
              Register as Member <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="mt-16 flex items-center justify-center gap-12 text-slate-400 text-xs font-bold uppercase tracking-wider">
         <div className="flex items-center gap-2"><ShieldCheck size={16}/> Secure & Private</div>
         <div className="flex items-center gap-2"><Users size={16}/> Family Connected</div>
         <div className="flex items-center gap-2"><Smartphone size={16}/> Easy to Use</div>
      </div>
      <p className="mt-12 text-xs text-slate-400">© 2026 FamilyHub OS. All rights reserved.</p>
    </div>
  );

  const renderForm = (roleDef) => (
    <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-stretch pt-4 animate-in slide-in-from-bottom-8 duration-500 h-full">
      <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col h-full">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 mb-2">Register as {roleDef.title}</h1>
        <p className="text-slate-500 mb-8">{roleDef.subtitle}</p>

        <form onSubmit={(e) => handleSignup(e, roleDef.id)} className="space-y-5 flex-1 flex flex-col">
          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Full Name <span className="text-red-500">*</span></label>
               <input type="text" name="fullName" placeholder="Enter full name" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-900 text-sm" required />
             </div>
             <div className="space-y-1.5">
               <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Email Address <span className="text-red-500">*</span></label>
               <input type="email" name="email" placeholder="Enter email address" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-900 text-sm" required />
             </div>
          </div>

          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-1.5 relative">
               <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Mobile Number <span className="text-red-500">*</span></label>
               <div className="flex">
                  <select className="shrink-0 pl-3 pr-8 py-3 rounded-l-xl bg-slate-100 outline-none border border-r-0 border-slate-200 font-bold text-slate-700 text-sm appearance-none">
                     <option>+91</option>
                     <option>+1</option>
                     <option>+44</option>
                  </select>
                  <input type="tel" name="phone" placeholder="Enter mobile number" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-r-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 border-l-0 focus:border-blue-500 transition-all font-medium text-slate-900 text-sm" required />
               </div>
             </div>
             {roleDef.id === 'MEMBER' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-900 text-sm uppercase" required />
                </div>
             )}
          </div>

          <div className="grid grid-cols-2 gap-5">
             <div className="space-y-1.5 relative">
               <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Create Password <span className="text-red-500">*</span></label>
               <div className="relative">
                 <input type={showPassword ? 'text' : 'password'} name="password" placeholder="Enter password" value={formData.password} onChange={handleInputChange} className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-900 text-sm" required />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                 </button>
               </div>
             </div>
             <div className="space-y-1.5 relative">
               <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">Confirm Password <span className="text-red-500">*</span></label>
               <div className="relative">
                 <input type={showPassword ? 'text' : 'password'} name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleInputChange} className="w-full pr-12 pl-4 py-3 rounded-xl bg-slate-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 border border-slate-200 focus:border-blue-500 transition-all font-medium text-slate-900 text-sm" required />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                 </button>
               </div>
             </div>
          </div>

          <div className="flex-1"></div>

          <button type="submit" disabled={loading} className={`w-full py-4 mt-8 rounded-xl font-bold text-white transition-all shadow-lg ${roleDef.colorClass}`}>
             {loading ? 'Creating...' : `Create ${roleDef.title} Account`}
          </button>
          
          <p className="text-center text-xs font-semibold text-slate-500 mt-4">
            By creating an account, you agree to our <a href="#" className="text-slate-700 underline">Terms of Service</a> and <a href="#" className="text-slate-700 underline">Privacy Policy</a>.
          </p>
        </form>
      </div>

      <div className={`w-80 p-8 rounded-[2rem] flex flex-col justify-start border border-white relative overflow-hidden ${roleDef.panelBg} shrink-0`}>
         <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm ${roleDef.iconBg}`}>
               {roleDef.icon}
            </div>
            <h3 className={`font-black text-lg ${roleDef.textColor}`}>{roleDef.title} Benefits</h3>
         </div>
         <ul className="space-y-4 relative z-10">
            {roleDef.benefits.map((b, i) => (
               <li key={i} className="flex items-start gap-3">
                  <Check size={16} className={`shrink-0 mt-0.5 ${roleDef.textColor}`} />
                  <span className="text-sm font-semibold text-slate-700">{b}</span>
               </li>
            ))}
         </ul>
         <div className="absolute -bottom-10 -right-10 opacity-20 pointer-events-none">
            {roleDef.watermark}
         </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-10">
       <div className="max-w-6xl mx-auto w-full p-8 flex-1 flex flex-col">
          {renderHeader()}
          <div className="flex-1 flex items-center justify-center w-full">
            {step === 'select' && renderSelectStep()}
            {step === 'admin' && renderForm({
              id: 'ADMIN',
              title: 'Admin',
              subtitle: 'Create an admin account to manage your family.',
              colorClass: 'bg-[#7C3AED] hover:bg-purple-700 shadow-purple-500/30',
              panelBg: 'bg-purple-50/80',
              textColor: 'text-[#7C3AED]',
              iconBg: 'bg-[#7C3AED]',
              icon: <Shield size={18} />,
              benefits: [
                'Full access to all features',
                'Manage family members',
                'Create and manage events',
                'Send announcements',
                'Manage documents & assets',
                'Access analytics & reports'
              ],
              watermark: <Users size={160} className="text-purple-600" />
            })}
            {step === 'member' && renderForm({
              id: 'MEMBER',
              title: 'Member',
              subtitle: 'Create a member account to connect with your family.',
              colorClass: 'bg-[#059669] hover:bg-emerald-700 shadow-emerald-500/30',
              panelBg: 'bg-emerald-50/80',
              textColor: 'text-[#059669]',
              iconBg: 'bg-[#059669]',
              icon: <UserCheck size={18} />,
              benefits: [
                'Connect with family members',
                'View family updates',
                'Participate in events',
                'Access shared albums',
                'Stay informed with announcements',
                'Secure & private access'
              ],
              watermark: <UserCheck size={160} className="text-emerald-600" />
            })}
          </div>
       </div>
    </div>
  );
}
