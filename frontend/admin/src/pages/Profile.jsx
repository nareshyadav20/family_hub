import React from 'react';
import { User, Mail, Phone, MapPin, Camera, Edit2 } from 'lucide-react';

export default function Profile() {
  const info = { 
    name: 'Robert Smith', 
    role: 'Family Admin', 
    email: 'robert@smith.com', 
    phone: '+1 (555) 100-1001', 
    location: 'Springfield, IL', 
    joined: 'January 2022', 
    bio: 'Patriarch of the Smith family. Passionate about keeping our family connected and our legacy preserved for future generations.' 
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Profile</h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="h-40 bg-gradient-to-r from-indigo-600 to-violet-500 relative">
          <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur p-2 rounded-xl text-white hover:bg-white/30 transition-colors">
            <Camera size={18}/>
          </button>
        </div>
        <div className="px-8 pb-8">
          <div className="flex items-end gap-5 -mt-12 mb-6">
            <div className="w-24 h-24 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-xl border-4 border-white dark:border-slate-900">
              RS
            </div>
            <div className="pb-1 flex-1">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">{info.name}</h2>
              <p className="text-sm text-slate-500">{info.role}</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 shadow-md transition-colors">
              <Edit2 size={14}/> Edit Profile
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-2xl leading-relaxed">{info.bio}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: <Mail size={16}/>, label: 'Email', val: info.email },
              { icon: <Phone size={16}/>, label: 'Phone', val: info.phone },
              { icon: <MapPin size={16}/>, label: 'Location', val: info.location },
              { icon: <User size={16}/>, label: 'Member since', val: info.joined },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div className="text-slate-400 shrink-0">{f.icon}</div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{f.label}</p>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate">{f.val}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
