import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, Image, Calendar, BookOpen, Star, Play, ChevronDown, Heart, Globe, Shield } from 'lucide-react';
import axios from 'axios';
import Navbar from '../components/landing/Navbar';
import Footer from '../components/landing/Footer';
import '../landing.css';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/website`;

const features = [
  { icon: Shield, title: 'Bank-Level Security', desc: 'Your family\'s data is protected with AES-256 encryption and zero-knowledge architecture.', color: '#4F46E5' },
  { icon: Globe, title: 'Global Access', desc: 'Access your family\'s history, media, and connections from anywhere in the world.', color: '#7C3AED' },
  { icon: Heart, title: 'Built with Love', desc: 'Designed for families first — intuitive, warm, and personal at every step.', color: '#EF4444' },
  { icon: Users, title: 'Unlimited Members', desc: 'Add your entire extended family — cousins, grandparents, and generations to come.', color: '#14B8A6' },
];

const testimonials = [
  { name: 'Priya Sharma', relation: 'Family Head', text: 'FamilyHub OS has transformed how we preserve our heritage. Every photo, story, and milestone is now beautifully organized.', avatar: 'https://i.pravatar.cc/150?img=47', rating: 5 },
  { name: 'Michael Johnson', relation: 'Son', text: 'Connecting with relatives I had never met through our family tree was an emotional experience I will never forget.', avatar: 'https://i.pravatar.cc/150?img=11', rating: 5 },
  { name: 'Ananya Mehta', relation: 'Daughter-in-law', text: 'The gallery feature is stunning. We have uploaded thousands of photos and they are all perfectly catalogued.', avatar: 'https://i.pravatar.cc/150?img=23', rating: 5 },
];

export default function Home() {
  const [activeMemory, setActiveMemory] = useState(0);
  const [homeData, setHomeData] = useState({ stats: null, memories: [], upcomingEvents: [] });

  useEffect(() => {
    axios.get(`${API_URL}/home`)
      .then(res => setHomeData(res.data))
      .catch(err => console.error(err));
      
    const t = setInterval(() => {
      setHomeData(prev => {
         if (prev.memories.length > 0) {
            setActiveMemory(val => (val + 1) % prev.memories.length);
         }
         return prev;
      });
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const statsList = [
    { label: 'Family Members', value: homeData.stats?.totalMembers || '0', icon: Users, color: '#4F46E5' },
    { label: 'Generations', value: homeData.stats?.generations || '0', icon: Image, color: '#7C3AED' },
    { label: 'Countries', value: homeData.stats?.countries || '0', icon: Calendar, color: '#14B8A6' },
    { label: 'Photos Shared', value: homeData.stats?.photos || '0', icon: BookOpen, color: '#F59E0B' },
  ];

  return (
    <div style={{ paddingTop: 72 }}>
      <Navbar />
      {/* === HERO === */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 40%, #ECFDF5 100%)' }}>
        {/* Decorative blobs */}
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', background: 'linear-gradient(135deg, rgba(79,70,229,0.15), rgba(124,58,237,0.1))', top: -100, right: -100, animation: 'blob 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', background: 'linear-gradient(135deg, rgba(20,184,166,0.12), rgba(79,70,229,0.08))', bottom: -80, left: -100, animation: 'blob 12s ease-in-out infinite reverse' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div style={{ animation: 'fadeInUp 0.8s ease both' }}>
              <div className="badge badge-primary" style={{ marginBottom: 24 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#4F46E5', display: 'inline-block' }} />
                Trusted by 10,000+ Families Worldwide
              </div>
              <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: 900, lineHeight: 1.1, marginBottom: 24, color: '#111827' }}>
                Your Family's{' '}
                <span className="gradient-text">Digital Legacy</span>
                {' '}Starts Here
              </h1>
              <p style={{ fontSize: 18, color: '#6B7280', lineHeight: 1.8, marginBottom: 40, maxWidth: 480 }}>
                Preserve memories, celebrate milestones, and keep every generation connected through one beautiful, secure platform.
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginBottom: 48 }}>
                <Link to="/login?mode=signup" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px', textDecoration: 'none' }}>
                  Join Your Family <ArrowRight size={18} />
                </Link>
                <a href="#features" className="btn btn-outline" style={{ fontSize: 16, padding: '14px 32px' }}>
                  <Play size={16} /> See How It Works
                </a>
              </div>
              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 32 }}>
                {[['10K+', 'Families'], ['500K+', 'Memories'], ['99.9%', 'Uptime']].map(([val, label]) => (
                  <div key={label}>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 22, fontWeight: 800, color: '#111827' }}>{val}</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF' }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero visual */}
            <div style={{ position: 'relative', animation: 'float 6s ease-in-out infinite' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: 520, marginLeft: 'auto' }}>
                {/* Main card */}
                <div style={{ borderRadius: 24, background: 'white', padding: 24, boxShadow: '0 40px 100px rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.08)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 16, color: '#111827' }}>The Smith Family</div>
                      <div style={{ fontSize: 13, color: '#9CA3AF' }}>Est. 1952 • 247 Members</div>
                    </div>
                    <div style={{ padding: '6px 14px', borderRadius: 50, background: 'rgba(16,185,129,0.1)', fontSize: 12, fontWeight: 700, color: '#10B981' }}>● Live</div>
                  </div>
                  {/* Photo grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 16 }}>
                    <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&h=200&fit=crop" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', height: 160 }} alt="Family" />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <img src="https://images.unsplash.com/photo-1530103862676-de8892cb7370?w=200&h=90&fit=crop" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', height: 72 }} alt="Birthday" />
                      <img src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=90&fit=crop" style={{ width: '100%', borderRadius: 14, objectFit: 'cover', height: 72 }} alt="Beach" />
                    </div>
                  </div>
                  {/* Events preview */}
                  <div style={{ background: 'linear-gradient(135deg, rgba(79,70,229,0.06), rgba(124,58,237,0.04))', borderRadius: 14, padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Calendar size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Summer Reunion</div>
                        <div style={{ fontSize: 12, color: '#9CA3AF' }}>Aug 15, 2026 • 45 going</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#4F46E5', background: 'rgba(79,70,229,0.1)', padding: '4px 12px', borderRadius: 50 }}>RSVP</span>
                  </div>
                </div>

                {/* Floating badges */}
                <div style={{ position: 'absolute', top: -20, left: -20, borderRadius: 14, padding: '12px 16px', background: 'white', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B, #EF4444)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎂</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 12, color: '#111827' }}>Birthday Today!</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>Grandpa turns 82</div>
                  </div>
                </div>
                <div style={{ position: 'absolute', bottom: -16, right: -16, borderRadius: 14, padding: '12px 16px', background: 'white', boxShadow: '0 12px 40px rgba(0,0,0,0.12)', display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', marginRight: 4 }}>
                    {[10, 20, 30].map(i => <img key={i} src={`https://i.pravatar.cc/40?img=${i}`} style={{ width: 28, height: 28, borderRadius: '50%', border: '2px solid white', marginLeft: -8 }} alt="" />)}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>+12 new members this month</div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div style={{ position: 'absolute', bottom: -40, left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#9CA3AF', fontSize: 13 }}>
            <span>Scroll to explore</span>
            <ChevronDown size={20} style={{ animation: 'float 2s ease-in-out infinite' }} />
          </div>
        </div>
      </section>

      {/* === STATS === */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 }}>
            {statsList.map((stat, i) => (
              <div key={i} style={{ animation: `fadeInUp 0.6s ease ${i * 0.1}s both`, textAlign: 'center', padding: 32, borderRadius: 20, border: '1px solid #F3F4F6', boxShadow: '0 4px 24px rgba(0,0,0,0.04)', transition: 'all 0.3s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = `0 20px 60px rgba(0,0,0,0.10)`}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.04)'}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${stat.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <stat.icon size={24} color={stat.color} />
                </div>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontSize: 36, fontWeight: 900, color: '#111827', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 14, color: '#9CA3AF', marginTop: 8, fontWeight: 500 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FEATURES === */}
      <section id="features" style={{ padding: '80px 0', background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16, margin: '0 auto 16px', display: 'inline-flex' }}>Why FamilyHub OS</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 900, marginBottom: 16 }}>Everything Your Family Needs</h2>
            <p style={{ fontSize: 17, color: '#6B7280', maxWidth: 520, margin: '0 auto' }}>A complete platform designed to keep your family closer and your memories safe forever.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {features.map((f, i) => (
              <div key={i} className="card" style={{ padding: 32, cursor: 'default', animation: `fadeInUp 0.6s ease ${i * 0.12}s both` }}>
                <div style={{ width: 56, height: 56, borderRadius: 16, background: `${f.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <f.icon size={26} color={f.color} />
                </div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 12, color: '#111827' }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === MEMORIES PREVIEW === */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div>
              <div className="badge badge-primary" style={{ marginBottom: 20 }}>Memory Gallery</div>
              <h2 style={{ fontSize: 40, fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>Cherish Every<br /><span className="gradient-text">Precious Moment</span></h2>
              <p style={{ fontSize: 16, color: '#6B7280', lineHeight: 1.8, marginBottom: 32 }}>
                From first birthdays to golden anniversaries, every family photo tells a story worth preserving for generations to come.
              </p>
              <div style={{ display: 'flex', gap: 16 }}>
                <Link to="/login" className="btn btn-primary">Explore Gallery <ArrowRight size={16} /></Link>
                <Link to="/login" className="btn btn-ghost" style={{ textDecoration: 'none' }}>Upload Photos</Link>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {homeData.memories.map((m, i) => (
                <div key={i} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  <img src={m.thumbnailUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=280&fit=crop'} alt={m.title} style={{ width: '100%', height: i === 0 ? 200 : 130, objectFit: 'cover' }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)' }} />
                  <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14 }}>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 13, color: 'white' }}>{m.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{new Date(m.eventDate).getFullYear()} • ❤ 0</div>
                  </div>
                </div>
              ))}
              {homeData.memories.length === 0 && (
                <div style={{color: '#9CA3AF', fontSize: 14}}>No recent memories.</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* === UPCOMING EVENTS === */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #0F172A, #1E1B4B)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 48 }}>
            <div>
              <div className="badge" style={{ background: 'rgba(79,70,229,0.3)', color: '#A5B4FC', marginBottom: 16 }}>Upcoming Events</div>
              <h2 style={{ fontSize: 40, fontWeight: 900, color: 'white', lineHeight: 1.2 }}>Never Miss a<br />Family Milestone</h2>
            </div>
            <Link to="/login" style={{ color: '#A5B4FC', fontSize: 15, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}>
              View All Events <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {homeData.upcomingEvents.map((ev, i) => (
              <div key={i} style={{ borderRadius: 20, padding: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', transition: 'all 0.3s', cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <span style={{ padding: '5px 14px', borderRadius: 50, fontSize: 12, fontWeight: 700, background: `#4F46E525`, color: '#4F46E5' }}>{ev.category}</span>
                  <div style={{ textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{ev.maxGuests || 0} max attending</div>
                </div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, color: 'white', marginBottom: 12 }}>{ev.name}</h3>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>📅 {new Date(ev.eventDate).toLocaleDateString()}</div>
                <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>📍 {ev.venue}</div>
                <button style={{ width: '100%', padding: '12px', borderRadius: 12, border: `1px solid #4F46E5`, color: '#4F46E5', background: 'transparent', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#4F46E5'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4F46E5'; }}>
                  RSVP Now
                </button>
              </div>
            ))}
            {homeData.upcomingEvents.length === 0 && (
               <div style={{color: 'white', fontSize: 14}}>No upcoming public events.</div>
            )}
          </div>
        </div>
      </section>

      {/* === TESTIMONIALS === */}
      <section id="testimonials" style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex', margin: '0 auto 16px' }}>Family Stories</div>
            <h2 style={{ fontSize: 40, fontWeight: 900 }}>Loved by Families Everywhere</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: 32 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 20 }}>
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={16} fill="#F59E0B" color="#F59E0B" />)}
                </div>
                <p style={{ fontSize: 15, color: '#374151', lineHeight: 1.8, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <img src={t.avatar} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} alt={t.name} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>{t.name}</div>
                    <div style={{ fontSize: 13, color: '#9CA3AF' }}>{t.relation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === CTA === */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -100, right: -100 }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -80, left: -80 }} />
        <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 52px)', fontWeight: 900, color: 'white', marginBottom: 20 }}>Start Your Family's<br />Digital Journey Today</h2>
          <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.8)', marginBottom: 40, maxWidth: 480, margin: '0 auto 40px' }}>
            Join thousands of families already preserving their legacy on FamilyHub OS.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login?mode=signup" className="btn btn-white" style={{ fontSize: 16, padding: '16px 36px', textDecoration: 'none' }}>
              Get Started Free <ArrowRight size={18} />
            </Link>
            <a href="#features" className="btn" style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', fontSize: 16, padding: '16px 36px' }}>
              Learn More
            </a>
          </div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 24 }}>Free forever for families • No credit card required</p>
        </div>
      </section>
      <Footer />
    </div>
  );
}
