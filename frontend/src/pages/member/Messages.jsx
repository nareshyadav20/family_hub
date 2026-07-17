import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ChevronLeft, CheckCheck } from 'lucide-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { io } from 'socket.io-client';

const formatTime = (isoString) => {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  
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
      mutationFn: async (text) => {
          if (!activeChat) return;
          const res = await axios.post(`${API_URL}/messages`, {
              receiverId: activeChat,
              text
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
    if (!input.trim() || !activeChat) return;
    mutation.mutate(input);
    setInput('');
  };

  const filtered = conversations.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex gap-5 h-[calc(100vh-180px)] animate-in fade-in duration-500 min-h-[500px]">
      {/* Conversation List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-black text-lg text-slate-900 dark:text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations..." 
              className="w-full pl-9 pr-4 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium focus:outline-none" 
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {isLoading && <div className="p-4 text-center text-sm text-slate-500">Loading conversations...</div>}
          {filtered.map(conv => (
            <button key={conv.id} onClick={() => setActiveChat(conv.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-50 dark:border-slate-800/60 last:border-0 ${activeChat === conv.id ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}>
              <div className="relative shrink-0">
                <div className={`w-11 h-11 rounded-xl ${conv.color || 'bg-indigo-500'} text-white flex items-center overflow-hidden justify-center font-bold text-lg shadow-sm bg-gradient-to-br from-blue-500 to-indigo-500`}>
                  {conv.avatar ? <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" /> : conv.initials}
                </div>
                {conv.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{conv.name}</span>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-2">{formatTime(conv.time)}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMsg}</p>
              </div>
              {conv.unread > 0 && (
                <span className="w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0">{conv.unread}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden`}>
        {active ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <button onClick={() => setActiveChat(null)} className="md:hidden p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronLeft size={18} /></button>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center overflow-hidden justify-center text-white font-bold shadow-sm">
                {active.avatar ? <img src={active.avatar} alt={active.name} className="w-full h-full object-cover" /> : active.initials}
              </div>
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{active.name}</p>
                <p className="text-xs font-medium text-slate-400">{active.online ? 'Online' : 'Offline'}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Phone size={17} /></button>
                <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Video size={17} /></button>
                <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={17} /></button>
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {msgsLoading && <div className="text-center text-slate-500 text-sm">Loading messages...</div>}
              {msgs.map((msg, i) => (
                <div key={i} className={`flex ${msg.mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium ${msg.mine ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] font-semibold mt-1 flex items-center gap-1 justify-end ${msg.mine ? 'text-blue-200' : 'text-slate-400'}`}>
                      {formatTime(msg.time)} {msg.mine && <CheckCheck size={11} />}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={msgsEndRef} />
            </div>
            
            {/* Input */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <input 
                value={input} 
                onChange={e => setInput(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && send()}
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 text-slate-800 dark:text-slate-200" 
              />
              <button onClick={send} disabled={mutation.isPending || !input.trim()} className="w-11 h-11 shrink-0 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white transition-colors disabled:opacity-40 shadow-md shadow-blue-500/30">
                <Send size={16} />
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4"><Send size={24} className="opacity-30" /></div>
            <p className="font-semibold text-sm">Select a conversation to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
