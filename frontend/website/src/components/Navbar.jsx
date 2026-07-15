import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Info, GitFork, Image, Calendar, BookOpen, Phone, LogIn, UserPlus, ChevronDown, Bell, User, LogOut } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: '/', icon: Home },
  { label: 'About', href: '/about', icon: Info },
  { label: 'Family Tree', href: '/tree', icon: GitFork },
  { label: 'Gallery', href: '/gallery', icon: Image },
  { label: 'Events', href: '/events', icon: Calendar },
  { label: 'Stories', href: '/stories', icon: BookOpen },
  { label: 'Contact', href: '/contact', icon: Phone },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'http://localhost:5174/login?join=true';
  };

  const getDashboardUrl = () => {
    if (!user) return '/login';
    const role = user.role || 'MEMBER';
    return (role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'FAMILY_ADMIN') 
       ? 'http://localhost:5173/admin/dashboard' 
       : 'http://localhost:5173/member/dashboard';
  };

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
            <Link key={link.href} to={link.href} style={{
              padding: '8px 14px', borderRadius: 10, fontSize: 14, fontWeight: 500,
              color: location.pathname === link.href ? '#4F46E5' : '#374151',
              background: location.pathname === link.href ? 'rgba(79,70,229,0.08)' : 'transparent',
              transition: 'all 0.2s',
              textDecoration: 'none',
            }}>
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 16px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                color: 'white', fontWeight: 600, fontSize: 14,
              }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <User size={14} />
                </div>
                {user.name || 'Member'}
                <ChevronDown size={14} />
              </button>
              {showUserMenu && (
                <div style={{
                  position: 'absolute', right: 0, top: '110%', minWidth: 200,
                  background: 'white', borderRadius: 16, border: '1px solid #E5E7EB',
                  boxShadow: '0 20px 60px rgba(0,0,0,0.12)', padding: 8, zIndex: 100,
                }}>
                  <a href={getDashboardUrl()} onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, color: '#374151', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <Home size={16} color="#4F46E5" /> My Dashboard
                  </a>
                  <a href={`${getDashboardUrl()}/gallery`} onClick={() => setShowUserMenu(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, color: '#374151', fontSize: 14, fontWeight: 500, textDecoration: 'none', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#F9FAFB'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <Image size={16} color="#4F46E5" /> Private Gallery
                  </a>
                  <div style={{ height: 1, background: '#E5E7EB', margin: '8px 0' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderRadius: 10, color: '#EF4444', fontSize: 14, fontWeight: 500, width: '100%', border: 'none', background: 'transparent', cursor: 'pointer', transition: 'background 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background='#FEF2F2'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <LogOut size={16} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login?join=true" className="btn btn-primary" style={{ padding: '10px 20px' }}>
              <UserPlus size={16} /> Join Family
            </Link>
          )}
          <button onClick={() => setIsOpen(!isOpen)} style={{ display: 'none', border: 'none', background: 'transparent', cursor: 'pointer', padding: 4 }} className="mobile-menu-btn">
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div style={{ background: 'white', borderTop: '1px solid #E5E7EB', padding: 16 }}>
          {navLinks.map(link => (
            <Link key={link.href} to={link.href} onClick={() => setIsOpen(false)} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 12,
              color: location.pathname === link.href ? '#4F46E5' : '#374151',
              fontWeight: 500, fontSize: 15, textDecoration: 'none', marginBottom: 4,
              background: location.pathname === link.href ? 'rgba(79,70,229,0.08)' : 'transparent',
            }}>
              <link.icon size={18} /> {link.label}
            </Link>
          ))}
          <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
            <Link to="/login?join=true" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>Join Family</Link>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) { .desktop-nav { display: none !important; } .mobile-menu-btn { display: flex !important; } }
      `}</style>
    </nav>
  );
}
