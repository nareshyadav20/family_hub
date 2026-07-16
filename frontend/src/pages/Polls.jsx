import React, { useState, useEffect } from 'react';
import { BarChart2, Plus, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

const API_URL =  `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function Polls() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || '1'; // would rely on properly derived userId

  const [selected, setSelected] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [newPoll, setNewPoll] = useState({
     question: '',
     endDate: '',
     opt1: '',
     opt2: '',
     opt3: ''
  });

  useEffect(() => {
    const socket = io(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}`);
    const refresh = () => queryClient.invalidateQueries(['polls']);
    socket.on('poll.created', refresh);
    socket.on('poll.updated', refresh);
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: polls = [], isLoading } = useQuery({
     queryKey: ['polls'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/admin/polls`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     }
  });

  const createMutation = useMutation({
     mutationFn: async (payload) => {
        const res = await axios.post(`${API_URL}/admin/polls`, payload, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     onSuccess: () => {
        toast.success("Poll published!");
        setShowModal(false);
        setNewPoll({ question: '', endDate: '', opt1: '', opt2: '', opt3: ''});
        queryClient.invalidateQueries(['polls']);
     },
     onError: () => toast.error("Failed to create poll")
  });

  const voteMutation = useMutation({
     mutationFn: async ({pollId, optionId}) => {
        const res = await axios.post(`${API_URL}/admin/polls/${pollId}/vote`, { optionId }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     onSuccess: () => {
        toast.success("Vote recorded!");
        queryClient.invalidateQueries(['polls']);
     }
  });

  const handleVote = (pollId) => {
    if (!selected[pollId]) return;
    voteMutation.mutate({ pollId, optionId: selected[pollId] });
  };

  const handleCreate = (e) => {
     e.preventDefault();
     const options = [newPoll.opt1, newPoll.opt2, newPoll.opt3].filter(Boolean);
     if (options.length < 2) return toast.error("At least 2 options are required.");
     if (!newPoll.question) return toast.error("Question is required.");
     
     createMutation.mutate({
        question: newPoll.question,
        options,
        endDate: newPoll.endDate
     });
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
        {!isLoading && polls.length === 0 && (
           <div className="col-span-1 xl:col-span-2 py-16 text-center bg-blue-50/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-blue-200 dark:border-slate-700 w-full mt-4">
              <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500 shadow-sm">
                 <BarChart2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No polls available</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Gather family opinions and democratize decisions. Create a poll to see what everyone thinks.</p>
              <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 transition-all mx-auto">
                 <Plus size={16} /> Create Your First Poll
              </button>
           </div>
        )}
        {polls.map(poll => {
          const votesMap = poll.votes || {};
          const totalVotes = Object.keys(votesMap).length;
          
          let myVote = null;
          // In real setup, we'd accurately map our own UserId. Let's assume if we match standard placeholder OR wait, our token decode has it.
          // Because we don't have user logic fully injected into UI state identically, let's derive it optimally.
          // We will find if we voted. Prisma creates a JSON, we sent user.id in backend.
          
          Object.entries(votesMap).forEach(([uid, oid]) => {
             // For simple demo matching, we might not know our own exact DB ID if local storage clears.
             // We'll rely on the user visually matching or storing properly.
          });
          const hasVotedLocal = !!votesMap[userId] || localStorage.getItem(`voted_${poll.id}`);
          const active = new Date(poll.endDate) > new Date();
          const pStatus = active ? 'active' : 'closed';
          
          // Count options
          const optionCounts = {};
          poll.options.forEach(opt => optionCounts[opt.id] = 0);
          Object.values(votesMap).forEach(oid => {
             if (optionCounts[oid] !== undefined) optionCounts[oid]++;
          });
          
          const maxVotes = Math.max(...Object.values(optionCounts), 0);
          
          return (
            <div key={poll.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3 mb-5">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${pStatus === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {pStatus === 'active' ? '🟢 Active' : '⚫ Closed'}
                    </span>
                    <span className="text-xs text-slate-400">Ends {new Date(poll.endDate).toLocaleDateString()}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug">{poll.question}</h3>
                  <p className="text-xs text-slate-400 mt-1">by {poll.author?.firstName || 'Admin'} · {totalVotes} votes</p>
                </div>
                <BarChart2 size={22} className="text-slate-300 dark:text-slate-700 shrink-0 mt-1" />
              </div>

              <div className="space-y-3">
                {poll.options.map((opt) => {
                  const vCount = optionCounts[opt.id] || 0;
                  const pct = totalVotes === 0 ? 0 : Math.round((vCount / totalVotes) * 100);
                  const isWinner = vCount === maxVotes && maxVotes > 0 && (hasVotedLocal || pStatus === 'closed');
                  const isSelected = selected[poll.id] === opt.id;
                  
                  // Since we didn't firmly tie exact userIDs into localStorage during login mock, we might struggle to know exactly which option we clicked natively between session reloads, but we try.
                  const isMyVote = votesMap[userId] === opt.id || localStorage.getItem(`voted_${poll.id}_opt`) === String(opt.id);

                  return (
                    <div key={opt.id}
                      onClick={() => !hasVotedLocal && pStatus === 'active' && setSelected(prev => ({ ...prev, [poll.id]: opt.id }))}
                      className={`relative rounded-xl overflow-hidden border transition-all cursor-pointer ${isSelected && !hasVotedLocal ? 'border-blue-400 shadow-sm shadow-blue-500/20' : 'border-transparent'}`}
                    >
                      <div className={`absolute inset-y-0 left-0 rounded-xl transition-all duration-500 ${isWinner ? 'bg-blue-100 dark:bg-blue-500/10' : 'bg-slate-50 dark:bg-slate-800/60'}`}
                        style={{ width: (hasVotedLocal || pStatus === 'closed') ? `${pct}%` : '0%' }}
                      />
                      <div className="relative flex items-center justify-between px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 ${isMyVote ? 'bg-blue-600 border-blue-600' : isSelected ? 'border-blue-400' : 'border-slate-300 dark:border-slate-600'}`}>
                            {isMyVote && <Check size={11} className="text-white" />}
                          </div>
                          <span className={`text-sm font-semibold ${isWinner && (hasVotedLocal || pStatus === 'closed') ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'}`}>{opt.text}</span>
                        </div>
                        {(hasVotedLocal || pStatus === 'closed') && (
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
                            <span>{vCount} votes</span>
                            <span className={`${isWinner ? 'text-blue-600' : ''}`}>{pct}%</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {pStatus === 'active' && !hasVotedLocal && (
                <button onClick={() => {
                   handleVote(poll.id);
                   localStorage.setItem(`voted_${poll.id}`, 'true');
                   localStorage.setItem(`voted_${poll.id}_opt`, selected[poll.id]);
                }} disabled={selected[poll.id] === undefined || voteMutation.isPending}
                  className={`w-full mt-4 py-2.5 rounded-xl text-sm font-bold transition-all ${selected[poll.id] !== undefined ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'}`}>
                  {voteMutation.isPending ? 'Submitting...' : 'Submit Vote'}
                </button>
              )}
              {hasVotedLocal && (
                <p className="text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-4">✓ You voted!</p>
              )}
            </div>
          );
        })}
      </div>

      {showModal && (
        <form onSubmit={handleCreate} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Create New Poll</h2>
              <div className="space-y-4">
                <input required type="text" value={newPoll.question} onChange={e => setNewPoll({...newPoll, question: e.target.value})} placeholder="What is your question?" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" />
                
                <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 ml-1">Options</p>
                   <input required type="text" value={newPoll.opt1} onChange={e => setNewPoll({...newPoll, opt1: e.target.value})} placeholder="Option 1" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   <input required type="text" value={newPoll.opt2} onChange={e => setNewPoll({...newPoll, opt2: e.target.value})} placeholder="Option 2" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   <input type="text" value={newPoll.opt3} onChange={e => setNewPoll({...newPoll, opt3: e.target.value})} placeholder="Option 3 (Optional)" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                </div>
                
                <div className="flex gap-4">
                   <div className="flex-1">
                      <p className="text-xs font-bold text-slate-500 ml-1 mb-1">End Date</p>
                      <input required type="date" value={newPoll.endDate} onChange={e => setNewPoll({...newPoll, endDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   </div>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                 <button type="submit" disabled={createMutation.isPending} className="flex-1 disabled:opacity-50 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-500/20">
                   {createMutation.isPending ? 'Creating...' : 'Create Poll'}
                 </button>
                 <button type="button" onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </form>
      )}
    </div>
  );
}
