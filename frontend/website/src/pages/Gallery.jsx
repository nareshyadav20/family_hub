import React, { useState } from 'react';
import { Heart, X, ChevronLeft, ChevronRight, Search } from 'lucide-react';

// Removed mock albums
import axios from 'axios';
const API_URL = `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/website`;

const tags = ['All', 'Reunion', 'Birthday', 'Travel', 'Wedding', 'Holiday'];

export default function Gallery() {
  const [activeTag, setActiveTag] = useState('All');
  const [lightbox, setLightbox] = useState(null);
  const [likedPhotos, setLikedPhotos] = useState(new Set());
  const [search, setSearch] = useState('');
  const [albums, setAlbums] = useState([]);
  const [featured, setFeatured] = useState([]);

  useEffect(() => {
    axios.get(`${API_URL}/gallery`)
      .then(res => {
        const photos = res.data;
        const mappedFeatured = photos.map(p => ({
           id: p.id,
           src: p.url,
           caption: p.name,
           likes: p.size || 0
        }));
        setFeatured(mappedFeatured);

        // Map photos into mock albums based on categories
        const categorized = {};
        photos.forEach(p => {
           const c = p.category || 'Other';
           if (!categorized[c]) categorized[c] = { title: c, cover: p.url, count: 0, tag: c, id: c, year: new Date(p.createdAt).getFullYear() };
           categorized[c].count += 1;
        });
        setAlbums(Object.values(categorized));
      })
      .catch(err => console.error(err));
  }, []);

  const filteredAlbums = albums.filter(a => activeTag === 'All' || a.tag === activeTag);

  const toggleLike = (id) => {
    setLikedPhotos(prev => {
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
          <div className="badge badge-primary" style={{ marginBottom: 16, display: 'inline-flex' }}>Memory Gallery</div>
          <h1 style={{ fontSize: 48, fontWeight: 900, marginBottom: 16 }}>Family <span className="gradient-text">Gallery</span></h1>
          <p style={{ fontSize: 17, color: '#6B7280', marginBottom: 32 }}>A visual journey through our family's most cherished moments.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 320 }}>
              <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search photos and albums..." style={{ width: '100%', padding: '12px 16px 12px 42px', borderRadius: 50, border: '1px solid #E5E7EB', background: 'white', fontSize: 14, outline: 'none', boxShadow: '0 4px 16px rgba(0,0,0,0.06)' }} />
            </div>
          </div>
        </div>
      </section>

      {/* Albums */}
      <section style={{ padding: '64px 0', background: 'white' }}>
        <div className="container">
          <div style={{ display: 'flex', justify: 'space-between', alignItems: 'center', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
            <h2 style={{ fontSize: 32, fontWeight: 800 }}>Albums</h2>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {tags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(tag)} style={{ padding: '8px 18px', borderRadius: 50, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, transition: 'all 0.2s', background: activeTag === tag ? 'linear-gradient(135deg, #4F46E5, #7C3AED)' : '#F3F4F6', color: activeTag === tag ? 'white' : '#374151' }}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 24 }}>
            {filteredAlbums.map((album, i) => (
              <div key={album.id} className="card" style={{ overflow: 'hidden', cursor: 'pointer', animation: `fadeInUp 0.5s ease ${i * 0.08}s both` }}>
                <div style={{ position: 'relative', overflow: 'hidden', height: 200 }}>
                  <img src={album.cover} alt={album.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                  <span style={{ position: 'absolute', top: 14, right: 14, padding: '4px 12px', borderRadius: 50, background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', color: 'white', fontSize: 12, fontWeight: 700 }}>{album.tag}</span>
                  <div style={{ position: 'absolute', bottom: 14, left: 14, color: 'white' }}>
                    <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16 }}>{album.title}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{album.count} photos • {album.year}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Photos */}
      <section style={{ padding: '64px 0', background: '#F8FAFC' }}>
        <div className="container">
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32 }}>Featured Memories</h2>
          <div style={{ columns: '280px', columnGap: 16 }}>
            {featured.map((photo, i) => (
              <div key={photo.id} style={{ breakInside: 'avoid', marginBottom: 16, position: 'relative', borderRadius: 16, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => setLightbox(i)}>
                <img src={photo.src} alt={photo.caption} style={{ width: '100%', display: 'block', transition: 'transform 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)', opacity: 0, transition: 'opacity 0.3s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={e => e.currentTarget.style.opacity = '0'}>
                  <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'white', fontWeight: 600, fontSize: 14 }}>{photo.caption}</span>
                    <button onClick={e => { e.stopPropagation(); toggleLike(photo.id); }} style={{ border: 'none', background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: likedPhotos.has(photo.id) ? '#EF4444' : 'white' }}>
                      <Heart size={16} fill={likedPhotos.has(photo.id) ? '#EF4444' : 'none'} />
                      <span style={{ fontSize: 13 }}>{photo.likes + (likedPhotos.has(photo.id) ? 1 : 0)}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
          onClick={() => setLightbox(null)}>
          <button onClick={e => { e.stopPropagation(); setLightbox(l => Math.max(l - 1, 0)); }} style={{ position: 'absolute', left: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <ChevronLeft size={24} />
          </button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: '80vw', maxHeight: '80vh' }}>
            <img src={featured[lightbox].src} alt={featured[lightbox].caption} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 16, objectFit: 'contain' }} />
            <p style={{ color: 'white', textAlign: 'center', marginTop: 16, fontWeight: 600 }}>{featured[lightbox].caption}</p>
          </div>
          <button onClick={e => { e.stopPropagation(); setLightbox(l => Math.min(l + 1, featured.length - 1)); }} style={{ position: 'absolute', right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <ChevronRight size={24} />
          </button>
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <X size={24} />
          </button>
        </div>
      )}
    </div>
  );
}
