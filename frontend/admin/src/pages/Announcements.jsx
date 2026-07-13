import React, { useState } from 'react';
import { Megaphone, Plus, Edit2, Trash2, Globe, Lock, Users, ChevronDown, ChevronUp } from 'lucide-react';

const announcements = [
  {
    id: 1, title: 'Annual Family Reunion – August 2026', author: 'Arjun Mehta', avatar: 'https://i.pravatar.cc/100?img=2', date: 'July 8, 2026',
    content: 'We are thrilled to announce our Annual Family Reunion on August 15, 2026 at Central Park, New York. This year\'s theme is "Roots & Branches." Please RSVP by August 1st so we can make the arrangements. Transportation will be arranged from the airport for outstation members. Looking forward to seeing everyone!',
    audience: 'All Members', pinned: true, reactions: 34, comments: 12, tag: 'Important',
    tagColor: 'bg-red-100 text-red-700',
  },
  {
    id: 2, title: 'Grandpa Robert Turns 80 – Birthday Celebration!', author: 'Sarah Smith', avatar: 'https://i.pravatar.cc/100?img=5', date: 'July 5, 2026',
    content: 'Our beloved Grandpa Robert is celebrating his 80th birthday on September 2nd! The family has planned a grand surprise birthday bash at the Family Estate in Los Angeles. Dinner, music, and a special video tribute are in store. Please keep it a surprise!',
    audience: 'All Members', pinned: true, reactions: 67, comments: 29, tag: 'Celebration',
    tagColor: 'bg-purple-100 text-purple-700',
  },
  {
    id: 3, title: 'New Document Vault Launch', author: 'Arjun Mehta', avatar: 'https://i.pravatar.cc/100?img=2', date: 'July 1, 2026',
    content: 'We\'ve launched the secure Family Document Vault! You can now upload and access important documents like property papers, insurance, and certificates. All files are encrypted and only accessible to verified family members. Check it out under the Documents section.',
    audience: 'All Members', pinned: false, reactions: 21, comments: 4, tag: 'Update',
    tagColor: 'bg-blue-100 text-blue-700',
  },
  {
    id: 4, title: 'Monthly Polls Now Available!', author: 'Emily Smith', avatar: 'https://i.pravatar.cc/100?img=3', date: 'June 28, 2026',
    content: 'We\'re starting monthly family polls to make collective decisions easier. This month\'s poll: "Where should we vacation in December?" Please cast your vote by June 30th. Every vote counts!',
    audience: 'All Members', pinned: false, reactions: 15, comments: 7, tag: 'Action Required',
    tagColor: 'bg-amber-100 text-amber-700',
  },
  {
    id: 5, title: 'New Family Members Welcomed!', author: 'Sarah Smith', avatar: 'https://i.pravatar.cc/100?img=5', date: 'June 20, 2026',
    content: 'Please join us in welcoming three new members to the family portal: Priya Mehta (daughter-in-law), Kiran Sharma (nephew), and Ananya Patel (cousin). Please reach out and help them get settled into the platform!',
    audience: 'All Members', pinned: false, reactions: 43, comments: 16, tag: 'Welcome',
    tagColor: 'bg-emerald-100 text-emerald-700',
  },
];

export default function Announcements() {
  const [expanded, setExpanded] = useState(null);
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500 text-sm mt-1">Broadcast important updates to all family members.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30 cursor-pointer">
          <Plus size={16} /> New Announcement
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map(ann => (
          <div key={ann.id} className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md ${ann.pinned ? 'border-blue-200 dark:border-blue-800/60' : 'border-slate-100 dark:border-slate-800'}`}>
            {ann.pinned && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800/50 px-5 py-2 flex items-center gap-2">
                <Megaphone size={14} className="text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Pinned Announcement</span>
              </div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <img src={ann.avatar} className="w-10 h-10 rounded-xl object-cover shadow-sm shrink-0" alt="" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-slate-900 dark:text-white text-[15px]">{ann.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${ann.tagColor}`}>{ann.tag}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <span>{ann.author}</span>
                      <span>·</span>
                      <span>{ann.date}</span>
                      <span>·</span>
                      <div className="flex items-center gap-1"><Globe size={11} /> {ann.audience}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={15} /></button>
                  <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={15} /></button>
                </div>
              </div>

              <div className={`mt-4 text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed ${expanded === ann.id ? '' : 'line-clamp-2'}`}>
                {ann.content}
              </div>
              <button onClick={() => setExpanded(expanded === ann.id ? null : ann.id)} className="mt-1 flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                {expanded === ann.id ? <><ChevronUp size={14} /> Show less</> : <><ChevronDown size={14} /> Read more</>}
              </button>

              <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center gap-5 text-sm text-slate-500">
                <button className="flex items-center gap-1.5 font-semibold hover:text-red-500 transition-colors">
                  <span className="text-base">❤️</span> {ann.reactions}
                </button>
                <button className="flex items-center gap-1.5 font-semibold hover:text-blue-600 transition-colors">
                  <span className="text-base">💬</span> {ann.comments} Comments
                </button>
                <button className="flex items-center gap-1.5 font-semibold hover:text-emerald-600 transition-colors">
                  <span className="text-base">📢</span> Share
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">New Announcement</h2>
              <div className="space-y-4">
                <input type="text" placeholder="Announcement Title" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium" />
                <textarea rows="4" placeholder="Write your message here..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium resize-none"></textarea>
                <div className="flex items-center justify-between">
                   <select className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-medium w-1/2">
                      <option>All Members</option><option>Admins Only</option>
                   </select>
                   <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer">
                      <input type="checkbox" className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300" />
                      Pin to Top
                   </label>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                 <button onClick={() => { alert('Announcement published!'); setShowModal(false); }} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-blue-500/20">Publish</button>
                 <button onClick={() => setShowModal(false)} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
