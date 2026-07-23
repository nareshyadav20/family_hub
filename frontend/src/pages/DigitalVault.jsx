import React, { useState } from 'react';
import { Shield, Upload, FileText, Download, Eye, Search, Lock, Plus, Folder } from 'lucide-react';

const vaultItems = [
  { id: 1, name: 'Property Deed — Springfield House', type: 'Property', size: '2.4 MB', date: 'June 10, 2026', owner: 'Robert Smith', icon: '🏠', color: '#4F46E5', sensitive: true },
  { id: 2, name: 'Smith Family Will & Testament', type: 'Legal', size: '890 KB', date: 'May 5, 2026', owner: 'Legal Team', icon: '⚖️', color: '#EF4444', sensitive: true },
  { id: 3, name: 'Birth Certificates — All Children', type: 'Certificate', size: '3.1 MB', date: 'April 12, 2026', owner: 'Martha Smith', icon: '📜', color: '#7C3AED', sensitive: true },
  { id: 4, name: 'Investment Portfolio 2025', type: 'Finance', size: '1.8 MB', date: 'March 20, 2026', owner: 'Robert Smith', icon: '📈', color: '#10B981', sensitive: true },
  { id: 5, name: 'Vehicle Registrations', type: 'Property', size: '1.2 MB', date: 'Feb 14, 2026', owner: 'William Smith', icon: '🚗', color: '#14B8A6', sensitive: false },
  { id: 6, name: 'Insurance Policies Bundle', type: 'Insurance', size: '4.7 MB', date: 'Jan 8, 2026', owner: 'James Smith', icon: '🛡️', color: '#F59E0B', sensitive: false },
];

const vaultCategories = ['All', 'Property', 'Legal', 'Certificate', 'Finance', 'Insurance'];

export default function DigitalVault() {
  const [activeType, setActiveType] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = vaultItems.filter(v =>
    (activeType === 'All' || v.type === activeType) &&
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Digital Vault</h1>
          <p className="text-sm text-slate-500 mt-1">Securely store all important family documents and certificates.</p>
        </div>
        <button className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-violet-500/30">
          <Upload size={18} /> Upload Document
        </button>
      </div>

      {/* Security badge */}
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/30">
          <Shield size={22} color="white" />
        </div>
        <div>
          <div className="font-bold text-indigo-700 dark:text-indigo-400 text-sm mb-0.5">AES-256 Military-Grade Encryption</div>
          <p className="text-sm text-indigo-600/70 dark:text-indigo-400/60">All documents are encrypted at rest and in transit. Only authorized family admins can access sensitive files.</p>
        </div>
        <div className="ml-auto text-right hidden sm:block">
          <div className="text-2xl font-black text-indigo-700 dark:text-indigo-400">100%</div>
          <div className="text-xs text-indigo-500">Encrypted</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[['📁', '6', 'Documents'], ['🔒', '4', 'Sensitive Files'], ['💾', '14.1 MB', 'Total Size'], ['📂', '5', 'Categories']].map(([emoji, val, label]) => (
          <div key={label} className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm text-center">
            <div className="text-3xl mb-3">{emoji}</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{val}</div>
            <div className="text-sm text-slate-500 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Search & filters */}
      <div className="flex gap-4 flex-wrap items-center">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full h-10 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/40" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {vaultCategories.map(cat => (
            <button key={cat} onClick={() => setActiveType(cat)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${activeType === cat ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden shadow-sm vault-table-container">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4">
          {['Document Name', 'Category', 'Size', 'Date Added', 'Actions'].map((h, i) => (
            <div key={h} className={`text-xs font-bold text-slate-400 uppercase tracking-wider ${i === 4 ? 'text-right' : ''}`}>{h}</div>
          ))}
        </div>
        {filtered.map((doc, i) => (
          <div key={doc.id} className={`px-6 py-4 grid grid-cols-[2fr_1fr_1fr_1fr_120px] gap-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-50 dark:border-slate-800 last:border-0`}>
            <div className="flex items-center gap-4">
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${doc.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>{doc.icon}</div>
              <div>
                <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  {doc.name}
                  {doc.sensitive && <Lock size={12} className="text-slate-400" />}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">Uploaded by {doc.owner}</div>
              </div>
            </div>
            <span style={{ background: `${doc.color}12`, color: doc.color }} className="text-xs font-bold px-3 py-1 rounded-full inline-block">{doc.type}</span>
            <span className="text-sm text-slate-500">{doc.size}</span>
            <span className="text-sm text-slate-500">{doc.date}</span>
            <div className="flex gap-2 justify-end">
              {[Eye, Download].map((Icon, j) => (
                <button key={j} className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:border-indigo-300 hover:text-indigo-600 flex items-center justify-center text-slate-400 transition-all">
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-16 text-center text-slate-400">
            <Folder size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-sm">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
