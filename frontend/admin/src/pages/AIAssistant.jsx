import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Bot, User, Lightbulb } from 'lucide-react';

const initialMsgs = [
  { role: 'assistant', text: "Hello! I'm your FamilyHub AI Assistant. I can help you manage events, find members, get insights about family finances, or answer questions about your family tree. How can I help today?" },
];

const suggestions = [
  "How many members joined this month?",
  "What are the upcoming events?",
  "Show me the family net worth summary",
  "Who has a birthday next?",
  "How much storage is used?",
];

const aiReplies = [
  "Based on the Smith family data, 3 new members joined this month — Noah Smith, Priya Mehta, and David Lee. Total active members: 247.",
  "You have 3 upcoming events: Summer Reunion (Aug 15), Grandma's 75th Birthday (Sep 2), and James & Sarah's 25th Anniversary (Oct 12).",
  "Family net worth stands at $3,125,000. Properties: $2,050,000 · Vehicles: $280,000 · Investments: $795,000. Growth of +8.4% this year.",
  "Grandpa Robert's birthday is in 3 days (July 14)! Emily Smith's birthday is on July 28. Would you like me to send birthday reminders to the family?",
  "Current storage usage is 14.1 GB of documents in your Digital Vault, plus 4.2 GB in private gallery. Total: 18.3 GB used.",
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(initialMsgs);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [replyIdx, setReplyIdx] = useState(0);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = (text = input) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setTimeout(() => {
      const reply = aiReplies[replyIdx % aiReplies.length];
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
      setReplyIdx(i => i + 1);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">AI Assistant</h1>
          <p className="text-slate-500 text-sm">Powered by FamilyHub Intelligence</p>
        </div>
      </div>

      <div className="grid grid-cols-[1fr_280px] gap-6 items-start">
        {/* Chat */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col" style={{ height: 580 }}>
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}>
                {m.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md">
                    <Bot size={15} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-br-md' : 'bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'}`}>
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shrink-0 shadow-md">
                    <User size={15} className="text-white" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot size={15} className="text-white" />
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md flex items-center gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 bg-slate-400 rounded-full" style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything about your family..."
              className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 transition-all"
            />
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40 shadow-lg shadow-violet-500/25"
            >
              <Send size={18} />
            </button>
          </div>
        </div>

        {/* Suggestions panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
            <Lightbulb size={16} className="text-amber-500" /> Suggested Questions
          </h3>
          <div className="space-y-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => send(s)}
                className="w-full text-left px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 hover:text-indigo-600 text-sm font-medium text-slate-600 dark:text-slate-400 transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-500/20"
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 rounded-xl border border-violet-100 dark:border-violet-500/20">
            <div className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-1">AI Capabilities</div>
            <ul className="text-xs text-violet-600/70 dark:text-violet-400/60 space-y-1">
              <li>• Member insights & stats</li>
              <li>• Event recommendations</li>
              <li>• Finance summaries</li>
              <li>• Document search help</li>
              <li>• Family tree queries</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
