import React, { useState } from 'react';
import PrivateLayout from '../../components/PrivateLayout';
import { Pin, Bell, ChevronDown, ChevronUp, Megaphone } from 'lucide-react';

import axios from 'axios';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

const priorityColors = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' };
const priorityBg = { high: 'rgba(239,68,68,0.08)', medium: 'rgba(245,158,11,0.08)', low: 'rgba(16,185,129,0.08)' };

export default function Announcements() {
  const [expanded, setExpanded] = useState(new Set());
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
     const token = localStorage.getItem('token');
     axios.get(`${API_URL}/member/announcements`, { headers: { Authorization: `Bearer ${token}` } })
       .then(res => {
          const mapped = res.data.map(a => ({
             id: a.id,
             title: a.title,
             author: a.author ? `${a.author.firstName} ${a.author.lastName}` : 'Admin',
             avatar: a.author?.avatar || `https://ui-avatars.com/api/?name=${a.author ? a.author.firstName : 'A'}`,
             date: new Date(a.createdAt).toLocaleDateString(),
             pinned: a.isPinned || false,
             priority: a.priority?.toLowerCase() || 'medium',
             content: a.content || ''
          }));
          setAnnouncements(mapped);
       })
       .catch(err => console.error(err));
  }, []);

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
