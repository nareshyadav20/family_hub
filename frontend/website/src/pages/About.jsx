import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Star, BookOpen, Users } from 'lucide-react';

const timeline = [
  { year: '1952', title: 'The Beginning', desc: 'Robert and Martha Smith marry in a small ceremony in Springfield, Illinois. The beginning of an extraordinary legacy.', emoji: '💍' },
  { year: '1958', title: 'First Generation', desc: 'Three children born — James, William, and Patricia. The family home rings with laughter and love.', emoji: '👶' },
  { year: '1975', title: 'Expanding Horizons', desc: 'The next generation begins. First grandchild Arjun is born, bringing new joy to an ever-growing family.', emoji: '🌱' },
  { year: '1995', title: 'Coast to Coast', desc: 'Family members spread across the USA — New York, California, Texas, and beyond. Annual reunions become a beloved tradition.', emoji: '🗺️' },
  { year: '2010', title: 'Going Global', desc: 'Family branches reach three continents. International video calls and photo sharing become the new normal.', emoji: '🌍' },
  { year: '2024', title: 'Digital Legacy', desc: 'FamilyHub OS is created to preserve every memory, story, and milestone for all future generations.', emoji: '✨' },
];

const values = [
  { icon: Heart, title: 'Love', desc: 'Love is the foundation of everything we do as a family.', color: '#EF4444' },
  { icon: Star, title: 'Excellence', desc: 'We strive to honor our heritage through excellence in all we pursue.', color: '#F59E0B' },
  { icon: Users, title: 'Togetherness', desc: 'No matter where we are, we remain connected as one family.', color: '#4F46E5' },
  { icon: BookOpen, title: 'Remembrance', desc: 'We cherish every story, photo, and memory of those who came before us.', color: '#14B8A6' },
];

export default function About() {
  return (
    <div style={{ paddingTop: 72 }}>
      {/* Hero */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: 20, display: 'inline-flex' }}>Our Story</div>
          <h1 style={{ fontSize: 56, fontWeight: 900, marginBottom: 24, lineHeight: 1.1 }}>
            The <span className="gradient-text">Smith Family</span><br />Legacy
          </h1>
          <p style={{ fontSize: 18, color: '#6B7280', maxWidth: 580, margin: '0 auto 40px', lineHeight: 1.8 }}>
            For over 70 years, our family has grown across continents, created memories across generations, and built bonds that time cannot break.
          </p>
          <img src="https://images.unsplash.com/photo-1511895426328-dc8714191300?w=1200&h=500&fit=crop" style={{ borderRadius: 24, width: '100%', maxHeight: 420, objectFit: 'cover', boxShadow: '0 40px 100px rgba(79,70,229,0.15)' }} alt="Family" />
        </div>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48 }}>
            <div style={{ padding: 40, borderRadius: 24, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 16 }}>Our Mission</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.9 }}>
                To preserve the Smith family's rich history, celebrate our milestones, and ensure that every member — from the eldest to the youngest yet to be born — feels deeply connected to their roots and to each other.
              </p>
            </div>
            <div style={{ padding: 40, borderRadius: 24, background: 'linear-gradient(135deg, #14B8A6, #3B82F6)', color: 'white' }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>🔭</div>
              <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 28, marginBottom: 16 }}>Our Vision</h2>
              <p style={{ fontSize: 16, lineHeight: 1.8, opacity: 0.9 }}>
                A world where every Smith family member, regardless of where they live, wakes up each day knowing they belong to something timeless — a family whose love transcends distance, time, and generations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 style={{ fontSize: 44, fontWeight: 900, marginBottom: 16 }}>What We Stand For</h2>
            <p style={{ fontSize: 17, color: '#6B7280' }}>The values that have guided our family for generations.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            {values.map((v, i) => (
              <div key={i} className="card" style={{ padding: 32, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 20, background: `${v.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <v.icon size={28} color={v.color} />
                </div>
                <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#111827' }}>{v.title}</h3>
                <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '80px 0', background: 'white' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Our History</div>
            <h2 style={{ fontSize: 44, fontWeight: 900 }}>Family Through the Ages</h2>
          </div>
          <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, background: 'linear-gradient(to bottom, #4F46E5, #7C3AED, #14B8A6)', transform: 'translateX(-50%)' }} />
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 40, marginBottom: 48, flexDirection: i % 2 === 0 ? 'row' : 'row-reverse', animation: `fadeInUp 0.6s ease ${i * 0.1}s both` }}>
                <div style={{ flex: 1, textAlign: i % 2 === 0 ? 'right' : 'left' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#4F46E5', marginBottom: 8 }}>{item.year}</div>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 18, marginBottom: 8, color: '#111827' }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: '#6B7280', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'white', border: '3px solid #4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0, boxShadow: '0 0 0 6px rgba(79,70,229,0.1)', zIndex: 1 }}>
                  {item.emoji}
                </div>
                <div style={{ flex: 1 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 0', background: 'linear-gradient(135deg, #0F172A, #1E1B4B)', textAlign: 'center' }}>
        <div className="container">
          <h2 style={{ fontSize: 44, fontWeight: 900, color: 'white', marginBottom: 20 }}>Be Part of Our Story</h2>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.7)', maxWidth: 480, margin: '0 auto 40px', lineHeight: 1.8 }}>Join the family, add your chapter, and help write the next generation of our legacy.</p>
          <a href="http://localhost:5173/login?mode=signup" className="btn btn-primary" style={{ fontSize: 16, padding: '16px 36px', textDecoration: 'none' }}>Join the Family <ArrowRight size={18} /></a>
        </div>
      </section>
    </div>
  );
}
