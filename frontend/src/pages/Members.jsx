import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Search, Filter, Plus, Mail, MessageCircle, MoreHorizontal, Edit2, Trash2, ShieldAlert,
  Users, UserCheck, Clock, CheckCircle2, AlertCircle, X, ChevronDown, Download, Users as FamilyIcon, FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Metrics are computed dynamically based on live API data

import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const getStatusBadge = (status) => {
  switch (status) {
    case 'ACTIVE': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-200';
    case 'INVITATION_SENT': return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 border-amber-200';
    case 'EMAIL_FAILED': return 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400 border-red-200';
    case 'PENDING_INVITE': return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-200';
    case 'WAITING_APPROVAL': return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-200';
    case 'INACTIVE': return 'bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400 border-slate-200';
    case 'REJECTED': return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 border-rose-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

const getRoleBadge = (role) => {
  if (role === 'SUPER_ADMIN') return 'text-purple-700 font-bold';
  if (role === 'ADMIN') return 'text-blue-700 font-bold';
  return 'text-slate-600 font-medium';
};

export default function Members() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState(() => {
    return new window.URLSearchParams(location.search).get('search') || '';
  });

  useEffect(() => {
    const query = new window.URLSearchParams(location.search).get('search');
    if (query !== null) setSearchQuery(query);
  }, [location.search]);

  const [selectedRows, setSelectedRows] = useState([]);
  const [activeDrawer, setActiveDrawer] = useState(null); // holds member object
  const queryClient = useQueryClient();

  const handleResendInvite = async (memberId) => {
    try {
      toast.loading('Resending invitation...', { id: 'resend' });
      const res = await axios.post(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/members/invite/resend`, { memberId }, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.data.success === false) {
          throw new Error(res.data.error || 'Failed to resend');
      }
      toast.success('Invitation resent successfully', { id: 'resend' });
      queryClient.invalidateQueries(['members']);
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Failed to resend invitation', { id: 'resend' });
    }
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedRows.length} members?`)) return;
    try {
      toast.loading('Deleting members...', { id: 'bulk-delete' });
      await axios.delete(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/members/bulk`, {
        data: { ids: selectedRows },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      toast.success('Members deleted successfully', { id: 'bulk-delete' });
      setSelectedRows([]);
      queryClient.invalidateQueries(['members']);
    } catch (err) {
      toast.error('Failed to delete members', { id: 'bulk-delete' });
    }
  };

  const handleBulkNotify = () => {
    toast.success(`Sent notifications to ${selectedRows.length} selected members.`);
  };

  const handleBulkExport = () => {
    // Generate simple CSV from selected rows
    const selectedData = rawMembers.filter(m => selectedRows.includes(m.id));
    if (selectedData.length === 0) return;
    
    // Create CSV content
    const headers = ['Member ID,First Name,Last Name,Email,Phone,Role,Status\n'];
    const rows = selectedData.map(m => `${m.memberId || ''},${m.firstName},${m.lastName || ''},${m.email || ''},${m.phone || ''},${m.role},${m.status}\n`);
    const csvContent = headers.concat(rows).join('');
    
    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `members_export_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Export downloaded successfully!');
  };

  const { data: rawMembers = [], isLoading, error } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/members`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const liveMembers = rawMembers.map(m => ({
    id: m.id,
    memId: m.memberId || 'MEM-0000',
    name: `${m.firstName} ${m.lastName}`.trim(),
    email: m.email || '',
    phone: m.phone || (m.memberProfile?.phone) || 'No Phone',
    relation: m.relationship || 'Member',
    branch: m.familyBranch || 'Main',
    gen: 'G2', // dynamic generation logic
    role: m.role,
    status: m.status,
    progress: typeof m.profileCompletion === 'number' ? m.profileCompletion : 25,
    currentStep: m.currentProfileStep || 'Basic Information',
    lastActive: m.updatedAt ? new Date(m.updatedAt).toLocaleDateString() : 'Never',
    avatar: m.avatar || ''
  })).filter(m => 
    !searchQuery || 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.memId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const today = new Date();
  const liveMetrics = [
    { label: 'Total Members', value: rawMembers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Members', value: rawMembers.filter(m => m.status === 'ACTIVE').length, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Invites', value: rawMembers.filter(m => ['PENDING_INVITE', 'INVITATION_SENT'].includes(m.status)).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Profile Incomplete', value: rawMembers.filter(m => m.status === 'ACTIVE' && (m.memberProfile?.profileCompletion || 0) < 100).length, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Family Branches', value: new Set(rawMembers.map(m => m.familyBranch).filter(Boolean)).size, icon: FamilyIcon, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: "Today's Birthdays", value: rawMembers.filter(m => m.memberProfile?.dob && new Date(m.memberProfile.dob).getDate() === today.getDate() && new Date(m.memberProfile.dob).getMonth() === today.getMonth()).length, icon: AlertCircle, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  const handleRowClick = (m) => setActiveDrawer(m);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative pb-20">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
         <div>
           <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Family Directory</h1>
           <p className="text-slate-500 text-sm mt-1">Enterprise management screen for family members and access controls.</p>
         </div>
         <div className="flex items-center gap-3 w-full sm:w-auto">
            <button onClick={() => navigate('/admin/dashboard/members/invite')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all">
               <Mail size={16} /> Invite Member
            </button>
            <button onClick={() => navigate('/admin/dashboard/members/add')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center gap-2 transition-all">
               <Plus size={16} /> Add Member
            </button>
         </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {liveMetrics.map((m, i) => (
           <div key={i} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center">
              <div className={`w-10 h-10 rounded-full ${m.bg} ${m.color} flex items-center justify-center mb-2`}>
                 <m.icon size={20} strokeWidth={2.5} />
              </div>
              <div className="text-2xl font-bold text-slate-900 dark:text-white">{m.value}</div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{m.label}</div>
           </div>
        ))}
      </div>

      {/* Search, Filters & Bulk Actions Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
         <div className="flex flex-wrap items-center justify-between gap-4">
            
            {/* Search inputs */}
            <div className="flex items-center gap-3">
               <div className="relative w-64 md:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name, ID, email, or mobile..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50" />
               </div>
               <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50">
                  <Filter size={16} /> Filters <ChevronDown size={14} className="opacity-50" />
               </button>
            </div>

            {/* Bulk Actions Context Menu */}
            {selectedRows.length > 0 ? (
               <div className="flex items-center gap-2 animate-in slide-in-from-right-4">
                  <span className="text-sm font-bold text-blue-600 mr-2">{selectedRows.length} selected</span>
                  <button onClick={handleBulkExport} className="px-3 py-1.5 text-xs font-bold bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 flex items-center gap-1"><Download size={14} /> Export</button>
                  <button onClick={handleBulkNotify} className="px-3 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 rounded-md hover:bg-indigo-100 flex items-center gap-1"><Mail size={14} /> Notify</button>
                  <button onClick={handleBulkDelete} className="px-3 py-1.5 text-xs font-bold bg-rose-50 text-rose-700 rounded-md hover:bg-rose-100 flex items-center gap-1"><Trash2 size={14} /> Delete</button>
               </div>
            ) : (
               <div className="flex items-center gap-2">
                  <button className="px-3 py-2 text-sm font-semibold text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center gap-2">
                    <Download size={16} /> Export CSV
                  </button>
               </div>
            )}
         </div>
      </div>

      {/* Main Enterprise Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden overflow-x-auto">
         <table className="w-full text-sm text-left whitespace-nowrap responsive-table">
            <thead className="text-xs text-slate-500 font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
               <tr>
                  <th className="px-4 py-4 w-12 text-center hidden md:table-cell">
                    <input type="checkbox" onChange={(e) => setSelectedRows(e.target.checked ? liveMembers.map(m=>m.id) : [])} checked={selectedRows.length > 0 && selectedRows.length === liveMembers.length} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  </th>
                  <th className="px-4 py-4 cursor-pointer hover:text-slate-800">Member</th>
                  <th className="px-4 py-4 cursor-pointer hover:text-slate-800 hidden md:table-cell">Contact</th>
                  <th className="px-4 py-4 cursor-pointer hover:text-slate-800">Relationship</th>
                  <th className="px-4 py-4 cursor-pointer hover:text-slate-800 text-right md:text-left">Branch</th>
                  <th className="px-4 py-4 cursor-pointer text-center hover:text-slate-800">Gen</th>
                  <th className="px-4 py-4 cursor-pointer hover:text-slate-800">Role</th>
                  <th className="px-4 py-4 cursor-pointer hover:text-slate-800">Status</th>
                  <th className="px-4 py-4">Profile</th>
                  <th className="px-4 py-4 cursor-pointer hover:text-slate-800">Last Active</th>
                  <th className="px-4 py-4 text-center">Actions</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
               {isLoading ? (
                  <tr><td colSpan="11" className="text-center py-8 text-slate-500 font-bold">Loading Directory...</td></tr>
               ) : liveMembers.length === 0 ? (
                  <tr>
                     <td colSpan="11" className="text-center py-16">
                        <div className="flex flex-col items-center justify-center">
                           <div className="w-16 h-16 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-blue-500">
                              <Users size={32} />
                           </div>
                           <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1">No members found</h3>
                           <p className="text-sm text-slate-500 max-w-sm mx-auto mb-4">Your family directory is empty. Start building your family network by adding or inviting members.</p>
                           <button onClick={() => navigate('/admin/dashboard/members/invite')} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all">
                              <Mail size={16} /> Invite Your First Member
                           </button>
                        </div>
                     </td>
                  </tr>
               ) : liveMembers.map((m) => (
                 <tr key={m.id} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/40 transition-colors group relative">
                    <td className="px-4 py-4 text-center hidden md:table-cell w-12">
                       <input type="checkbox" checked={selectedRows.includes(m.id)} onChange={() => setSelectedRows(prev => prev.includes(m.id) ? prev.filter(id => id !== m.id) : [...prev, m.id])} className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    </td>
                    <td data-label="Member" className="px-4 py-4 cursor-pointer md:w-auto" onClick={() => handleRowClick(m)}>
                       <div className="flex items-center gap-3 justify-end md:justify-start">
                          <div className="w-10 h-10 rounded-full bg-indigo-100 border border-slate-200 shrink-0 overflow-hidden flex items-center justify-center text-indigo-700 font-bold">
                             {m.avatar ? <img src={m.avatar} alt="Profile" className="w-full h-full object-cover" /> : m.name.charAt(0)}
                          </div>
                          <div className="text-right md:text-left">
                             <div className="font-bold text-slate-900 dark:text-white text-sm">{m.name}</div>
                             <div className="text-[11px] font-mono text-slate-500 mt-0.5">{m.memId}</div>
                          </div>
                       </div>
                    </td>
                    <td data-label="Contact" className="px-4 py-4 w-full md:w-auto">
                       <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5 justify-end md:justify-start"><MessageCircle size={12}/>{m.phone}</div>
                       <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 justify-end md:justify-start">{m.email ? <><Mail size={12}/> {m.email}</> : <span className="text-slate-400 italic">No email</span>}</div>
                    </td>
                    <td data-label="Relationship" className="px-4 py-4 w-full md:w-auto">
                       <span className="font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md text-xs">{m.relation}</span>
                    </td>
                    <td data-label="Branch" className="px-4 py-4 w-full md:w-auto text-slate-600 text-sm font-medium">{m.branch}</td>
                    <td data-label="Generation" className="px-4 py-4 w-full md:w-auto md:text-center text-slate-500 font-mono font-bold text-xs"><span className="bg-slate-50/50 px-2 rounded">{m.gen}</span></td>
                    <td data-label="Role" className="px-4 py-4 w-full md:w-auto">
                       <span className={`text-xs ${getRoleBadge(m.role)}`}>{m.role.replace('_', ' ')}</span>
                    </td>
                    <td data-label="Status" className="px-4 py-4 w-full md:w-auto">
                       <span className={`px-2.5 py-1 rounded-full text-xs font-bold border inline-block ${getStatusBadge(m.status)}`}>
                         {m.status === 'Active' ? '🟢 ' : m.status === 'Invitation Sent' ? '🟡 ' : ''}{m.status}
                       </span>
                    </td>
                    <td data-label="Profile" className="px-4 py-4 w-full md:w-40">
                       <div className="flex flex-col gap-1.5 items-end md:items-start w-full relative">
                          <div className="flex items-center gap-2 w-full md:w-auto">
                             <div className="w-full md:w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex-1 md:flex-none">
                                <div className={`h-full rounded-full ${m.progress === 100 ? 'bg-emerald-500' : m.progress >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${m.progress}%` }}></div>
                             </div>
                             <span className={`text-[11px] font-bold w-9 text-right md:text-left ${m.progress === 100 ? 'text-emerald-600' : 'text-slate-600 dark:text-slate-400'}`}>{m.progress}%</span>
                          </div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">{m.currentStep}</span>
                       </div>
                    </td>
                    <td data-label="Last Active" className="px-4 py-4 w-full md:w-auto text-xs text-slate-500 font-medium">{m.lastActive}</td>
                    <td data-label="Actions" className="px-4 py-4 w-full md:w-auto md:text-center mt-2 md:mt-0">
                       <div className="flex justify-end md:justify-center">
                          <button className="p-2 md:p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors mr-1" title="View Profile" onClick={() => handleRowClick(m)}>
                             <Search size={16} />
                          </button>
                          <button className="p-2 md:p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors mr-1" title="Edit">
                             <Edit2 size={16} />
                          </button>
                          <button className="p-2 md:p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors" title="More actions">
                             <MoreHorizontal size={16} />
                          </button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      {/* Right Drawer (Profile Details) */}
      <AnimatePresence>
         {activeDrawer && (
           <>
             {/* Backdrop */}
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-50" onClick={() => setActiveDrawer(null)} />
             {/* Drawer */}
             <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed right-0 top-0 h-full w-[400px] bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
                   <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2"><UserCheck size={18} /> Member Profile</h2>
                   <button onClick={() => setActiveDrawer(null)} className="p-2 hover:bg-slate-200 rounded-full text-slate-500"><X size={18} /></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                   <div className="text-center">
                      <div className="w-24 h-24 rounded-full bg-indigo-100 mx-auto mb-3 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-4xl font-black text-indigo-500">
                         {activeDrawer.avatar ? <img src={activeDrawer.avatar} className="w-full h-full object-cover" alt="avatar" /> : activeDrawer.name.charAt(0)}
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">{activeDrawer.name}</h3>
                      <p className="font-mono text-slate-500 text-sm mt-1">{activeDrawer.memId}</p>
                      <div className="mt-3 flex justify-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusBadge(activeDrawer.status)}`}>{activeDrawer.status}</span>
                      </div>
                   </div>

                   <div className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                      <div className="flex justify-between items-center"><span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Role</span> <span className="font-bold text-slate-700">{activeDrawer.role.replace('_', ' ')}</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Branch</span> <span className="font-bold text-slate-700">{activeDrawer.branch}</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Relationship</span> <span className="font-bold text-slate-700">{activeDrawer.relation}</span></div>
                      <div className="flex justify-between items-center"><span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Generation</span> <span className="font-bold text-slate-700 bg-slate-200 px-2 py-0.5 rounded text-xs">{activeDrawer.gen}</span></div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-xs text-slate-400 uppercase font-bold tracking-wider">Contact Info</h4>
                      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"><MessageCircle size={16} className="text-blue-500"/><span className="text-sm font-semibold text-slate-700">{activeDrawer.phone}</span></div>
                      <div className="flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-xl"><Mail size={16} className="text-blue-500"/><span className="text-sm font-semibold text-slate-700">{activeDrawer.email || 'No email provided'}</span></div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-xs text-slate-400 uppercase font-bold tracking-wider border-t border-slate-100 pt-4">Quick Actions</h4>
                      <div className="grid grid-cols-2 gap-2">
                         <button className="p-2 border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex justify-center items-center gap-2"><Edit2 size={14}/> Edit</button>
                         {['INVITATION_SENT', 'EMAIL_FAILED'].includes(activeDrawer.status) && (
                            <button onClick={() => handleResendInvite(activeDrawer.id)} className="p-2 border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex justify-center items-center gap-2"><Mail size={14}/> Resend Invite</button>
                         )}
                         <button className="p-2 border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 rounded-lg flex justify-center items-center gap-2"><FamilyIcon size={14}/> View Tree</button>
                         <button className="p-2 border border-rose-200 text-sm font-bold text-rose-700 hover:bg-rose-50 rounded-lg flex justify-center items-center gap-2"><ShieldAlert size={14}/> Deactivate</button>
                      </div>
                   </div>
                </div>
             </motion.div>
           </>
         )}
      </AnimatePresence>
    </div>
  );
}
