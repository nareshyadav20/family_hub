import React, { useState } from 'react';
import { Folder, File, FileText, Image, Upload, Lock, Eye, Download, Trash2, Plus, Search } from 'lucide-react';

const documents = [
  { id: 1, name: 'Property Deed – Mumbai House', type: 'pdf', size: '2.4 MB', uploadedBy: 'Robert Smith', date: 'June 12, 2026', folder: 'Legal', icon: <FileText size={20} />, iconColor: 'text-red-500', locked: true },
  { id: 2, name: 'Family Insurance Policy 2026', type: 'pdf', size: '1.8 MB', uploadedBy: 'Arjun Mehta', date: 'July 1, 2026', folder: 'Insurance', icon: <FileText size={20} />, iconColor: 'text-red-500', locked: true },
  { id: 3, name: 'Annual Reunion Invitation.docx', type: 'doc', size: '340 KB', uploadedBy: 'Sarah Smith', date: 'July 5, 2026', folder: 'Events', icon: <File size={20} />, iconColor: 'text-blue-500', locked: false },
  { id: 4, name: 'Family Group Photo – 2024', type: 'image', size: '5.1 MB', uploadedBy: 'Emily Smith', date: 'Jan 22, 2025', folder: 'Photos', icon: <Image size={20} />, iconColor: 'text-emerald-500', locked: false },
  { id: 5, name: 'Will & Testament – Robert Smith', type: 'pdf', size: '892 KB', uploadedBy: 'Robert Smith', date: 'March 3, 2024', folder: 'Legal', icon: <FileText size={20} />, iconColor: 'text-red-500', locked: true },
  { id: 6, name: 'Vaccination Records – All Members', type: 'pdf', size: '1.2 MB', uploadedBy: 'Arjun Mehta', date: 'May 14, 2026', folder: 'Health', icon: <FileText size={20} />, iconColor: 'text-red-500', locked: false },
  { id: 7, name: 'Grandpa 80th Birthday Budget', type: 'sheet', size: '128 KB', uploadedBy: 'Emily Smith', date: 'July 3, 2026', folder: 'Events', icon: <File size={20} />, iconColor: 'text-green-500', locked: false },
  { id: 8, name: 'Passport Copies – Family', type: 'pdf', size: '3.6 MB', uploadedBy: 'Robert Smith', date: 'Feb 18, 2025', folder: 'Legal', icon: <FileText size={20} />, iconColor: 'text-red-500', locked: true },
];

const folders = ['All', 'Legal', 'Insurance', 'Events', 'Photos', 'Health'];

export default function Documents() {
  const [activeFolder, setActiveFolder] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = documents.filter(d =>
    (activeFolder === 'All' || d.folder === activeFolder) &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Documents</h1>
          <p className="text-slate-500 text-sm mt-1">Secure storage for important family files.</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30">
          <Upload size={16} /> Upload Document
        </button>
      </div>

      {/* Folder Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {folders.map(f => {
          const count = f === 'All' ? documents.length : documents.filter(d => d.folder === f).length;
          return (
            <button key={f} onClick={() => setActiveFolder(f)}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${activeFolder === f ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-blue-300'}`}>
              <Folder size={22} className={activeFolder === f ? 'text-white' : 'text-amber-400'} />
              <span className="text-xs font-bold truncate w-full text-center">{f}</span>
              <span className={`text-[10px] font-semibold ${activeFolder === f ? 'text-blue-200' : 'text-slate-400'}`}>{count} files</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative w-64">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <input type="text" placeholder="Search documents..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
      </div>

      {/* File Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Folder</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Uploaded by</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(doc => (
              <tr key={doc.id} className="border-b border-slate-50 dark:border-slate-800/60 last:border-0 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center ${doc.iconColor}`}>
                      {doc.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{doc.name}</p>
                      {doc.locked && <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold mt-0.5"><Lock size={10} /> Sensitive</div>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{doc.folder}</span></td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{doc.uploadedBy}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{doc.size}</td>
                <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{doc.date}</td>
                <td className="px-6 py-4">
                  <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Eye size={15} /></button>
                    <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-emerald-600 transition-colors"><Download size={15} /></button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-400">
            <Folder className="mx-auto mb-3 opacity-30" size={36} />
            <p className="font-medium text-sm">No documents found</p>
          </div>
        )}
      </div>
    </div>
  );
}
