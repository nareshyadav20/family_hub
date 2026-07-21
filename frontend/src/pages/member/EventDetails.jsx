import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Calendar, Clock, MapPin, ArrowLeft, Video, Radio, Ticket } from 'lucide-react';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['member_event', id],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    }
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-slate-400">
        <div className="w-10 h-10 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="font-bold">Loading event details...</p>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-red-500 font-bold text-xl">Event not found or unauthorized!</div>
        <button onClick={() => navigate(-1)} className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 transition">Go Back</button>
      </div>
    );
  }

  const dateObj = new Date(event.eventDate);
  const formattedDate = dateObj.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  let isStreamEnded = false;
  if (event.endTime) {
     const [hours, minutes] = event.endTime.split(':');
     const endDateTime = new Date(dateObj);
     if (!isNaN(parseInt(hours)) && !isNaN(parseInt(minutes))) {
        endDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
        if (new Date() > endDateTime) {
           isStreamEnded = true;
        }
     }
  }

  return (
    <div className="max-w-6xl mx-auto pb-32 animate-in fade-in duration-500 pt-4 px-4 md:px-0">
      <button onClick={() => navigate('/member/dashboard/events')} className="flex items-center gap-2 text-slate-500 hover:text-[#2563EB] font-bold text-sm mb-6 transition-colors group">
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Events
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-[24px] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden mb-8">
        <div className="h-48 md:h-80 w-full relative bg-slate-100 dark:bg-slate-800">
          {event.bannerImage ? (
            <img src={event.bannerImage} alt={event.name} className="w-full h-full object-cover object-center" />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#2563EB] to-indigo-800 flex items-center justify-center">
               <Calendar size={64} className="text-white/20" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-sm border border-white/20">
              {event.category}
            </span>
          </div>
        </div>

        <div className="p-8 md:p-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white capitalize leading-tight">{event.name}</h1>
              <div className="flex items-center gap-3 mt-3">
                 <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider rounded-lg">{event.familyBranch} Branch</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 border-y border-slate-100 dark:border-slate-800 py-8">
            <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center text-[#2563EB] shrink-0">
                  <Calendar size={20} />
               </div>
               <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Date</h3>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{formattedDate}</p>
               </div>
            </div>
            
            <div className="flex items-start gap-4">
               <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
                  <Clock size={20} />
               </div>
               <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Time</h3>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{event.startTime} {event.endTime ? `- ${event.endTime}` : ''}</p>
               </div>
            </div>

            <div className="flex items-start gap-4 lg:col-span-2">
               <div className="w-12 h-12 bg-[#FACC15]/10 rounded-xl flex items-center justify-center text-[#eab308] shrink-0">
                  <MapPin size={20} />
               </div>
               <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-1">Location</h3>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{event.venue}</p>
                  <p className="text-sm font-medium text-slate-500 mt-0.5">{event.address}, {event.city}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-8">
               
               {event.recordedUrl ? (
                 <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-4">
                   <div className="flex items-center gap-2 mb-4">
                     <span className="bg-slate-800 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center shadow-sm tracking-widest">
                       RECORDED
                     </span>
                     <h2 className="text-xl font-bold text-slate-800 dark:text-white">Official FamilyHub Recording</h2>
                   </div>
                   
                   <div className="w-full aspect-video rounded-lg overflow-hidden bg-black shadow-inner border border-slate-800">
                     <iframe 
                       width="100%" height="100%" 
                       src={event.recordedUrl.includes("watch?v=") ? event.recordedUrl.replace("watch?v=", "embed/") : event.recordedUrl} 
                       title="FamilyHub Recorded Stream" 
                       frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
                     </iframe>
                   </div>
                 </div>
               ) : (
                 event.liveStream && event.streamUrl ? (
                   isStreamEnded ? (
                     <div className="mt-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center shadow-sm">
                        <Video size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
                        <h2 className="text-xl font-bold text-slate-700 dark:text-white mb-2">Live Stream Ended</h2>
                        <p className="text-sm text-slate-500 font-medium max-w-md">The stream originally scheduled until {event.endTime} has automatically closed. A recording may be uploaded soon by the organizer.</p>
                     </div>
                   ) : (
                     <div className="mt-6 bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-800 p-4">
                       <div className="flex items-center gap-3 mb-4">
                         <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold flex items-center gap-1.5 animate-pulse shadow-sm">
                           <Radio size={12} /> LIVE NOW
                         </span>
                         {event.liveChat && <span className="bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full font-bold">CHAT ENABLED</span>}
                         <h2 className="text-xl font-bold text-slate-800 dark:text-white">Official FamilyHub Live Stream</h2>
                       </div>
                       
                       <div className={`grid gap-4 ${event.liveChat ? 'grid-cols-1 lg:grid-cols-3' : 'grid-cols-1'}`}>
                         <div className={`w-full aspect-video rounded-lg overflow-hidden bg-black shadow-inner border border-slate-800 ${event.liveChat ? 'lg:col-span-2' : ''}`}>
                           <iframe 
                             width="100%" height="100%" 
                             src={event.streamUrl.includes("watch?v=") ? event.streamUrl.replace("watch?v=", "embed/") + "?autoplay=1" : event.streamUrl + "?autoplay=1"} 
                             title="FamilyHub Live Stream" 
                             frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen>
                           </iframe>
                         </div>
                         
                         {event.liveChat && (
                           <div className="w-full h-[400px] lg:h-auto rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900">
                             <iframe
                               width="100%" height="100%"
                               src={`https://www.youtube.com/live_chat?v=${event.streamUrl.split('v=')[1]?.split('&')[0] || ''}&embed_domain=${window.location.hostname === 'localhost' ? 'localhost' : window.location.hostname}`}
                               frameBorder="0">
                             </iframe>
                           </div>
                         )}
                       </div>
                     </div>
                   )
                 ) : null
               )}

               <section>
                 <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">About the Event</h2>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                   {event.description || "No description provided."}
                 </p>
               </section>
            </div>

            <div className="space-y-6">
              {event.rsvpEnabled && (
                 <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
                   <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Ticket size={18} className="text-[#2563EB]" /> RSVP to Event
                   </h3>
                   <div className="space-y-4">
                     <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        Your RSVP is requested for this event. Do you plan to attend?
                     </p>
                     <div className="grid grid-cols-2 gap-3 pt-2">
                        <button className="bg-[#2563EB] hover:bg-blue-700 text-white font-bold py-2 rounded-xl text-sm transition-colors shadow">Attending</button>
                        <button className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2 rounded-xl text-sm transition-colors">Decline</button>
                     </div>
                   </div>
                 </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
