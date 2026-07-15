import React, { useState } from 'react';
import PrivateLayout from '../../components/PrivateLayout';
import { Calendar, MapPin, Users, Clock, CheckCircle, Plus } from 'lucide-react';

import axios from 'axios';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

export default function PrivateEvents() {
  const [rsvped, setRsvped] = useState(new Set([1]));
  const [filter, setFilter] = useState('upcoming');
  const [privateEvents, setPrivateEvents] = useState([]);

  useEffect(() => {
     const token = localStorage.getItem('token');
     axios.get(`${API_URL}/admin/events`, { headers: { Authorization: `Bearer ${token}` } })
       .then(res => {
          const mapped = res.data.map(e => {
             const isPast = new Date(e.eventDate) < new Date();
             return {
                id: e.id,
                title: e.name,
                date: new Date(e.eventDate).toLocaleDateString(),
                time: e.startTime || 'TBD',
                location: e.venue || 'TBD',
                attendees: [], // mock some attendees
                totalAttendees: e.maxGuests || 0,
                type: e.category || 'Event',
                color: '#4F46E5',
                status: isPast ? 'past' : 'upcoming',
                desc: e.description || ''
             }
          });
          setPrivateEvents(mapped);
       })
       .catch(err => console.error(err));
  }, []);

  const filtered = privateEvents.filter(e => filter === 'all' || e.status === filter);

  return (
    <PrivateLayout title="Private Events" subtitle="Exclusive family events and gatherings">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Header actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', padding: 4, borderRadius: 12 }}>
            {[['upcoming', 'Upcoming'], ['past', 'Past'], ['all', 'All']].map(([val, label]) => (
              <button key={val} onClick={() => setFilter(val)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s', background: filter === val ? 'white' : 'transparent', color: filter === val ? '#4F46E5' : '#6B7280', boxShadow: filter === val ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                {label}
              </button>
            ))}
          </div>
          <button style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 700, fontSize: 14 }}>
            <Plus size={16} /> Create Private Event
          </button>
        </div>

        {/* Events List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {filtered.map((event) => (
            <div key={event.id} style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', display: 'grid', gridTemplateColumns: '1fr auto', gap: 24, alignItems: 'center', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 40px rgba(79,70,229,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                  <span style={{ padding: '4px 14px', borderRadius: 50, background: `${event.color}15`, color: event.color, fontSize: 12, fontWeight: 700 }}>{event.type}</span>
                  {event.status === 'past' && <span style={{ padding: '4px 14px', borderRadius: 50, background: '#F3F4F6', color: '#6B7280', fontSize: 12, fontWeight: 700 }}>Past</span>}
                </div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 20, color: '#111827', marginBottom: 10 }}>{event.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.6, marginBottom: 16 }}>{event.desc}</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, fontSize: 14, color: '#6B7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Clock size={15} color={event.color} /> {event.time} • {event.date}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={15} color={event.color} /> {event.location}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={15} color={event.color} /> {event.totalAttendees} attending</span>
                </div>
                {event.attendees.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
                    <div style={{ display: 'flex' }}>
                      {event.attendees.map((av, i) => <img key={i} src={av} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: '2px solid white', marginLeft: i > 0 ? -10 : 0, boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} alt="" />)}
                    </div>
                    <span style={{ fontSize: 13, color: '#9CA3AF' }}>+{event.totalAttendees - event.attendees.length} more going</span>
                  </div>
                )}
              </div>
              {event.status === 'upcoming' && (
                <button onClick={() => setRsvped(p => { const n = new Set(p); n.has(event.id) ? n.delete(event.id) : n.add(event.id); return n; })} style={{ padding: '12px 28px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s', background: rsvped.has(event.id) ? '#F0FDF4' : `linear-gradient(135deg, ${event.color}, ${event.color}cc)`, color: rsvped.has(event.id) ? '#10B981' : 'white', border: rsvped.has(event.id) ? '1px solid #10B981' : 'none' }}>
                  {rsvped.has(event.id) ? <><CheckCircle size={16} /> Confirmed</> : 'RSVP Now'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </PrivateLayout>
  );
}
