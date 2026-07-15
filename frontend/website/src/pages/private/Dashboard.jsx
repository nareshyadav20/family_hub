import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

import PrivateLayout from '../../components/PrivateLayout';
import { Users, Image, Calendar, Folder, Megaphone, Bell, TrendingUp, Heart, BookOpen, ChevronRight, ArrowRight } from 'lucide-react';

const quickLinks = [
  { label: 'Private Gallery', href: '/private/gallery', icon: Image, color: '#7C3AED' },
  { label: 'Events', href: '/private/events', icon: Calendar, color: '#4F46E5' },
  { label: 'Member Directory', href: '/private/members', icon: Users, color: '#14B8A6' },
  { label: 'Documents', href: '/private/documents', icon: Folder, color: '#F59E0B' },
  { label: 'Announcements', href: '/private/announcements', icon: Megaphone, color: '#EF4444' },
];

export default function PrivateDashboard() {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const token = localStorage.getItem('token');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  
  const [data, setData] = useState({
     stats: { totalMembers: 0, activeMembers: 0, eventsThisMonth: 0, photos: 0, documents: 0 },
     upcomingBirthdays: [],
     feedPosts: []
  });

  useEffect(() => {
     axios.get(`${API_URL}/member/dashboard`, { headers: { Authorization: `Bearer ${token}` } })
       .then(res => setData(res.data))
       .catch(err => console.error(err));
  }, [token]);

  const dashStats = [
    { label: 'Family Members', value: data.stats.totalMembers || '0', icon: Users, color: '#4F46E5', bg: 'rgba(79,70,229,0.1)', change: `${data.stats.activeMembers || 0} active` },
    { label: 'Gallery Photos', value: data.stats.photos || '0', icon: Image, color: '#7C3AED', bg: 'rgba(124,58,237,0.1)', change: 'Photos Shared' },
    { label: 'Upcoming Events', value: data.stats.eventsThisMonth || '0', icon: Calendar, color: '#14B8A6', bg: 'rgba(20,184,166,0.1)', change: 'This Month' },
    { label: 'Documents', value: data.stats.documents || '0', icon: Folder, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)', change: 'Uploaded' },
  ];

  return (
    <PrivateLayout title="Dashboard" subtitle="Welcome to your private family space">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>

        {/* Welcome Banner */}
        <div style={{ borderRadius: 24, padding: '32px 40px', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', right: -40, top: -40 }} />
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', left: -30, bottom: -40 }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 8 }}>{greeting},</div>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 900, fontSize: 32, marginBottom: 12 }}>Welcome back, {user?.name?.split(' ')[0]} 👋</h2>
              <p style={{ fontSize: 16, opacity: 0.85, maxWidth: 420 }}>You are connected to 247 family members. 6 upcoming events, 2 unread announcements.</p>
            </div>
            <img src="https://i.pravatar.cc/100?img=12" style={{ width: 80, height: 80, borderRadius: '50%', border: '4px solid rgba(255,255,255,0.4)', objectFit: 'cover' }} alt={user?.name} />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
          {dashStats.map((s, i) => (
            <div key={i} style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', transition: 'all 0.3s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.10)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.04)'; }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ width: 48, height: 48, borderRadius: 14, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={22} color={s.color} />
                </div>
              </div>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 30, fontWeight: 900, color: '#111827', lineHeight: 1, marginBottom: 6 }}>{s.value}</div>
              <div style={{ fontSize: 14, color: '#6B7280', fontWeight: 500, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>{s.change}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Recent Activity */}
          <div style={{ background: 'white', borderRadius: 20, padding: 28, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 18, color: '#111827' }}>Recent Activity</h3>
              <span style={{ fontSize: 13, color: '#4F46E5', fontWeight: 600, cursor: 'pointer' }}>View All</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {data.feedPosts.length > 0 ? data.feedPosts.slice(0, 5).map((act, i) => (
                <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', paddingBottom: 20, borderBottom: i < Math.min(data.feedPosts.length, 5) - 1 ? '1px solid #F3F4F6' : 'none' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Folder size={18} color="#6B7280" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 14, color: '#374151', lineHeight: 1.5, fontWeight: 500 }}>{act.name || act.title}</p>
                    <p style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>{new Date(act.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              )) : (
                 <div style={{ color: '#9CA3AF', fontSize: 14 }}>No recent activity.</div>
              )}
            </div>
          </div>

          {/* Birthdays + Quick Links */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Birthdays */}
            <div style={{ background: 'linear-gradient(135deg, #FFF7ED, #FEF3C7)', borderRadius: 20, padding: 24, border: '1px solid #FDE68A' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 22 }}>🎂</span>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 16, color: '#92400E' }}>Upcoming Birthdays</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.upcomingBirthdays.length > 0 ? data.upcomingBirthdays.map((b, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <img src={b.avatar || `https://ui-avatars.com/api/?name=${b.name}`} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} alt={b.name} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: '#78350F' }}>{b.name}</div>
                      <div style={{ fontSize: 12, color: '#92400E' }}>Turning {b.turningThisYear}</div>
                    </div>
                    <span style={{ fontSize: 18 }}>🎁</span>
                  </div>
                )) : (
                   <div style={{ color: '#92400E', fontSize: 14 }}>No upcoming birthdays.</div>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ background: 'white', borderRadius: 20, padding: 24, border: '1px solid #E5E7EB', boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }}>
              <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 16, color: '#111827', marginBottom: 16 }}>Quick Access</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {quickLinks.map(({ label, href, icon: Icon, color }) => (
                  <Link key={href} to={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, textDecoration: 'none', transition: 'background 0.2s', color: '#374151' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ width: 32, height: 32, borderRadius: 9, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={16} color={color} />
                    </div>
                    <span style={{ flex: 1, fontWeight: 600, fontSize: 14 }}>{label}</span>
                    <ChevronRight size={14} color="#9CA3AF" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PrivateLayout>
  );
}
