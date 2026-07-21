import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/Card';
import { Calendar as CalendarIcon, MapPin, Clock, ChevronRight, Image as ImageIcon, Play, Radio } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export default function Events() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('upcoming');

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Re-using the unified admin fetch endpoint for data continuity 
      // (in a full production app, this would be grouped slightly differently)
      const token = localStorage.getItem('token');
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  const now = new Date();
  
  // Members do NOT see Draft events. Only Publisher events.
  const upcomingEvents = events.filter(e => new Date(e.eventDate) >= now && e.status === 'Publish');
  const pastEvents = events.filter(e => new Date(e.eventDate) < now && e.status === 'Publish');

  const activeEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
         <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Events</h1>
           <p className="text-muted-foreground text-sm mt-1">Discover upcoming family gatherings and celebrations.</p>
         </div>
      </div>
      
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
         <button onClick={() => setActiveTab('upcoming')} className={`pb-3 border-b-2 font-bold px-2 transition-colors ${activeTab === 'upcoming' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Upcoming ({upcomingEvents.length})</button>
         <button onClick={() => setActiveTab('past')} className={`pb-3 border-b-2 font-medium px-2 transition-colors ${activeTab === 'past' ? 'border-indigo-600 text-indigo-600 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'}`}>Past Events ({pastEvents.length})</button>
      </div>

      {isLoading ? (
         <div className="py-20 text-center font-bold text-slate-400">Loading Events...</div>
      ) : activeEvents.length === 0 ? (
         <div className="py-20 text-center text-slate-400 font-semibold bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
           No events scheduled. Check back later!
         </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {activeEvents.map((e) => {
             const dateObj = new Date(e.eventDate);
             const month = dateObj.toLocaleString('en-US', { month: 'short' }).toUpperCase();
             const day = dateObj.getDate();
             
             return (
               <Card key={e.id} className="border-0 shadow-sm dark:shadow-none bg-white dark:bg-slate-900 group cursor-pointer hover:-translate-y-1 hover:shadow-xl transition-all duration-300 overflow-hidden rounded-2xl flex flex-col">
                 <div className="h-40 w-full relative overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-300">
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                    {e.bannerImage ? (
                       <img src={e.bannerImage} alt={e.name} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                    ) : ( 
                       <ImageIcon size={40} className="transform group-hover:scale-105 transition-transform duration-700 opacity-50" />
                    )}
                    
                    <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-md dark:bg-slate-900/95 rounded-xl p-2 shadow-lg text-center min-w-[55px] border border-white/50">
                      <div className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">{month}</div>
                      <div className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-0.5">{day}</div>
                    </div>
                    
                    <div className="absolute top-4 right-4 z-20">
                       <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20 shadow-sm">
                         {e.category}
                       </span>
                    </div>
                 </div>
                 
                 <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{e.name}</h3>
                      
                      <div className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-3"><Clock className="h-4 w-4 shrink-0 text-slate-400" /> {dateObj.toLocaleDateString()} at {e.startTime}</div>
                        <div className="flex items-center gap-3"><MapPin className="h-4 w-4 shrink-0 text-slate-400" /> <span className="truncate">{e.venue}, {e.city || e.address}</span></div>
                      </div>
                    </div>
                    
                    <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{e.familyBranch} Branch</span>
                       </div>
                       <div className="text-indigo-600 font-bold text-sm flex items-center">
                          View Details <ChevronRight className="h-4 w-4 ml-1" />
                       </div>
                    </div>
                    
                    {/* Role-Based Virtual Stream Button */}
                    {(e.liveStream && e.streamId) && (
                      <div className="mt-4 w-full">
                         <button 
                           onClick={(ev) => { ev.stopPropagation(); navigate(`/live/${e.streamId}`); }} 
                           className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm shadow-md shadow-blue-500/20"
                         >
                           <Play className="w-4 h-4 fill-current" />
                           Join Virtual Live Stream
                           <span className="flex items-center gap-1.5 ml-2 bg-red-500/20 text-red-100 border border-red-500/50 px-2 py-0.5 rounded-full text-[10px] tracking-wider animate-pulse">
                             <Radio size={10} /> LIVE
                           </span>
                         </button>
                      </div>
                    )}
                 </CardContent>
               </Card>
             );
           })}
        </div>
      )}
    </div>
  );
}
