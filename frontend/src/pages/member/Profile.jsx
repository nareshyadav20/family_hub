import React from 'react';
import { User, Mail, Phone, MapPin, Edit2, Camera, Calendar, Shield, BookOpen, Briefcase, Heart, Activity, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['memberProfile'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/member/profile`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Profile Data...</div>;

  const { user, profile } = data || {};
  const completion = profile?.profileCompletion || 25;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <div className="flex gap-3">
           <button className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 transition-colors bg-white dark:bg-slate-900 shadow-sm text-sm">Share Profile</button>
           <button onClick={() => navigate('/member/dashboard/profile-setup')} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">
             <Edit2 size={16} /> Edit Profile Wizard
           </button>
        </div>
      </div>

      {completion < 100 && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between shadow-lg text-white">
             <div>
                <h3 className="font-bold text-lg mb-1">Incomplete Profile</h3>
                <p className="text-emerald-100 text-sm">Your profile is currently {completion}% complete.</p>
                <div className="w-full max-w-[200px] h-2 bg-black/20 rounded-full overflow-hidden mt-3">
                   <div className="h-full bg-white rounded-full" style={{ width: `${completion}%` }}></div>
                </div>
             </div>
             <button onClick={() => navigate('/member/dashboard/profile-setup')} className="mt-4 md:mt-0 bg-white text-emerald-600 px-6 py-2.5 rounded-xl font-bold text-sm shadow hover:shadow-lg transition-all">
                Complete Now
             </button>
          </div>
      )}

      {/* Basic Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 relative"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 -mt-16 mb-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-lg bg-blue-900 flex items-center justify-center text-4xl text-white font-bold overflow-hidden">
                 {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.firstName?.charAt(0)}
              </div>
              <button className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-slate-900 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white shadow-md hover:bg-slate-800 transition-colors border-2 border-white dark:border-slate-950 block">
                <Camera size={16} />
              </button>
            </div>
            <div className="pb-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize truncate">{user?.firstName} {user?.lastName}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 flex items-center gap-1 uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                   <Shield size={12} /> {user?.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${user?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                   {user?.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-2">
                 <Heart size={14} className="text-rose-500" /> {user?.relationship || 'Family Member'} • {user?.familyBranch || 'General Branch'}
              </p>
            </div>
          </div>

          {/* About / Bio */}
          {profile?.biography && (
            <div className="mb-8 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
               <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-2"><User size={14}/> About Me</h3>
               <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{profile.biography}</p>
            </div>
          )}

          {/* Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Contact & Basics Section */}
             <div className="space-y-6">
                <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                   <User className="text-blue-500" /> Contact & Basic Info
                </h3>
                <div className="space-y-4">
                   <InfoRow icon={<Phone />} label="Mobile Phone" value={user?.phone || 'Not provided'} />
                   <InfoRow icon={<Mail />} label="Email Address" value={user?.email || 'Not provided'} />
                   <InfoRow icon={<MapPin />} label="Address" value={profile?.address || 'Not provided'} />
                   <InfoRow icon={<Calendar />} label="Date of Birth" value={profile?.dob ? new Date(profile.dob).toLocaleDateString() : 'Not provided'} />
                   <InfoRow icon={<Shield />} label="Member ID" value={user?.memberId || 'Pending'} copyable />
                   <InfoRow icon={<Activity />} label="Blood Group" value={profile?.bloodGroup || 'Not provided'} />
                </div>
             </div>

             {/* Education & Career Section */}
             <div className="space-y-6">
                <h3 className="font-bold text-lg border-b border-slate-100 dark:border-slate-800 pb-3 flex items-center gap-2">
                   <Briefcase className="text-amber-500" /> Education & Career
                </h3>
                <div className="space-y-4">
                   <InfoRow icon={<BookOpen />} label="Qualification" value={profile?.education || 'Not provided'} />
                   <InfoRow icon={<Briefcase />} label="Occupation" value={profile?.occupation || 'Not provided'} />
                   <InfoRow icon={<Briefcase />} label="Company" value={profile?.company || 'Not provided'} />
                </div>
             </div>
             
          </div>

        </div>
      </div>

    </div>
  );
}

function InfoRow({ icon, label, value, copyable }) {
  return (
    <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
       <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center shrink-0">
          {React.cloneElement(icon, { size: 18 })}
       </div>
       <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-center gap-2">
             <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">{value}</p>
             {copyable && <button className="text-blue-600 text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>}
          </div>
       </div>
    </div>
  )
}
