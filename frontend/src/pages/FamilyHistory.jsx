import React, { useState } from 'react';
import { BookOpen, Plus, Calendar, Image as ImageIcon, FileText, Search, LayoutGrid, ChevronDown, RefreshCw, Eye, MoreVertical, ChevronLeft, ChevronRight, X, Upload, UserPlus } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function FamilyHistory() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [desc, setDesc] = useState('');
  const [related, setRelated] = useState('');
  const [visibility, setVisibility] = useState('Family Only');
  const [status, setStatus] = useState('Published');
  const [fileBase64, setFileBase64] = useState(null);
  
  const token = localStorage.getItem('token');
  const API_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

  const { data: historyData = [], isLoading } = useQuery({
      queryKey: ['familyHistory'],
      queryFn: async () => {
          const res = await axios.get(`${API_URL}/family-history`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      }
  });

  const { data: documentsData = [] } = useQuery({
      queryKey: ['adminDocuments'],
      queryFn: async () => {
          const res = await axios.get(`${API_URL}/documents`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      }
  });

  const { data: galleryData = [] } = useQuery({
      queryKey: ['gallery'],
      queryFn: async () => {
          const res = await axios.get(`${API_URL}/gallery`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      }
  });

  const uploadHistory = useMutation({
      mutationFn: async () => {
          const payload = {
              title,
              category,
              eventDate: date,
              description: desc,
              related,
              visibility,
              status,
              fileUrl: fileBase64
          };
          const res = await axios.post(`${API_URL}/family-history`, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      onSuccess: () => {
          setShowAddModal(false);
          setTitle(''); setCategory(''); setDate(''); setDesc(''); setRelated(''); 
          setFileBase64(null); setVisibility('Family Only'); setStatus('Published');
          queryClient.invalidateQueries(['familyHistory']);
      }
  });

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) {
              alert('File size exceeds 5MB limit.');
              return;
          }
          const reader = new FileReader();
          reader.onloadend = () => {
              setFileBase64(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const filtered = historyData.filter(d => 
     (search === '' || d.title.toLowerCase().includes(search.toLowerCase()))
  );
  
  const totalEvents = historyData.length;
  const eventsThisYear = historyData.filter(h => h.year === new Date().getFullYear().toString()).length;

  const totalStories = historyData.filter(h => h.category !== 'Property').length;
  const storiesThisYear = historyData.filter(h => h.category !== 'Property' && h.year === new Date().getFullYear().toString()).length;

  const totalPhotos = galleryData.length;
  const photosThisYear = galleryData.filter(p => p.year === new Date().getFullYear().toString()).length;

  const totalDocuments = documentsData.length;
  const docsThisYear = documentsData.filter(d => new Date(d.createdAt || Date.now()).getFullYear() === new Date().getFullYear()).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Family History
            </h1>
            <p className="text-slate-500 text-sm mt-0.5 font-medium">Preserve and celebrate your family's legacy for future generations.</p>
          </div>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
        >
          <Plus size={18} /> Add History
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: <Calendar strokeWidth={2.5} size={24} />, bg: 'bg-purple-50 dark:bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400', value: totalEvents, label: 'Total Events', trend: `+${eventsThisYear} this year` },
          { icon: <BookOpen strokeWidth={2.5} size={24} />, bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', value: totalStories, label: 'Family Stories', trend: `+${storiesThisYear} this year` },
          { icon: <ImageIcon strokeWidth={2.5} size={24} />, bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400', value: totalPhotos, label: 'Heritage Photos', trend: `+${photosThisYear} this year` },
          { icon: <FileText strokeWidth={2.5} size={24} />, bg: 'bg-blue-50 dark:bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', value: totalDocuments, label: 'Documents', trend: `+${docsThisYear} this year` },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
              {stat.icon}
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 dark:text-white leading-none mb-1">{stat.value}</h3>
              <p className="text-sm font-bold text-slate-500 leading-tight mb-1">{stat.label}</p>
              <p className="text-xs font-bold text-emerald-500">{stat.trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col xl:flex-row gap-4 items-center justify-between">
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text" placeholder="Search history..."
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:font-medium"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
             <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
               <LayoutGrid size={16} className="text-slate-400" /> All Categories <ChevronDown size={14} className="text-slate-400 ml-2" />
             </button>
             <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
               <Calendar size={16} className="text-slate-400" /> All Years <ChevronDown size={14} className="text-slate-400 ml-2" />
             </button>
             <button className="flex items-center gap-2 px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 whitespace-nowrap shrink-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
               <img src="https://ui-avatars.com/api/?name=B&background=e2e8f0&color=64748b" className="w-4 h-4 rounded-full" alt="branch" /> All Branches <ChevronDown size={14} className="text-slate-400 ml-2" />
             </button>
          </div>
        </div>
        <button onClick={() => setSearch('')} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0">
           <RefreshCw size={16} /> Clear Filters
        </button>
      </div>

      {/* Main Grid: Table & Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        
        {/* Table Area */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="grid grid-cols-1 gap-4 p-4">
             {isLoading && (
                <div className="p-8 text-center text-slate-500 font-bold tracking-wider text-sm">Loading database...</div>
             )}
             {!isLoading && filtered.length === 0 && (
                <div className="p-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                   <div className="w-16 h-16 bg-purple-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-purple-500 mx-auto">
                      <BookOpen size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No history records yet</h3>
                   <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">Begin documenting your family’s legacy. Add key milestones, properties, or ancestral origins.</p>
                   <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all mx-auto">
                      <Plus size={16} /> Add First Event
                   </button>
                </div>
             )}
             {filtered.map(item => (
                <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700/50 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-start">
                   <img src={item.thumbnail} alt={item.title} className="w-full md:w-32 h-32 md:h-24 rounded-xl object-cover shadow-sm bg-slate-100 shrink-0" />
                   
                   <div className="flex-1 min-w-0 flex flex-col h-full">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.catColor}`}>
                                 {item.category}
                               </span>
                               <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 text-[10px] font-bold">
                                 {item.status}
                               </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate leading-tight">{item.title}</h3>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 mt-1">{item.subtitle}</p>
                         </div>
                         <div className="flex items-center gap-2 shrink-0 md:flex-col md:items-end">
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.date}</span>
                            <span className="text-xs font-semibold text-slate-400">{item.location}</span>
                         </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                               <span className="text-xs text-slate-400 font-semibold">Added by:</span>
                               <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{item.addedBy}</span>
                            </div>
                            
                            <div className="flex items-center">
                               {item.members.map((m, i) => (
                                 <img key={i} src={m} alt="member" className={`w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 object-cover ${i > 0 && '-ml-2'}`} />
                               ))}
                               {item.extraMembers > 0 && (
                                 <div className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-600 dark:text-slate-300 -ml-2 z-10 shrink-0">
                                   +{item.extraMembers}
                                 </div>
                               )}
                               {item.members.length === 0 && <span className="text-[10px] text-slate-400 font-medium ml-1">No related</span>}
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-1.5 shrink-0">
                            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                              <Eye size={14} />
                            </button>
                            <button className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors">
                              <MoreVertical size={14} />
                            </button>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 mt-auto border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-slate-500">Showing {filtered.length} results</span>
            <div className="flex items-center gap-2">
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronLeft size={16} /></button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm">1</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"><ChevronRight size={16} /></button>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300">
               10 / page <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Sidebar Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6 shadow-sm min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-black text-slate-900 dark:text-white">Family Timeline</h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="relative">
             <div className="absolute left-[11px] top-4 bottom-8 w-0.5 bg-slate-100 dark:bg-slate-800"></div>

             <div className="space-y-7 relative z-10">
               {filtered.map((node, i) => (
                 <div key={node.id} className="flex gap-4 group cursor-pointer">
                    <div className="mt-1">
                      <div className={`w-6 h-6 rounded-full border-4 border-white dark:border-slate-900 ${node.timelineColor} shadow-sm transition-transform duration-300 group-hover:scale-125`}></div>
                    </div>
                    <div className="flex-1 flex gap-3 pb-1">
                       <div className="flex-1">
                          <h4 className={`text-sm font-black mb-0.5 ${node.timelineColor.replace('bg-', 'text-')} transition-colors`}>
                             {node.year} <span className="text-slate-900 dark:text-white ml-2">{node.title}</span>
                          </h4>
                          <p className="text-xs font-medium text-slate-500 leading-relaxed pr-2 line-clamp-2">
                             {node.subtitle}
                          </p>
                       </div>
                       <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                          <img src={node.thumbnail} alt={node.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                       </div>
                    </div>
                 </div>
               ))}
               {filtered.length === 0 && (
                  <div className="flex flex-col items-center justify-center pt-20 pb-10 text-slate-400">
                     <span className="text-[40px] mb-2 opacity-50">⏳</span>
                     <p className="text-sm font-bold text-center">Your timeline is waiting...</p>
                  </div>
               )}
             </div>
          </div>
        </div>

      </div>

      {/* Add History Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center p-4 sm:p-6 overflow-y-auto w-full">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center rounded-t-3xl bg-slate-50/50 dark:bg-slate-800/50">
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                <BookOpen size={22} className="text-indigo-600 dark:text-indigo-400" /> Add Family History
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              
              {/* Left Column */}
              <div className="space-y-8">
                {/* Basic Information */}
                <div>
                   <h3 className="text-sm font-black uppercase text-indigo-600 mb-5 tracking-wider">Basic Information</h3>
                   
                   <div className="space-y-4">
                     <div>
                       <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">History Title <span className="text-rose-500">*</span></label>
                       <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Ancestral Home Built" className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category <span className="text-rose-500">*</span></label>
                          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200">
                            <option value="">Select Category</option>
                            <option value="Birth">Birth</option>
                            <option value="Marriage">Marriage</option>
                            <option value="Education">Education</option>
                            <option value="Reunion">Reunion</option>
                            <option value="Property">Property</option>
                            <option value="Achievement">Achievement</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Event Date <span className="text-rose-500">*</span></label>
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 dark:text-slate-200" />
                        </div>
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description <span className="text-rose-500">*</span></label>
                       <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Describe the history event in detail..." className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"></textarea>
                     </div>
                   </div>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-8 h-full flex flex-col justify-between">
                <div>
                   <h3 className="text-sm font-black uppercase text-indigo-600 mb-5 tracking-wider">Related Member</h3>
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                      <input type="text" value={related} onChange={e => setRelated(e.target.value)} placeholder="Search Member..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 p-1.5 rounded-lg text-slate-500">
                        <UserPlus size={16} />
                      </button>
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-black uppercase text-indigo-600 mb-5 tracking-wider">Photo (Optional)</h3>
                   <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl h-[120px] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full relative overflow-hidden">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {fileBase64 ? (
                         <div className="absolute inset-0">
                           <img src={fileBase64} alt="Thumb" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-white opacity-0 hover:opacity-100 transition-opacity text-sm">Change Image</div>
                         </div>
                      ) : (
                         <>
                           <Upload size={28} className="text-indigo-500 mb-2" />
                           <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Upload Image</span>
                         </>
                      )}
                   </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-indigo-600 mb-3 tracking-wider">Visibility</h3>
                    <select value={visibility} onChange={e => setVisibility(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 dark:text-slate-200">
                       <option value="Family Only">Family Only</option>
                       <option value="Public">Public</option>
                       <option value="Private">Private</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-indigo-600 mb-3 tracking-wider">Status</h3>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-bold flex focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                       <option value="Published">Published</option>
                       <option value="Draft">Draft</option>
                       <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>
            
            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-3xl flex justify-end gap-3 hover:opacity-100">
               <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
               >
                 Cancel
               </button>
               <button 
                  onClick={() => uploadHistory.mutate()}
                  className="px-6 py-2.5 rounded-xl border border-indigo-200 dark:border-indigo-500/20 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 text-sm font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors shadow-sm"
               >
                 {uploadHistory.isPending ? 'Saving...' : 'Save Draft'}
               </button>
               <button 
                  onClick={() => uploadHistory.mutate()}
                  disabled={uploadHistory.isPending || !title || !category || !date}
                  className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md shadow-indigo-600/20 ml-2"
               >
                 {uploadHistory.isPending ? 'Publishing...' : 'Publish'}
               </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
