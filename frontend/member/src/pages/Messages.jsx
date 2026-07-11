import React, { useState } from 'react';
import { Send, Search, Phone, Video, MoreVertical, ChevronLeft } from 'lucide-react';

const conversations = [
  { id: 1, name: 'Sarah Smith', relation: 'Mother', avatar: 'https://i.pravatar.cc/150?img=47', online: true, lastMessage: 'Don\'t forget to pack warm clothes!', time: '2m ago', unread: 3 },
  { id: 2, name: 'Family Group Chat', relation: 'Group · 8 members', avatar: null, online: true, lastMessage: 'Robert: Can\'t wait to see everyone at the reunion!', time: '15m ago', unread: 12 },
  { id: 3, name: 'Emily Smith', relation: 'Sister', avatar: 'https://i.pravatar.cc/150?img=25', online: true, lastMessage: 'Haha yes that was so funny!', time: '1h ago', unread: 0 },
  { id: 4, name: 'James Smith', relation: 'Father', avatar: 'https://i.pravatar.cc/150?img=68', online: false, lastMessage: 'Call me when you reach.', time: '3h ago', unread: 1 },
  { id: 5, name: 'Robert Smith', relation: 'Grandfather', avatar: 'https://i.pravatar.cc/150?img=70', online: false, lastMessage: 'Blessings always, my child.', time: 'Yesterday', unread: 0 },
  { id: 6, name: 'William Smith', relation: 'Uncle', avatar: 'https://i.pravatar.cc/150?img=52', online: false, lastMessage: 'Sending you tickets for the match!', time: 'Mon', unread: 0 },
];

const chatMessages = {
  1: [
    { from: 'them', text: 'Hi beta! How are you?', time: '2:10 PM' },
    { from: 'me', text: 'Hi maa! I\'m doing great. How about you?', time: '2:11 PM' },
    { from: 'them', text: 'All good here. Are you coming for the reunion?', time: '2:12 PM' },
    { from: 'me', text: 'Yes! Already booked my tickets 😊', time: '2:13 PM' },
    { from: 'them', text: 'Wonderful! Don\'t forget to pack warm clothes!', time: '2:15 PM' },
  ],
  2: [
    { from: 'them', text: 'Robert: So excited for the reunion everyone!', time: '1:00 PM' },
    { from: 'them', text: 'Emily: Me too! I\'m making my famous pasta 🍝', time: '1:05 PM' },
    { from: 'me', text: 'Count me in! See you all there 🎉', time: '1:07 PM' },
    { from: 'them', text: 'Sarah: Don\'t forget the games, Arjun!', time: '1:08 PM' },
    { from: 'them', text: 'Robert: Can\'t wait to see everyone at the reunion!', time: '1:45 PM' },
  ],
  3: [
    { from: 'me', text: 'Did you see the picture Grandpa sent?', time: '11:00 AM' },
    { from: 'them', text: 'OMG yes! That throwback photo is priceless 😂', time: '11:02 AM' },
    { from: 'me', text: 'We looked so funny back then haha', time: '11:03 AM' },
    { from: 'them', text: 'Haha yes that was so funny!', time: '11:10 AM' },
  ],
};

export default function Messages() {
  const [activeChat, setActiveChat] = useState(null);
  const [input, setInput] = useState('');
  const [msgState, setMsgState] = useState(chatMessages);
  const active = activeChat ? conversations.find(c => c.id === activeChat) : null;
  const msgs = activeChat ? (msgState[activeChat] || []) : [];

  const send = () => {
    if (!input.trim() || !activeChat) return;
    setMsgState(prev => ({ ...prev, [activeChat]: [...(prev[activeChat] || []), { from: 'me', text: input.trim(), time: 'Just now' }] }));
    setInput('');
  };

  return (
    <div className="flex gap-5 h-[calc(100vh-180px)] animate-in fade-in duration-500 min-h-[500px]">
      {/* Conversation List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 shrink-0 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden`}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-black text-lg text-slate-900 dark:text-white mb-3">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input type="text" placeholder="Search conversations..." className="w-full pl-9 pr-4 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <button key={conv.id} onClick={() => setActiveChat(conv.id)} className={`w-full flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left border-b border-slate-50 dark:border-slate-800/60 last:border-0 ${activeChat === conv.id ? 'bg-blue-50 dark:bg-blue-500/10' : ''}`}>
              <div className="relative shrink-0">
                {conv.avatar ? <img src={conv.avatar} alt={conv.name} className="w-11 h-11 rounded-xl object-cover" />
                  : <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-lg">F</div>}
                {conv.online && <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900"></span>}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{conv.name}</span>
                  <span className="text-[11px] font-medium text-slate-400 shrink-0 ml-2">{conv.time}</span>
                </div>
                <p className="text-xs text-slate-500 truncate font-medium">{conv.lastMessage}</p>
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
              {active.avatar ? <img src={active.avatar} alt={active.name} className="w-10 h-10 rounded-xl object-cover" />
                : <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">F</div>}
              <div className="flex-1">
                <p className="font-bold text-slate-900 dark:text-white text-sm">{active.name}</p>
                <p className="text-xs font-medium text-slate-400">{active.relation}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Phone size={17} /></button>
                <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Video size={17} /></button>
                <button className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"><MoreVertical size={17} /></button>
              </div>
            </div>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {msgs.map((msg, i) => (
                <div key={i} className={`flex ${msg.from === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl text-sm font-medium ${msg.from === 'me' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-sm'}`}>
                    <p>{msg.text}</p>
                    <p className={`text-[10px] font-semibold mt-1 ${msg.from === 'me' ? 'text-blue-200' : 'text-slate-400'}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* Input */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()}
                type="text" placeholder="Type a message..." className="flex-1 px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
              <button onClick={send} className="w-11 h-11 shrink-0 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center text-white transition-colors disabled:opacity-40 shadow-md shadow-blue-500/30" disabled={!input.trim()}>
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
