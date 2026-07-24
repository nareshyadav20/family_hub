import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GridSkeleton } from '../../components/loaders/SkeletonLoaders';
import { Users, MapPin, Phone, Mail, Heart, MessageCircle, Crown, Shield, User } from 'lucide-react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const ROLE_BADGE = {
  'SUPER_ADMIN': { label: 'Super Admin', class: 'bg-amber-100 text-amber-700  ', icon: <Crown size={11} /> },
  'ADMIN': { label: 'Admin', class: 'bg-blue-100 text-[#2E1E6B]  ', icon: <Shield size={11} /> },
  'MEMBER': { label: 'Member', class: 'bg-[#FAF8FF] text-slate-600  ', icon: <User size={11} /> },
};

export default function Family() {
  const location = useLocation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState(() => {
    return new window.URLSearchParams(location.search).get('search') || '';
  });

  useEffect(() => {
    const query = new window.URLSearchParams(location.search).get('search');
    if (query !== null) setSearch(query);
  }, [location.search]);


  const { data: rawMembers = [], isLoading } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/members`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const liveMembers = rawMembers.map(m => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`.trim(),
    relation: m.relationship || 'Member',
    role: m.role || 'MEMBER',
    phone: m.phone || m.memberProfile?.phone || 'No Phone',
    email: m.email || 'No email',
    location: m.memberProfile?.address || 'Unknown',
    avatar: m.avatar || '',
    online: m.status === 'ACTIVE' || false,
    bio: m.memberProfile?.biography || 'No biography available.',
    dob: m.memberProfile?.dob ? new Date(m.memberProfile.dob).toLocaleDateString() : 'N/A'
  }));

  const filtered = liveMembers.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.relation.toLowerCase().includes(search.toLowerCase())
  );

  const member = selected ? liveMembers.find(m => m.id === selected) : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1F2430]">Family Members</h1>
          <p className="text-slate-500 text-sm mt-1">{liveMembers.length} members in the family</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" placeholder="Search family members..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-[24px] bg-white border border-[#E9E5F8] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30" />
      </div>

      {isLoading ? (
        <GridSkeleton count={6} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(m => {
            const badge = ROLE_BADGE[m.role];
            return (
              <div key={m.id} onClick={() => setSelected(selected === m.id ? null : m.id)}
                className={`bg-white rounded-2xl border shadow-sm p-5 cursor-pointer transition-all hover:shadow-sm ${selected === m.id ? 'border-blue-400 ring-2 ring-blue-400/20' : 'border-[#E9E5F8] '}`}>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative shrink-0">
                    <img src={m.avatar} alt={m.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm" />
                    <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${m.online ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#1F2430] text-[15px] truncate">{m.name}</h3>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mt-0.5">{m.relation}</p>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold mt-1.5 ${badge.class}`}>
                      {badge.icon} {badge.label}
                    </div>
                  </div>
                </div>

                {selected === m.id && (
                  <div className="border-t border-slate-50 pt-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                    <p className="text-sm text-slate-600 italic">"{m.bio}"</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2.5 text-slate-600"><MapPin size={14} className="text-slate-400 shrink-0" />{m.location}</div>
                      <div className="flex items-center gap-2.5 text-slate-600"><Phone size={14} className="text-slate-400 shrink-0" />{m.phone}</div>
                      <div className="flex items-center gap-2.5 text-slate-600"><Mail size={14} className="text-slate-400 shrink-0" />{m.email}</div>
                      <div className="flex items-center gap-2.5 text-slate-600"><Heart size={14} className="text-slate-400 shrink-0" />Born {m.dob}</div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#FAF8FF] text-[#7C5CFC] text-sm font-bold rounded-[24px] hover:bg-blue-100 transition-colors">
                        <MessageCircle size={15} /> Message
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
