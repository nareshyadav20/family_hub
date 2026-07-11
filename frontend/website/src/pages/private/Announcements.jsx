import React, { useState } from 'react';
import PrivateLayout from '../../components/PrivateLayout';
import { Pin, Bell, ChevronDown, ChevronUp, Megaphone } from 'lucide-react';

const announcements = [
  {
    id: 1, title: '📣 Summer Reunion 2026 — Final Details Released!', author: 'James Smith (Admin)', date: 'July 8, 2026', pinned: true, priority: 'high', avatar: 'https://i.pravatar.cc/50?img=53',
    content: `Dear Family,\n\nWe are thrilled to announce the final details for our Summer Reunion 2026!\n\n📅 Date: August 15–16, 2026\n📍 Location: Central Park, New York City\n🕙 Start Time: 10:00 AM\n\nThis year's reunion will be a 2-day event with activities for all ages. We have planned:\n• BBQ dinner on Day 1\n• Family sports day on Day 2\n• A special tribute ceremony for Grandpa Robert's 84th birthday\n• A family photo session\n\nPlease RSVP by July 30th. Looking forward to seeing everyone!\n\nWith love,\nJames & the Family Admin Team`
  },
  {
    id: 2, title: '🎂 Birthday Wish Collection for Grandma', author: 'Emily Smith', date: 'July 5, 2026', pinned: true, priority: 'medium', avatar: 'https://i.pravatar.cc/50?img=25',
    content: "As Grandma Martha's 81st birthday approaches (September 2nd), we are collecting special birthday wishes from all family members for a personalized memory book.\n\nPlease send your wishes, favorite memory with Grandma, or a special photo to this portal or email them to emily@smith.com by August 20th.\n\nWe will compile everything into a beautiful printed book to present to her on her special day! 💝"
  },
  {
    id: 3, title: '🏡 Property Deed Update — Springfield Estate', author: 'James Smith (Admin)', date: 'June 28, 2026', pinned: false, priority: 'high', avatar: 'https://i.pravatar.cc/50?img=53',
    content: 'Important legal update regarding the Springfield family estate. The property deed has been updated to include all immediate family members in the joint ownership agreement. A copy of the updated deed has been uploaded to the Document Vault.\n\nPlease review the document and confirm receipt by replying to this announcement. If you have any questions, please contact our family legal counsel.'
  },
  {
    id: 4, title: '📸 August Photo Challenge — "Roots & Wings"', author: 'Patricia Dove', date: 'June 20, 2026', pinned: false, priority: 'low', avatar: 'https://i.pravatar.cc/50?img=38',
    content: 'This month\'s family photo challenge theme is "Roots & Wings"!\n\nShare a photo that represents:\n🌳 Your ROOTS — something that connects you to your family heritage\n🦅 Your WINGS — something that represents how far you\'ve come\n\nUpload your photos to the Private Gallery by July 31st. The family will vote for their favorites and winners will be featured on our family website!'
  },
  {
    id: 5, title: '💰 Family Investment Fund — Annual Report Available', author: 'Robert Smith Jr.', date: 'June 10, 2026', pinned: false, priority: 'medium', avatar: 'https://i.pravatar.cc/50?img=60',
    content: 'The Annual Smith Family Investment Fund report for 2025 is now available in the Document Vault.\n\nHighlights:\n• Total portfolio value: $2.4M (up 12% YoY)\n• New investments added: 3 real estate holdings\n• Dividend payouts to shareholders: March 2026\n\nAll adult family members are invited to review the report and attend our virtual Q&A session scheduled for July 15, 2026.'
  },
];

const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const priorityBg = { high: 'rgba(239,68,68,0.08)', medium: 'rgba(245,158,11,0.08)', low: 'rgba(16,185,129,0.08)' };

export default function Announcements() {
  const [expanded, setExpanded] = useState(new Set([1]));

  const toggleExpand = (id) => setExpanded(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const pinned = announcements.filter(a => a.pinned);
  const regular = announcements.filter(a => !a.pinned);

  return (
    <PrivateLayout title="Announcements" subtitle="Official messages from family administration">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Stats bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {[['📌', pinned.length, 'Pinned'], ['📢', announcements.length, 'Total'], ['🔴', announcements.filter(a => a.priority === 'high').length, 'High Priority']].map(([emoji, val, label]) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 28 }}>{emoji}</span>
              <div>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 900, fontSize: 26, color: '#111827' }}>{val}</div>
                <div style={{ fontSize: 13, color: '#9CA3AF' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pinned */}
        {pinned.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
              <Pin size={16} color="#4F46E5" />
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 16, color: '#111827' }}>Pinned Announcements</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {pinned.map(ann => <AnnouncementCard key={ann.id} ann={ann} expanded={expanded} onToggle={toggleExpand} />)}
            </div>
          </div>
        )}

        {/* Regular */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Megaphone size={16} color="#9CA3AF" />
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 16, color: '#111827' }}>All Announcements</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {regular.map(ann => <AnnouncementCard key={ann.id} ann={ann} expanded={expanded} onToggle={toggleExpand} />)}
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}

function AnnouncementCard({ ann, expanded, onToggle }) {
  const isExpanded = expanded.has(ann.id);
  return (
    <div style={{ background: 'white', borderRadius: 20, border: `1px solid ${ann.pinned ? 'rgba(79,70,229,0.2)' : '#E5E7EB'}`, boxShadow: ann.pinned ? '0 4px 20px rgba(79,70,229,0.08)' : '0 2px 8px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
      <div style={{ padding: '24px 28px', cursor: 'pointer' }} onClick={() => onToggle(ann.id)}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
              {ann.pinned && (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 50, background: 'rgba(79,70,229,0.1)', color: '#4F46E5', fontSize: 11, fontWeight: 700 }}>
                  <Pin size={10} /> Pinned
                </span>
              )}
              <span style={{ padding: '3px 10px', borderRadius: 50, fontSize: 11, fontWeight: 700, background: priorityBg[ann.priority], color: priorityColors[ann.priority], textTransform: 'capitalize' }}>
                {ann.priority} priority
              </span>
            </div>
            <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 17, color: '#111827', lineHeight: 1.4, marginBottom: 14 }}>{ann.title}</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={ann.avatar} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} alt={ann.author} />
              <div>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>{ann.author}</span>
                <span style={{ fontSize: 13, color: '#9CA3AF' }}> • {ann.date}</span>
              </div>
            </div>
          </div>
          <div style={{ color: '#9CA3AF', flexShrink: 0, marginTop: 4 }}>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div style={{ padding: '0 28px 28px', borderTop: '1px solid #F3F4F6' }}>
          <div style={{ paddingTop: 20 }}>
            {ann.content.split('\n').map((line, i) => (
              <p key={i} style={{ fontSize: 14, color: '#374151', lineHeight: 1.8, marginBottom: line === '' ? 8 : 0 }}>{line || <br />}</p>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid #F3F4F6', display: 'flex', gap: 12 }}>
            <button style={{ padding: '10px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 600, fontSize: 13 }}>👍 Acknowledge</button>
            <button style={{ padding: '10px 20px', borderRadius: 10, border: '1px solid #E5E7EB', cursor: 'pointer', background: 'white', color: '#374151', fontWeight: 600, fontSize: 13 }}>💬 Reply</button>
          </div>
        </div>
      )}
    </div>
  );
}
