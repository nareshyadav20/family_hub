import React, { useState, useEffect, useRef } from 'react';
import { Send, Search, Paperclip, Smile, Phone, Video, MoreHorizontal, CheckCheck, FileText, ChevronLeft, Image as ImageIcon } from 'lucide-react';
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

  const scrollContainerRef = useRef(null);

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
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
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
      <h1 className="text-[28px] font-bold tracking-tight text-[#1F2430]">Messages</h1>
      <div className="bg-white rounded-[24px] border border-[#E9E5F8] shadow-sm overflow-hidden flex" style={{ height: '620px' }}>
        {/* Contacts List */}
        <div className={`${selected ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-[#E9E5F8] flex flex-col shrink-0 bg-[#FCFBFF]`}>
          <div className="p-4 border-b border-[#E9E5F8]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#6B7280]" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#E9E5F8] rounded-[16px] text-sm text-[#1F2430] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] transition-all font-semibold"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isLoading && <div className="p-4 text-center text-sm text-[#6B7280] font-semibold">Loading contacts...</div>}
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors border-b border-[#E9E5F8]/40 ${selected?.id === c.id ? 'bg-[#EEE8FF] text-[#7C5CFC]' : 'hover:bg-[#FAF8FF]'}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-[14px] ${c.color || 'bg-[#7C5CFC]'} text-white flex items-center overflow-hidden justify-center font-bold text-xs shadow-sm`}>
                    {c.avatar ? <img src={c.avatar} alt={c.name} className="w-full h-full object-cover" /> : c.initials}
                  </div>
                  {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#2EB67D] border-2 border-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[13px] font-bold text-[#1F2430] truncate">{c.name}</h4>
                    <span className="text-[10px] text-[#6B7280] shrink-0 ml-1 font-semibold">{formatTime(c.time) || ''}</span>
                  </div>
                  <p className="text-[11px] text-[#6B7280] truncate mt-0.5 font-semibold">{c.lastMsg}</p>
                </div>
                {c.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-[#7C5CFC] text-white flex items-center justify-center text-[10px] font-bold shrink-0">{c.unread}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`${selected ? 'flex' : 'hidden md:flex'} flex-1 flex-col relative bg-white`}>
          {selected ? (
            <>
              <div className="px-6 py-4 border-b border-[#E9E5F8] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button onClick={() => setSelected(null)} className="md:hidden p-1.5 rounded-xl hover:bg-[#FAF8FF] text-[#6B7280] mr-1"><ChevronLeft size={18} /></button>
                  <div className={`w-9 h-9 rounded-[12px] ${selected.color || 'bg-[#7C5CFC]'} text-white flex items-center overflow-hidden justify-center font-bold text-xs shadow-sm`}>
                    {selected.avatar ? <img src={selected.avatar} alt={selected.name} className="w-full h-full object-cover" /> : selected.initials}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#1F2430]">{selected.name}</h4>
                    <p className={`text-[10px] font-bold ${selected.online ? 'text-[#2EB67D]' : 'text-[#6B7280]'}`}>{selected.online ? 'Online' : 'Offline'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[Phone, Video, MoreHorizontal].map((Icon, i) => (
                    <button key={i} className="p-2 hover:bg-[#FAF8FF] rounded-xl transition-colors text-[#6B7280]">
                      <Icon size={18} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#FAF8FF]">
                {msgsLoading && <div className="text-center text-[#6B7280] font-semibold text-sm">Loading messages...</div>}

                {msgs.map(m => (
                  <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[72%] px-4 py-3 rounded-[18px] text-[14px] leading-relaxed font-semibold ${m.mine ? 'bg-[#7C5CFC] text-white rounded-br-[4px] shadow-sm' : 'bg-white text-[#1F2430] rounded-bl-[4px] shadow-sm border border-[#E9E5F8]'}`}>
                      {m.fileUrl && (
                        <div className="mb-2">
                          {m.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) ? (
                            <img src={m.fileUrl} alt={m.fileName} className="rounded-lg max-w-full h-auto cursor-pointer" onClick={() => window.open(m.fileUrl, '_blank')} />
                          ) : (
                            <a href={m.fileUrl} target="_blank" rel="noreferrer" className={`flex items-center gap-2 p-2 rounded-lg ${m.mine ? 'bg-[#6B49F6] hover:bg-[#7C5CFC]' : 'bg-[#FAF8FF] hover:bg-[#EEE8FF]'} transition-colors`}>
                              <FileText size={16} />
                              <span className="truncate max-w-[150px] font-medium">{m.fileName}</span>
                            </a>
                          )}
                        </div>
                      )}
                      {m.text && <p>{m.text}</p>}
                      <p className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end ${m.mine ? 'text-[#EEE8FF]' : 'text-[#6B7280]'}`}>
                        {formatTime(m.time)} {m.mine && <CheckCheck size={11} />}
                      </p>
                    </div>
                  </div>
                ))}

              </div>

              <div className="p-4 border-t border-[#E9E5F8] relative bg-white">
                {showEmojiPicker && (
                  <div className="absolute bottom-20 right-4 z-50 shadow-xl rounded-xl">
                    <EmojiPicker onEmojiClick={handleEmojiClick} theme="light" />
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                  <button onClick={() => fileInputRef.current?.click()} className="p-2 hover:bg-[#FAF8FF] rounded-xl transition-colors text-[#6B7280]"><Paperclip size={18} /></button>
                  <input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2.5 bg-[#FAF8FF] rounded-[16px] border border-[#E9E5F8] text-sm text-[#1F2430] placeholder:text-[#6B7280]/60 focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/10 focus:border-[#7C5CFC] font-semibold"
                  />
                  <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className={`p-2 rounded-xl transition-colors ${showEmojiPicker ? 'bg-[#EEE8FF] text-[#7C5CFC]' : 'hover:bg-[#FAF8FF] text-[#6B7280]'}`}><Smile size={18} /></button>
                  <button onClick={handleSend} disabled={mutation.isPending || (!msg.trim() && !mutation.variables?.fileUrl)} className="p-2.5 bg-[#7C5CFC] hover:bg-[#6B49F6] disabled:opacity-50 rounded-xl transition-colors shadow-lg shadow-[#7C5CFC]/25">
                    <Send size={18} className="text-white" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#6B7280] font-semibold text-sm bg-[#FAF8FF]">
              {isLoading ? 'Loading conversations...' : 'Select a conversation to start messaging'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
