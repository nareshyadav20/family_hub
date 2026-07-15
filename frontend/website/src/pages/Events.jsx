import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight, Filter, CheckCircle } from 'lucide-react';
import axios from 'axios';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/website`;

const types = ['All', 'Reunion', 'Birthday', 'Anniversary', 'Holiday', 'Other'];

export default function Events() {
  const [filter, setFilter] = useState('upcoming');
  const [typeFilter, setTypeFilter] = useState('All');
  const [rsvped, setRsvped] = useState(new Set());
  const [events, setEvents] = useState([]);
  
  useEffect(() => {
    axios.get(`${API_URL}/events`)
      .then(res => {
         const mapped = res.data.map(e => {
            const isPast = new Date(e.eventDate) < new Date();
            return {
               id: e.id,
               title: e.name,
               date: new Date(e.eventDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric'}),
               shortMonth: new Date(e.eventDate).toLocaleString('default', { month: 'short' }),
               day: new Date(e.eventDate).getDate(),
               time: e.startTime || '12:00 PM',
               location: e.venue || 'TBD',
               type: e.category || 'Other',
               attendees: e.maxGuests || 0,
               status: isPast ? 'past' : 'upcoming',
               image: e.bannerImage || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=350&fit=crop',
               color: '#4F46E5',
               desc: e.description || 'Join us for this family event.'
            };
         });
         setEvents(mapped);
      })
      .catch(err => console.error(err));
  }, []);

  const filtered = events.filter(e => (filter === 'all' || e.status === filter) && (typeFilter === 'All' || e.type === typeFilter));

  const handleRsvp = (id) => {
    setRsvped(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Header */}
      <section style={{ padding: '64px 0 48px', background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Events</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Family <span className="gradient-text">Events</span></h1>
          <p style={{ fontSize: 17, color: '#6B7280' }}>Plan, celebrate, and create memories together.</p>
        </div>
      </section>

      <section style={{ padding: '48px 0', background: 'white' }}>
        <div className="container">
          {/* Filters */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 40, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 4, background: '#F3F4F6', padding: 4, borderRadius: 12 }}>
              {[['upcoming', 'Upcoming'], ['past', 'Past Events'], ['all', 'All Events']].map(([val, label]) => (
                <button key={val} onClick={() => setFilter(val)} style={{ padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s', background: filter === val ? 'white' : 'transparent', color: filter === val ? '#4F46E5' : '#6B7280', boxShadow: filter === val ? '0 2px 8px rgba(0,0,0,0.1)' : 'none' }}>
                  {label}
                </button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {types.map(t => (
                <button key={t} onClick={() => setTypeFilter(t)} style={{ padding: '8px 16px', borderRadius: 50, border: `1px solid ${typeFilter === t ? '#4F46E5' : '#E5E7EB'}`, cursor: 'pointer', fontWeight: 600, fontSize: 13, background: typeFilter === t ? 'rgba(79,70,229,0.08)' : 'white', color: typeFilter === t ? '#4F46E5' : '#6B7280', transition: 'all 0.2s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Events grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 28 }}>
            {filtered.map((event, i) => (
              <div key={event.id} className="card" style={{ overflow: 'hidden', animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
                <div style={{ position: 'relative', height: 220, overflow: 'hidden' }}>
                  <img src={event.image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5), transparent)' }} />
                  <div style={{ position: 'absolute', top: 16, left: 16, display: 'flex', gap: 8 }}>
                    <span style={{ padding: '5px 14px', borderRadius: 50, background: event.color, color: 'white', fontSize: 12, fontWeight: 700 }}>{event.type}</span>
                    {event.status === 'past' && <span style={{ padding: '5px 14px', borderRadius: 50, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 12, fontWeight: 700 }}>Past</span>}
                  </div>
                  <div style={{ position: 'absolute', bottom: 16, right: 16, background: 'white', borderRadius: 12, padding: '8px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#EF4444' }}>{event.shortMonth.toUpperCase()}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{event.day}</div>
                  </div>
                </div>
                <div style={{ padding: 24 }}>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 18, color: '#111827', marginBottom: 16, lineHeight: 1.3 }}>{event.title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>{event.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {[
                      [Clock, `${event.time} • ${event.date}`],
                      [MapPin, event.location],
                      [Users, `${event.attendees + (rsvped.has(event.id) ? 1 : 0)} attending`],
                    ].map(([Icon, text], j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#6B7280' }}>
                        <Icon size={15} color={event.color} /> {text}
                      </div>
                    ))}
                  </div>
                  {event.status === 'upcoming' && (
                    <button onClick={() => handleRsvp(event.id)} style={{
                      width: '100%', padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: 14, transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: rsvped.has(event.id) ? '#F0FDF4' : `linear-gradient(135deg, ${event.color}, ${event.color}dd)`,
                      color: rsvped.has(event.id) ? '#10B981' : 'white',
                      border: rsvped.has(event.id) ? '1px solid #10B981' : 'none',
                    }}>
                      {rsvped.has(event.id) ? <><CheckCircle size={16} /> RSVP Confirmed!</> : `RSVP for this Event`}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '80px 24px', color: '#9CA3AF' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, color: '#374151', marginBottom: 8 }}>No events found</h3>
              <p>Try removing filters or check back later for upcoming events.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
