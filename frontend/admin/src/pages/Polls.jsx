import React, { useState } from 'react';
import { BarChart2, Plus, Check, X } from 'lucide-react';

const mockPolls = [
  {
    id: 1, question: 'Where should we vacation in December 2026?', createdBy: 'Arjun Mehta', createdAt: 'July 5, 2026', endDate: 'July 20, 2026',
    totalVotes: 14, status: 'active',
    options: [
      { label: 'Goa, India', votes: 5 },
      { label: 'Maldives', votes: 4 },
      { label: 'Switzerland', votes: 3 },
      { label: 'Dubai, UAE', votes: 2 },
    ],
  },
  {
    id: 2, question: 'What theme should we pick for the Annual Reunion?', createdBy: 'Sarah Smith', createdAt: 'June 28, 2026', endDate: 'July 10, 2026',
    totalVotes: 18, status: 'closed',
    options: [
      { label: 'Roots & Branches 🌳', votes: 10 },
      { label: 'Golden Memories ✨', votes: 5 },
      { label: 'New Beginnings 🌅', votes: 3 },
    ],
  },
  {
    id: 3, question: 'Which day is best for the monthly family video call?', createdBy: 'Arjun Mehta', createdAt: 'June 15, 2026', endDate: 'June 22, 2026',
    totalVotes: 12, status: 'closed',
    options: [
      { label: 'Sunday evening', votes: 7 },
      { label: 'Saturday morning', votes: 3 },
      { label: 'Friday night', votes: 2 },
    ],
  },
  {
    id: 4, question: 'What should we gift Grandpa for his 80th birthday?', createdBy: 'Emily Smith', createdAt: 'July 1, 2026', endDate: 'July 25, 2026',
    totalVotes: 9, status: 'active',
    options: [
      { label: 'Custom photo album', votes: 4 },
      { label: 'A family trip', votes: 3 },
      { label: 'Smart watch', votes: 2 },
    ],
  },
];

export default function Polls() {
  const [voted, setVoted] = useState({});
  const [selected, setSelected] = useState({});
  const [showModal, setShowModal] = useState(false);

  const handleVote = (pollId) => {
    if (!selected[pollId]) return;
    setVoted(prev => ({ ...prev, [pollId]: selected[pollId] }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Polls</h1>
          <p className="text-slate-500 text-sm mt-1">Gather opinions and make decisions together.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30 cursor-pointer">
          <Plus size={16} /> Create Poll
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        {mockPolls.map(poll => {
          const isVoted = !!voted[poll.id];
          const maxVotes = Math.max(...poll.options.map(o => o.votes));
          const winnerIdx = poll.options.findIndex(o => o.votes === maxVotes);

          return (
            <div key={poll.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${poll.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {poll.status === 'active' ? '🟢 Active' : '⚫ Closed'}
                    </span>
                    <span className="text-xs text-slate-400">Ends {poll.endDate}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug">{poll.question}</h3>
                  <p className="text-xs text-slate-400 mt-1">by {poll.createdBy} · {poll.totalVotes} votes</p>
                </div>
                <BarChart2 size={22} className="text-slate-300 dark:text-slate-700 shrink-0 mt-1" />
              </div>

              <div className="space-y-3">
                {poll.options.map((opt, idx) => {
                  const pct = Math.round((opt.votes / poll.totalVotes) * 100);
                  const isWinner = idx === winnerIdx && (isVoted || poll.status === 'closed');
                  const isSelected = selected[poll.id] === idx;
                  const isMyVote = voted[poll.id] === idx;

                  return (
                    <div key={idx}
                      onClick={() => !isVoted && poll.status === 'active' && setSelected(prev => ({ ...prev, [poll.id]: idx }))}
                      className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer ${isSelected && !isVoted ? 'border-blue-400 shadow-sm shadow-blue-500/20' : 'border-transparent'}`}
                    >
                      {/* Progress bar background */}
                      <div className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-500 ${isWinner ? 'bg-blue-100 dark:bg-blue-500/10' : 'bg-slate-50 dark:bg-slate-800/60'}`}
                        style={{ width: (isVoted || poll.status === 'closed') ? `${pct}%` : '0%' }}
                      />
                      <div className="relative flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${isMyVote ? 'bg-blue-600 border-blue-600' : isSelected ? 'border-blue-400' : 'border-slate-300 dark:border-slate-600'}`}>
                            {isMyVote && <Check size={11} className="text-white" />}
                          </div>
                          <span className={`text-sm font-semibold ${isWinner && (isVoted || poll.status === 'closed') ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{opt.label}</span>
                        </div>
                        {(isVoted || poll.status === 'closed') && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>{opt.votes} votes</span>
                            <span className={`${isWinner ? 'text-blue-600' : ''}`}>{pct}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {poll.status === 'active' && !isVoted && (
                <button onClick={() => handleVote(poll.id)} disabled={selected[poll.id] === undefined}
                  className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selected[poll.id] !== undefined ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                  Submit Vote
                </button>
              )}
              {isVoted && (
                <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-4">✓ You voted!</p>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Poll</h2>
              <div className="space-y-4">
                <input type="text" placeholder="What is your question?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" />
                
                <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 ml-1">Options</p>
                   <input type="text" placeholder="Option 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   <input type="text" placeholder="Option 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   <input type="text" placeholder="Option 3 (Optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                </div>
                
                <div className="flex gap-4">
                   <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 ml-1 mb-1">End Date</p>
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                 <button onClick={() => { alert('Poll published successfully!'); setShowModal(false); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-500/20">Create Poll</button>
                 <button onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
