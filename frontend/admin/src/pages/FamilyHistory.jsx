import React from 'react';
import { BookOpen, Plus } from 'lucide-react';

const timeline = [
  { year: '1942', event: 'Robert Smith Sr. born in Springfield, Illinois', color: '#F59E0B' },
  { year: '1945', event: 'Martha Johnson born in Naperville, Illinois', color: '#EC4899' },
  { year: '1966', event: 'Robert and Martha wed at First Baptist Church, Springfield', color: '#EF4444' },
  { year: '1968', event: 'James Smith born — first son', color: '#3B82F6' },
  { year: '1972', event: 'William Smith born — second son', color: '#6366F1' },
  { year: '1975', event: 'Patricia Smith (Dove) born — daughter', color: '#8B5CF6' },
  { year: '1990', event: 'James marries Sarah Thompson in New York City', color: '#14B8A6' },
  { year: '1995', event: 'Arjun Smith born — first grandchild', color: '#10B981' },
  { year: '1998', event: 'Emily Smith born — second grandchild', color: '#F97316' },
  { year: '2001', event: 'Noah Smith born — third grandchild', color: '#22D3EE' },
  { year: '2010', event: 'Smith Family Foundation established', color: '#4F46E5' },
  { year: '2022', event: 'FamilyHub OS launched — family goes digital', color: '#7C3AED' },
  { year: '2026', event: 'Family grows to 247 members across 4 generations', color: '#10B981' },
];

export default function FamilyHistory() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Family History <BookOpen size={24} className="text-amber-500" />
          </h1>
          <p className="text-slate-500 text-sm mt-1">The Smith Family Timeline — 4 Generations</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-amber-500/30">
          <Plus size={18} /> Add Event
        </button>
      </div>

      <div className="grid grid-cols-[1fr_320px] gap-6 items-start">
        {/* Timeline */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-8 shadow-sm">
          <div className="space-y-0">
            {timeline.map((t, i) => (
              <div key={i} className="flex gap-6 group cursor-pointer">
                <div className="flex flex-col items-center">
                  <div
                    className="w-4 h-4 rounded-full shadow-md shrink-0 group-hover:scale-125 transition-transform duration-200"
                    style={{ background: t.color }}
                  />
                  {i < timeline.length - 1 && (
                    <div className="w-0.5 flex-1 bg-slate-200 dark:bg-slate-700 min-h-[44px]" />
                  )}
                </div>
                <div className="pb-8 group-hover:translate-x-1 transition-transform duration-200">
                  <span
                    className="text-xs font-black px-2 py-0.5 rounded-md"
                    style={{ background: `${t.color}18`, color: t.color }}
                  >
                    {t.year}
                  </span>
                  <p className="text-sm font-medium text-slate-800 dark:text-white mt-1.5">{t.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats side panel */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 rounded-2xl p-6 border border-amber-100 dark:border-amber-500/20">
            <div className="text-4xl mb-3">🌳</div>
            <h3 className="font-black text-2xl text-amber-900 dark:text-amber-400 mb-1">84 Years</h3>
            <p className="text-sm text-amber-700 dark:text-amber-400/70">of Smith Family History</p>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4">Family Milestones</h3>
            <div className="space-y-3">
              {[
                [4, 'Generations', '#4F46E5'],
                [247, 'Total Members', '#7C3AED'],
                [13, 'Recorded Events', '#14B8A6'],
                [1966, 'Est. Year', '#F59E0B'],
              ].map(([val, label, color]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="font-black text-lg" style={{ color }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-3">Key Locations</h3>
            <div className="space-y-2">
              {['Springfield, Illinois', 'New York City, NY', 'Los Angeles, CA', 'San Francisco, CA'].map(loc => (
                <div key={loc} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                  {loc}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
