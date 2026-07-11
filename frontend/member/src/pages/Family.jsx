import React, { useState } from 'react';
import { Users, MapPin, Phone, Mail, Heart, MessageCircle, Crown, Shield, User } from 'lucide-react';

const familyMembers = [
  { id: 1, name: 'Robert Smith', relation: 'Grandfather', role: 'Super Admin', phone: '+91 98765 43210', email: 'robert.smith@email.com', location: 'Mumbai, India', avatar: 'https://i.pravatar.cc/150?img=70', online: false, bio: 'Patriarch of the Smith family. Retired professor, avid reader.', dob: 'March 12, 1946' },
  { id: 2, name: 'Martha Smith', relation: 'Grandmother', role: 'Member', phone: '+91 98765 43211', email: 'martha.smith@email.com', location: 'Mumbai, India', avatar: 'https://i.pravatar.cc/150?img=45', online: true, bio: 'Loves cooking traditional recipes and gardening.', dob: 'June 5, 1950' },
  { id: 3, name: 'James Smith', relation: 'Father', role: 'Member', phone: '+91 87654 32109', email: 'james.smith@email.com', location: 'Delhi, India', avatar: 'https://i.pravatar.cc/150?img=68', online: false, bio: 'Software engineer at TechCorp. Loves cricket and hiking.', dob: 'Nov 22, 1972' },
  { id: 4, name: 'Sarah Smith', relation: 'Mother', role: 'Member', phone: '+91 87654 32108', email: 'sarah.smith@email.com', location: 'Delhi, India', avatar: 'https://i.pravatar.cc/150?img=47', online: true, bio: 'Artist and yoga instructor. Loves painting.', dob: 'Feb 14, 1975' },
  { id: 5, name: 'Arjun Mehta', relation: 'Myself (Son)', role: 'Family Admin', phone: '+91 76543 21098', email: 'arjun.mehta@email.com', location: 'Bangalore, India', avatar: 'https://i.pravatar.cc/150?img=33', online: true, bio: 'Product Manager. Passionate about family togetherness.', dob: 'Aug 10, 1998' },
  { id: 6, name: 'Emily Smith', relation: 'Sister', role: 'Member', phone: '+91 76543 21097', email: 'emily.smith@email.com', location: 'Pune, India', avatar: 'https://i.pravatar.cc/150?img=25', online: true, bio: 'Medical student at AIIMS. Dancer and music lover.', dob: 'Jan 30, 2001' },
  { id: 7, name: 'William Smith', relation: 'Uncle', role: 'Member', phone: '+91 65432 10987', email: 'william.smith@email.com', location: 'Chennai, India', avatar: 'https://i.pravatar.cc/150?img=52', online: false, bio: 'Businessman. Loves travelling and photography.', dob: 'Sep 8, 1968' },
  { id: 8, name: 'Priya Mehta', relation: 'Cousin', role: 'Member', phone: '+91 54321 09876', email: 'priya.mehta@email.com', location: 'Hyderabad, India', avatar: 'https://i.pravatar.cc/150?img=44', online: false, bio: 'Graphic designer. Creative and adventurous.', dob: 'Dec 19, 2000' },
];

const ROLE_BADGE = {
  'Super Admin': { label: 'Super Admin', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', icon: <Crown size={11} /> },
  'Family Admin': { label: 'Admin', class: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', icon: <Shield size={11} /> },
  'Member': { label: 'Member', class: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', icon: <User size={11} /> },
};

export default function Family() {
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = familyMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.relation.toLowerCase().includes(search.toLowerCase())
  );

  const member = selected ? familyMembers.find(m => m.id === selected) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Members</h1>
          <p className="text-slate-500 text-sm mt-1">{familyMembers.length} members in the Smith family</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" placeholder="Search family members..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(m => {
          const badge = ROLE_BADGE[m.role];
          return (
            <div key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
              className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-md ${selected === m.id ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-slate-100 dark:border-slate-800'}`}>
              <div className="flex items-center gap-4 mb-4">
                <div className="relative shrink-0">
                  <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                  <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${m.online ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white text-[15px] truncate">{m.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500 font-medium mt-0.5">{m.relation}</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mt-1.5 ${badge.class}`}>
                    {badge.icon} {badge.label}
                  </div>
                </div>
              </div>

              {selected === m.id && (
                <div className="border-t border-slate-50 dark:border-slate-800 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-slate-600 dark:text-slate-400 italic">"{m.bio}"</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400"><MapPin size={14} className="text-slate-400 shrink-0" />{m.location}</div>
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400"><Phone size={14} className="text-slate-400 shrink-0" />{m.phone}</div>
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400"><Mail size={14} className="text-slate-400 shrink-0" />{m.email}</div>
                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400"><Heart size={14} className="text-slate-400 shrink-0" />Born {m.dob}</div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-sm font-bold rounded-xl hover:bg-blue-100 transition-colors">
                      <MessageCircle size={15} /> Message
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
