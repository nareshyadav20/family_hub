import React, { useState } from 'react';
import { Folder, File, FileText, Image, Lock, Eye, Download, Search } from 'lucide-react';

const documents = [
  { id: 1, name: 'Property Deed – Mumbai House', type: 'pdf', size: '2.4 MB', uploadedBy: 'Robert Smith', date: 'June 12, 2026', folder: 'Legal', iconColor: 'text-red-500', locked: true, shared: false },
  { id: 2, name: 'Family Insurance Policy 2026', type: 'pdf', size: '1.8 MB', uploadedBy: 'Arjun Mehta', date: 'July 1, 2026', folder: 'Insurance', iconColor: 'text-red-500', locked: false, shared: true },
  { id: 3, name: 'Annual Reunion Invitation.docx', type: 'doc', size: '340 KB', uploadedBy: 'Sarah Smith', date: 'July 5, 2026', folder: 'Events', iconColor: 'text-blue-500', locked: false, shared: true },
  { id: 4, name: 'Family Group Photo – 2024', type: 'image', size: '5.1 MB', uploadedBy: 'Emily Smith', date: 'Jan 22, 2025', folder: 'Photos', iconColor: 'text-emerald-500', locked: false, shared: true },
  { id: 5, name: 'Vaccination Records – All Members', type: 'pdf', size: '1.2 MB', uploadedBy: 'Arjun Mehta', date: 'May 14, 2026', folder: 'Health', iconColor: 'text-red-500', locked: false, shared: true },
  { id: 6, name: 'Grandpa 80th Birthday Budget', type: 'sheet', size: '128 KB', uploadedBy: 'Emily Smith', date: 'July 3, 2026', folder: 'Events', iconColor: 'text-green-500', locked: false, shared: true },
  { id: 7, name: 'Will & Testament – Robert Smith', type: 'pdf', size: '892 KB', uploadedBy: 'Robert Smith', date: 'March 3, 2024', folder: 'Legal', iconColor: 'text-red-500', locked: true, shared: false },
  { id: 8, name: 'Passport Copies – Family.pdf', type: 'pdf', size: '3.6 MB', uploadedBy: 'Robert Smith', date: 'Feb 18, 2025', folder: 'Legal', iconColor: 'text-red-500', locked: true, shared: false },
];

const folders = ['All', 'Legal', 'Insurance', 'Events', 'Photos', 'Health'];

export default function Documents() {
  const [activeFolder, setActiveFolder] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = documents.filter(d =>
    (d.shared || !d.locked) &&
    (activeFolder === 'All' || d.folder === activeFolder) &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getIcon = (type, color) => {
    if (type === 'image') return <Image size={20} className={color} />;
    return <FileText size={20} className={color} />;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Documents</h1>
        <p className="text-slate-500 text-sm mt-1">Access and download family documents shared with you.</p>
      </div>

      {/* Folder Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {folders.map(f => {
          const count = f === 'All' ? filtered.length : documents.filter(d => d.folder === f && !d.locked).length;
          return (
            <button key={f} onClick={() => setActiveFolder(f)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border transition-all ${activeFolder === f ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-blue-300'}`}>
              <Folder size={22} className={activeFolder === f ? 'text-white' : 'text-amber-400'} />
              <span className="text-xs font-bold">{f}</span>
              <span className={`text-[10px] font-semibold ${activeFolder === f ? 'text-blue-200' : 'text-slate-400'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      {/* File list */}
      <div className="space-y-3">
        {filtered.map(doc => (
          <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
            <div className={`w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 ${doc.iconColor}`}>
              {getIcon(doc.type, doc.iconColor)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">{doc.name}</p>
                {doc.locked && <Lock size={12} className="text-amber-500 shrink-0" />}
              </div>
              <p className="text-xs font-medium text-slate-400 mt-0.5">Shared by {doc.uploadedBy} · {doc.date} · {doc.size}</p>
            </div>
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">{doc.folder}</span>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Eye size={16} /></button>
              <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors"><Download size={16} /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-20 text-slate-400">
            <Folder className="mx-auto mb-3 opacity-30" size={36} />
            <p className="font-medium text-sm">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
