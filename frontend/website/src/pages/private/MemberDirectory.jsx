import React, { useState } from 'react';
import PrivateLayout from '../../components/PrivateLayout';
import { Search, Filter, Phone, Mail, MapPin, Users, Heart } from 'lucide-react';

const members = [
  { id: 1, name: 'Robert Smith', relation: 'Patriarch', role: 'Family Head', phone: '+1 555 001 0001', email: 'robert@smith.com', location: 'Springfield, IL', avatar: 'https://i.pravatar.cc/150?img=60', generation: '1st', dob: 'July 14, 1942', online: false },
  { id: 2, name: 'Martha Smith', relation: 'Matriarch', role: 'Family Head', phone: '+1 555 001 0002', email: 'martha@smith.com', location: 'Springfield, IL', avatar: 'https://i.pravatar.cc/150?img=45', generation: '1st', dob: 'Sep 2, 1945', online: true },
  { id: 3, name: 'James Smith', relation: 'Son', role: 'Family Admin', phone: '+1 555 001 0003', email: 'james@smith.com', location: 'New York, NY', avatar: 'https://i.pravatar.cc/150?img=53', generation: '2nd', dob: 'Mar 15, 1968', online: true },
  { id: 4, name: 'Sarah Smith', relation: 'Daughter-in-law', role: 'Member', phone: '+1 555 001 0004', email: 'sarah@smith.com', location: 'New York, NY', avatar: 'https://i.pravatar.cc/150?img=44', generation: '2nd', dob: 'Nov 30, 1970', online: false },
  { id: 5, name: 'William Smith', relation: 'Son', role: 'Member', phone: '+1 555 001 0005', email: 'will@smith.com', location: 'Los Angeles, CA', avatar: 'https://i.pravatar.cc/150?img=55', generation: '2nd', dob: 'Jun 8, 1972', online: true },
  { id: 6, name: 'Patricia Dove', relation: 'Daughter', role: 'Member', phone: '+1 555 001 0006', email: 'patricia@dove.com', location: 'Chicago, IL', avatar: 'https://i.pravatar.cc/150?img=38', generation: '2nd', dob: 'Dec 20, 1975', online: false },
  { id: 7, name: 'Arjun Smith', relation: 'Grandson', role: 'Member', phone: '+1 555 001 0007', email: 'arjun@smith.com', location: 'San Francisco, CA', avatar: 'https://i.pravatar.cc/150?img=12', generation: '3rd', dob: 'Apr 22, 1995', online: true },
  { id: 8, name: 'Emily Smith', relation: 'Granddaughter', role: 'Member', phone: '+1 555 001 0008', email: 'emily@smith.com', location: 'Austin, TX', avatar: 'https://i.pravatar.cc/150?img=25', generation: '3rd', dob: 'Jul 28, 1998', online: true },
  { id: 9, name: 'Noah Smith', relation: 'Grandson', role: 'Member', phone: '+1 555 001 0009', email: 'noah@smith.com', location: 'Seattle, WA', avatar: 'https://i.pravatar.cc/150?img=17', generation: '3rd', dob: 'Aug 3, 2001', online: false },
];

const roleColors = { 'Family Head': '#EF4444', 'Family Admin': '#4F46E5', 'Member': '#10B981' };
const genColors = { '1st': '#F59E0B', '2nd': '#4F46E5', '3rd': '#14B8A6' };

export default function MemberDirectory() {
  const [search, setSearch] = useState('');
  const [genFilter, setGenFilter] = useState('All');
  const [selected, setSelected] = useState(null);

  const filtered = members.filter(m =>
    (genFilter === 'All' || m.generation === genFilter) &&
    (m.name.toLowerCase().includes(search.toLowerCase()) || m.relation.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <PrivateLayout title="Member Directory" subtitle="All family members — private & secure">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        {/* Search & filters */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 400 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search members by name or relation..." style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }} onFocus={e => e.target.style.borderColor = '#4F46E5'} onBlur={e => e.target.style.borderColor = '#E5E7EB'} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['All', '1st', '2nd', '3rd'].map(gen => (
              <button key={gen} onClick={() => setGenFilter(gen)} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: genFilter === gen ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F3F4F6', color: genFilter === gen ? 'white' : '#374151' }}>
                {gen === 'All' ? 'All Generations' : `${gen} Generation`}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 14, color: '#9CA3AF' }}>{filtered.length} members found</div>
        </div>

        {/* Members grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {filtered.map((m, i) => (
            <div key={m.id} style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', cursor: 'pointer', transition: 'all 0.3s', animation: `fadeInUp 0.5s ease ${i * 0.05}s both` }}
              onClick={() => setSelected(m)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(79,70,229,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
                <div style={{ position: 'relative' }}>
                  <img src={m.avatar} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '3px solid #E5E7EB' }} alt={m.name} />
                  <div style={{ position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: m.online ? '#10B981' : '#9CA3AF', border: '2px solid white' }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 8 }}>{m.relation}</p>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: `${roleColors[m.role] || '#4F46E5'}15`, color: roleColors[m.role] || '#4F46E5' }}>{m.role}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 50, background: `${genColors[m.generation]}15`, color: genColors[m.generation] }}>{m.generation} Gen</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, borderTop: '1px solid #F3F4F6', paddingTop: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}><MapPin size={13} color="#9CA3AF" /> {m.location}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#6B7280' }}><Mail size={13} color="#9CA3AF" /> {m.email}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Member Detail Sidebar */}
        {selected && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', justifyContent: 'flex-end', backdropFilter: 'blur(4px)' }}
            onClick={() => setSelected(null)}>
            <div style={{ width: 420, background: 'white', height: '100%', overflow: 'auto', boxShadow: '-20px 0 60px rgba(0,0,0,0.15)', animation: 'fadeInUp 0.3s ease' }}
              onClick={e => e.stopPropagation()}>
              <div style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', padding: '40px 32px 32px', textAlign: 'center', position: 'relative' }}>
                <button onClick={() => setSelected(null)} style={{ position: 'absolute', top: 20, right: 20, border: 'none', background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: 8, cursor: 'pointer', color: 'white' }}>✕</button>
                <img src={selected.avatar} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '4px solid rgba(255,255,255,0.4)', marginBottom: 16 }} alt={selected.name} />
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 22, color: 'white', marginBottom: 6 }}>{selected.name}</h2>
                <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15 }}>{selected.relation}</p>
              </div>
              <div style={{ padding: 32 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                  {[['Role', selected.role], ['Generation', `${selected.generation} Gen`], ['Date of Birth', selected.dob], ['Status', selected.online ? 'Online' : 'Offline']].map(([label, val]) => (
                    <div key={label} style={{ padding: '16px', background: '#F8FAFC', borderRadius: 14 }}>
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{val}</div>
                    </div>
                  ))}
                </div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 16 }}>Contact Information</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[[Phone, selected.phone], [Mail, selected.email], [MapPin, selected.location]].map(([Icon, val], i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: '#F8FAFC', borderRadius: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Icon size={16} color="#4F46E5" />
                      </div>
                      <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}
