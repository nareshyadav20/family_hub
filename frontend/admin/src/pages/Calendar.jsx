import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const events = [
  { date: '2026-07-14', title: "Grandpa's Birthday", type: 'birthday', color: '#F59E0B' },
  { date: '2026-07-15', title: 'Board Meeting', type: 'meeting', color: '#4F46E5' },
  { date: '2026-07-20', title: 'Business Strategy', type: 'meeting', color: '#4F46E5' },
  { date: '2026-07-28', title: "Emily's Birthday", type: 'birthday', color: '#F59E0B' },
  { date: '2026-08-02', title: "Grandma's Birthday", type: 'birthday', color: '#F59E0B' },
  { date: '2026-08-15', title: 'Summer Reunion', type: 'event', color: '#14B8A6' },
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDay(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function Calendar() {
  const today = new Date();
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(6); // July 2026

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const [showEventModal, setShowEventModal] = useState(false);

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); };

  const getEventsForDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 relative">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Calendar</h1>
          <p className="text-sm text-slate-500 mt-1">Track birthdays, anniversaries, and family events.</p>
        </div>
        <button onClick={() => setShowEventModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-lg shadow-indigo-500/30">
          <Plus size={18} /> Add Event
        </button>
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
                <div className="text-xs text-slate-500">{new Date(ev.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
              <div className="ml-auto">
                <span style={{ background: `${ev.color}15`, color: ev.color }} className="text-xs font-bold px-3 py-1 rounded-full capitalize">{ev.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Add Calendar Event</h2>
              
              <div className="space-y-4">
                <div>
                   <p className="text-xs font-bold text-slate-500 mb-1">Basic Information</p>
                   <input type="text" placeholder="Event Title (Required) ✅" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium mb-3" />
                   <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium">
                      <option>Event Type ✅</option>
                      <option>Birthday</option>
                      <option>Meeting</option>
                      <option>Gathering</option>
                   </select>
                </div>
                
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                   <p className="text-xs font-bold text-slate-500 mb-2">2.2 Date & Time</p>
                   <div className="flex gap-3">
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                      <input type="time" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium" />
                   </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                 <button onClick={() => { alert('Calendar Event Added Successfully!'); setShowEventModal(false); }} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-indigo-500/20">Save Event</button>
                 <button onClick={() => setShowEventModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
