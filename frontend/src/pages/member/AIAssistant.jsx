import React, { useState } from 'react';
import { Sparkles, Send, User, Loader } from 'lucide-react';

const SUGGESTIONS = [
  '🎂 Write a birthday message for Grandpa Robert',
  '🌴 Suggest family vacation ideas for December',
  '📅 Help me plan the reunion itinerary',
  '💌 Compose an invitation for the anniversary dinner',
  '🌳 Tell me fun facts about our family tree',
  '📸 Caption ideas for our family reunion photos',
];

const RESPONSES = {
  '🎂 Write a birthday message for Grandpa Robert': '🎉 Happy 80th Birthday, Grandpa Robert! 🎂\n\nEighty years of wisdom, warmth, and unconditional love — that\'s what you\'ve given us. You are the pillar of our family, the lighthouse in every storm.  May this decade be filled with joy, good health, and endless laughter surrounded by those who love you most.\n\nWith all our hearts, ❤️ The Smith Family',
  '🌴 Suggest family vacation ideas for December': '🏖 December is perfect for:\n\n1. **Goa, India** – Beaches, seafood, and vibrant Christmas markets!\n2. **Maldives** – Luxury overwater villas for the whole family.\n3. **Shimla, India** – Snow-covered hills and cozy holidays.\n4. **Singapore** – Theme parks, Universal Studios, and Gardens by the Bay.\n\nI recommend Goa for the best value and family-friendly activities! Want me to draft a travel plan? 🗺️',
};

const defaultMessages = [
  { role: 'ai', text: 'Hi Arjun! 👋 I\'m your FamilyHub AI Assistant. I can help you write messages, plan events, discover family history, brainstorm gift ideas, and more. What would you like help with today?' },
];

export default function AIAssistant() {
  const [messages, setMessages] = useState(defaultMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = (text) => {
    const userMsg = text || input.trim();
    if (!userMsg) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);
    setTimeout(() => {
      const response = RESPONSES[userMsg] || `I'd be happy to help with "${userMsg}"! Let me think about the best approach for your family... 🤔\n\nFor a personalized response, this would connect to an AI model like Gemini in production. For now, try one of the suggestion prompts below for a demo!`;
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] min-h-[500px] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-5 shrink-0">
        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
          <Sparkles size={22} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[#1F2430]">AI Assistant</h1>
          <p className="text-slate-500 text-sm mt-0.5">Your smart family companion · Powered by Gemini</p>
        </div>
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-5 shrink-0">
          {SUGGESTIONS.map((s, i) => (
            <button key={i} onClick={() => sendMessage(s)}
              className="bg-white border border-[#E9E5F8] rounded-2xl px-4 py-3.5 text-sm font-medium text-slate-700 text-left hover:border-violet-300 hover:bg-violet-50 transition-all shadow-sm hover:shadow-sm">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Chat */}
      <div className="flex-1 overflow-y-auto bg-white rounded-2xl border border-[#E9E5F8] shadow-sm p-5 space-y-5">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-9 h-9 rounded-[24px] flex items-center justify-center shrink-0 ${msg.role === 'ai' ? 'bg-gradient-to-br from-violet-500 to-indigo-600' : 'bg-gradient-to-br from-blue-500 to-cyan-500'}`}>
              {msg.role === 'ai' ? <Sparkles size={16} className="text-white" /> : <User size={16} className="text-white" />}
            </div>
            <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm font-medium leading-relaxed whitespace-pre-line ${msg.role === 'ai' ? 'bg-[#FCFBFF] text-[#1F2430] rounded-tl-sm' : 'bg-[#7C5CFC] text-white rounded-tr-sm'}`}>
              {msg.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-[24px] bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="text-white" />
            </div>
            <div className="bg-[#FCFBFF] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader size={14} className="text-violet-500 animate-spin" />
              <span className="text-sm text-slate-400 font-medium">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="mt-4 flex gap-3 shrink-0">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
          type="text" placeholder="Ask me anything about the family..." className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-[#E9E5F8] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-violet-500/30 shadow-sm" />
        <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
          className="w-12 h-12 shrink-0 bg-gradient-to-br from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 rounded-2xl flex items-center justify-center text-white transition-all disabled:opacity-40 shadow-sm shadow-violet-500/30">
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
