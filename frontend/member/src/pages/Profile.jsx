import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Edit2, Check, Camera, Calendar, Heart, Shield } from 'lucide-react';

const getMockStats = () => [
  { label: 'Events Attended', value: '14' }, 
  { label: 'Photos Shared', value: '47' }, 
  { label: 'Messages Sent', value: '283' }
];

export default function Profile() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Arjun Mehta';
  const roleName = user ? (user.role === 'ADMIN' ? 'Family Admin' : user.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Member') : 'Family Admin';
  const displayEmail = user?.email || 'arjun.mehta@email.com';
  
  const defaultProfile = {
    name: fullName, 
    role: roleName, 
    relation: user?.memberProfile?.relationship || 'Member', 
    email: displayEmail,
    phone: user?.memberProfile?.phone || '+91 76543 21098', 
    location: user?.memberProfile?.currentCity || 'Bangalore, India', 
    dob: user?.memberProfile?.dateOfBirth ? new Date(user.memberProfile.dateOfBirth).toLocaleDateString() : 'August 10, 1998',
    bio: user?.memberProfile?.biography || 'Passionate about keeping our family connected and creating memories together.',
    avatar: 'https://i.pravatar.cc/150?img=33', 
    joinedDate: 'January 2024', 
    statusMsg: '🎉 Excited for the family reunion!',
    stats: getMockStats(),
  };

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(defaultProfile);

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Profile</h1>
        <button onClick={() => setEditing(!editing)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${editing ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 shadow-sm'}`}>
          {editing ? <><Check size={15} /> Save Changes</> : <><Edit2 size={15} /> Edit Profile</>}
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)' }}></div>
        </div>
        <div className="px-6 pb-6">
          <div className="flex items-end gap-4 -mt-12 mb-5">
            <div className="relative">
              <img src={form.avatar} alt={form.name} className="w-24 h-24 rounded-3xl object-cover border-4 border-white dark:border-slate-900 shadow-lg" />
              {editing && (
                <button className="absolute bottom-1 right-1 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-md">
                  <Camera size={14} />
                </button>
              )}
            </div>
            <div className="pb-2 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">{form.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 flex items-center gap-1">
                  <Shield size={10} /> {form.role}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1">{form.statusMsg}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {form.stats.map((s, i) => (
              <div key={i} className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 text-center">
                <p className="text-2xl font-black text-slate-900 dark:text-white">{s.value}</p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {[
              { label: 'Full Name', key: 'name', icon: <User size={16} /> },
              { label: 'Email Address', key: 'email', icon: <Mail size={16} /> },
              { label: 'Phone Number', key: 'phone', icon: <Phone size={16} /> },
              { label: 'Location', key: 'location', icon: <MapPin size={16} /> },
              { label: 'Date of Birth', key: 'dob', icon: <Calendar size={16} /> },
              { label: 'Relation', key: 'relation', icon: <Heart size={16} /> },
            ].map(field => (
              <div key={field.key} className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                  {field.icon}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{field.label}</p>
                  {editing && field.key !== 'dob' && field.key !== 'relation' ? (
                    <input value={form[field.key]} onChange={e => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
                  ) : (
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{form[field.key]}</p>
                  )}
                </div>
              </div>
            ))}
            <div className="flex items-start gap-4">
              <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 shrink-0 mt-5">
                <Edit2 size={16} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Bio</p>
                {editing ? (
                  <textarea value={form.bio} onChange={e => setForm(prev => ({ ...prev, bio: e.target.value }))} rows={3}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none" />
                ) : (
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{form.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
