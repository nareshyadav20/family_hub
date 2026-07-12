import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Image, Calendar, Users, Folder, Megaphone, LogOut, Menu, X, ChevronRight, Bell, Globe } from 'lucide-react';

const privateNav = [
  { label: 'Dashboard', href: '/private', icon: LayoutDashboard },
  { label: 'Private Gallery', href: '/private/gallery', icon: Image },
  { label: 'Private Events', href: '/private/events', icon: Calendar },
  { label: 'Member Directory', href: '/private/members', icon: Users },
  { label: 'Documents', href: '/private/documents', icon: Folder },
  { label: 'Announcements', href: '/private/announcements', icon: Megaphone },
];

export default function PrivateLayout({ children, title, subtitle }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { 
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login'); 
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#F8FAFC', fontFamily: 'Inter,sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: sidebarOpen ? 260 : 72, flexShrink: 0, background: '#0F172A', display: 'flex', flexDirection: 'column', transition: 'width 0.3s ease', overflow: 'hidden' }}>
        <div style={{ padding: '24px 16px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 15, color: 'white', whiteSpace: 'nowrap' }}>FamilyHub</div>
                <div style={{ fontSize: 11, color: '#64748B', whiteSpace: 'nowrap' }}>Private Portal</div>
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: '16px 10px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {privateNav.map(({ label, href, icon: Icon }) => {
            const isActive = location.pathname === href;
            return (
              <Link key={href} to={href} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 12, textDecoration: 'none', transition: 'all 0.2s', background: isActive ? 'rgba(79,70,229,0.2)' : 'transparent', color: isActive ? '#A5B4FC' : '#64748B', borderLeft: isActive ? '3px solid #4F46E5' : '3px solid transparent', whiteSpace: 'nowrap', overflow: 'hidden' }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; } }}>
                <Icon size={20} style={{ flexShrink: 0 }} />
                {sidebarOpen && <span style={{ fontWeight: 600, fontSize: 14 }}>{label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '16px 10px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 12, textDecoration: 'none', color: '#64748B', marginBottom: 4, transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B'; }}>
            <Globe size={20} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ fontWeight: 600, fontSize: 14 }}>Public Website</span>}
          </Link>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 12px', borderRadius: 12, border: 'none', background: 'transparent', cursor: 'pointer', color: '#EF4444', width: '100%', transition: 'all 0.2s', whiteSpace: 'nowrap', overflow: 'hidden' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <LogOut size={20} style={{ flexShrink: 0 }} />
            {sidebarOpen && <span style={{ fontWeight: 600, fontSize: 14 }}>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <header style={{ height: 64, background: 'white', borderBottom: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px', flexShrink: 0, boxShadow: '0 1px 8px rgba(0,0,0,0.04)', position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button onClick={() => setSidebarOpen(p => !p)} style={{ border: 'none', background: '#F3F4F6', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#374151' }}>
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
            {title && (
              <div>
                <h1 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 18, color: '#111827', lineHeight: 1 }}>{title}</h1>
                {subtitle && <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 2 }}>{subtitle}</p>}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button style={{ position: 'relative', border: 'none', background: '#F3F4F6', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#374151' }}>
              <Bell size={18} />
              <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: '#EF4444', border: '1.5px solid white' }} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src="https://i.pravatar.cc/50?img=12" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }} alt={user?.name} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{user?.name}</div>
                <div style={{ fontSize: 12, color: '#9CA3AF' }}>Family Member</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflow: 'auto', padding: '32px', background: 'linear-gradient(135deg, #F8FAFC, #EEF2FF 50%, #F8FAFC)' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
