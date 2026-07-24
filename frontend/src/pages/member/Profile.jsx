import React, { useRef } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Camera, Calendar, Shield, BookOpen, Briefcase, Heart, Activity, FileText } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
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

  const fileInputRef = useRef(null);

  if (isLoading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Profile Data...</div>;

  const { user, profile } = data || {};
  const completion = profile?.profileCompletion || 25;

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
       toast.error('Please upload a valid image file');
       return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
       const base64String = event.target.result;
       try {
          await axios.put(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/avatar`, {
             avatar: base64String
          }, {
             headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          
          // Update local storage so other components refresh
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          storedUser.avatar = base64String;
          localStorage.setItem('user', JSON.stringify(storedUser));
          
          toast.success('Avatar updated successfully!');
          window.location.reload(); // Quickest way to refresh all query data and layout
       } catch (error) {
          toast.error('Failed to update avatar');
          console.error(error);
       }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-10">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-[#1F2430]">My Profile</h1>
        <div className="flex gap-3">
           <button className="px-4 py-2 border border-[#E9E5F8] rounded-[24px] font-semibold text-slate-600 hover:bg-[#FCFBFF] transition-colors bg-white shadow-sm text-sm">Share Profile</button>
           <button onClick={() => navigate('/member/dashboard/profile-setup')} className="flex items-center gap-2 px-6 py-2.5 rounded-[24px] text-sm font-bold bg-[#7C5CFC] hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20 transition-all">
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
             <button onClick={() => navigate('/member/dashboard/profile-setup')} className="mt-4 md:mt-0 bg-white text-emerald-600 px-6 py-2.5 rounded-[24px] font-bold text-sm shadow hover:shadow-lg transition-all">
                Complete Now
             </button>
          </div>
      )}

      {/* Basic Profile Card */}
      <div className="bg-white rounded-3xl border border-[#E9E5F8] shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-40 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 relative"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 mb-6">
              <div className="relative shrink-0 -mt-16 sm:-mt-20">
                <div className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg bg-blue-900 flex items-center justify-center text-4xl text-white font-bold overflow-hidden">
                   {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.firstName?.charAt(0)}
                </div>
                <input type="file" hidden ref={fileInputRef} onChange={handleAvatarUpload} accept="image/*" />
                <button onClick={() => fileInputRef.current.click()} className="absolute bottom-2 right-2 w-8 h-8 md:w-10 md:h-10 bg-slate-900 rounded-[24px] flex items-center justify-center text-white shadow-sm hover:bg-slate-800 transition-colors border-2 border-white block">
                  <Camera size={16} />
                </button>
              </div>
            <div className="pb-2 flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-3xl font-black text-[#1F2430] capitalize truncate">{user?.firstName} {user?.lastName}</h2>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-[#2E1E6B] flex items-center gap-1 uppercase tracking-wider shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
                   <Shield size={12} /> {user?.role}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${user?.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700 ' : 'bg-amber-100 text-amber-700 '}`}>
                   {user?.status}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-500 mt-2 flex items-center gap-2">
                 <Heart size={14} className="text-rose-500" /> {user?.relationship || 'Family Member'} • {user?.familyBranch || 'General Branch'}
              </p>
            </div>
          </div>

          {/* About / Bio */}
          {profile?.biography && (
            <div className="mb-8 p-5 bg-[#FCFBFF] rounded-2xl border border-[#E9E5F8]">
               <h3 className="text-xs font-bold uppercase text-slate-400 mb-2 tracking-wider flex items-center gap-2"><User size={14}/> About Me</h3>
               <p className="text-sm text-slate-700 leading-relaxed font-medium">{profile.biography}</p>
            </div>
          )}

          {/* Grids */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             
             {/* Contact & Basics Section */}
             <div className="space-y-6">
                <h3 className="font-bold text-lg border-b border-[#E9E5F8] pb-3 flex items-center gap-2">
                   <User className="text-[#7C5CFC]" /> Contact & Basic Info
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
                <h3 className="font-bold text-lg border-b border-[#E9E5F8] pb-3 flex items-center gap-2">
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
    <div className="flex items-start gap-4 p-3 rounded-[24px] hover:bg-[#FCFBFF] transition-colors group">
       <div className="w-10 h-10 rounded-[24px] bg-[#FAF8FF] text-[#7C5CFC] flex items-center justify-center shrink-0">
          {React.cloneElement(icon, { size: 18 })}
       </div>
       <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
          <div className="flex items-center gap-2">
             <p className="font-semibold text-sm text-[#1F2430] truncate">{value}</p>
             {copyable && <button className="text-[#7C5CFC] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">Copy</button>}
          </div>
       </div>
    </div>
  )
}
