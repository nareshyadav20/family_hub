import React, { useState } from 'react';
import PrivateLayout from '../../components/PrivateLayout';
import { Folder, FileText, Download, Eye, Search, Upload, Shield, Lock } from 'lucide-react';

import axios from 'axios';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

const types = ['All', 'Property', 'Certificate', 'Legal', 'Finance', 'Medical'];

export default function Documents() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
     const token = localStorage.getItem('token');
     axios.get(`${API_URL}/documents`, { headers: { Authorization: `Bearer ${token}` } })
       .then(res => {
          const mapped = res.data.map(d => ({
             id: d.id,
             name: d.name,
             type: d.category || 'Other',
             size: (d.size / 1024 / 1024).toFixed(2) + ' MB',
             uploaded: new Date(d.createdAt).toLocaleDateString(),
             uploadedBy: d.uploader ? `${d.uploader.firstName} ${d.uploader.lastName}` : 'Admin',
             icon: '📄',
             color: '#4F46E5',
             sensitive: d.visibility === 'PRIVATE'
          }));
          setDocuments(mapped);
       })
       .catch(err => console.error(err));
  }, []);

  const filtered = documents.filter(d =>
    (typeFilter === 'All' || d.type.includes(typeFilter)) &&
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
