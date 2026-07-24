import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Users, Image as ImageIcon, Send, Lock, Globe, MessageSquare, MoreVertical, Calendar, FileText, BarChart, Settings } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL =  `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function FamilyGroups() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [activeGroup, setActiveGroup] = useState(null); // ID of the group being viewed
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}`);
    setSocket(newSocket);
    // Realtime notification when someone adds you to a group
    newSocket.on('notification.created', () => {
       queryClient.invalidateQueries(['family_groups_all']);
    });
    return () => newSocket.disconnect();
  }, [queryClient]);

  const { data: groups = [], isLoading } = useQuery({
     queryKey: ['family_groups_all'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/groups`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     }
  });

  const joinMutate = useMutation({
     mutationFn: async (groupId) => {
        const res = await axios.post(`${API_URL}/groups/${groupId}/join`, {}, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     onSuccess: () => {
        toast.success("Joined group successfully!");
        queryClient.invalidateQueries(['family_groups_all']);
     }
  });

  const activeGroupData = groups.find(g => g.id === activeGroup);

  if (activeGroup && activeGroupData) {
      return <GroupDetails groupMeta={activeGroupData} onBack={() => setActiveGroup(null)} token={token} socket={socket} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-[#1F2430]">Family Groups</h1>
            <p className="text-slate-500 text-sm mt-1">Connect in smaller circles with family branches or committees.</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {isLoading && <div className="col-span-full p-10 text-center font-bold text-slate-400">Loading groups...</div>}
         
         {!isLoading && groups.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-[#E9E5F8] rounded-3xl">
               <Users size={40} className="mx-auto text-slate-300 mb-3" />
               <h3 className="text-lg font-bold text-slate-700">No Groups Found</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">Your family hasn't created any groups yet.</p>
            </div>
         )}

         {groups.map(g => {
            const hasJoined = g.members?.length > 0;
            return (
              <div key={g.id} className="bg-white border border-[#E9E5F8] rounded-3xl overflow-hidden shadow-sm hover:shadow-sm transition-all flex flex-col group">
                 <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-600 relative p-4 cursor-pointer" onClick={() => hasJoined && setActiveGroup(g.id)}>
                    <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                       {g.privacy === 'Private' ? <Lock size={10} /> : <Globe size={10} />}
                       {g.privacy}
                    </div>
                 </div>
                 <div className="px-5 pb-5 relative -mt-8 flex-1 flex flex-col">
                    <div className="w-16 h-16 bg-white p-1 rounded-2xl shadow-sm">
                       <div className="w-full h-full bg-[#FAF8FF] rounded-[24px] flex items-center justify-center font-black text-2xl text-[#7C5CFC]">
                          {g.name.charAt(0)}
                       </div>
                    </div>
                    <h3 className="text-lg font-bold mt-3 text-[#1F2430] group-hover:text-[#7C5CFC] transition-colors cursor-pointer" onClick={() => hasJoined && setActiveGroup(g.id)}>{g.name}</h3>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-2">{g.category}</p>
                    <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 min-h-[40px]">{g.description || 'No description provided.'}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#E9E5F8]">
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-500">{g._count?.members || 0} Members</span>
                       </div>
                       
                       {!hasJoined ? (
                          <button onClick={() => joinMutate.mutate(g.id)} disabled={joinMutate.isPending} className="px-4 py-2 bg-[#FAF8FF] text-[#7C5CFC] font-bold text-sm rounded-[24px] hover:bg-blue-100 transition-colors">
                             Join Group
                          </button>
                       ) : (
                          <button onClick={() => setActiveGroup(g.id)} className="px-4 py-2 bg-[#FAF8FF] text-slate-700 font-bold text-sm rounded-[24px] hover:bg-slate-200 transition-colors">
                             Enter
                          </button>
                       )}
                    </div>
                 </div>
              </div>
            );
         })}
      </div>
    </div>
  );
}

function GroupDetails({ groupMeta, onBack, token, socket }) {
   const queryClient = useQueryClient();
   const [tab, setTab] = useState('chat'); // chat, members, events, gallery, documents, polls, announcements

   const { data: group, isLoading } = useQuery({
      queryKey: ['group_member_view', groupMeta.id],
      queryFn: async () => {
         const res = await axios.get(`${API_URL}/groups/${groupMeta.id}`, { headers: { Authorization: `Bearer ${token}` } });
         return res.data;
      }
   });

   if (isLoading) return <div className="p-20 text-center font-bold text-slate-500">Loading group space...</div>;

   const activeUserMemberProfile = group.members?.find?.(m => m.userId === localStorage.getItem('userId')) || { role: 'Member', isMuted: false };
   const isAdmin = activeUserMemberProfile.role === 'Admin';

   return (
      <div className="animate-in slide-in-from-right-4 duration-500">
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1F2430] mb-4 transition-colors">
            ← Back to Groups
         </button>
         
         <div className="bg-white border border-[#E9E5F8] rounded-3xl overflow-hidden shadow-sm flex flex-col h-[750px]">
            {/* Header */}
            <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative flex items-end px-8 pb-6">
               <div className="flex items-end gap-5 translate-y-8 z-10 w-full relative">
                  <div className="w-24 h-24 bg-white p-1.5 rounded-3xl shadow-xl flex-shrink-0">
                     <div className="w-full h-full bg-[#FAF8FF] rounded-2xl flex items-center justify-center font-black text-4xl text-[#7C5CFC]">
                        {group.name.charAt(0)}
                     </div>
                  </div>
                  <div className="flex-1 pb-1">
                     <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-[#1F2430] drop-shadow-sm">{group.name}</h2>
                        <span className="px-2.5 py-1 bg-blue-100 text-[#2E1E6B] text-[10px] font-black rounded-full uppercase tracking-widest">{group.category}</span>
                     </div>
                     <p className="text-slate-500 font-medium text-sm mt-1">{group._count?.members || 1} Members</p>
                  </div>
                  <div className="pb-1 text-right">
                     {isAdmin ? (
                        <button className="px-4 py-2 bg-[#FAF8FF] hover:bg-slate-200 text-slate-700 rounded-[24px] text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                           <Settings size={16}/> Group Settings
                        </button>
                     ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[20px] text-xs font-bold shadow-sm">You are a {activeUserMemberProfile.role}</span>
                     )}
                  </div>
               </div>
               {/* Background pattern mask */}
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Nav Tabs */}
            <div className="px-8 mt-12 border-b border-[#E9E5F8] flex gap-2 overflow-x-auto scrollbar-none">
               {[
                  { id: 'chat', label: 'Group Chat', icon: MessageSquare },
                  { id: 'members', label: 'Members', icon: Users },
                  { id: 'events', label: 'Events', icon: Calendar },
                  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                  { id: 'documents', label: 'Documents', icon: FileText },
                  { id: 'polls', label: 'Polls', icon: BarChart },
               ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all shrink-0 ${tab === t.id ? 'border-blue-600 text-[#7C5CFC]' : 'border-transparent text-slate-500 hover:text-[#1F2430]'}`}>
                     <t.icon size={16} /> {t.label}
                  </button>
               ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex bg-[#FCFBFF]/50">
               {tab === 'chat' && <DiscussionBoard groupId={group.id} token={token} socket={socket} activeProfile={activeUserMemberProfile} />}
               
               {tab === 'members' && (
                  <div className="flex-1 overflow-y-auto p-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {group.members?.map(m => (
                           <div key={m.id} className="bg-white border p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-sm transition-shadow">
                              <img src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.firstName}+${m.user?.lastName}&background=random`} className="w-12 h-12 rounded-full shadow-sm" alt="" />
                              <div className="flex-1 min-w-0">
                                 <p className="font-bold text-sm text-[#1F2430] truncate">{m.user?.firstName} {m.user?.lastName}</p>
                                 <p className="text-[11px] font-bold text-slate-400 mt-0.5">{m.role}</p>
                              </div>
                              {isAdmin && m.userId !== localStorage.getItem('userId') && (
                                 <button className="text-slate-300 hover:text-red-500 transition-colors p-1"><MoreVertical size={16}/></button>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
               )}

               {['events', 'gallery', 'documents', 'polls'].includes(tab) && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                     <div className="w-20 h-20 bg-[#FAF8FF] rounded-3xl flex items-center justify-center text-slate-300 mb-4">
                        {tab === 'events' && <Calendar size={32} />}
                        {tab === 'gallery' && <ImageIcon size={32} />}
                        {tab === 'documents' && <FileText size={32} />}
                        {tab === 'polls' && <BarChart size={32} />}
                     </div>
                     <h3 className="font-bold text-lg text-slate-700 capitalize w-full">Group {tab}</h3>
                     <p className="text-slate-500 text-sm max-w-sm mt-2">This dedicated module space is coming in a future update! It will integrate flawlessly into your group isolation boundary.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

function DiscussionBoard({ groupId, token, socket, activeProfile }) {
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
      <div className="flex flex-col h-full w-full max-w-4xl mx-auto overflow-y-auto scrollbar-none py-6 px-4">
         <form onSubmit={handleSend} className="bg-white p-4 rounded-3xl shadow-sm border border-[#E9E5F8] mb-8 shrink-0">
            <textarea 
               value={text} 
               onChange={e => setText(e.target.value)} 
               placeholder="Share something with the group..." 
               className="w-full min-h-[80px] bg-[#FCFBFF] border-none rounded-2xl px-5 py-4 text-[15px] font-medium focus:ring-2 focus:ring-[#7C5CFC] resize-none outline-none mb-3"
            />
            <div className="flex justify-between items-center">
               <div className="flex gap-2">
                  <button type="button" className="p-2.5 text-slate-400 hover:text-[#7C5CFC] bg-[#FCFBFF] hover:bg-[#FAF8FF] rounded-[24px] transition-colors"><ImageIcon size={18} /></button>
                  <button type="button" className="p-2.5 text-slate-400 hover:text-[#7C5CFC] bg-[#FCFBFF] hover:bg-[#FAF8FF] rounded-[24px] transition-colors"><FileText size={18} /></button>
               </div>
               <div className="flex items-center gap-3">
                  {editingPost && <button type="button" onClick={() => {setEditingPost(null); setText('');}} className="text-sm font-bold text-slate-500 hover:text-[#1F2430]">Cancel</button>}
                  <button type="submit" disabled={!text.trim() || createMutate.isPending} className="px-6 py-2.5 bg-[#7C5CFC] text-white font-bold rounded-[24px] disabled:opacity-50 hover:bg-blue-700 shadow-sm flex gap-2 items-center">
                     <Send size={16} /> {editingPost ? 'Update Post' : 'Post'}
                  </button>
               </div>
            </div>
         </form>

         {isLoading && <div className="text-center font-bold text-slate-400 py-10">Loading discussions...</div>}
         
         <div className="space-y-6">
            {posts.map(post => {
               const isAuthor = post.authorId === currentUserId;
               const hasLiked = post.likes?.length > 0;
               return (
                  <div key={post.id} className="bg-white rounded-3xl p-6 shadow-sm border border-[#E9E5F8]">
                     <div className="flex justify-between items-start mb-4">
                        <div className="flex gap-3 items-center">
                           <img src={post.author?.avatar || `https://ui-avatars.com/api/?name=${post.author?.firstName}+${post.author?.lastName}`} className="w-10 h-10 rounded-full bg-[#FAF8FF]" alt=""/>
                           <div>
                              <div className="flex items-center gap-2">
                                 <h4 className="font-bold text-[#1F2430] leading-none">{post.author?.firstName} {post.author?.lastName}</h4>
                                 <span className="text-[10px] font-bold px-2 py-0.5 bg-[#FAF8FF] text-[#7C5CFC] rounded-full">{post.author?.role}</span>
                              </div>
                              <p className="text-xs font-semibold text-slate-500 mt-1">{new Date(post.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                           </div>
                        </div>
                        {isAuthor && (
                           <div className="flex items-center gap-1">
                              <button onClick={() => { setEditingPost(post); setText(post.content); window.scrollTo(0, 0); }} className="p-2 text-slate-400 hover:text-[#7C5CFC] hover:bg-[#FAF8FF] rounded-[20px]"><Settings size={14}/></button>
                              <button onClick={() => deleteMutate.mutate(post.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-[20px]"><MoreVertical size={14}/></button>
                           </div>
                        )}
                     </div>
                     <p className="text-[15px] font-medium text-[#1F2430] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                     
                     <div className="flex items-center gap-6 mt-6 pt-4 border-t border-[#E9E5F8]">
                        <button onClick={() => likeMutate.mutate(post.id)} className={`flex items-center gap-1.5 font-bold text-sm ${hasLiked ? 'text-[#7C5CFC]' : 'text-slate-500 hover:text-[#7C5CFC]'}`}>
                           <div className={`p-1.5 rounded-[20px] ${hasLiked ? 'bg-[#FAF8FF]' : 'bg-[#FCFBFF] group-hover:bg-[#FAF8FF]'}`}>❤️</div> {post._count?.likes || 0} Likes
                        </button>
                        <button className="flex items-center gap-1.5 font-bold text-sm text-slate-500 hover:text-[#7C5CFC]">
                           <div className="p-1.5 rounded-[20px] bg-[#FCFBFF] group-hover:bg-[#FAF8FF]"><MessageSquare size={16} /></div> {post._count?.comments || 0} Comments
                        </button>
                     </div>
                  </div>
               );
            })}
         </div>
      </div>
   );
}
