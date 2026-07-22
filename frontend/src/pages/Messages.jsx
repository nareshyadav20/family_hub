import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, Smile, Phone, Video, MoreHorizontal, CheckCheck, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Messages() {
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const activeUser = userStr ? JSON.parse(userStr) : null;
  const API_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;
  const SOCKET_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}`;

  const msgsEndRef = useRef(null);

  // Fetch conversations
  const { data: contacts = [], isLoading } = useQuery({
     queryKey: ['conversations'],
     queryFn: async () => {
         const res = await axios.get(`${API_URL}/messages/conversations`, {
             headers: { Authorization: `Bearer ${token}` }
         });
         return res.data;
     }
  });

  // Set default selected
  useEffect(() => {
     if (contacts.length > 0 && !selected) {
         setSelected(contacts[0]);
     }
  }, [contacts, selected]);

  // Fetch messages for selected conversation
  const { data: msgs = [], isLoading: msgsLoading } = useQuery({
      queryKey: ['messages', selected?.id],
      queryFn: async () => {
          if (!selected) return [];
          const res = await axios.get(`${API_URL}/messages/${selected.id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      enabled: !!selected
  });

  // Scroll to bottom
  useEffect(() => {
      msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Socket
  useEffect(() => {
      if (!activeUser) return;
      const socket = io(SOCKET_URL);
      
      socket.on(`message.new.${activeUser.id}`, (newMsg) => {
          queryClient.setQueryData(['messages', newMsg.senderId], (oldData) => {
              if (!oldData) return [newMsg];
              if (oldData.some(m => m.id === newMsg.id)) return oldData;
              return [...oldData, newMsg];
          });
          queryClient.invalidateQueries(['conversations']);
      });

      return () => socket.disconnect();
  }, [activeUser, queryClient, SOCKET_URL]);

  const mutation = useMutation({
      mutationFn: async (payload) => {
          if (!selected) return;
          const res = await axios.post(`${API_URL}/messages`, {
              receiverId: selected.id,
              text: payload.text,
              fileUrl: payload.fileUrl,
              fileName: payload.fileName
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      onSuccess: (newMsg) => {
          queryClient.setQueryData(['messages', selected.id], (oldData) => {
             if (!oldData) return [newMsg];
             return [...oldData, newMsg];
          });
          queryClient.invalidateQueries(['conversations']);
      }
  });

  const handleSend = () => {
    if (!msg.trim()) return;
    mutation.mutate({ text: msg, fileUrl: null, fileName: null });
    setMsg('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setMsg(prev => prev + emojiObject.emoji);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('attachment', file);

    try {
      const res = await axios.post(`${API_URL}/messages/upload`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        }
      });
      mutation.mutate({ text: '', fileUrl: res.data.fileUrl, fileName: res.data.fileName });
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload file.');
    }
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const filtered = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Messages</h1>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex" style={{ height: '620px' }}>
        {/* Contacts List */}
        <div className="w-80 border-r border-slate-100 dark:border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && <div className="p-4 text-center text-sm text-slate-500">Loading contacts...</div>}
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/50 ${selected?.id === c.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-xl ${c.color || 'bg-indigo-500'} text-white flex items-center overflow-hidden justify-center font-bold text-xs shadow-sm`}>
                     {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : c.initials}
                  </div>
                  {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{c.name}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{formatTime(c.time) || ''}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">{c.unread}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col relative">
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl ${selected.color || 'bg-indigo-500'} text-white flex items-center overflow-hidden justify-center font-bold text-xs shadow-sm`}>
                    {selected.avatar ? <img src={selected.avatar} alt={selected.name} className="w-full h-full object-cover" /> : selected.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">{selected.name}</h4>
                    <p className={`text-[10px] font-medium ${selected.online ? 'text-emerald-500' : 'text-slate-400'}`}>{selected.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[Phone, Video, MoreHorizontal].map((Icon, i) => (
                    <button key={i} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {msgsLoading && <div className="text-center text-slate-500 text-sm">Loading messages...</div>}
                
                {msgs.map(m => (
                  <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${m.mine ? 'bg-indigo-600 text-white rounded-br-md shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md shadow-sm'}`}>
                      {m.fileUrl && (
                        <div className="mb-2">
                          {m.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            <img src={m.fileUrl} alt={m.fileName} className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(m.fileUrl, '_blank')} />
                          ) : (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${m.mine ? 'bg-indigo-700 hover:bg-indigo-800' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'} transition-colors`}>
                              <FileText size={16} />
                              <span className="truncate max-w-[150px] font-medium">{m.fileName}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {m.text && <p>{m.text}</p>}
                      <p className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end ${m.mine ? 'text-indigo-200' : 'text-slate-400'}`}>
                        {formatTime(m.time)} {m.mine && <CheckCheck size={11} />}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={msgsEndRef} />
              </div>

              <div className="p-4 border-t border-slate-100 dark:border-slate-800 relative">
                {showEmojiPicker && (
                  <div className="absolute bottom-20 right-4 z-50 shadow-xl rounded-xl">
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"><Paperclip size={18} /></button>
                  <input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800 dark:text-slate-200"
                  />
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? 'bg-indigo-100 text-indigo-600' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400'}`}><Smile size={18} /></button>
                  <button onClick={handleSend} disabled={mutation.isPending || (!msg.trim() && !mutation.variables?.fileUrl)} className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-indigo-500/25">
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400 text-sm">
               {isLoading ? 'Loading conversations...' : 'Select a conversation to start messaging'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
