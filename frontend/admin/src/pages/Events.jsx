import React from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar as CalendarIcon, MapPin, Users, Plus, Clock, ChevronRight } from 'lucide-react';

export default function Events() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-end">
         <div>
           <h1 className="text-3xl font-bold tracking-tight">Family Events</h1>
           <p className="text-muted-foreground text-sm mt-1">Plan, manage, and celebrate together.</p>
         </div>
         <Button className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 rounded-full px-6">
           <Plus className="h-4 w-4 mr-2" /> Create Event
         </Button>
      </div>
      
      <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800 pb-px">
         <button className="pb-3 border-b-2 border-indigo-600 text-indigo-600 font-bold px-2">Upcoming</button>
         <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium px-2">Past Events</button>
         <button className="pb-3 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 font-medium px-2">Drafts</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
         {[
           { title: "Summer Family Reunion 2026", date: "Aug 15", fullDate: "August 15, 2026", time: "10:00 AM", location: "Central Park, NY", attendees: 45, type: "Reunion", bg: "from-blue-600 to-cyan-500", cover: "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500&h=300&fit=crop" },
           { title: "Grandpa's 80th Birthday Bash", date: "Sep 02", fullDate: "September 2, 2026", time: "6:00 PM", location: "Family Estate, LA", attendees: 120, type: "Birthday", bg: "from-purple-600 to-pink-500", cover: "https://images.unsplash.com/photo-1530103862676-de8892cb7370?w=500&h=300&fit=crop" },
           { title: "10th Anniversary Dinner", date: "Oct 12", fullDate: "October 12, 2026", time: "7:00 PM", location: "The Ritz Carlton", attendees: 30, type: "Anniversary", bg: "from-amber-500 to-orange-500", cover: "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=500&h=300&fit=crop" },
         ].map((e, idx) => (
           <Card key={idx} className="border-0 shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none bg-white dark:bg-slate-900 group cursor-pointer hover:-translate-y-1 transition-all duration-300 overflow-hidden rounded-2xl flex flex-col">
             <div className="h-40 w-full relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors z-10"></div>
                <img src={e.cover} alt={e.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-in-out" />
                <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md dark:bg-slate-900/90 rounded-xl p-2 shadow-lg text-center min-w-[55px] border border-white/50">
                  <div className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{e.date.split(" ")[0]}</div>
                  <div className="text-2xl font-black text-slate-800 dark:text-white leading-none mt-0.5">{e.date.split(" ")[1]}</div>
                </div>
                <div className="absolute top-4 right-4 z-20">
                   <span className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold border border-white/20 shadow-sm">
                     {e.type}
                   </span>
                </div>
             </div>
             
             <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-3 text-slate-800 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{e.title}</h3>
                  
                  <div className="space-y-2.5 text-sm font-medium text-slate-600 dark:text-slate-400">
                    <div className="flex items-center gap-3"><Clock className="h-4 w-4 text-slate-400" /> {e.fullDate} at {e.time}</div>
                    <div className="flex items-center gap-3"><MapPin className="h-4 w-4 text-slate-400" /> {e.location}</div>
                  </div>
                </div>
                
                <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900 overflow-hidden">
                             <img src={`https://i.pravatar.cc/100?img=${idx*3+i}`} alt="user" />
                           </div>
                        ))}
                      </div>
                      <span className="text-xs font-semibold text-slate-500">+{e.attendees - 3} attending</span>
                   </div>
                   <Button variant="ghost" size="icon" className="group-hover:bg-indigo-50 text-indigo-600 rounded-full h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                   </Button>
                </div>
             </CardContent>
           </Card>
         ))}
      </div>
    </div>
  );
}
