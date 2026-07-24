import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ChevronLeft, CheckCheck, Paperclip, Smile, FileText, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';
import EmojiPicker from 'emoji-picker-react';

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState('');
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
  const { data: conversations = [], isLoading } = useQuery({
     queryKey: ['conversations'],
     queryFn: async () => {
         const res = await axios.get(`${API_URL}/messages/conversations`, {
             headers: { Authorization: `Bearer ${token}` }
         });
         return res.data;
     }
  });

  const active = activeChat ? conversations.find(c => c.id === activeChat) : null;

  // Fetch messages for selected conversation
  const { data: msgs = [], isLoading: msgsLoading } = useQuery({
      queryKey: ['messages', activeChat],
      queryFn: async () => {
          if (!activeChat) return [];
          const res = await axios.get(`${API_URL}/messages/${activeChat}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      enabled: !!activeChat
  });

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
          if (!activeChat) return;
          const res = await axios.post(`${API_URL}/messages`, {
              receiverId: activeChat,
              text: payload.text,
              fileUrl: payload.fileUrl,
              fileName: payload.fileName
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      onSuccess: (newMsg) => {
          queryClient.setQueryData(['messages', activeChat], (oldData) => {
             if (!oldData) return [newMsg];
             return [...oldData, newMsg];
          });
          queryClient.invalidateQueries(['conversations']);
      }
  });

  const send = () => {
    if (!input.trim() && !mutation.variables?.fileUrl) return;
    mutation.mutate({ text: input, fileUrl: null, fileName: null });
    setInput('');
    setShowEmojiPicker(false);
  };

  const handleEmojiClick = (emojiObject) => {
    setInput(prev => prev + emojiObject.emoji);
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

  const filtered = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex gap-5 h-[calc(100vh-180px)] animate-in fade-in duration-500 min-h-[500px]">
      {/* Conversation List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 bg-white rounded-2xl border border-[#E9E5F8] shadow-sm overflow-hidden`}>
        <div className="p-4 border-b border-[#E9E5F8]">
          <h2 className="font-black text-lg text-[#1F2430] mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 h-9 rounded-[24px] bg-[#FCFBFF] border-none text-sm font-medium focus:outline-none" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && <div className="p-4 text-center text-sm text-slate-500">Loading conversations...</div>}
          {filtered.map(conv => (
            <button key={conv.id} onClick={() => setActiveChat(conv.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-[#FCFBFF] transition-colors text-left border-b border-slate-50 last:border-0 ${activeChat === conv.id ? 'bg-[#FAF8FF] ' : ''}`}>
              <div className="relative shrink-0">
                <div className={`w-11 h-11 rounded-[24px] ${conv.color || 'bg-[#7C5CFC]'} text-white flex items-center overflow-hidden justify-center font-bold text-lg shadow-sm bg-gradient-to-br from-blue-500 to-indigo-500`}>
                  {conv.avatar ? <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" /> : conv.initials}
                </div>
                {conv.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm text-[#1F2430] truncate">{conv.name}</span>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-2">{formatTime(conv.time)}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-[#7C5CFC] text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">{conv.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white rounded-2xl border border-[#E9E5F8] shadow-sm overflow-hidden`}>
        {active ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E9E5F8]">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-1.5 rounded-[20px] hover:bg-[#FAF8FF] text-slate-500"><ChevronLeft size={18} /></button>
              <div className="w-10 h-10 rounded-[24px] bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center overflow-hidden justify-center text-white font-bold shadow-sm">
                {active.avatar ? <img src={active.avatar} alt={active.name} className="w-full h-full object-cover" /> : active.initials}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[#1F2430] text-sm">{active.name}</p>
                <p className="text-xs font-medium text-slate-400">{active.online ? 'Online' : 'Offline'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-[24px] hover:bg-[#FAF8FF] text-slate-400 hover:text-[#7C5CFC] transition-colors"><Phone size={17} /></button>
                <button className="p-2 rounded-[24px] hover:bg-[#FAF8FF] text-slate-400 hover:text-[#7C5CFC] transition-colors"><Video size={17} /></button>
                <button className="p-2 rounded-[24px] hover:bg-[#FAF8FF] text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={17} /></button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {msgsLoading && <div className="text-center text-slate-500 text-sm">Loading messages...</div>}
              {msgs.map((msg, i) => (
                <div key={i} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium ${msg.mine ? 'bg-[#7C5CFC] text-white rounded-br-sm' : 'bg-[#FAF8FF] text-[#1F2430] rounded-bl-sm'}`}>
                    {msg.fileUrl && (
                      <div className="mb-2">
                        {msg.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                          <img src={msg.fileUrl} alt={msg.fileName} className="rounded-[20px] max-w-full h-auto cursor-pointer" onClick={() => window.open(msg.fileUrl, '_blank')} />
                        ) : (
                          <a href={msg.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-[20px] ${msg.mine ? 'bg-blue-700 hover:bg-blue-800' : 'bg-slate-200 hover:bg-slate-300 '} transition-colors`}>
                            <FileText size={16} />
                            <span className="truncate max-w-[150px]">{msg.fileName}</span>
                          </a>
                        )}
                      </div>
                    )}
                    {msg.text && <p>{msg.text}</p>}
                    <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 justify-end ${msg.mine ? 'text-blue-200' : 'text-slate-400'}`}>
                      {formatTime(msg.time)} {msg.mine && <CheckCheck size={11} />}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={msgsEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-[#E9E5F8] flex items-center gap-3 relative">
              {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-50 shadow-xl rounded-[24px]">
                  <EmojiPicker onEmojiClick={handleEmojiClick} theme="auto" />
                </div>
              )}
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-[#FAF8FF] rounded-[24px] transition-colors text-slate-400">
                <Paperclip size={18} />
              </button>
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && send()}
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 px-4 py-3 rounded-[24px] bg-[#FCFBFF] border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/30 text-[#1F2430]" 
              />
              <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-[24px] transition-colors ${showEmojiPicker ? 'bg-blue-100 text-[#7C5CFC]' : 'hover:bg-[#FAF8FF] text-slate-400'}`}>
                <Smile size={18} />
              </button>
              <button onClick={send} disabled={mutation.isPending || (!input.trim() && !mutation.variables?.fileUrl)} className="w-11 h-11 shrink-0 bg-[#7C5CFC] hover:bg-blue-700 rounded-[24px] flex items-center justify-center text-white transition-colors disabled:opacity-40 shadow-sm shadow-blue-500/30">
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8FF] flex items-center justify-center mb-4"><Send size={24} className="opacity-30" /></div>
            <p className="font-semibold text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
