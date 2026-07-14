import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

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
  const token = localStorage.getItem('token');
  
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const { data: serverEvents = [], isLoading } = useQuery({
     queryKey: ['events'],
     queryFn: async () => {
        const res = await axios.get(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/events`, {
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

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-indigo-600 p-2 text-white shadow-sm rounded-lg">
          <CalendarIcon size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Family Calendar</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Keep track of birthdays, meetings, and family events.</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex gap-6 flex-wrap">
        {[['#F59E0B', 'Birthdays & Anniversaries'], ['#4F46E5', 'Meetings'], ['#14B8A6', 'Events']].map(([color, label]) => (
          <div key={label} className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400">
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
            {label}
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50">
          {DAYS.map(day => (
            <div key={day} className="py-3 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">{day}</div>
          ))}
        </div>

        {/* Days grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }} className="bg-white">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="h-28 border-b border-r border-slate-100 dark:border-slate-800/50" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
            const dayEvents = getEventsForDay(day);
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            return (
              <div key={day} className={`h-28 p-2 border-b border-r border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors cursor-pointer group`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold mb-1.5 transition-all ${isToday ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30' : 'text-slate-700 dark:text-slate-300 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 group-hover:text-indigo-600'}`}>{day}</div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((ev, idx) => (
                    <div key={idx} style={{ background: `${ev.color}18`, borderLeft: `3px solid ${ev.color}`, color: ev.color, padding: '2px 6px', borderRadius: '0 4px 4px 0', fontSize: 11, fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                <div className="text-xs text-slate-500 font-medium mt-0.5">{new Date(ev.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div className="ml-auto">
                <span style={{ background: `${ev.color}15`, color: ev.color }} className="text-xs font-bold px-3 py-1 rounded-full capitalize">{ev.type}</span>
              </div>
            </div>
          ))}
          {events.filter(e => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length === 0 && (
             <div className="text-sm text-slate-500 font-medium py-4 text-center">No events scheduled.</div>
          )}
        </div>
      </div>

    </div>
  );
}
