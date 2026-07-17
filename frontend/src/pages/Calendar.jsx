import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus, RefreshCw, Calendar as CalendarIcon, LogOut } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const API_URL = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com';

const getCategoryColor = (cat) => {
   if (!cat) return '#14B8A6'; 
   const l = cat.toLowerCase();
   if (l.includes('birthday')) return '#F59E0B';
   if (l.includes('meeting') || l.includes('board')) return '#4F46E5';
   return '#14B8A6';
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
     name: '',
     category: 'Birthday',
     eventDate: '',
     startTime: ''
  });

  const [googleStatus, setGoogleStatus] = useState({ connected: false, loading: true });
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Check URL parameters for oauth success/error
    const params = new URLSearchParams(location.search);
    const success = params.get('success');
    const error = params.get('error');
    if (success) {
      toast.success('Successfully connected Google Calendar!');
      navigate(location.pathname, { replace: true });
    }
    if (error) {
      toast.error('Failed to connect Google Calendar.');
      navigate(location.pathname, { replace: true });
    }

    // Fetch Google Calendar connection status
    fetchGoogleStatus();
  }, [location, navigate]);

  const fetchGoogleStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/google/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGoogleStatus({ connected: res.data.connected, email: res.data.email, loading: false });
    } catch (err) {
      setGoogleStatus({ connected: false, loading: false });
    }
  };

  const handleConnectGoogle = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/google/connect`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      toast.error('Failed to initiate Google connection');
    }
  };

  const handleDisconnectGoogle = async () => {
    try {
      await axios.delete(`${API_URL}/api/google/disconnect`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Disconnected Google Calendar');
      fetchGoogleStatus();
    } catch (err) {
      toast.error('Failed to disconnect Google Calendar');
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await axios.post(`${API_URL}/api/google/sync`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Events synchronized to Google Calendar');
      fetchGoogleStatus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to sync events');
    } finally {
      setSyncing(false);
    }
  };

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const { data: serverEvents = [], isLoading } = useQuery({
     queryKey: ['events'],
     queryFn: async () => {
        const res = await axios.get(`${API_URL}/api/v1/admin/events`, {
           headers: { Authorization: `Bearer ${token}` }
        });
        return res.data;
     }
  });
  
  const events = serverEvents.map(e => ({
     date: new Date(e.eventDate).toISOString().split('T')[0],
     title: e.name,
     type: e.category?.toLowerCase() || 'event',
     color: getCategoryColor(e.category)
  }));

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  const createEventMutation = useMutation({
     mutationFn: async (payload) => {
       const res = await axios.post(`${API_URL}/api/v1/admin/events`, payload, {
          headers: { Authorization: `Bearer ${token}` }
       });
       return res.data;
     },
     onSuccess: () => {
        toast.success("Event added successfully");
        setShowEventModal(false);
        setNewEvent({ name: '', category: 'Birthday', eventDate: '', startTime: ''});
        queryClient.invalidateQueries(['events']);
        
        // Auto-sync if connected
        if (googleStatus.connected) handleSync();
     },
     onError: () => toast.error("Failed to add event")
  });

  const handleCreateEvent = (e) => {
     e.preventDefault();
     if (!newEvent.name || !newEvent.eventDate) return toast.error("Title and Date are required");
     
     createEventMutation.mutate({
        ...newEvent,
        status: 'Publish', 
        visibility: 'Family'
     });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Track birthdays, anniversaries, and family events.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Google Calendar Controls */}
          {!googleStatus.loading && (
            <div className="flex items-center gap-2 mr-2">
              {googleStatus.connected ? (
                <>
                  <div className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-xl border border-green-100 flex items-center">
                    <CalendarIcon size={14} className="mr-1.5" /> {googleStatus.email}
                  </div>
                  <button onClick={handleSync} disabled={syncing} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all" title="Sync Events">
                    <RefreshCw size={18} className={syncing ? 'animate-spin' : ''} />
                  </button>
                  <button onClick={handleDisconnectGoogle} className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all" title="Disconnect">
                    <LogOut size={18} />
                  </button>
                </>
              ) : (
                <button onClick={handleConnectGoogle} className="flex items-center gap-2 bg-white border-2 border-slate-200 hover:border-slate-300 px-4 py-2 rounded-xl text-sm font-bold text-slate-700 transition-all shadow-sm">
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" /> Connect Google Calendar
                </button>
              )}
            </div>
          )}

          <button onClick={() => setShowEventModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30">
            <Plus size={18} /> Add Event
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 flex-wrap">
        {[['#F59E0B', 'Birthdays & Anniversaries'], ['#4F46E5', 'Meetings'], ['#14B8A6', 'Events']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 dark:border-slate-800">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <ChevronLeft size={20} />
          </button>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{MONTHS[month]} {year}</h2>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-500">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} className="border-b border-slate-100 dark:border-slate-800">
          {DAYS.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 border-b border-r border-slate-50 dark:border-slate-800/50" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            return (
              <div key={day} className={`h-28 p-2 border-b border-r border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1.5 transition-all ${isToday ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600'}`}>{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((ev, idx) => (
                    <div key={idx} style={{ background: `${ev.color}18`, borderLeft: `3px solid ${ev.color}`, color: ev.color, padding: '2px 6px', borderRadius: '0 4px 4px 0', fontSize: 11, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-[10px] text-slate-400 font-semibold pl-1">+{dayEvents.length - 2} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming events list */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Upcoming in {MONTHS[month]}</h3>
        <div className="space-y-3">
          {events.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).map((ev, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              <div style={{ width: 4, height: 40, borderRadius: 2, background: ev.color, flexShrink: 0 }} />
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-white">{ev.title}</div>
                <div className="text-xs text-slate-500">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div className="ml-auto">
                <span style={{ background: `${ev.color}15`, color: ev.color }} className="text-xs font-bold px-3 py-1 rounded-full capitalize">{ev.type}</span>
              </div>
            </div>
          ))}
          {events.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length === 0 && (
             <div className="flex flex-col items-center justify-center py-10">
                <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 text-indigo-500">
                   <span className="text-[24px]">📅</span>
                </div>
                <h4 className="font-bold text-slate-800 dark:text-white mb-1">No upcoming events</h4>
                <p className="text-xs text-slate-500">Your schedule for this month is clear.</p>
             </div>
          )}
        </div>
      </div>

      {showEventModal && (
        <form onSubmit={handleCreateEvent} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add Calendar Event</h2>
              
              <div className="space-y-4">
                <div>
                   <p className="text-xs font-bold text-slate-500 mb-1">Basic Information</p>
                   <input required type="text" value={newEvent.name} onChange={e => setNewEvent({...newEvent, name: e.target.value})} placeholder="Event Title (Required) ✅" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium mb-3" />
                   <select value={newEvent.category} onChange={e => setNewEvent({...newEvent, category: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium">
                      <option value="Birthday">Birthday</option>
                      <option value="Meeting">Meeting</option>
                      <option value="Gathering">Gathering</option>
                   </select>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-xs font-bold text-slate-500 mb-2">Date & Time</p>
                   <div className="flex gap-3">
                      <input required type="date" value={newEvent.eventDate} onChange={e => setNewEvent({...newEvent, eventDate: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                      <input required type="time" value={newEvent.startTime} onChange={e => setNewEvent({...newEvent, startTime: e.target.value})} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                 <button type="submit" disabled={createEventMutation.isPending} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-indigo-500/20">
                    {createEventMutation.isPending ? 'Saving...' : 'Save Event'}
                 </button>
                 <button type="button" onClick={() => setShowEventModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </form>
      )}
    </div>
  );
}
