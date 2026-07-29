import React, { useState } from 'react';
import { BookOpen, Plus, Calendar, Image as ImageIcon, FileText, Search, LayoutGrid, ChevronDown, RefreshCw, Eye, MoreVertical, ChevronLeft, ChevronRight, X, Upload, UserPlus, Edit2, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import API_BASE_URL from '../config/api';

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

  const [activeCategory, setActiveCategory] = useState('All');
  const [activeYear, setActiveYear] = useState('All');
  const [activeBranch, setActiveBranch] = useState('All');
  
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);

  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingHistory, setEditingHistory] = useState(null);
  const [activeActionId, setActiveActionId] = useState(null);

  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editRelated, setEditRelated] = useState('');
  const [editVisibility, setEditVisibility] = useState('Family Only');
  const [editStatus, setEditStatus] = useState('Published');
  const [editFileBase64, setEditFileBase64] = useState(null);
  
  const token = localStorage.getItem('token');
  const API_URL = `${API_BASE_URL}/api/v1`;
  
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
          queryClient.invalidateQueries({ queryKey: ['familyHistory'] });
      }
  });

  const deleteHistoryMutation = useMutation({
      mutationFn: async (id) => {
          const res = await axios.delete(`${API_URL}/family-history/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['familyHistory'] });
      }
  });

  const updateHistoryMutation = useMutation({
      mutationFn: async ({ id, payload }) => {
          const res = await axios.put(`${API_URL}/family-history/${id}`, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      onSuccess: () => {
          setShowEditModal(false);
          setEditingHistory(null);
          queryClient.invalidateQueries({ queryKey: ['familyHistory'] });
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

  const years = ['All', ...new Set(historyData.map(h => h.year))].sort((a, b) => b - a);
  const branches = ['All', 'Main'];

  const filtered = historyData.filter(d => {
     const matchesSearch = search === '' || d.title.toLowerCase().includes(search.toLowerCase()) || d.subtitle.toLowerCase().includes(search.toLowerCase());
     const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
     const matchesYear = activeYear === 'All' || d.year === activeYear;
     const matchesBranch = activeBranch === 'All' || true;
     return matchesSearch && matchesCategory && matchesYear && matchesBranch;
  });
  
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
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 ">
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
          { icon: <Calendar strokeWidth={2.5} size={24} />, bg: 'bg-purple-50 ', text: 'text-purple-600 ', value: totalEvents, label: 'Total Events', trend: `+${eventsThisYear} this year` },
          { icon: <BookOpen strokeWidth={2.5} size={24} />, bg: 'bg-emerald-50 ', text: 'text-emerald-600 ', value: totalStories, label: 'Family Stories', trend: `+${storiesThisYear} this year` },
          { icon: <ImageIcon strokeWidth={2.5} size={24} />, bg: 'bg-orange-50 ', text: 'text-orange-600 ', value: totalPhotos, label: 'Heritage Photos', trend: `+${photosThisYear} this year` },
          { icon: <FileText strokeWidth={2.5} size={24} />, bg: 'bg-blue-50 ', text: 'text-blue-600 ', value: totalDocuments, label: 'Documents', trend: `+${docsThisYear} this year` },
        ].map((stat, i) => (
          <div key={i} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.text}`}>
              {stat.icon}
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 leading-none mb-1">{stat.value}</h3>
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
              className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all placeholder:font-medium"
            />
          </div>
          <div className="flex gap-3 w-full sm:w-auto overflow-visible pb-2 sm:pb-0 hide-scrollbar">
             {/* Category Filter */}
             <div className="relative z-30">
                <button 
                  onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowYearDropdown(false); setShowBranchDropdown(false); }}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-50 transition-colors"
                >
                  <LayoutGrid size={16} className="text-slate-400" /> 
                  {activeCategory === 'All' ? 'All Categories' : activeCategory} 
                  <ChevronDown size={14} className="text-slate-400 ml-2" />
                </button>
                {showCategoryDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {['All', 'Birth', 'Marriage', 'Education', 'Reunion', 'Property', 'Achievement'].map(cat => (
                      <button
                        key={cat}
                        onClick={() => { setActiveCategory(cat); setShowCategoryDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${activeCategory === cat ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                      >
                        {cat === 'All' ? 'All Categories' : cat}
                      </button>
                    ))}
                  </div>
                )}
             </div>

             {/* Year Filter */}
             <div className="relative z-30">
                <button 
                  onClick={() => { setShowYearDropdown(!showYearDropdown); setShowCategoryDropdown(false); setShowBranchDropdown(false); }}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-50 transition-colors"
                >
                  <Calendar size={16} className="text-slate-400" /> 
                  {activeYear === 'All' ? 'All Years' : activeYear} 
                  <ChevronDown size={14} className="text-slate-400 ml-2" />
                </button>
                {showYearDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-200">
                    {years.map(yr => (
                      <button
                        key={yr}
                        onClick={() => { setActiveYear(yr); setShowYearDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${activeYear === yr ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                      >
                        {yr === 'All' ? 'All Years' : yr}
                      </button>
                    ))}
                  </div>
                )}
             </div>

             {/* Branch Filter */}
             <div className="relative z-30">
                <button 
                  onClick={() => { setShowBranchDropdown(!showBranchDropdown); setShowCategoryDropdown(false); setShowYearDropdown(false); }}
                  className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 whitespace-nowrap shrink-0 hover:bg-slate-50 transition-colors"
                >
                  <img src="https://ui-avatars.com/api/?name=B&background=e2e8f0&color=64748b" className="w-4 h-4 rounded-full" alt="branch" /> 
                  {activeBranch === 'All' ? 'All Branches' : `${activeBranch} Branch`} 
                  <ChevronDown size={14} className="text-slate-400 ml-2" />
                </button>
                {showBranchDropdown && (
                  <div className="absolute left-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-200">
                    {branches.map(br => (
                      <button
                        key={br}
                        onClick={() => { setActiveBranch(br); setShowBranchDropdown(false); }}
                        className={`w-full text-left px-4 py-2.5 text-sm font-semibold hover:bg-slate-50 transition-colors ${activeBranch === br ? 'text-indigo-600 bg-indigo-50/50' : 'text-slate-700'}`}
                      >
                        {br === 'All' ? 'All Branches' : `${br} Branch`}
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
        <button onClick={() => { setSearch(''); setActiveCategory('All'); setActiveYear('All'); setActiveBranch('All'); }} className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors shrink-0">
           <RefreshCw size={16} /> Clear Filters
        </button>
      </div>

      {/* Main Grid: Table & Timeline */}
      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6 items-start">
        
        {/* Table Area */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          <div className="grid grid-cols-1 gap-4 p-4">
             {isLoading && (
                <div className="p-8 text-center text-slate-500 font-bold tracking-wider text-sm">Loading database...</div>
             )}
             {!isLoading && filtered.length === 0 && (
                <div className="p-16 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 ">
                   <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mb-4 text-purple-500 mx-auto">
                      <BookOpen size={32} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-800 mb-1">No history records yet</h3>
                   <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">Begin documenting your family’s legacy. Add key milestones, properties, or ancestral origins.</p>
                   <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all mx-auto">
                      <Plus size={16} /> Add First Event
                   </button>
                </div>
             )}
             {filtered.map(item => (
                <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row gap-5 items-start">
                   <img src={item.thumbnail} alt={item.title} className="w-full md:w-32 h-32 md:h-24 rounded-xl object-cover shadow-sm bg-slate-100 shrink-0" />
                   
                   <div className="flex-1 min-w-0 flex flex-col h-full">
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                         <div>
                            <div className="flex items-center gap-2 mb-1">
                               <span className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${item.catColor}`}>
                                 {item.category}
                               </span>
                               <span className="inline-flex px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                                 {item.status}
                               </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 truncate leading-tight">{item.title}</h3>
                            <p className="text-sm text-slate-500 font-medium line-clamp-2 mt-1">{item.subtitle}</p>
                         </div>
                         
                         <div className="flex items-center gap-1.5 shrink-0">
                            <button 
                               onClick={(e) => { e.stopPropagation(); setSelectedHistory(item); setShowViewModal(true); }}
                               className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
                               title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                            <button 
                               onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingHistory(item);
                                  setEditTitle(item.title);
                                  setEditCategory(item.category);
                                  setEditDate(item.date ? new Date(item.date).toISOString().split('T')[0] : '');
                                  setEditDesc(item.subtitle);
                                  setEditRelated('');
                                  setEditVisibility(item.visibility || 'Family Only');
                                  setEditStatus(item.status || 'Published');
                                  setEditFileBase64(item.thumbnail);
                                  setShowEditModal(true);
                               }}
                               className="w-8 h-8 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-200 flex items-center justify-center transition-colors"
                               title="Edit Event"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button 
                               onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Delete this history event?')) {
                                      deleteHistoryMutation.mutate(item.id);
                                  }
                               }}
                               className="w-8 h-8 rounded-lg bg-slate-50 text-rose-600 hover:bg-rose-50 flex items-center justify-center transition-colors"
                               title="Delete Event"
                            >
                              <Trash2 size={14} />
                            </button>
                         </div>
                      </div>

                      <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between">
                         <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2">
                               <span className="text-xs text-slate-400 font-semibold">Added by:</span>
                               <span className="text-xs font-bold text-slate-700 ">{item.addedBy}</span>
                            </div>
                            
                            <div className="flex items-center">
                               {item.members.map((m, i) => (
                                 <img key={i} src={m} alt="member" className={`w-6 h-6 rounded-full border-2 border-white object-cover ${i > 0 && '-ml-2'}`} />
                               ))}
                               {item.extraMembers > 0 && (
                                 <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600 -ml-2 z-10 shrink-0">
                                   +{item.extraMembers}
                                 </div>
                               )}
                               {item.members.length === 0 && <span className="text-[10px] text-slate-400 font-medium ml-1">No related</span>}
                            </div>
                         </div>
                         
                         <div className="flex items-center gap-2 shrink-0 text-right">
                            <span className="text-sm font-bold text-slate-700">{item.date}</span>
                            <span className="text-slate-300">•</span>
                            <span className="text-xs font-semibold text-slate-400">{item.location}</span>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 mt-auto border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-sm font-semibold text-slate-500">Showing {filtered.length} results</span>
            <div className="flex items-center gap-2">
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 :bg-slate-800 transition-colors"><ChevronLeft size={16} /></button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-indigo-600 text-white font-bold text-sm shadow-sm">1</button>
               <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 :bg-slate-800 transition-colors"><ChevronRight size={16} /></button>
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 ">
               10 / page <ChevronDown size={14} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Sidebar Timeline */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm min-h-[500px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-base font-black text-slate-900 ">Family Timeline</h2>
            <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">View All</button>
          </div>

          <div className="relative">
             <div className="absolute left-[11px] top-4 bottom-8 w-0.5 bg-slate-100 "></div>

             <div className="space-y-7 relative z-10">
               {filtered.map((node, i) => (
                 <div key={node.id} className="flex gap-4 group cursor-pointer">
                    <div className="mt-1">
                      <div className={`w-6 h-6 rounded-full border-4 border-white ${node.timelineColor} shadow-sm transition-transform duration-300 group-hover:scale-125`}></div>
                    </div>
                    <div className="flex-1 flex gap-3 pb-1">
                       <div className="flex-1">
                          <h4 className={`text-sm font-black mb-0.5 ${node.timelineColor.replace('bg-', 'text-')} transition-colors`}>
                             {node.year} <span className="text-slate-900 ml-2">{node.title}</span>
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
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center rounded-t-3xl bg-slate-50/50 ">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <BookOpen size={22} className="text-indigo-600 " /> Add Family History
              </h2>
              <button 
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 :bg-slate-600 transition-colors cursor-pointer"
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
                       <label className="block text-sm font-bold text-slate-700 mb-1.5">History Title <span className="text-rose-500">*</span></label>
                       <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Ancestral Home Built" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
                          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 ">
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
                          <label className="block text-sm font-bold text-slate-700 mb-1.5">Event Date <span className="text-rose-500">*</span></label>
                          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800 " />
                        </div>
                     </div>

                     <div>
                       <label className="block text-sm font-bold text-slate-700 mb-1.5">Description <span className="text-rose-500">*</span></label>
                       <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={4} placeholder="Describe the history event in detail..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"></textarea>
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
                      <input type="text" value={related} onChange={e => setRelated(e.target.value)} placeholder="Search Member..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-100 hover:bg-slate-200 :bg-slate-600 p-1.5 rounded-lg text-slate-500">
                        <UserPlus size={16} />
                      </button>
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-black uppercase text-indigo-600 mb-5 tracking-wider">Photo (Optional)</h3>
                   <label className="border-2 border-dashed border-slate-300 rounded-2xl h-[120px] flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 :bg-slate-800 transition-colors w-full relative overflow-hidden">
                      <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {fileBase64 ? (
                         <div className="absolute inset-0">
                           <img src={fileBase64} alt="Thumb" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-white opacity-0 hover:opacity-100 transition-opacity text-sm">Change Image</div>
                         </div>
                      ) : (
                         <>
                           <Upload size={28} className="text-indigo-500 mb-2" />
                           <span className="text-sm font-bold text-slate-700 ">Upload Image</span>
                         </>
                      )}
                   </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-indigo-600 mb-3 tracking-wider">Visibility</h3>
                    <select value={visibility} onChange={e => setVisibility(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700 ">
                       <option value="Family Only">Family Only</option>
                       <option value="Public">Public</option>
                       <option value="Private">Private</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-indigo-600 mb-3 tracking-wider">Status</h3>
                    <select value={status} onChange={e => setStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-emerald-50 text-emerald-700 text-sm font-bold flex focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                       <option value="Published">Published</option>
                       <option value="Draft">Draft</option>
                       <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>
            
            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3 hover:opacity-100">
               <button 
                  onClick={() => setShowAddModal(false)}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 :bg-slate-800 transition-colors shadow-sm"
               >
                 Cancel
               </button>
               <button 
                  onClick={() => uploadHistory.mutate()}
                  className="px-6 py-2.5 rounded-xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-sm font-bold hover:bg-indigo-100 :bg-indigo-500/20 transition-colors shadow-sm"
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

      {showViewModal && selectedHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center p-4 sm:p-6 overflow-y-auto w-full">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative my-auto animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-indigo-600" /> History Event Details
              </h2>
              <button 
                onClick={() => { setShowViewModal(false); setSelectedHistory(null); }}
                className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-200/60 hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              {selectedHistory.thumbnail && (
                <div className="w-full h-44 rounded-2xl overflow-hidden shadow-sm">
                  <img src={selectedHistory.thumbnail} alt={selectedHistory.title} className="w-full h-full object-cover" />
                </div>
              )}
              
              <div className="flex items-center gap-2">
                 <span className={`inline-flex px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${selectedHistory.catColor}`}>
                   {selectedHistory.category}
                 </span>
                 <span className="inline-flex px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-bold">
                   {selectedHistory.status}
                 </span>
              </div>
              
              <div>
                <h3 className="text-lg font-black text-slate-900">{selectedHistory.title}</h3>
                <p className="text-xs font-semibold text-indigo-600 mt-1">{selectedHistory.date} • {selectedHistory.location}</p>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <p className="text-slate-600 text-sm leading-relaxed font-medium whitespace-pre-wrap">{selectedHistory.subtitle}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                <span>Added by: <strong className="text-slate-600">{selectedHistory.addedBy}</strong></span>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => { setShowViewModal(false); setSelectedHistory(null); }}
                className="px-5 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && editingHistory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center p-4 sm:p-6 overflow-y-auto w-full">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl relative my-auto animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center rounded-t-3xl bg-slate-50/50">
              <h2 className="text-xl font-black text-slate-900 flex items-center gap-3">
                <BookOpen size={22} className="text-indigo-600" /> Edit Family History
              </h2>
              <button 
                onClick={() => { setShowEditModal(false); setEditingHistory(null); }}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 text-slate-500 hover:bg-slate-300 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
              
              {/* Left Column */}
              <div className="space-y-8">
                 <div>
                    <h3 className="text-sm font-black uppercase text-indigo-600 mb-5 tracking-wider">Basic Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">History Title <span className="text-rose-500">*</span></label>
                        <input type="text" value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="e.g. Ancestral Home Built" className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                         <div>
                           <label className="block text-sm font-bold text-slate-700 mb-1.5">Category <span className="text-rose-500">*</span></label>
                           <select value={editCategory} onChange={e => setEditCategory(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800">
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
                           <label className="block text-sm font-bold text-slate-700 mb-1.5">Event Date <span className="text-rose-500">*</span></label>
                           <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-800" />
                         </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Description <span className="text-rose-500">*</span></label>
                        <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} rows={4} placeholder="Describe the history event in detail..." className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50"></textarea>
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
                      <input type="text" value={editRelated} onChange={e => setEditRelated(e.target.value)} placeholder="Search Member..." className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                   </div>
                </div>

                <div>
                   <h3 className="text-sm font-black uppercase text-indigo-600 mb-5 tracking-wider">Photo (Optional)</h3>
                   <label className="border-2 border-dashed border-slate-300 rounded-2xl h-[120px] flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors w-full relative overflow-hidden">
                      <input type="file" accept="image/*" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setEditFileBase64(reader.result);
                              reader.readAsDataURL(file);
                          }
                      }} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                      {editFileBase64 ? (
                         <div className="absolute inset-0">
                           <img src={editFileBase64} alt="Thumb" className="w-full h-full object-cover" />
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center font-bold text-white opacity-0 hover:opacity-100 transition-opacity text-sm">Change Image</div>
                         </div>
                      ) : (
                         <>
                           <Upload size={28} className="text-indigo-500 mb-2" />
                           <span className="text-sm font-bold text-slate-700">Upload Image</span>
                         </>
                      )}
                   </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-black uppercase text-indigo-600 mb-3 tracking-wider">Visibility</h3>
                    <select value={editVisibility} onChange={e => setEditVisibility(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-slate-700">
                       <option value="Family Only">Family Only</option>
                       <option value="Public">Public</option>
                       <option value="Private">Private</option>
                    </select>
                  </div>
                  <div>
                    <h3 className="text-sm font-black uppercase text-indigo-600 mb-3 tracking-wider">Status</h3>
                    <select value={editStatus} onChange={e => setEditStatus(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-emerald-50 text-emerald-700 text-sm font-bold flex focus:outline-none focus:ring-2 focus:ring-emerald-500/50">
                       <option value="Published">Published</option>
                       <option value="Draft">Draft</option>
                       <option value="Archived">Archived</option>
                    </select>
                  </div>
                </div>

              </div>

            </div>
            
            {/* Footer Buttons */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-3xl flex justify-end gap-3">
               <button 
                  onClick={() => { setShowEditModal(false); setEditingHistory(null); }}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
               >
                 Cancel
               </button>
               <button 
                  onClick={() => updateHistoryMutation.mutate({
                     id: editingHistory.id,
                     payload: {
                        title: editTitle,
                        category: editCategory,
                        eventDate: editDate,
                        description: editDesc,
                        related: editRelated,
                        visibility: editVisibility,
                        status: editStatus,
                        fileUrl: editFileBase64
                     }
                  })}
                  disabled={updateHistoryMutation.isPending || !editTitle || !editCategory || !editDate}
                  className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-bold transition-all shadow-md shadow-indigo-600/20 ml-2"
               >
                 {updateHistoryMutation.isPending ? 'Saving...' : 'Save Changes'}
               </button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
