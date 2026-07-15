import React, { useState } from 'react';
import { BookOpen, Heart, Clock, User, ArrowRight, Search } from 'lucide-react';
import axios from 'axios';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/website`;

const categories = ['All', 'Elder Stories', 'Memories', 'Articles'];

export default function Stories() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState(new Set());
  const [stories, setStories] = useState([]);

  useEffect(() => {
     axios.get(`${API_URL}/stories`)
        .then(res => {
           const mapped = res.data.map(s => ({
              id: s.id,
              title: s.title,
              author: s.addedBy ? `${s.addedBy.firstName} ${s.addedBy.lastName}` : 'Anonymous',
              authorAvatar: s.addedBy?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(s.addedBy ? s.addedBy.firstName : 'A')}&background=random`,
              date: new Date(s.eventDate).toLocaleDateString(),
              readTime: '5 min read',
              category: s.category || 'Memories',
              image: s.thumbnailUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=340&fit=crop',
              excerpt: s.description || '',
              likes: 0,
              color: '#4F46E5'
           }));
           setStories(mapped);
        })
        .catch(err => console.error(err));
  }, []);

  const filtered = stories.filter(s =>
    (activeCategory === 'All' || s.category === activeCategory) &&
    (s.title.toLowerCase().includes(search.toLowerCase()) || s.author.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ paddingTop: 72 }}>
      {/* Header */}
      <section style={{ padding: '64px 0 48px', background: 'linear-gradient(135deg, #EEF2FF, #F5F3FF)', textAlign: 'center' }}>
        <div className="container">
          <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Family Stories</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Stories & <span className="gradient-text">Memories</span></h1>
          <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 32 }}>Articles, elder stories, and precious memories written by family members.</p>
          <div style={{ position: 'relative', width: 360, margin: '0 auto' }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stories..." style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 50, border: '1px solid #E5E7EB', background: 'white', fontSize: 14, outline: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} />
          </div>
        </div>
      </section>

      <section style={{ padding: '48px 0', background: 'white' }}>
        <div className="container">
          {/* Category tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 40, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} style={{ padding: '10px 24px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, transition: 'all 0.2s', background: activeCategory === cat ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F3F4F6', color: activeCategory === cat ? 'white' : '#374151' }}>
                {cat}
              </button>
            ))}
          </div>

          {/* Featured story (first story) */}
          {filtered.length > 0 && (
            <div className="card" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden', marginBottom: 48, animation: 'fadeInUp 0.6s ease both' }}>
              <div style={{ position: 'relative', minHeight: 360, overflow: 'hidden' }}>
                <img src={filtered[0].image} alt={filtered[0].title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', top: 20, left: 20 }}>
                  <span style={{ padding: '6px 16px', borderRadius: 50, background: filtered[0].color, color: 'white', fontSize: 12, fontWeight: 700 }}>Featured • {filtered[0].category}</span>
                </div>
              </div>
              <div style={{ padding: 40, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                  <img src={filtered[0].authorAvatar} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt={filtered[0].author} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>{filtered[0].author}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF' }}>{filtered[0].date}</div>
                  </div>
                </div>
                <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 26, color: '#111827', marginBottom: 16, lineHeight: 1.3 }}>{filtered[0].title}</h2>
                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.8, marginBottom: 24 }}>{filtered[0].excerpt.substring(0, 200)}...</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#9CA3AF' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {filtered[0].readTime}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Heart size={14} fill={liked.has(filtered[0].id) ? '#EF4444' : 'none'} color={liked.has(filtered[0].id) ? '#EF4444' : '#9CA3AF'} /> {filtered[0].likes}</span>
                  </div>
                  <a href="#" style={{ display: 'flex', alignItems: 'center', gap: 8, color: filtered[0].color, fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>Read Story <ArrowRight size={16} /></a>
                </div>
              </div>
            </div>
          )}
          {filtered.length === 0 && (
             <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>No stories available yet.</div>
          )}

          {/* Story grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 24 }}>
            {filtered.slice(1).map((story, i) => (
              <div key={story.id} className="card" style={{ overflow: 'hidden', animation: `fadeInUp 0.5s ease ${i * 0.08}s both`, cursor: 'pointer' }}>
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                  <img src={story.image} alt={story.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.06)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  <span style={{ position: 'absolute', top: 14, left: 14, padding: '4px 12px', borderRadius: 50, background: story.color, color: 'white', fontSize: 11, fontWeight: 700 }}>{story.category}</span>
                </div>
                <div style={{ padding: 24 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                    <img src={story.authorAvatar} style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} alt={story.author} />
                    <div style={{ fontSize: 13, color: '#6B7280' }}><strong style={{ color: '#374151' }}>{story.author}</strong> • {story.date}</div>
                  </div>
                  <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 17, color: '#111827', marginBottom: 10, lineHeight: 1.3 }}>{story.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B7280', lineHeight: 1.7, marginBottom: 16 }}>{story.excerpt.substring(0, 120)}...</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: 12, fontSize: 12, color: '#9CA3AF' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {story.readTime}</span>
                      <button onClick={() => setLiked(p => { const n = new Set(p); n.has(story.id) ? n.delete(story.id) : n.add(story.id); return n; })} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: liked.has(story.id) ? '#EF4444' : '#9CA3AF', fontSize: 12 }}>
                        <Heart size={12} fill={liked.has(story.id) ? '#EF4444' : 'none'} /> {story.likes}
                      </button>
                    </div>
                    <a href="#" style={{ fontSize: 13, color: story.color, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, textDecoration: 'none' }}>Read <ArrowRight size={13} /></a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
