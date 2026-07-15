import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Camera, MessageCircle, PlayCircle, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{ background: '#0F172A', color: '#94A3B8', padding: '64px 0 32px' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 48, marginBottom: 48 }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 14, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 20, color: 'white' }}>FamilyHub OS</div>
                <div style={{ fontSize: 12, color: '#64748B' }}>Digital Family Legacy</div>
              </div>
            </div>
            <p style={{ fontSize: 14, lineHeight: 1.7, marginBottom: 20, color: '#64748B' }}>
              Preserving memories, celebrating milestones, and connecting generations through technology.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {[Share2, Camera, MessageCircle, PlayCircle].map((Icon, i) => (
                <a key={i} href="#" style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s', color: '#94A3B8' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(79,70,229,0.3)'; e.currentTarget.style.color = 'white'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#94A3B8'; }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Poppins,sans-serif', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Explore</h4>
            {[['Home', '/'], ['About Us', '/about'], ['Family Tree', '/tree'], ['Gallery', '/gallery'], ['Events', '/events'], ['Stories', '/stories']].map(([label, href]) => (
              <Link key={href} to={href} style={{ display: 'block', color: '#64748B', fontSize: 14, marginBottom: 10, transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
                → {label}
              </Link>
            ))}
          </div>

          {/* Members */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Poppins,sans-serif', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Members</h4>
            {[['Join Family', '/login?join=true'], ['Private Gallery', '/private/gallery'], ['Family Events', '/private/events'], ['Documents', '/private/documents'], ['Announcements', '/private/announcements']].map(([label, href]) => (
              <Link key={label} to={href} style={{ display: 'block', color: '#64748B', fontSize: 14, marginBottom: 10, transition: 'color 0.2s', textDecoration: 'none' }}
                onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                onMouseLeave={e => e.currentTarget.style.color = '#64748B'}>
                → {label}
              </Link>
            ))}
          </div>

          {/* Contact */}
          <div>
            <h4 style={{ color: 'white', fontFamily: 'Poppins,sans-serif', fontWeight: 700, marginBottom: 20, fontSize: 16 }}>Get in Touch</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { icon: Mail, text: 'family@familyhubos.com' },
                { icon: Phone, text: '+1 (555) 123-4567' },
                { icon: MapPin, text: 'San Francisco, CA, USA' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: '#64748B' }}>
                  <Icon size={16} color="#4F46E5" /> {text}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, padding: '16px 20px', borderRadius: 14, background: 'rgba(79,70,229,0.1)', border: '1px solid rgba(79,70,229,0.2)' }}>
              <p style={{ fontSize: 13, color: '#94A3B8', marginBottom: 10 }}>Subscribe to family updates</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="email" placeholder="Your email" style={{ flex: 1, padding: '8px 14px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)', color: 'white', fontSize: 13, outline: 'none' }} />
                <button style={{ padding: '8px 14px', borderRadius: 8, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>→</button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 28, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: 13, color: '#475569' }}>© 2026 FamilyHub OS. All rights reserved. Made with <Heart size={12} style={{ display: 'inline', color: '#EF4444' }} /> for families worldwide.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
              <a key={item} href="#" style={{ fontSize: 13, color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.color = '#4F46E5'}
                onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
