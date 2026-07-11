import React, { useState } from 'react';
import { Megaphone, ChevronDown, ChevronUp } from 'lucide-react';

const announcements = [
  { id: 1, title: 'Annual Family Reunion – August 2026', author: 'Arjun Mehta (Admin)', avatar: 'https://i.pravatar.cc/150?img=33', date: 'July 8, 2026', content: 'We are thrilled to announce our Annual Family Reunion on August 15, 2026 at Central Park, New York! Theme: "Roots & Branches." Please RSVP by August 1st. Transportation from major airports will be arranged. Looking forward to seeing everyone!', reactions: 34, comments: 12, tag: 'Important', tagColor: 'bg-red-100 text-red-700', pinned: true },
  { id: 2, title: "Grandpa Robert's 80th Birthday Celebration!", author: 'Sarah Smith (Admin)', avatar: 'https://i.pravatar.cc/150?img=47', date: 'July 5, 2026', content: 'Our beloved Grandpa Robert is celebrating his 80th birthday on September 2nd at the Family Estate in Los Angeles. Dinner, music, and a special video tribute are in store. Please keep it a surprise!', reactions: 67, comments: 29, tag: 'Celebration', tagColor: 'bg-purple-100 text-purple-700', pinned: true },
  { id: 3, title: 'New Document Vault Now Live', author: 'Arjun Mehta (Admin)', avatar: 'https://i.pravatar.cc/150?img=33', date: 'July 1, 2026', content: 'We\'ve launched the secure Family Document Vault! Upload and access important documents like property papers, insurance, and certificates. All files are encrypted and only accessible to verified family members.', reactions: 21, comments: 4, tag: 'Update', tagColor: 'bg-blue-100 text-blue-700', pinned: false },
  { id: 4, title: 'Monthly Family Poll – Vote Now!', author: 'Arjun Mehta (Admin)', avatar: 'https://i.pravatar.cc/150?img=33', date: 'June 28, 2026', content: 'Cast your vote for our December vacation destination! The options are Goa, Maldives, Switzerland, and Dubai. Please respond by June 30th. Your voice matters!', reactions: 15, comments: 7, tag: 'Action Required', tagColor: 'bg-amber-100 text-amber-700', pinned: false },
  { id: 5, title: 'Welcome New Family Members!', author: 'Sarah Smith (Admin)', avatar: 'https://i.pravatar.cc/150?img=47', date: 'June 20, 2026', content: 'We welcome three new members to the FamilyHub portal: Priya Mehta (daughter-in-law), Kiran Sharma (nephew), and Ananya Patel (cousin). Say hello and help them feel at home!', reactions: 43, comments: 16, tag: 'Welcome', tagColor: 'bg-emerald-100 text-emerald-700', pinned: false },
];

const EMOJI_REACTIONS = ['❤️', '😍', '🎉', '👏', '😮'];

export default function Announcements() {
  const [expanded, setExpanded] = useState(null);
  const [reacted, setReacted] = useState({});

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
        <p className="text-slate-500 text-sm mt-1">Family updates and important notices from admins.</p>
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-shadow hover:shadow-md ${ann.pinned ? 'border-blue-200 dark:border-blue-800/60' : 'border-slate-100 dark:border-slate-800'}`}>
            {ann.pinned && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/40 px-5 py-2 flex items-center gap-2">
                <Megaphone size={13} className="text-blue-600" />
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Pinned</span>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start gap-4 mb-4">
                <img src={ann.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-1">
                    <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">{ann.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${ann.tagColor}`}>{ann.tag}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium">{ann.author} · {ann.date}</p>
                </div>
              </div>

              <p className={`text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed ${expanded === ann.id ? '' : 'line-clamp-2'}`}>{ann.content}</p>
              <button onClick={() => setExpanded(expanded === ann.id ? null : ann.id)} className="mt-1.5 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700">
                {expanded === ann.id ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
              </button>

              {/* Reactions */}
              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 flex-wrap">
                  {EMOJI_REACTIONS.map(emoji => (
                    <button key={emoji} onClick={() => setReacted(prev => ({ ...prev, [ann.id + emoji]: !prev[ann.id + emoji] }))}
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${reacted[ann.id + emoji] ? 'bg-blue-50 border-blue-300 dark:bg-blue-500/20 dark:border-blue-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100'}`}>
                      {emoji}
                    </button>
                  ))}
                </div>
                <span className="text-xs font-semibold text-slate-400">{ann.reactions} reactions · {ann.comments} comments</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
