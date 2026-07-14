import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Plus, Search, Filter, Users, Lock, Globe, MessageSquare, Image, MoreVertical, Send, File, Archive, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API_URL || `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function FamilyGroups() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('list'); // list, create, details
  const [activeGroup, setActiveGroup] = useState(null); // ID of the group being viewed
  const [detailTab, setDetailTab] = useState('overview'); // overview, members, chat
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}`);
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

          <div className="bg-white dark:bg-slate-900 border rounded-2xl shadow-sm overflow-hidden">
             <div className="p-4 border-b dark:border-slate-800 flex gap-4">
                <div className="relative w-full max-w-sm">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                   <input type="text" placeholder="Search groups..." className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500" />
                </div>
                <button className="px-4 py-2 bg-slate-50 border rounded-xl text-sm font-bold text-slate-600 flex items-center gap-2"><Filter size={16} /> Filter</button>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left text-sm border-collapse">
                  <thead>
                     <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 font-bold border-b dark:border-slate-800">
                        <th className="p-4">Group Name</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Privacy</th>
                        <th className="p-4">Members</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Actions</th>
                     </tr>
                  </thead>
                  <tbody>
                     {groups.map(g => (
                        <tr key={g.id} className="border-b dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                           <td className="p-4">
                              <div className="flex items-center gap-3 cursor-pointer" onClick={() => goDetails(g.id)}>
                                 <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center font-bold">{g.name.charAt(0)}</div>
                                 <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white">{g.name}</h4>
                                    <p className="text-xs text-slate-500 truncate w-40">{g.description}</p>
                                 </div>
                              </div>
                           </td>
                           <td className="p-4 text-slate-600 font-medium">{g.category}</td>
                           <td className="p-4">
                              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full ${g.privacy === 'Private' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                 {g.privacy}
                              </span>
                           </td>
                           <td className="p-4 text-slate-600 font-bold">{g._count?.members || 0}</td>
                           <td className="p-4 text-slate-600 font-medium">{g.status}</td>
                           <td className="p-4 text-right">
                              <button onClick={() => goDetails(g.id)} className="text-blue-600 hover:text-blue-800 font-bold text-sm px-3 py-1.5 bg-blue-50 rounded-lg">View</button>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
             </div>
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
            <div className="flex gap-2">
               <button onClick={() => setTab('overview')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'overview' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Overview</button>
               <button onClick={() => setTab('members')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'members' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Members</button>
               <button onClick={() => setTab('chat')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'chat' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Chat</button>
               <button onClick={() => setTab('settings')} className={`px-4 py-2 font-bold text-sm rounded-lg ${tab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'}`}>Settings</button>
            </div>
         </div>

         <div className="flex-1 p-6 flex flex-col min-h-0 bg-slate-50/20">
            {tab === 'chat' && <GroupChat groupId={groupId} token={token} socket={socket} />}
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

function GroupChat({ groupId, token, socket }) {
   const queryClient = useQueryClient();
   const bottomRef = useRef();
   const [text, setText] = useState('');
   const [uploading, setUploading] = useState(false);

   const { data: messages = [], isLoading } = useQuery({
      queryKey: ['groupMessages', groupId],
      queryFn: async () => {
         const res = await axios.get(`${API_URL}/groups/${groupId}/messages`, { headers: { Authorization: `Bearer ${token}` } });
         return res.data.reverse(); // backend sorted desc to get newest 100, reverse for UI
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
      bottomRef.current?.scrollIntoView();
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
      if (!text.trim()) return;
      sendMutate.mutate({ content: text, type: 'Text' });
      setText('');
   };
   
   // Handle file selection (mock flow for now, you typically upload to cloud then send URL)
   const handleFile = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      setUploading(true);
      // Simulate fake fast upload
      setTimeout(() => {
         sendMutate.mutate({ content: `Uploaded ${file.name}`, type: file.type.includes('image') ? 'Image' : 'File', fileName: file.name, fileUrl: 'https://placehold.co/400x300' });
         setUploading(false);
      }, 1000);
   };

   return (
      <div className="flex flex-col h-[500px] w-full max-w-4xl pt-4">
         <div className="flex-1 overflow-y-auto pr-4 space-y-4 min-h-0 bg-white/50 rounded-2xl p-4 border border-slate-100 shadow-inner">
            {isLoading && <div className="text-center font-bold text-slate-400 pt-8">Loading history...</div>}
            {messages.length === 0 && !isLoading && <div className="text-center text-slate-400 font-bold mt-10">Start the conversation!</div>}
            
            {messages.map(msg => {
               // Assuming activeUser mapping by ID isn't immediately strictly known here in context, styling left-aligned standard
               return (
                  <div key={msg.id} className="flex items-end gap-3 max-w-[80%]">
                     <img src={msg.sender?.avatar || `https://ui-avatars.com/api/?name=${msg.sender?.firstName}+${msg.sender?.lastName}`} className="w-8 h-8 rounded-full mb-1 shadow-sm shrink-0" alt=""/>
                     <div className="flex flex-col bg-white border border-slate-200 p-3.5 rounded-2xl rounded-bl-sm shadow-sm">
                        <span className="text-[11px] font-bold text-slate-500 mb-1">{msg.sender?.firstName} {msg.sender?.lastName}</span>
                        {msg.type === 'Image' ? (
                           <img src={msg.fileUrl} className="rounded-xl w-64 object-cover my-1" alt="" />
                        ) : null}
                        <span className="text-sm font-medium text-slate-900 leading-snug break-words">{msg.content}</span>
                        <span className="text-[10px] text-slate-400 mt-1.5 self-end">{new Date(msg.createdAt).toLocaleTimeString([],{hour: '2-digit', minute:'2-digit'})}</span>
                     </div>
                  </div>
               )
            })}
            <div ref={bottomRef} />
         </div>

         <form onSubmit={handleSend} className="h-16 mt-4 flex gap-3 shrink-0 items-center">
            <label className={`w-14 h-14 bg-white border rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer ${uploading ? 'opacity-50' : ''}`}>
               <Image size={24} />
               <input type="file" accept="image/*, application/pdf" className="hidden" onChange={handleFile} disabled={uploading} />
            </label>
            <input 
               type="text" 
               value={text} 
               onChange={e => setText(e.target.value)} 
               placeholder="Type a message..." 
               className="flex-1 h-14 bg-white border rounded-2xl px-5 text-sm font-medium focus:ring-2 focus:ring-blue-500 shadow-sm outline-none"
            />
            <button type="submit" disabled={!text.trim() || sendMutate.isPending} className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white disabled:opacity-50 hover:bg-blue-700 transition-colors shadow-md shadow-blue-600/30">
               <Send size={24} />
            </button>
         </form>
      </div>
   );
}
