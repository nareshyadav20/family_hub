import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, Filter, Users, Lock, Globe, MessageSquare, Image, MoreVertical, Send, File, Archive, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_URL =  `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function FamilyGroups() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('list'); // list, create, details
  const [activeGroup, setActiveGroup] = useState(null); // ID of the group being viewed
  const [detailTab, setDetailTab] = useState('overview'); // overview, members, chat
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}`);
    setSocket(newSocket);
    return () => newSocket.disconnect();
  }, []);

  const { data: groups = [], isLoading } = useQuery({
     queryKey: ['groups'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/groups`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     }
  });

  const createMutation = useMutation({
     mutationFn: async (payload) => {
        const res = await axios.post(`${API_URL}/groups`, payload, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     onSuccess: () => {
        toast.success("Group created!");
        queryClient.invalidateQueries(['groups']);
        setActiveTab('list');
     }
  });

  const goCreate = () => setActiveTab('create');
  const goList = () => { setActiveTab('list'); setActiveGroup(null); };
  const goDetails = (id) => { setActiveGroup(id); setActiveTab('details'); };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {activeTab === 'list' && (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Groups</h1>
              <p className="text-slate-500 text-sm mt-1">Manage all public and private family groups.</p>
            </div>
            <button onClick={goCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30">
              <Plus size={16} /> Create Group
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
             <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm">
                <p className="text-slate-500 text-sm font-bold">Total Groups</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{groups.length}</h3>
             </div>
             <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm">
                <p className="text-slate-500 text-sm font-bold">Private Groups</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{groups.filter(g => g.privacy === 'Private').length}</h3>
             </div>
             <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm">
                <p className="text-slate-500 text-sm font-bold">Total Members</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{groups.reduce((acc, g) => acc + (g._count?.members || 0), 0)}</h3>
             </div>
             <div className="bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm">
                <p className="text-slate-500 text-sm font-bold">Active Groups</p>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{groups.filter(g => g.status === 'Active').length}</h3>
             </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input type="text" placeholder="Search groups..." className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 shadow-sm" />
             </div>
             <button className="px-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2 shadow-sm"><Filter size={16} /> Filter</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
             {groups.length === 0 ? (
                <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900">
                   <Users size={40} className="mx-auto text-blue-500 mb-3" />
                   <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No groups created</h3>
                   <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">Create dedicated groups for branches of the family, specific events, or interest circles.</p>
                   <button onClick={goCreate} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 transition-all mx-auto">
                      <Plus size={16} /> Create First Group
                   </button>
                </div>
             ) : (
                groups.map(g => (
                  <div key={g.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
                     <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-600 relative p-4 cursor-pointer" onClick={() => goDetails(g.id)}>
                        <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                           {g.privacy === 'Private' ? <Lock size={10} /> : <Globe size={10} />}
                           {g.privacy}
                        </div>
                     </div>
                     <div className="px-5 pb-5 relative -mt-8 flex-1 flex flex-col">
                        <div className="w-16 h-16 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm">
                           <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-2xl text-blue-600">
                              {g.name.charAt(0)}
                           </div>
                        </div>
                        <h3 className="text-lg font-bold mt-3 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => goDetails(g.id)}>{g.name}</h3>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-2">{g.category}</p>
                        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[40px]">{g.description || 'No description provided.'}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-100 dark:border-slate-800">
                           <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-500">{g._count?.members || 0} Members</span>
                              <span className="text-slate-300">•</span>
                              <span className={`text-xs font-bold ${g.status === 'Active' ? 'text-emerald-500' : 'text-slate-400'}`}>{g.status}</span>
                           </div>
                           
                           <button onClick={() => goDetails(g.id)} className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-sm rounded-xl hover:bg-blue-100 transition-colors">
                              Manage
                           </button>
                        </div>
                     </div>
                  </div>
                ))
             )}
          </div>
        </>
      )}

      {activeTab === 'create' && (
         <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl border shadow-sm overflow-hidden p-8">
            <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Create New Group</h2>
            <form onSubmit={e => {
               e.preventDefault();
               createMutation.mutate({
                  name: e.target.name.value,
                  description: e.target.description.value,
                  category: e.target.category.value,
                  privacy: e.target.privacy.value,
               });
            }} className="space-y-5">
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Group Name *</label>
                  <input required name="name" type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <textarea name="description" rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium resize-none"></textarea>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Category *</label>
                     <select name="category" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium">
                        <option>Immediate Family</option>
                        <option>Extended Family</option>
                        <option>Event</option>
                        <option>Committee</option>
                        <option>Friends</option>
                        <option>Custom</option>
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-bold text-slate-700">Privacy</label>
                     <select name="privacy" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium">
                        <option>Private</option>
                        <option>Public</option>
                     </select>
                  </div>
               </div>
               <div className="pt-6 border-t flex justify-end gap-3">
                  <button type="button" onClick={goList} className="px-6 py-2.5 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">Cancel</button>
                  <button type="submit" disabled={createMutation.isPending} className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50">Create Group</button>
               </div>
            </form>
         </div>
      )}

      {activeTab === 'details' && activeGroup && (
         <GroupDetails groupId={activeGroup} onBack={goList} token={token} socket={socket} />
      )}
    </div>
  );
}

function GroupDetails({ groupId, onBack, token, socket }) {
   const queryClient = useQueryClient();
   const [tab, setTab] = useState('chat');

   const { data: group, isLoading } = useQuery({
      queryKey: ['group', groupId],
      queryFn: async () => {
         const res = await axios.get(`${API_URL}/groups/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
         return res.data;
      }
   });

   if (isLoading) return <div className="p-10 text-center font-bold text-slate-500">Loading details...</div>;

   return (
      <div className="bg-white dark:bg-slate-900 rounded-3xl border shadow-sm min-h-[600px] flex flex-col">
         <div className="p-6 border-b flex justify-between items-center bg-slate-50/50 rounded-t-3xl">
            <div className="flex items-center gap-4">
               <button onClick={onBack} className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold">←</button>
               <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{group.name}</h2>
                  <p className="text-sm font-medium text-slate-500">{group.privacy} Group · {group._count?.members || 1} members</p>
               </div>
            </div>
            <div className="flex flex-wrap gap-2">
               <button onClick={() => setTab('overview')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Overview</button>
               <button onClick={() => setTab('members')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'members' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Members</button>
               <button onClick={() => setTab('chat')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Chat</button>
               <button onClick={() => setTab('settings')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Settings</button>
            </div>
         </div>

         <div className="flex-1 p-6 flex flex-col min-h-0 bg-slate-50/20">
            {tab === 'chat' && (
               <div className="bg-slate-100 rounded-2xl flex-1 flex flex-col rounded-3xl h-full shadow-inner">
                  <DiscussionBoard groupId={groupId} token={token} socket={socket} />
               </div>
            )}
            {tab === 'overview' && (
               <div className="space-y-4 max-w-xl">
                  <h3 className="font-bold text-lg">Group Description</h3>
                  <p className="text-slate-600">{group.description || 'No description provided.'}</p>
                  <div className="grid grid-cols-2 gap-4 mt-6">
                     <div className="p-4 rounded-xl border bg-slate-50"><p className="text-xs text-slate-500 font-bold mb-1">Category</p><p className="font-bold">{group.category}</p></div>
                     <div className="p-4 rounded-xl border bg-slate-50"><p className="text-xs text-slate-500 font-bold mb-1">Created</p><p className="font-bold">{new Date(group.createdAt).toLocaleDateString()}</p></div>
                  </div>
               </div>
            )}
            {tab === 'members' && (
               <div>
                  <h3 className="font-bold mb-4">Members List</h3>
                  <div className="space-y-3 max-w-2xl">
                     {group.members?.map(m => (
                        <div key={m.id} className="flex items-center justify-between p-4 rounded-xl border bg-white shadow-sm">
                           <div className="flex items-center gap-3">
                              <img src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.firstName}+${m.user?.lastName}`} className="w-10 h-10 rounded-full" alt="" />
                              <div>
                                 <p className="font-bold text-slate-900">{m.user?.firstName} {m.user?.lastName}</p>
                                 <p className="text-xs text-slate-500">{m.role}</p>
                              </div>
                           </div>
                           <button className="text-red-500 text-xs font-bold px-3 py-1 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Remove</button>
                        </div>
                     ))}
                  </div>
               </div>
            )}
         </div>
      </div>
   );
}

function DiscussionBoard({ groupId, token, socket }) {
   const queryClient = useQueryClient();
   const [text, setText] = useState('');
   const [editingPost, setEditingPost] = useState(null);
   const currentUserId = localStorage.getItem('userId');

   const { data: posts = [], isLoading } = useQuery({
      queryKey: ['groupPosts', groupId],
      queryFn: async () => {
         const res = await axios.get(`${API_URL}/groups/${groupId}/posts`, { headers: { Authorization: `Bearer ${token}` } });
         return res.data;
      }
   });

   useEffect(() => {
      if (!socket) return;
      const events = ['post_created', 'post_updated', 'post_changed'];
      const handler = () => queryClient.invalidateQueries(['groupPosts', groupId]);
      events.forEach(e => socket.on(`group.${groupId}.${e}`, handler));
      
      socket.on(`group.${groupId}.post_deleted`, (data) => {
         queryClient.setQueryData(['groupPosts', groupId], old => Array.isArray(old) ? old.filter(p => p.id !== data.postId) : []);
      });

      return () => {
         events.forEach(e => socket.off(`group.${groupId}.${e}`, handler));
         socket.off(`group.${groupId}.post_deleted`);
      };
   }, [socket, groupId, queryClient]);

   const createMutate = useMutation({
      mutationFn: async (payload) => {
         if (editingPost) {
            await axios.put(`${API_URL}/groups/posts/${editingPost.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
         } else {
            await axios.post(`${API_URL}/groups/${groupId}/posts`, payload, { headers: { Authorization: `Bearer ${token}` } });
         }
      },
      onSuccess: () => {
         setText('');
         setEditingPost(null);
      }
   });

   const deleteMutate = useMutation({
      mutationFn: async (postId) => {
         await axios.delete(`${API_URL}/groups/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
      }
   });
   
   const likeMutate = useMutation({
      mutationFn: async (postId) => {
         await axios.post(`${API_URL}/groups/posts/${postId}/like`, {}, { headers: { Authorization: `Bearer ${token}` } });
      }
   });

   const handleSend = (e) => {
      e.preventDefault();
      if (!text.trim()) return;
      createMutate.mutate({ content: text });
   };

   return (
      <div className="flex flex-col h-[600px] w-full max-w-4xl mx-auto overflow-y-auto scrollbar-none py-6 px-4">
         <form onSubmit={handleSend} className="bg-white p-4 rounded-3xl shadow-sm border border-slate-200 mb-8 shrink-0">
            <textarea 
               value={text} 
               onChange={e => setText(e.target.value)} 
               placeholder="Share an update or start a discussion..." 
               className="w-full min-h-[80px] bg-slate-50 border-none rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-blue-500 resize-none outline-none mb-3"
            />
            <div className="flex justify-between items-center">
               <div className="flex gap-2">
                  <button type="button" className="p-2.5 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors"><Image size={18} /></button>
                  <button type="button" className="p-2.5 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 rounded-xl transition-colors"><File size={18} /></button>
               </div>
               <div className="flex items-center gap-3">
                  {editingPost && <button type="button" onClick={() => {setEditingPost(null); setText('');}} className="text-sm font-bold text-slate-500 hover:text-slate-800">Cancel</button>}
                  <button type="submit" disabled={!text.trim() || createMutate.isPending} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 hover:bg-blue-700 shadow-md flex gap-2 items-center">
                     <Send size={16} /> {editingPost ? 'Update' : 'Post'}
                  </button>
               </div>
            </div>
         </form>

         {isLoading && <div className="text-center font-bold text-slate-400 py-10">Loading discussions...</div>}
         
         <div className="space-y-6">
            {posts.map(post => {
               // Admin portal allows admin to edit their own, delete ANY (enforced by backend / UI can just show it)
               // For simplicity, showing edit/delete if user is author OR user is Admin
               const isAuthor = post.authorId === currentUserId;
               const hasLiked = post.likes?.length > 0;
               return (
                  <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                           <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.firstName}+${post.author?.lastName}`} className="w-10 h-10 rounded-full bg-slate-100" alt=""/>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className="font-bold text-slate-900 leading-none">{post.author?.firstName} {post.author?.lastName}</h4>
                                 <span className="text-[10px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full">{post.author?.role}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 mt-1">{new Date(post.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-1">
                           {isAuthor && <button onClick={() => { setEditingPost(post); setText(post.content); window.scrollTo(0, 0); }} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"><MoreVertical size={14}/></button>}
                           <button className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" onClick={() => deleteMutate.mutate(post.id)}><Trash2 size={14}/></button>
                        </div>
                     </div>
                     <p className="text-[15px] font-medium text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                     
                     <div className="flex items-center gap-6 mt-6 pt-4 border-t border-slate-100">
                        <button onClick={() => likeMutate.mutate(post.id)} className={`flex items-center gap-1.5 font-bold text-sm ${hasLiked ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}>
                           <div className={`p-1.5 rounded-lg ${hasLiked ? 'bg-blue-50' : 'bg-slate-50 group-hover:bg-blue-50'}`}>❤️</div> {post._count?.likes || 0} Likes
                        </button>
                        <button className="flex items-center gap-1.5 font-bold text-sm text-slate-500 hover:text-indigo-600">
                           <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-indigo-50"><MessageSquare size={16} /></div> {post._count?.comments || 0} Comments
                        </button>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
