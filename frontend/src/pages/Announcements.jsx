import React, { useState } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Globe, Lock, Users, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL =  `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function Announcements() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  const [newAnnouncement, setNewAnnouncement] = useState({
     title: '',
     message: '',
     targetType: 'All Members',
     pinned: false
  });

  const { data: announcements = [], isLoading } = useQuery({
     queryKey: ['announcements'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/announcements`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     }
  });

  const createMutation = useMutation({
     mutationFn: async (payload) => {
        const res = await axios.post(`${API_URL}/admin/announcements`, payload, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     onSuccess: () => {
        toast.success("Announcement published!");
        setShowModal(false);
        setNewAnnouncement({ title: '', message: '', targetType: 'All Members', pinned: false });
        queryClient.invalidateQueries(['announcements']);
     },
     onError: () => toast.error("Failed to publish announcement")
  });

  const handleSubmit = (e) => {
     e.preventDefault();
     if (!newAnnouncement.title || !newAnnouncement.message) return toast.error("Title and Message required");
     createMutation.mutate(newAnnouncement);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500 text-sm mt-1">Broadcast important updates to all family members.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30 cursor-pointer">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {isLoading && <div className="p-8 text-center text-slate-500">Loading announcements...</div>}
        {!isLoading && announcements.length === 0 && (
           <div className="py-16 text-center bg-blue-50/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-blue-200 dark:border-slate-700 w-full mt-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-sm">
                 <Megaphone size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No announcements</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Broadcast important updates, rules, or news to all family members across the platform.</p>
              <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 transition-all mx-auto">
                 <Plus size={16} /> Broadcast First Announcement
              </button>
           </div>
        )}
        
        {announcements.map(ann => (
          <div key={ann.id} className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${ann.pinned ? 'border-blue-200 dark:border-blue-800/60' : 'border-slate-100 dark:border-slate-800'}`}>
            {ann.pinned && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50 px-5 py-2 flex items-center gap-2">
                <Megaphone size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pinned Announcement</span>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img src={ann.author?.avatar || `https://ui-avatars.com/api/?name=${ann.author?.firstName}+${ann.author?.lastName}`} className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">{ann.title}</h3>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span>{ann.author?.firstName} {ann.author?.lastName}</span>
                      <span>·</span>
                      <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1"><Globe size={11} /> {ann.targetType}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={15} /></button>
                  <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>

              <div className={`mt-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed whitespace-pre-wrap ${expanded === ann.id ? '' : 'line-clamp-2'}`}>
                {ann.message}
              </div>
              
              {ann.message && ann.message.length > 100 && (
                 <button onClick={() => setExpanded(expanded === ann.id ? null : ann.id)} className="mt-1 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                   {expanded === ann.id ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
                 </button>
              )}
            </div>
          </div>
         ))}
      </div>

      {showModal && (
        <form onSubmit={handleSubmit} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Announcement</h2>
              <div className="space-y-4">
                <input required type="text" value={newAnnouncement.title} onChange={e => setNewAnnouncement({...newAnnouncement, title: e.target.value})} placeholder="Announcement Title" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" />
                <textarea required value={newAnnouncement.message} onChange={e => setNewAnnouncement({...newAnnouncement, message: e.target.value})} rows="4" placeholder="Write your message here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium resize-none"></textarea>
                <div className="flex items-center justify-between">
                   <select value={newAnnouncement.targetType} onChange={e => setNewAnnouncement({...newAnnouncement, targetType: e.target.value})} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium w-1/2">
                      <option value="All Members">All Members</option>
                      <option value="Admins Only">Admins Only</option>
                   </select>
                   <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer">
                      <input type="checkbox" checked={newAnnouncement.pinned} onChange={e => setNewAnnouncement({...newAnnouncement, pinned: e.target.checked})} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                      Pin to Top
                   </label>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                 <button type="submit" disabled={createMutation.isPending} className="flex-1 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-500/20">
                    {createMutation.isPending ? 'Publishing...' : 'Publish'}
                 </button>
                 <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </form>
      )}
    </div>
  );
}
