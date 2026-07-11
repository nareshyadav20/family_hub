import React, { useState } from 'react';
import { CalendarDays, Clock, MapPin, Users, ChevronRight, Plus, Check } from 'lucide-react';

const events = [
  { id: 1, title: 'Annual Family Reunion 2026', date: 'Aug 15, 2026', time: '10:00 AM', location: 'Central Park, New York', attendees: 45, type: 'Reunion', status: 'upcoming', cover: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80', rsvp: false, description: 'Our biggest family event of the year! Theme: Roots & Branches. Games, food, and a special tribute to Grandpa.' },
  { id: 2, title: "Grandpa Robert's 80th Birthday Bash", date: 'Sep 2, 2026', time: '6:00 PM', location: 'Family Estate, Los Angeles', attendees: 120, type: 'Birthday', status: 'upcoming', cover: 'https://images.unsplash.com/photo-1530103862676-de8892cb7370?w=600&q=80', rsvp: true, description: 'A grand surprise birthday celebration for Grandpa! Dinner, live music, and a special video tribute from the family.' },
  { id: 3, title: '10th Anniversary Dinner', date: 'Oct 12, 2026', time: '7:00 PM', location: 'The Ritz Carlton, Mumbai', attendees: 30, type: 'Anniversary', status: 'upcoming', cover: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&q=80', rsvp: false, description: 'Join us in celebrating 10 wonderful years of James and Sarah\'s marriage over a fine dining experience.' },
  { id: 4, title: 'Diwali Family Night', date: 'Nov 1, 2026', time: '8:00 PM', location: 'Smith Residence, Delhi', attendees: 28, type: 'Festival', status: 'upcoming', cover: 'https://images.unsplash.com/photo-1574175174819-9a2f64fa2b5d?w=600&q=80', rsvp: false, description: 'Light diyas, burst crackers, enjoy sweets and fireworks together this Diwali!' },
  { id: 5, title: 'Christmas Family Brunch', date: 'Dec 25, 2025', time: '11:00 AM', location: 'Robert & Martha\'s Home', attendees: 22, type: 'Holiday', status: 'past', cover: 'https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?w=600&q=80', rsvp: true, description: 'Annual Christmas brunch with the whole family. Gift exchange and carol singing!' },
];

const TYPE_COLORS = {
  Reunion: 'bg-blue-100 text-blue-700',
  Birthday: 'bg-purple-100 text-purple-700',
  Anniversary: 'bg-pink-100 text-pink-700',
  Festival: 'bg-amber-100 text-amber-700',
  Holiday: 'bg-emerald-100 text-emerald-700',
};

export default function Events() {
  const [rsvpd, setRsvpd] = useState(events.filter(e => e.rsvp).map(e => e.id));
  const [tab, setTab] = useState('upcoming');

  const filtered = events.filter(e => e.status === tab);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Family Events</h1>
          <p className="text-slate-500 text-sm mt-1">Stay connected through shared celebrations.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['upcoming', 'past'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-full text-sm font-bold capitalize transition-all ${tab === t ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-600 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}>
            {t === 'upcoming' ? `🗓 Upcoming (${events.filter(e => e.status === 'upcoming').length})` : `⏳ Past Events`}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(ev => (
          <div key={ev.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow group">
            <div className="h-44 relative overflow-hidden">
              <img src={ev.cover} alt={ev.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute top-4 left-4">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${TYPE_COLORS[ev.type]}`}>{ev.type}</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-xl p-2.5 text-center min-w-[52px] shadow-md">
                <div className="text-[10px] font-black text-rose-500 uppercase">{ev.date.split(' ')[0]}</div>
                <div className="text-xl font-black text-slate-800 leading-none">{ev.date.split(' ')[1].replace(',', '')}</div>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col gap-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-[15px] leading-snug">{ev.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{ev.description}</p>
              <div className="space-y-1.5 text-xs font-medium text-slate-500">
                <div className="flex items-center gap-2"><Clock size={12} className="text-slate-400" />{ev.date} at {ev.time}</div>
                <div className="flex items-center gap-2"><MapPin size={12} className="text-slate-400" />{ev.location}</div>
                <div className="flex items-center gap-2"><Users size={12} className="text-slate-400" />{ev.attendees} attending</div>
              </div>
              {ev.status === 'upcoming' && (
                <button onClick={() => setRsvpd(prev => prev.includes(ev.id) ? prev.filter(x => x !== ev.id) : [...prev, ev.id])}
                  className={`mt-auto w-full py-2.5 rounded-xl text-sm font-bold transition-all ${rsvpd.includes(ev.id) ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/30'}`}>
                  {rsvpd.includes(ev.id) ? <span className="flex items-center justify-center gap-2"><Check size={15} /> RSVP'd</span> : 'RSVP Now'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
