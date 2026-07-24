import React, { useState, useEffect } from 'react';
import { Megaphone, Globe, ChevronDown, ChevronUp, BarChart2, Check } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';

const API_URL =  `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function Announcements() {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId') || '1';
  const [expanded, setExpanded] = useState(null);
  const [selectedOpt, setSelectedOpt] = useState({});

  useEffect(() => {
    const socket = io(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}`);
    const refresh = () => {
       queryClient.invalidateQueries(['announcements_polls']);
    };
    socket.on('announcement.created', refresh);
    socket.on('poll.created', refresh);
    socket.on('poll.updated', refresh);
    return () => socket.disconnect();
  }, [queryClient]);

  const { data: feed = [], isLoading } = useQuery({
     queryKey: ['announcements_polls'],
     queryFn: async () => {
        const [annRes, pollRes] = await Promise.all([
           axios.get(`${API_URL}/member/announcements`, { headers: { Authorization: `Bearer ${token}` } }),
           axios.get(`${API_URL}/member/polls`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const anns = annRes.data.map(a => ({ ...a, kind: 'announcement' }));
        const polls = pollRes.data.map(p => ({ ...p, kind: 'poll' }));
        
        // Merge and sort
        const merged = [...anns, ...polls].sort((a, b) => {
           // Pinned announcements always first
           if (a.kind === 'announcement' && a.pinned && (!b.pinned)) return -1;
           if (b.kind === 'announcement' && b.pinned && (!a.pinned)) return 1;
           return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        return merged;
     },
     refetchInterval: 30000
  });

  const voteMutation = useMutation({
     mutationFn: async ({pollId, optionId}) => {
        const res = await axios.post(`${API_URL}/member/polls/${pollId}/vote`, { optionId }, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     },
     onSuccess: () => {
        toast.success("Vote recorded!");
        queryClient.invalidateQueries(['announcements_polls']);
     }
  });

  const handleVote = (pollId) => {
    if (!selectedOpt[pollId]) return;
    voteMutation.mutate({ pollId, optionId: selectedOpt[pollId] });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center bg-[#7C5CFC] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Family Bulletins</h1>
          <p className="text-blue-100 text-sm max-w-md font-medium leading-relaxed">Stay updated with the latest family news, important announcements, and ongoing polls from the administrators.</p>
        </div>
        <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-6">
           <Megaphone size={160} />
        </div>
      </div>

      <div className="space-y-5 flex flex-col items-center">
        {isLoading && <div className="p-8 text-center text-slate-500 font-medium w-full">Loading bulletins...</div>}
        {!isLoading && feed.length === 0 && <div className="p-8 text-center text-slate-500 font-medium bg-white rounded-2xl border w-full">No announcements found. You're all caught up!</div>}
        
        {feed.map(item => {
          if (item.kind === 'announcement') {
             return (
               <div key={`ann_${item.id}`} className={`bg-white w-full rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-sm ${item.pinned ? 'border-[#7C5CFC]/20 ' : 'border-[#E9E5F8] '}`}>
                 {item.pinned && (
                   <div className="bg-[#FAF8FF] border-b border-blue-100 px-5 py-2 flex items-center gap-2">
                     <Megaphone size={14} className="text-[#7C5CFC]" />
                     <span className="text-xs font-bold text-[#7C5CFC] uppercase tracking-wider">Pinned Announcement</span>
                   </div>
                 )}
                 <div className="p-6">
                   <div className="flex items-start justify-between gap-4">
                     <div className="flex items-start gap-4 flex-1 min-w-0">
                       <img src={item.author?.avatar || `https://ui-avatars.com/api/?name=${item.author?.firstName}+${item.author?.lastName}`} className="w-12 h-12 rounded-[24px] object-cover shadow-sm shrink-0" alt="" />
                       <div className="min-w-0 flex-1">
                         <div className="flex items-center gap-2 flex-wrap mb-1">
                           <h3 className="font-bold text-[#1F2430] text-lg">{item.title}</h3>
                         </div>
                         <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                           <span className="text-slate-700 font-bold">{item.author?.firstName} {item.author?.lastName}</span>
                           <span>·</span>
                           <span>{new Date(item.createdAt).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric'})}</span>
                           <span>·</span>
                           <div className="flex items-center gap-1 bg-[#FAF8FF] px-2 py-0.5 rounded text-[10px] uppercase font-bold"><Globe size={10} /> {item.targetType}</div>
                         </div>
                       </div>
                     </div>
                   </div>

                   <div className={`mt-5 text-[15px] text-slate-700 font-medium leading-relaxed whitespace-pre-wrap ${expanded === item.id ? '' : 'line-clamp-3'}`}>
                     {item.message}
                   </div>
                   
                   {item.message && item.message.length > 200 && (
                      <button onClick={() => setExpanded(expanded === item.id ? null : item.id)} className="mt-2 flex items-center gap-1 text-xs font-bold text-[#7C5CFC] hover:text-[#2E1E6B] transition-colors bg-[#FAF8FF] px-3 py-1.5 rounded-[20px]">
                        {expanded === item.id ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read full story</>}
                      </button>
                   )}
                 </div>
               </div>
             );
          }

          if (item.kind === 'poll') {
             const votesMap = item.votes || {};
             const totalVotes = Object.keys(votesMap).length;
             const hasVotedLocal = !!votesMap[userId] || localStorage.getItem(`voted_${item.id}`);
             const active = new Date(item.endDate) > new Date();
             const pStatus = active ? 'active' : 'closed';
             
             const optionCounts = {};
             item.options.forEach(opt => optionCounts[opt.id] = 0);
             Object.values(votesMap).forEach(oid => {
                if (optionCounts[oid] !== undefined) optionCounts[oid]++;
             });
             
             const maxVotes = Math.max(...Object.values(optionCounts), 0);

             return (
                <div key={`poll_${item.id}`} className="bg-white rounded-2xl w-full border border-[#E9E5F8] shadow-sm p-6 hover:shadow-sm transition-shadow">
                  <div className="flex items-start justify-between gap-3 mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${pStatus === 'active' ? 'bg-emerald-100 text-emerald-700 ' : 'bg-[#FAF8FF] text-slate-500 '}`}>
                          {pStatus === 'active' ? '🟢 Active Poll' : '⚫ Closed Poll'}
                        </span>
                        <span className="text-xs text-slate-400">Ends {new Date(item.endDate).toLocaleDateString()}</span>
                      </div>
                      <h3 className="font-bold text-[#1F2430] text-lg leading-snug">{item.question}</h3>
                      <p className="text-xs text-slate-400 mt-1">by {item.author?.firstName || 'Admin'} · {totalVotes} votes</p>
                    </div>
                    <div className="w-12 h-12 bg-[#FAF8FF] rounded-[24px] flex items-center justify-center">
                       <BarChart2 size={24} className="text-[#7C5CFC]" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    {item.options.map((opt) => {
                      const vCount = optionCounts[opt.id] || 0;
                      const pct = totalVotes === 0 ? 0 : Math.round((vCount / totalVotes) * 100);
                      const isWinner = vCount === maxVotes && maxVotes > 0 && (hasVotedLocal || pStatus === 'closed');
                      const isSelected = selectedOpt[item.id] === opt.id;
                      const isMyVote = votesMap[userId] === opt.id || localStorage.getItem(`voted_${item.id}_opt`) === String(opt.id);

                      return (
                        <div key={opt.id}
                          onClick={() => !hasVotedLocal && pStatus === 'active' && setSelectedOpt(prev => ({ ...prev, [item.id]: opt.id }))}
                          className={`relative rounded-[24px] overflow-hidden border transition-all cursor-pointer ${isSelected && !hasVotedLocal ? 'border-blue-400 shadow-sm shadow-blue-500/10' : 'border-[#E9E5F8]'}`}
                        >
                          <div className={`absolute inset-y-0 left-0 rounded-[24px] transition-all duration-500 ${isWinner ? 'bg-blue-100 ' : 'bg-[#FCFBFF] '}`}
                            style={{ width: (hasVotedLocal || pStatus === 'closed') ? `${pct}%` : '0%' }}
                          />
                          <div className="relative flex items-center justify-between px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${isMyVote ? 'bg-[#7C5CFC] border-blue-600' : isSelected ? 'border-blue-400' : 'border-slate-300 '}`}>
                                {isMyVote && <Check size={11} className="text-white" />}
                              </div>
                              <span className={`text-[15px] font-semibold ${isWinner && (hasVotedLocal || pStatus === 'closed') ? 'text-[#2E1E6B] ' : 'text-slate-700 '}`}>{opt.text}</span>
                            </div>
                            {(hasVotedLocal || pStatus === 'closed') && (
                              <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                                <span>{vCount} votes</span>
                                <span className={`${isWinner ? 'text-[#7C5CFC]' : ''} w-10 text-right`}>{pct}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {pStatus === 'active' && !hasVotedLocal && (
                    <button onClick={() => {
                       handleVote(item.id);
                       localStorage.setItem(`voted_${item.id}`, 'true');
                       localStorage.setItem(`voted_${item.id}_opt`, selectedOpt[item.id]);
                    }} disabled={selectedOpt[item.id] === undefined || voteMutation.isPending}
                      className={`w-full mt-5 py-3 rounded-[24px] text-sm font-bold transition-all ${selectedOpt[item.id] !== undefined ? 'bg-[#7C5CFC] text-white hover:bg-blue-700 shadow-sm shadow-blue-500/30' : 'bg-[#FAF8FF] text-slate-400 cursor-not-allowed'}`}>
                      {voteMutation.isPending ? 'Recording...' : 'Cast Vote'}
                    </button>
                  )}
                  {hasVotedLocal && (
                    <div className="mt-5 py-3 bg-emerald-50 rounded-[24px] flex justify-center border border-emerald-100">
                       <p className="text-sm font-bold text-emerald-600 flex items-center gap-2"><Check size={16}/> You have cast your vote</p>
                    </div>
                  )}
                </div>
             );
          }
         })}
      </div>
    </div>
  );
}
