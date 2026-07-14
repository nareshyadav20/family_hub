import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Search, Users, Image as ImageIcon, Send, Lock, Globe, MessageSquare, MoreVertical, Calendar, FileText, BarChart, Settings } from 'lucide-react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function FamilyGroups() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [activeGroup, setActiveGroup] = useState(null); // ID of the group being viewed
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}`);
    setSocket(newSocket);
    // Realtime notification when someone adds you to a group
    newSocket.on('notification.created', () => {
       queryClient.invalidateQueries(['my_groups']);
    });
    return () => newSocket.disconnect();
  }, [queryClient]);

  const { data: groups = [], isLoading } = useQuery({
     queryKey: ['my_groups'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/groups/my-groups`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     }
  });

  const activeGroupData = groups.find(g => g.id === activeGroup);

  if (activeGroup) {
      return <GroupDetails groupMeta={activeGroupData} onBack={() => setActiveGroup(null)} token={token} socket={socket} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
         <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Groups</h1>
            <p className="text-slate-500 text-sm mt-1">Connect in smaller circles with family branches or committees.</p>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm p-2 flex gap-4">
         <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input type="text" placeholder="Search your groups..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {isLoading && <div className="col-span-full p-10 text-center font-bold text-slate-400">Loading your groups...</div>}
         
         {!isLoading && groups.length === 0 && (
            <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
               <Users size={40} className="mx-auto text-slate-300 mb-3" />
               <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">No Groups Joined</h3>
               <p className="text-sm text-slate-500 max-w-sm mx-auto mt-1">You are not a member of any family groups yet. Ask an admin to add you to a group.</p>
            </div>
         )}

         {groups.map(g => (
            <div key={g.id} onClick={() => setActiveGroup(g.id)} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
               <div className="h-28 bg-gradient-to-br from-blue-500 to-indigo-600 relative p-4">
                  <div className="absolute top-4 right-4 px-2.5 py-1 bg-black/20 backdrop-blur-md text-white text-[10px] font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
                     {g.privacy === 'Private' ? <Lock size={10} /> : <Globe size={10} />}
                     {g.privacy}
                  </div>
               </div>
               <div className="px-5 pb-5 relative -mt-8">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 p-1 rounded-2xl shadow-sm">
                     <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center font-black text-2xl text-blue-600">
                        {g.name.charAt(0)}
                     </div>
                  </div>
                  <h3 className="text-lg font-bold mt-3 text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{g.name}</h3>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mt-1 mb-2">{g.category}</p>
                  <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">{g.description || 'No description provided.'}</p>
                  
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                     <div className="flex -space-x-2">
                        {[...Array(Math.min(3, g._count?.members || 1))].map((_, i) => (
                           <div key={i} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 bg-cover" style={{backgroundImage: 'url(https://i.pravatar.cc/100?u='+g.id+i+')'}}></div>
                        ))}
                     </div>
                     <span className="text-xs font-bold text-slate-500 ml-1">{g._count?.members || 0} Members</span>
                  </div>
               </div>
            </div>
         ))}
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
         <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-4 transition-colors">
            ← Back to Groups
         </button>
         
         <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex flex-col h-[750px]">
            {/* Header */}
            <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative flex items-end px-8 pb-6">
               <div className="flex items-end gap-5 translate-y-8 z-10 w-full relative">
                  <div className="w-24 h-24 bg-white dark:bg-slate-900 p-1.5 rounded-3xl shadow-xl flex-shrink-0">
                     <div className="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center font-black text-4xl text-blue-600">
                        {group.name.charAt(0)}
                     </div>
                  </div>
                  <div className="flex-1 pb-1">
                     <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white drop-shadow-sm">{group.name}</h2>
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-black rounded-full uppercase tracking-widest">{group.category}</span>
                     </div>
                     <p className="text-slate-500 font-medium text-sm mt-1">{group._count?.members || 1} Members</p>
                  </div>
                  <div className="pb-1 text-right">
                     {isAdmin ? (
                        <button className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                           <Settings size={16}/> Group Settings
                        </button>
                     ) : (
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-xs font-bold shadow-sm">You are a {activeUserMemberProfile.role}</span>
                     )}
                  </div>
               </div>
               {/* Background pattern mask */}
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white to-transparent mix-blend-overlay pointer-events-none"></div>
            </div>

            {/* Nav Tabs */}
            <div className="px-8 mt-12 border-b border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto scrollbar-none">
               {[
                  { id: 'chat', label: 'Group Chat', icon: MessageSquare },
                  { id: 'members', label: 'Members', icon: Users },
                  { id: 'events', label: 'Events', icon: Calendar },
                  { id: 'gallery', label: 'Gallery', icon: ImageIcon },
                  { id: 'documents', label: 'Documents', icon: FileText },
                  { id: 'polls', label: 'Polls', icon: BarChart },
               ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-3 font-bold text-sm border-b-2 transition-all shrink-0 ${tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                     <t.icon size={16} /> {t.label}
                  </button>
               ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-hidden flex bg-slate-50/50 dark:bg-slate-900/50">
               {tab === 'chat' && <GroupChat groupId={group.id} token={token} socket={socket} permissions={group} activeProfile={activeUserMemberProfile} />}
               
               {tab === 'members' && (
                  <div className="flex-1 overflow-y-auto p-8">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                        {group.members?.map(m => (
                           <div key={m.id} className="bg-white dark:bg-slate-800 border dark:border-slate-700 p-4 rounded-2xl flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                              <img src={m.user?.avatar || `https://ui-avatars.com/api/?name=${m.user?.firstName}+${m.user?.lastName}&background=random`} className="w-12 h-12 rounded-full shadow-sm" alt="" />
                              <div className="flex-1 min-w-0">
                                 <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{m.user?.firstName} {m.user?.lastName}</p>
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
                     <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-300 mb-4">
                        {tab === 'events' && <Calendar size={32} />}
                        {tab === 'gallery' && <ImageIcon size={32} />}
                        {tab === 'documents' && <FileText size={32} />}
                        {tab === 'polls' && <BarChart size={32} />}
                     </div>
                     <h3 className="font-bold text-lg text-slate-700 dark:text-slate-200 capitalize w-full">Group {tab}</h3>
                     <p className="text-slate-500 text-sm max-w-sm mt-2">This dedicated module space is coming in a future update! It will integrate flawlessly into your group isolation boundary.</p>
                  </div>
               )}
            </div>
         </div>
      </div>
   );
}

function GroupChat({ groupId, token, socket, permissions, activeProfile }) {
   const queryClient = useQueryClient();
   const bottomRef = useRef();
   const [text, setText] = useState('');
   
   const canPost = permissions.allowPosts && !activeProfile.isMuted;
   const canUpload = (permissions.allowPhotos || permissions.allowFiles) && canPost;

   const { data: messages = [], isLoading } = useQuery({
      queryKey: ['groupMessages', groupId],
      queryFn: async () => {
         const res = await axios.get(`${API_URL}/groups/${groupId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
         return res.data.reverse(); 
      }
   });

   useEffect(() => {
      if (!socket) return;
      const handler = (msg) => {
         queryClient.setQueryData(['groupMessages', groupId], old => {
            const arr = Array.isArray(old) ? old : [];
            if (arr.some(m => m.id === msg.id)) return arr;
            return [...arr, msg];
         });
         setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
      };
      socket.on(`group.${groupId}.message`, handler);
      return () => socket.off(`group.${groupId}.message`, handler);
   }, [socket, groupId, queryClient]);

   useEffect(() => {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 100);
   }, [messages.length]);

   const sendMutate = useMutation({
      mutationFn: async (payload) => {
         await axios.post(`${API_URL}/groups/${groupId}/messages`, payload, {
            headers: { Authorization: `Bearer ${token}` }
         });
      }
   });

   const handleSend = (e) => {
      e.preventDefault();
      if (!text.trim() || !canPost) return;
      sendMutate.mutate({ content: text, type: 'Text' });
      setText('');
   };

   return (
      <div className="flex flex-col h-full w-full max-w-5xl mx-auto border-x border-slate-100 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
         <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
            {isLoading && <div className="text-center font-bold text-slate-400 mt-10">Syncing secure channel...</div>}
            
            {messages.map((msg, i) => {
               const isMe = msg.senderId === localStorage.getItem('userId');
               const showHeader = i === 0 || messages[i-1].senderId !== msg.senderId || new Date(msg.createdAt) - new Date(messages[i-1].createdAt) > 300000;
               
               return (
                  <div key={msg.id} className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                     {showHeader ? (
                        <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.firstName}+${msg.sender?.lastName}&background=random`} className="w-8 h-8 rounded-full shadow-sm shrink-0" alt=""/>
                     ) : <div className="w-8 shrink-0"></div>}
                     
                     <div className={`flex flex-col max-w-[70%] ${isMe ? 'items-end' : 'items-start'}`}>
                        {showHeader && !isMe && (
                           <span className="text-[11px] font-bold text-slate-500 ml-1 mb-1">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                        )}
                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm relative group ${isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white dark:bg-slate-800 border dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-bl-sm'}`}>
                           <span className="text-[14px] leading-relaxed break-words whitespace-pre-wrap">{msg.content}</span>
                        </div>
                     </div>
                  </div>
               )
            })}
            <div ref={bottomRef} />
         </div>

         <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
            {!canPost ? (
               <div className="w-full h-12 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-sm font-bold text-slate-400">
                  <Lock size={16} className="mr-2" />
                  Only Admins can send messages in this group.
               </div>
            ) : (
               <form onSubmit={handleSend} className="flex gap-3 items-end relative">
                  {canUpload && (
                     <button type="button" className="w-12 h-12 shrink-0 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-500 rounded-2xl flex items-center justify-center transition-colors shadow-sm outline-none">
                        <ImageIcon size={22} />
                     </button>
                  )}
                  <textarea 
                     value={text} 
                     onChange={e => setText(e.target.value)} 
                     placeholder="Message group..." 
                     className="flex-1 min-h-[48px] max-h-32 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl px-5 py-3 text-[14px] font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none shadow-sm scrollbar-none"
                     onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                           e.preventDefault();
                           handleSend(e);
                        }
                     }}
                  />
                  <button type="submit" disabled={!text.trim() || sendMutate.isPending} className="w-12 h-12 shrink-0 bg-blue-600 rounded-2xl flex items-center justify-center text-white disabled:opacity-50 disabled:bg-blue-300 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30">
                     <Send size={20} className="ml-1" />
                  </button>
               </form>
            )}
         </div>
      </div>
   );
}
