import React, { useState } from 'react';
import { Search, ZoomIn, ZoomOut, X } from 'lucide-react';

const treeData = {
  id: '1', name: 'Robert Smith', role: 'Patriarch', born: '1942', avatar: 'https://i.pravatar.cc/100?img=60',
  spouse: { id: '2', name: 'Martha Smith', role: 'Matriarch', born: '1945', avatar: 'https://i.pravatar.cc/100?img=45' },
  children: [
    {
      id: '3', name: 'James Smith', role: 'Son', born: '1968', avatar: 'https://i.pravatar.cc/100?img=53',
      spouse: { id: '4', name: 'Sarah Smith', role: 'Daughter-in-law', born: '1970', avatar: 'https://i.pravatar.cc/100?img=44' },
      children: [
        { id: '6', name: 'Arjun Smith', role: 'Grandson', born: '1995', avatar: 'https://i.pravatar.cc/100?img=12', children: [] },
        { id: '7', name: 'Emily Smith', role: 'Granddaughter', born: '1998', avatar: 'https://i.pravatar.cc/100?img=25', children: [] },
      ]
    },
    {
      id: '5', name: 'William Smith', role: 'Son', born: '1972', avatar: 'https://i.pravatar.cc/100?img=55',
      spouse: { id: '51', name: 'Lisa Smith', role: 'Daughter-in-law', born: '1974', avatar: 'https://i.pravatar.cc/100?img=32' },
      children: [
        { id: '8', name: 'Noah Smith', role: 'Grandson', born: '2001', avatar: 'https://i.pravatar.cc/100?img=17', children: [] },
      ]
    },
    {
      id: '9', name: 'Patricia Dove', role: 'Daughter', born: '1975', avatar: 'https://i.pravatar.cc/100?img=38',
      children: [
        { id: '10', name: 'Sophie Dove', role: 'Granddaughter', born: '2004', avatar: 'https://i.pravatar.cc/100?img=29', children: [] },
      ]
    },
  ]
};

function MemberNode({ member, onClick }) {
  return (
    <div onClick={() => onClick(member)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s' }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
      <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', padding: 3, boxShadow: '0 8px 24px rgba(79,70,229,0.3)' }}>
        <img src={member.avatar} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '3px solid white' }} alt={member.name} />
      </div>
      <div style={{ marginTop: 10, textAlign: 'center', maxWidth: 100 }}>
        <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 13, color: '#111827', lineHeight: 1.2 }}>{member.name}</div>
        <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>{member.role}</div>
        <div style={{ fontSize: 11, color: '#C4B5FD', marginTop: 2 }}>b. {member.born}</div>
      </div>
    </div>
  );
}

function CoupleNode({ person, spouse, onClick }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
      <MemberNode member={person} onClick={onClick} />
      {spouse && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 24 }}>
            <div style={{ fontSize: 18 }}>💑</div>
            <div style={{ width: 40, height: 2, background: 'linear-gradient(90deg, #4F46E5, #7C3AED)', borderRadius: 1 }} />
          </div>
          <MemberNode member={spouse} onClick={onClick} />
        </>
      )}
    </div>
  );
}

function FamilyBranch({ node, onClick }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <CoupleNode person={node} spouse={node.spouse} onClick={onClick} />
      {node.children && node.children.length > 0 && (
        <>
          <div style={{ width: 2, height: 32, background: '#E5E7EB', marginTop: 16 }} />
          <div style={{ display: 'flex', gap: 32, position: 'relative', paddingTop: 16 }}>
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 2, background: '#E5E7EB' }} />
            {node.children.map((child, i) => (
              <div key={child.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 2, height: 16, background: '#E5E7EB' }} />
                <FamilyBranch node={child} onClick={onClick} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function FamilyTree() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [zoom, setZoom] = useState(1);

  return (
    <div style={{ paddingTop: 72, minHeight: '100vh', background: '#F8FAFC' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', padding: '48px 0 32px', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Interactive Tree</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Family <span className="gradient-text">Tree</span></h1>
          <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 32 }}>Explore your lineage — click on any member to view their details.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search family members..." style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 50, border: '1px solid #E5E7EB', background: 'white', fontSize: 14, outline: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} />
            </div>
            <button onClick={() => setZoom(z => Math.min(z + 0.1, 2))} style={{ padding: '12px 16px', borderRadius: 50, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#374151' }}>
              <ZoomIn size={16} /> Zoom In
            </button>
            <button onClick={() => setZoom(z => Math.max(z - 0.1, 0.5))} style={{ padding: '12px 16px', borderRadius: 50, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, fontSize: 14, color: '#374151' }}>
              <ZoomOut size={16} /> Zoom Out
            </button>
          </div>
        </div>
      </div>

      {/* Tree Canvas */}
      <div style={{ overflow: 'auto', padding: '48px 24px', minHeight: 500 }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.3s', display: 'inline-block', minWidth: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <FamilyBranch node={treeData} onClick={setSelected} />
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: '24px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          {[['4', 'Generations'], ['11', 'Members Shown'], ['1952', 'Founded In'], ['3', 'Branches']].map(([val, label]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 28, fontWeight: 900, color: '#4F46E5' }}>{val}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Member Detail Modal */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 24, backdropFilter: 'blur(4px)' }} onClick={() => setSelected(null)}>
          <div style={{ background: 'white', borderRadius: 24, padding: 40, maxWidth: 440, width: '100%', boxShadow: '0 40px 100px rgba(0,0,0,0.2)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <img src={selected.avatar} style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '4px solid #4F46E5' }} alt={selected.name} />
                <div>
                  <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 22, color: '#111827' }}>{selected.name}</h2>
                  <div className="badge badge-primary" style={{ marginTop: 6 }}>{selected.role}</div>
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ border: 'none', background: '#F3F4F6', borderRadius: 10, padding: 8, cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                ['Born', selected.born],
                ['Relationship', selected.role],
                ['Children', selected.children ? selected.children.length : 0],
                ['Generation', selected.born < '1960' ? '1st' : selected.born < '1985' ? '2nd' : '3rd'],
              ].map(([label, val]) => (
                <div key={label} style={{ padding: '14px 18px', background: '#F8FAFC', borderRadius: 14 }}>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 4 }}>{label}</div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: '#111827' }}>{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
