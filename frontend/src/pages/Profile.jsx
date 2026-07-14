import React from 'react';
import { User, Mail, Phone, MapPin, Camera, Edit2, Shield, CalendarDays } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Profile() {
  const { data: memberData, isLoading } = useQuery({
    queryKey: ['adminProfilePage'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/member/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const localUser = JSON.parse(localStorage.getItem('user')) || {};
  const activeUser = memberData?.user || localUser;
  
  const firstName = activeUser?.firstName || 'System';
  const lastName = activeUser?.lastName || 'Admin';
  const email = activeUser?.email || 'admin@familyhub.os';
  const phone = activeUser?.mobileNumber || 'Not provided';
  const roleRaw = activeUser?.role || 'SUPER_ADMIN';
  const branch = activeUser?.familyBranch || 'Headquarters';
  const gender = activeUser?.gender || 'N/A';
  const dob = activeUser?.dateOfBirth ? new Date(activeUser.dateOfBirth).toLocaleDateString() : 'N/A';
  
  const displayRole = roleRaw === 'SUPER_ADMIN' ? 'Super Admin' : roleRaw === 'ADMIN' ? 'Family Admin' : 'Admin';
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  if (isLoading) {
     return <div className="p-20 text-center text-slate-400 font-bold">Loading Profile...</div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">My Profile</h1>
      
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">
        
        {/* Banner Section */}
        <div className="h-48 relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-black/10"></div>
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md p-2.5 rounded-full text-white hover:bg-white/30 transition-all border border-white/30 shadow-lg cursor-pointer">
            <Camera size={20}/>
          </button>
        </div>
        
        {/* Profile Info Section */}
        <div className="px-6 md:px-10 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8 -mt-16 sm:-mt-20 mb-8 relative z-10">
            
            <div className="relative group">
               <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-4xl sm:text-5xl shadow-2xl border-4 sm:border-[6px] border-white dark:border-slate-950 object-cover shrink-0 relative overflow-hidden">
                 {activeUser?.avatar ? (
                    <img src={activeUser.avatar} alt="Profile" className="w-full h-full object-cover" />
                 ) : (
                    <span>{initials}</span>
                 )}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Camera size={28} className="text-white" />
                 </div>
               </div>
               <div className="absolute bottom-2 right-2 w-7 h-7 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full shadow-sm"></div>
            </div>

            <div className="flex-1 pb-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white capitalize">{firstName} {lastName}</h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                 <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-full border border-indigo-100 dark:border-indigo-500/20 shadow-sm">
                   <Shield size={12} strokeWidth={3} /> {displayRole}
                 </span>
                 <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize flex items-center gap-1.5">
                   <MapPin size={14} /> {branch} Branch
                 </span>
              </div>
            </div>

            <div className="pb-2">
               <button className="flex items-center w-full justify-center sm:justify-start gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 shadow-lg transition-all cursor-pointer">
                 <Edit2 size={16} strokeWidth={2.5} /> Edit Profile
               </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              { icon: <Mail size={18}/>, label: 'Email Address', val: email, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { icon: <Phone size={18}/>, label: 'Phone Number', val: phone, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { icon: <User size={18}/>, label: 'Gender', val: gender, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
              { icon: <CalendarDays size={18}/>, label: 'Date of Birth', val: dob, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-500/10' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.bg} ${f.color}`}>
                   {f.icon}
                </div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{f.val}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
             <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Account Security</h3>
             <div className="flex flex-col sm:flex-row gap-4">
                <button className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors text-slate-700 dark:text-slate-300">
                  Change Password
                </button>
                <button className="flex-1 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors text-slate-700 dark:text-slate-300">
                  Two-Factor Authentication
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
