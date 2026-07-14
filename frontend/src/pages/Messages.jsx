import React, { useState } from 'react';
import { Send, Search, Paperclip, Smile, Phone, Video, MoreHorizontal, CheckCheck } from 'lucide-react';

const contacts = [
  { id: 1, name: 'Martha Smith', initials: 'MS', color: 'bg-pink-500', lastMsg: 'Should we order more flowers for the reunion?', time: '2m ago', unread: 2, online: true },
  { id: 2, name: 'James Smith', initials: 'JS', color: 'bg-emerald-500', lastMsg: 'I booked the venue for the anniversary!', time: '15m ago', unread: 0, online: true },
  { id: 3, name: 'Emily Smith', initials: 'ES', color: 'bg-violet-500', lastMsg: 'Just uploaded the birthday photos 📸', time: '1h ago', unread: 1, online: false },
  { id: 4, name: 'William Smith', initials: 'WS', color: 'bg-orange-500', lastMsg: 'Will be there next week!', time: '3h ago', unread: 0, online: true },
  { id: 5, name: 'Patricia Dove', initials: 'PD', color: 'bg-indigo-500', lastMsg: 'Can we discuss the reunion catering?', time: '1d ago', unread: 0, online: false },
  { id: 6, name: 'Noah Smith', initials: 'NS', color: 'bg-teal-500', lastMsg: 'Thank you for the warm welcome!', time: '2d ago', unread: 0, online: false },
];

const mockMessages = [
  { id: 1, sender: 'Martha Smith', text: 'Have you finalized the catering for the reunion?', time: '10:30 AM', mine: false },
  { id: 2, sender: 'me', text: "Yes! I spoke with the caterer. They can do a full spread for everyone.", time: '10:32 AM', mine: true },
  { id: 3, sender: 'Martha Smith', text: 'Perfect! Should we also arrange for a vegetarian option?', time: '10:34 AM', mine: false },
  { id: 4, sender: 'me', text: 'Good thinking. I will ask them to add a veggie pasta and salad station.', time: '10:35 AM', mine: true },
  { id: 5, sender: 'Martha Smith', text: 'Should we order more flowers for the reunion?', time: '10:38 AM', mine: false },
];

export default function Messages() {
  const [selected, setSelected] = useState(contacts[0]);
  const [msg, setMsg] = useState('');
  const [msgs, setMsgs] = useState(mockMessages);
  const [search, setSearch] = useState('');

  const handleSend = () => {
    if (!msg.trim()) return;
    setMsgs(prev => [...prev, { id: prev.length + 1, sender: 'me', text: msg, time: 'now', mine: true }]);
    setMsg('');
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
            {filtered.map(c => (
              <div
                key={c.id}
                onClick={() => setSelected(c)}
                className={`flex items-center gap-3 px-4 py-4 cursor-pointer transition-colors border-b border-slate-50 dark:border-slate-800/50 ${selected.id === c.id ? 'bg-indigo-50 dark:bg-indigo-500/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
              >
                <div className="relative shrink-0">
                  <div className={`w-10 h-10 rounded-xl ${c.color} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>{c.initials}</div>
                  {c.online && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center">
                    <h4 className="text-[13px] font-bold text-slate-800 dark:text-white truncate">{c.name}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0 ml-1">{c.time}</span>
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
        <div className="flex-1 flex flex-col">
          <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${selected.color} text-white flex items-center justify-center font-bold text-xs shadow-sm`}>{selected.initials}</div>
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
            {msgs.map(m => (
              <div key={m.id} className={`flex ${m.mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[72%] px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${m.mine ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'}`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1.5 flex items-center gap-1 justify-end ${m.mine ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {m.time} {m.mine && <CheckCheck size={11} />}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"><Paperclip size={18} /></button>
              <input
                value={msg}
                onChange={e => setMsg(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm border-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-400"><Smile size={18} /></button>
              <button onClick={handleSend} className="p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-lg shadow-indigo-500/25">
                <Send size={18} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
