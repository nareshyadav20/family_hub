import React, { useState } from 'react';
import PrivateLayout from '../../components/PrivateLayout';
import { Folder, FileText, Download, Eye, Search, Upload, Shield, Lock } from 'lucide-react';

const documents = [
  { id: 1, name: 'Family Property Deed — Springfield', type: 'Property', size: '2.4 MB', uploaded: 'June 10, 2026', uploadedBy: 'James Smith', icon: '🏡', color: '#4F46E5', sensitive: true },
  { id: 2, name: 'Robert Smith Birth Certificate', type: 'Certificate', size: '980 KB', uploaded: 'May 22, 2026', uploadedBy: 'Martha Smith', icon: '📜', color: '#7C3AED', sensitive: true },
  { id: 3, name: 'Family Trust Agreement 2024', type: 'Legal', size: '5.1 MB', uploaded: 'April 8, 2026', uploadedBy: 'Legal Team', icon: '⚖️', color: '#EF4444', sensitive: true },
  { id: 4, name: 'Smith Family Insurance Policy', type: 'Legal', size: '1.8 MB', uploaded: 'March 15, 2026', uploadedBy: 'James Smith', icon: '🛡️', color: '#F59E0B', sensitive: false },
  { id: 5, name: 'Vehicle Registration — All Vehicles', type: 'Property', size: '1.2 MB', uploaded: 'Feb 28, 2026', uploadedBy: 'William Smith', icon: '🚗', color: '#14B8A6', sensitive: false },
  { id: 6, name: 'Family Investment Portfolio 2025', type: 'Finance', size: '3.7 MB', uploaded: 'Jan 10, 2026', uploadedBy: 'Robert Smith', icon: '📈', color: '#10B981', sensitive: true },
  { id: 7, name: 'Estate Will — Robert & Martha', type: 'Legal', size: '890 KB', uploaded: 'Dec 5, 2025', uploadedBy: 'Legal Team', icon: '📋', color: '#6366F1', sensitive: true },
  { id: 8, name: 'Medical Records — Emergency', type: 'Medical', size: '2.0 MB', uploaded: 'Nov 18, 2025', uploadedBy: 'Family Admin', icon: '🏥', color: '#F43F5E', sensitive: true },
];

const types = ['All', 'Property', 'Certificate', 'Legal', 'Finance', 'Medical'];

export default function Documents() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');

  const filtered = documents.filter(d =>
    (typeFilter === 'All' || d.type === typeFilter) &&
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PrivateLayout title="Document Vault" subtitle="Secure storage for all important family documents">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Security notice */}
        <div style={{ borderRadius: 16, padding: '16px 24px', background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04))', border: '1px solid rgba(79,70,229,0.15)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(79,70,229,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Shield size={22} color="#4F46E5" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: '#4F46E5', marginBottom: 2 }}>AES-256 Encrypted Vault</div>
            <p style={{ fontSize: 13, color: '#6B7280' }}>All documents are end-to-end encrypted. Only authorized family members can access sensitive files.</p>
          </div>
        </div>

        {/* Search & filters */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." style={{ width: '100%', padding: '12px 16px 12px 44px', borderRadius: 14, border: '1px solid #E5E7EB', fontSize: 14, outline: 'none', background: 'white', boxSizing: 'border-box' }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {types.map(t => (
              <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '10px 18px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: typeFilter === t ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F3F4F6', color: typeFilter === t ? 'white' : '#374151' }}>
                {t}
              </button>
            ))}
          </div>
          <button style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 700, fontSize: 14 }}>
            <Upload size={15} /> Upload
          </button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[['📁', documents.length, 'Total Documents'], ['🔒', documents.filter(d => d.sensitive).length, 'Sensitive Files'], ['💾', '18.2 MB', 'Total Size'], ['👥', '5', 'Contributors']].map(([emoji, val, label]) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 900, fontSize: 22, color: '#111827' }}>{val}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Document list */}
        <div style={{ background: 'white', borderRadius: 20, border: '1px solid #E5E7EB', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
          <div style={{ padding: '20px 28px', borderBottom: '1px solid #F3F4F6', background: '#F8FAFC' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 120px', gap: 16, fontSize: 12, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <span>Document Name</span>
              <span>Type</span>
              <span>Size</span>
              <span>Uploaded</span>
              <span style={{ textAlign: 'right' }}>Actions</span>
            </div>
          </div>
          <div>
            {filtered.map((doc, i) => (
              <div key={doc.id} style={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr 120px', gap: 16, alignItems: 'center', padding: '18px 28px', borderBottom: i < filtered.length - 1 ? '1px solid #F9FAFB' : 'none', transition: 'background 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.background = '#FAFBFF'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: `${doc.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{doc.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827', display: 'flex', alignItems: 'center', gap: 8 }}>
                      {doc.name}
                      {doc.sensitive && <Lock size={12} color="#9CA3AF" />}
                    </div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>By {doc.uploadedBy}</div>
                  </div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 50, background: `${doc.color}12`, color: doc.color }}>{doc.type}</span>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{doc.size}</span>
                <span style={{ fontSize: 13, color: '#6B7280' }}>{doc.uploaded}</span>
                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#EEF2FF'; e.currentTarget.style.color = '#4F46E5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#6B7280'; }}>
                    <Eye size={14} />
                  </button>
                  <button style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid #E5E7EB', background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F0FDF4'; e.currentTarget.style.color = '#10B981'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.color = '#6B7280'; }}>
                    <Download size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
