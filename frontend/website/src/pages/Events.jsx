import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Clock, ArrowRight, Filter, CheckCircle } from 'lucide-react';

const events = [
  { id: 1, title: 'Summer Family Reunion 2026', date: 'August 15, 2026', time: '10:00 AM', location: 'Central Park, New York', type: 'Reunion', attendees: 45, status: 'upcoming', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=350&fit=crop', color: '#4F46E5', desc: 'Our biggest family gathering of the year! Two days of fun, food, and family bonding. All branches of the Smith family are invited.' },
  { id: 2, title: "Grandma's 75th Birthday Celebration", date: 'September 2, 2026', time: '6:00 PM', location: 'Smith Family Estate, Los Angeles', type: 'Birthday', attendees: 88, status: 'upcoming', image: 'https://images.unsplash.com/photo-1530103862676-de8892cb7370?w=600&h=350&fit=crop', color: '#7C3AED', desc: "A grand celebration for the family matriarch! Join us as we honor Grandma Martha on her milestone 75th birthday." },
  { id: 3, title: 'James & Sarah 25th Anniversary', date: 'October 12, 2026', time: '7:00 PM', location: 'The Ritz Carlton, Beverly Hills', type: 'Anniversary', attendees: 30, status: 'upcoming', image: 'https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?w=600&h=350&fit=crop', color: '#14B8A6', desc: 'A black-tie celebration of 25 beautiful years of love, laughter, and togetherness.' },
  { id: 4, title: 'Christmas Family Gathering', date: 'December 25, 2025', time: '2:00 PM', location: 'Smith Family Home, Springfield', type: 'Holiday', attendees: 62, status: 'past', image: 'https://images.unsplash.com/photo-1545566501-4c6d0cbec0c7?w=600&h=350&fit=crop', color: '#EF4444', desc: 'Our annual Christmas celebration with the whole family.' },
  { id: 5, title: 'Summer Reunion 2025', date: 'July 20, 2025', time: '11:00 AM', location: 'Lake Tahoe, California', type: 'Reunion', attendees: 78, status: 'past', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=350&fit=crop', color: '#F59E0B', desc: 'A wonderful reunion at the beautiful Lake Tahoe.' },
];

const types = ['All', 'Reunion', 'Birthday', 'Anniversary', 'Holiday'];

export default function Events() {
  const [filter, setFilter] = useState('upcoming');
  const [typeFilter, setTypeFilter] = useState('All');
  const [rsvped, setRsvped] = useState(new Set());

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
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#EF4444' }}>{event.date.split(' ')[0].toUpperCase()}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{event.date.split(' ')[1].replace(',', '')}</div>
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
