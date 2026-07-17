import React, { useState } from 'react';
import { Search, Filter, ShieldCheck, XCircle, FileText, Download, CheckCircle2, MoreVertical, Eye, Lock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const folders = ['All', 'Legal', 'Insurance', 'Events', 'Photos', 'Health'];
const statuses = ['All Statuses', 'PENDING', 'VERIFIED', 'REJECTED'];

export default function Documents() {
  const queryClient = useQueryClient();
  const [activeFolder, setActiveFolder] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [search, setSearch] = useState('');

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['adminDocuments'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status, visibility }) => {
      const payload = { status };
      if (visibility) payload.visibility = visibility;
      const res = await axios.put(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/documents/${id}/status`, payload, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(['adminDocuments'])
  });

  const filtered = documents.filter(d => {
    const f1 = activeFolder === 'All' || d.category === activeFolder;
    const f2 = statusFilter === 'All Statuses' || d.status === statusFilter;
    const f3 = d.name.toLowerCase().includes(search.toLowerCase()) || 
               (d.uploader?.firstName && d.uploader.firstName.toLowerCase().includes(search.toLowerCase()));
    return f1 && f2 && f3;
  });

  if (isLoading) return <div className="p-20 text-center text-slate-400 font-bold">Loading Documents Directory...</div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Review Documents</h1>
          <p className="text-slate-500 text-sm mt-1">Manage, verify, and secure files uploaded by family members.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
           {statuses.map(s => (
             <button 
               key={s} 
               onClick={() => setStatusFilter(s)}
               className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${statusFilter === s ? 'bg-white dark:bg-slate-600 shadow-sm text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
             >
               {s === 'All Statuses' ? 'All' : s}
             </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by document name or uploader..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-11 pr-4 py-3 placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0">
            {folders.map(folder => (
              <button 
                key={folder}
                onClick={() => setActiveFolder(folder)}
                className={`px-4 py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${activeFolder === folder ? 'bg-slate-800 text-white dark:bg-slate-700' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800/50 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}
              >
                {folder}
              </button>
            ))}
            <button className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 flex items-center gap-2 text-sm font-semibold dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-300 transition-colors">
              <Filter size={16} /> Filters
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800/80">
                 <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Document Name</th>
                 <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Uploader</th>
                 <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Details</th>
                 <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status & Visibility</th>
                 <th className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                   <td className="px-4 py-4 min-w-[200px]">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            <FileText size={18} />
                         </div>
                         <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{doc.name}</p>
                            <p className="text-xs text-slate-400 font-medium">Uploaded {new Date(doc.createdAt).toLocaleDateString()}</p>
                         </div>
                      </div>
                   </td>
                   <td className="px-4 py-4 min-w-[150px]">
                      <div className="flex items-center gap-2">
                         <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center text-slate-600 dark:text-slate-300">
                           {doc.uploader?.firstName?.charAt(0) || 'U'}
                         </div>
                         <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                            {doc.uploader?.firstName} {doc.uploader?.lastName}
                         </span>
                      </div>
                   </td>
                   <td className="px-4 py-4 min-w-[120px]">
                      <div className="text-xs font-bold text-slate-500 whitespace-nowrap">{doc.category}</div>
                      <div className="text-[10px] text-slate-400 font-medium">{doc.type} • {doc.size}</div>
                   </td>
                   <td className="px-4 py-4 min-w-[150px]">
                      <div className="flex flex-col gap-1.5 items-start">
                         {doc.status === 'PENDING' && <span className="inline-flex px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-500/10 text-amber-600 text-[10px] items-center gap-1 font-bold border border-amber-200 dark:border-amber-500/20"><ShieldCheck size={10} /> Pending</span>}
                         {doc.status === 'VERIFIED' && <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] items-center gap-1 font-bold border border-emerald-200 dark:border-emerald-500/20"><CheckCircle2 size={10} /> Verified</span>}
                         {doc.status === 'REJECTED' && <span className="inline-flex px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-500/10 text-rose-600 text-[10px] items-center gap-1 font-bold border border-rose-200 dark:border-rose-500/20"><XCircle size={10} /> Rejected</span>}
                         
                         <span className="inline-flex px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] items-center gap-1 font-bold">
                           <Lock size={10} /> {doc.visibility}
                         </span>
                      </div>
                   </td>
                   <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2 pr-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                         {doc.status === 'PENDING' && (
                           <>
                             <button onClick={() => updateStatus.mutate({ id: doc.id, status: 'VERIFIED' })} className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 flex items-center justify-center transition-colors shadow-sm" title="Verify">
                               <CheckCircle2 size={14} />
                             </button>
                             <button onClick={() => updateStatus.mutate({ id: doc.id, status: 'REJECTED' })} className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 hover:bg-rose-100 dark:hover:bg-rose-500/20 flex items-center justify-center transition-colors shadow-sm" title="Reject">
                               <XCircle size={14} />
                             </button>
                           </>
                         )}
                         <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 flex items-center justify-center transition-colors shadow-sm" title="Preview">
                           <Eye size={14} />
                         </button>
                         <button className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 flex items-center justify-center transition-colors shadow-sm" title="Download">
                           <Download size={14} />
                         </button>
                      </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-sm">
                <FileText size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No documents found</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Manage, organize, and securely store sensitive family documents such as passports, medical records, or legal files here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
