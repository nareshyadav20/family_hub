import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Info, GitFork, Image, Calendar, BookOpen, Phone, LogIn, UserPlus, ChevronDown, Bell, User, LogOut } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'Features', href: '#features', icon: Info },
  { label: 'Testimonials', href: '#testimonials', icon: BookOpen },
  { label: 'Contact', href: '#contact', icon: Phone },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      transition: 'all 0.3s ease',
      background: scrolled ? 'rgba(255,255,255,0.92)' : 'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(229,231,235,0.8)' : '1px solid transparent',
      boxShadow: scrolled ? '0 4px 24px rgba(79,70,229,0.08)' : 'none',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 72 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(79,70,229,0.4)'
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 18, color: '#111827', lineHeight: 1.1 }}>FamilyHub</div>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>Digital Legacy</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }} className="desktop-nav">
          {navLinks.map(link => (
            <a key={link.href} href={link.href} style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
              color: location.pathname === link.href ? '#4F46E5' : '#374151',
              background: location.pathname === link.href ? 'rgba(79,70,229,0.08)' : 'transparent',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}>
              {link.label}
            </a>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link to="/login" className="btn btn-ghost" style={{ padding: '10px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogIn size={16} /> Sign In
          </Link>
          <Link to="/login?mode=signup" className="btn btn-primary" style={{ padding: '10px 20px', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={16} /> Join Family
          </Link>
          <button onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }} className="mobile-menu-btn">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: 16 }}>
          {navLinks.map(link => (
            <a key={link.href} href={link.href} onClick={() => setIsOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
              color: location.pathname === link.href ? '#4F46E5' : '#374151',
              fontWeight: 500, fontSize: 15, textDecoration: 'none', marginBottom: 4,
              background: location.pathname === link.href ? 'rgba(79,70,229,0.08)' : 'transparent',
            }}>
              <link.icon size={18} /> {link.label}
            </a>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Link to="/login" className="btn btn-ghost" style={{ flex: 1, justifyContent: 'center', padding: '12px', textDecoration: 'none' }}>Sign In</Link>
            <Link to="/login?mode=signup" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px', textDecoration: 'none' }}>Join Family</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </nav>
  );
}
