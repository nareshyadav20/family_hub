import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Video, ShieldAlert, WifiOff } from 'lucide-react';

export default function LiveStreamPage() {
  const { streamId } = useParams();
  const navigate = useNavigate();

  const { data: event, isLoading, isError, error } = useQuery({
    queryKey: ['live_stream', streamId],
    queryFn: async () => {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(
        `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/events/live/${streamId}`,
        { headers }
      );
      return res.data;
    },
    retry: false
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400">
        <div className="w-12 h-12 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin mb-6"></div>
        <p className="font-bold tracking-widest uppercase text-sm">Connecting to Stream Data...</p>
      </div>
    );
  }

  if (isError || !event) {
    const errorMsg = error?.response?.data?.error || 'Secure Stream Not Found or Disconnected';
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <div className="text-white font-black text-2xl md:text-3xl text-center mb-2">Access Denied</div>
        <p className="text-slate-400 font-medium text-center max-w-md bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8">{errorMsg}</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-[#2563EB] hover:bg-blue-600 rounded-xl font-bold text-white transition shadow-lg">Go Back</button>
      </div>
    );
  }

  const now = new Date();
  let isEventCompleted = false;
  if (event.eventDate && event.endTime) {
    const endDateTime = new Date(event.eventDate);
    const [hours, minutes] = event.endTime.split(':');
    if (!isNaN(parseInt(hours)) && !isNaN(parseInt(minutes))) {
      endDateTime.setHours(parseInt(hours), parseInt(minutes), 0);
      if (now > endDateTime) {
        isEventCompleted = true;
      }
    }
  }

  if (isEventCompleted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-4">
        <WifiOff size={64} className="text-slate-500 mb-6" />
        <div className="text-white font-black text-2xl md:text-3xl text-center mb-2">Event is completed</div>
        <p className="text-slate-400 font-medium text-center max-w-md bg-slate-900 p-4 rounded-xl border border-slate-800 mb-8">The live stream for this event has ended.</p>
        <button onClick={() => navigate(-1)} className="px-8 py-3 bg-[#2563EB] hover:bg-blue-600 rounded-xl font-bold text-white transition shadow-lg">Go Back</button>
      </div>
    );
  }

  // Jitsi configuration fragments
  const config = [
    'config.disableDeepLinking=true',
    'config.prejoinPageEnabled=false',
    `config.disableChat=${!event.liveChat}`,
  ].join('&');

  // Name attachment
  const userStr = localStorage.getItem('user');
  let displayName = 'Guest';
  if (userStr) {
     try {
       const user = JSON.parse(userStr);
       displayName = user.firstName + ' ' + (user.lastName || '');
     } catch (e) {}
  }
  const userInfo = `userInfo.displayName="${displayName}"`;

  const jitsiUrl = `https://meet.jit.si/${streamId}#${config}&${userInfo}`;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition">
              <ArrowLeft size={18} className="text-slate-300" />
            </button>
            <div>
               <h1 className="font-bold text-slate-100 flex items-center gap-2">
                 <Video size={16} className="text-[#2563EB]" /> {event.name}
               </h1>
               <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500">{event.category} • Host: {event.organizerId}</p>
            </div>
         </div>
         <div className="flex items-center gap-4">
            {event.recordEvent && (
              <span className="hidden md:flex items-center gap-1.5 text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Recording Enabled
              </span>
            )}
            <span className="flex items-center gap-2 text-xs font-bold text-red-500 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/30 animate-pulse tracking-widest">
               <div className="w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_#ef4444]"></div> SECURE LIVE
            </span>
         </div>
      </header>
      
      <main className="flex-1 w-full bg-black relative">
         <iframe
           src={jitsiUrl}
           className="absolute inset-0 w-full h-full"
           allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write; clipboard-read"
           style={{ border: 'none' }}
           title="FamilyHub Secure Stream"
         ></iframe>
      </main>
    </div>
  );
}
