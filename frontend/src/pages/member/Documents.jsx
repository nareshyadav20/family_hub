import React, { useState } from 'react';
import { Folder, FileText, Image as ImageIcon, Lock, Eye, Download, Search, Upload, ShieldCheck, CheckCircle2, Clock } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const folders = ['All', 'Legal', 'Insurance', 'Events', 'Photos', 'Health'];

export default function Documents() {
  const queryClient = useQueryClient();
  const [activeFolder, setActiveFolder] = useState('All');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileBase64, setFileBase64] = useState(null);
  const [uploadData, setUploadData] = useState({ name: '', category: 'Legal', visibility: 'PRIVATE' });
  const activeUser = JSON.parse(localStorage.getItem('user')) || {};

  const { data: documents = [], isLoading } = useQuery({
    queryKey: ['memberDocuments'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/documents`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      // Filter out Private/Admin documents not owned by this user
      return res.data.filter(d => 
         (d.visibility === 'FAMILY' && d.status === 'VERIFIED') || 
         d.uploaderId === activeUser.memberId || d.uploaderId === activeUser.id
      );
    }
  });

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 15 * 1024 * 1024) {
              alert('File size exceeds 15MB limit.');
              return;
          }
          setSelectedFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setFileBase64(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const uploadDoc = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;
      const fileType = selectedFile.type.startsWith('image/') ? 'image' : 'pdf';
      const fileSize = (selectedFile.size / (1024*1024)).toFixed(2) + ' MB';

      const res = await axios.post(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/documents`, {
         name: uploadData.name,
         category: uploadData.category,
         visibility: uploadData.visibility,
         type: fileType,
         size: fileSize,
         fileUrl: fileBase64,
         uploaderId: activeUser.id
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    },
    onSuccess: () => {
      setShowModal(false);
      setSelectedFile(null);
      setFileBase64(null);
      setUploadData({ name: '', category: 'Legal', visibility: 'PRIVATE' });
      queryClient.invalidateQueries(['memberDocuments']);
      alert('Document Uploaded Successfully. Please wait for Admin verification.');
    }
  });

  const filtered = documents.filter(d =>
    (activeFolder === 'All' || d.category === activeFolder) &&
    (search === '' || d.name.toLowerCase().includes(search.toLowerCase()))
  );

  const getIcon = (type) => {
    if (type === 'image') return <ImageIcon size={20} className="text-emerald-500" />;
    return <FileText size={20} className="text-blue-500" />;
  };

  if (isLoading) return <div className="p-20 text-center font-bold text-slate-400">Loading your Documents...</div>;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Documents</h1>
          <p className="text-slate-500 text-sm mt-1">Access verified documents or upload new files securely.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-500/30">
          <Upload size={18} /> Upload Document
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
         {/* Folder Grid */}
         <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
           {folders.map(f => {
             const count = f === 'All' ? filtered.length : filtered.filter(d => d.category === f).length;
             return (
               <button key={f} onClick={() => setActiveFolder(f)}
                 className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all whitespace-nowrap ${activeFolder === f ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300'}`}>
                 <Folder size={16} className={activeFolder === f ? 'text-blue-200' : 'text-amber-400'} />
                 <span className="text-sm font-bold">{f}</span>
                 <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${activeFolder === f ? 'bg-blue-700/50 text-blue-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>{count}</span>
               </button>
             );
           })}
         </div>

         {/* Search */}
         <div className="relative mb-6">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
           <input type="text" placeholder="Search for documents..." value={search} onChange={e => setSearch(e.target.value)}
             className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
         </div>

         {/* File list */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
           {filtered.map(doc => (
             <div key={doc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 flex items-center gap-4 hover:shadow-md transition-shadow group relative overflow-hidden">
               <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0">
                 {getIcon(doc.type)}
               </div>
               <div className="flex-1 min-w-0">
                 <div className="flex items-center gap-2 mb-1">
                   <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] truncate">{doc.name}</p>
                   {doc.visibility === 'PRIVATE' && <Lock size={12} className="text-amber-500 shrink-0" />}
                 </div>
                 <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 font-bold">{doc.category}</span>
                    <span>• {doc.size}</span>
                 </div>
               </div>
               
               <div className="flex flex-col items-end gap-2 shrink-0">
                  {doc.status === 'VERIFIED' && <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md"><CheckCircle2 size={12}/> Verified</span>}
                  {doc.status === 'PENDING' && <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-500/10 px-2 py-1 rounded-md"><Clock size={12}/> Pending</span>}
                  
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 transition-colors"><Eye size={14} /></button>
                     <button className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-500/10 text-blue-600 transition-colors"><Download size={14} /></button>
                  </div>
               </div>
             </div>
           ))}
           {filtered.length === 0 && (
             <div className="col-span-1 lg:col-span-2 text-center py-20 text-slate-400">
               <Folder className="mx-auto mb-4 opacity-30" size={48} />
               <p className="font-medium text-sm">No documents found matching criteria</p>
             </div>
           )}
         </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Upload Secure Document</h2>
              
              <div className="space-y-4">
                <input 
                  type="text" 
                  autoFocus
                  placeholder="Document Name (e.g. 2026 Tax Summary)" 
                  value={uploadData.name}
                  onChange={e => setUploadData({...uploadData, name: e.target.value})}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/50" 
                />
                <div className="flex gap-4">
                   <select 
                      value={uploadData.category}
                      onChange={e => setUploadData({...uploadData, category: e.target.value})}
                      className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium">
                      <option value="Legal">Legal</option>
                      <option value="Insurance">Insurance</option>
                      <option value="Events">Events</option>
                      <option value="Health">Health</option>
                   </select>
                   <select 
                      value={uploadData.visibility}
                      onChange={e => setUploadData({...uploadData, visibility: e.target.value})}
                      className="w-1/2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium">
                      <option value="PRIVATE">Private (Me & Admins)</option>
                      <option value="FAMILY">Family (All Verified)</option>
                   </select>
                </div>
                <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full relative">
                   <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx,.zip,image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                   
                   {selectedFile ? (
                     <div className="text-center">
                        <FileText size={32} className="text-emerald-500 mb-2 mx-auto" />
                        <span className="text-sm font-bold text-emerald-600 block">{selectedFile.name}</span>
                        <span className="text-xs text-slate-500">{(selectedFile.size / (1024*1024)).toFixed(2)} MB</span>
                     </div>
                   ) : (
                     <div className="text-center flex flex-col items-center">
                        <Upload size={32} className="text-blue-500 mb-3" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Browse or drop document here</span>
                        <span className="text-xs text-slate-400 mt-1">PDF, DOCX, ZIP, Image (Max 15MB)</span>
                     </div>
                   )}
                </label>
              </div>
              
              <div className="mt-5 flex gap-3">
                 <button 
                  onClick={() => uploadDoc.mutate()} 
                  disabled={!uploadData.name || !selectedFile || uploadDoc.isPending}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-500/20">
                    {uploadDoc.isPending ? 'Uploading...' : 'Secure Upload'}
                 </button>
                 <button onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
