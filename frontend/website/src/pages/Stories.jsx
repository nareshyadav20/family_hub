import React, { useState } from 'react';
import { BookOpen, Heart, Clock, User, ArrowRight, Search } from 'lucide-react';

const stories = [
  {
    id: 1, title: "Grandpa's Journey from Springfield to Success", author: 'Robert Smith Jr.', authorAvatar: 'https://i.pravatar.cc/100?img=12', date: 'June 15, 2026', readTime: '8 min read', category: 'Elder Stories', image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop', excerpt: 'In 1952, a 10-year-old Robert Smith walked into his first day of school with nothing but a suitcase and a dream. What followed was a remarkable 70-year journey of love, loss, and legacy...', likes: 234, color: '#4F46E5'
  },
  {
    id: 2, title: "The Beach Vacation That Changed Everything", author: 'Emily Smith', authorAvatar: 'https://i.pravatar.cc/100?img=25', date: 'May 20, 2026', readTime: '5 min read', category: 'Memories', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=340&fit=crop', excerpt: 'We almost didnt go. Dad was tired, mom was stressed, and we kids were fighting. But that one weekend in Maldives in 2023 became the most beautiful memory of my childhood...', likes: 187, color: '#7C3AED'
  },
  {
    id: 3, title: "How I Met Your Grandmother: A Love Story", author: 'Robert Smith Sr.', authorAvatar: 'https://i.pravatar.cc/100?img=60', date: 'April 10, 2026', readTime: '12 min read', category: 'Elder Stories', image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=340&fit=crop', excerpt: 'It was a rainy Tuesday in October 1969. I walked into the local library, late for my study session, and bumped into the most beautiful woman I had ever seen...', likes: 412, color: '#14B8A6'
  },
  {
    id: 4, title: "Growing Up in the Smith Household", author: 'James Smith', authorAvatar: 'https://i.pravatar.cc/100?img=53', date: 'March 5, 2026', readTime: '7 min read', category: 'Articles', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=340&fit=crop', excerpt: 'Our household was always loud, always messy, and always full of love. Mom kept 7 of us kids in line while Dad worked double shifts. But dinner table was always our sacred gathering spot...', likes: 156, color: '#F59E0B'
  },
  {
    id: 5, title: "Passing Down the Family Recipe", author: 'Martha Smith', authorAvatar: 'https://i.pravatar.cc/100?img=45', date: 'February 14, 2026', readTime: '4 min read', category: 'Memories', image: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=340&fit=crop', excerpt: "My mother's apple pie recipe is more than instructions on paper. It is a thread connecting five generations of Smith women who have baked this same pie on Sunday mornings...", likes: 298, color: '#EF4444'
  },
  {
    id: 6, title: "The Annual Reunion: A Family Tradition", author: 'Patricia Dove', authorAvatar: 'https://i.pravatar.cc/100?img=38', date: 'January 22, 2026', readTime: '6 min read', category: 'Articles', image: 'https://images.unsplash.com/photo-1530103862676-de8892cb7370?w=600&h=340&fit=crop', excerpt: 'For 40 years, every summer without fail, the entire Smith clan has gathered. What started as a backyard barbecue has evolved into a multi-day celebration spanning generations...', likes: 145, color: '#10B981'
  },
];

const categories = ['All', 'Elder Stories', 'Memories', 'Articles'];

export default function Stories() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [liked, setLiked] = useState(new Set());

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
                <p style={{ fontSize: 15, color: '#6B7280', lineHeight: 1.8, marginBottom: 24 }}>{filtered[0].excerpt}</p>
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
