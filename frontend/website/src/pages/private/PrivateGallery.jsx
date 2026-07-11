import React, { useState } from 'react';
import PrivateLayout from '../../components/PrivateLayout';
import { Upload, Image, Heart, X, ChevronLeft, ChevronRight, Lock } from 'lucide-react';

const privatePhotos = [
  { id: 1, src: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=400&fit=crop', caption: 'Family Reunion 2024 — Private', likes: 42, album: 'Reunion 2024', private: true },
  { id: 2, src: 'https://images.unsplash.com/photo-1530103862676-de8892cb7370?w=600&h=400&fit=crop', caption: "Grandpa's 80th — Candid Shots", likes: 38, album: "Birthdays", private: true },
  { id: 3, src: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', caption: 'Maldives — Private Collection', likes: 67, album: 'Travel', private: true },
  { id: 4, src: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop', caption: 'Wedding Day Behind the Scenes', likes: 89, album: 'Weddings', private: true },
  { id: 5, src: 'https://images.unsplash.com/photo-1545566501-4c6d0cbec0c7?w=600&h=400&fit=crop', caption: 'Christmas Morning 2023', likes: 34, album: 'Holidays', private: true },
  { id: 6, src: 'https://images.unsplash.com/photo-1502780809386-d4d374f0ef09?w=600&h=400&fit=crop', caption: 'Garden Party Spring 2024', likes: 55, album: 'Gatherings', private: true },
  { id: 7, src: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&h=400&fit=crop', caption: 'New York City Trip', likes: 48, album: 'Travel', private: true },
  { id: 8, src: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&h=400&fit=crop', caption: "Grandma's Kitchen Secrets", likes: 72, album: 'Daily Life', private: true },
];

export default function PrivateGallery() {
  const [liked, setLiked] = useState(new Set());
  const [lightbox, setLightbox] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const toggleLike = (id) => setLiked(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  return (
    <PrivateLayout title="Private Gallery" subtitle="Your family's exclusive photo collection">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Upload area */}
        <div style={{ borderRadius: 20, border: `2px dashed ${dragOver ? '#4F46E5' : '#CBD5E1'}`, padding: 32, textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s', background: dragOver ? 'rgba(79,70,229,0.04)' : 'white' }}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'rgba(79,70,229,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <Upload size={24} color="#4F46E5" />
          </div>
          <h3 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 700, fontSize: 16, color: '#111827', marginBottom: 8 }}>Upload Private Photos</h3>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 16 }}>Drag & drop photos here, or click to browse. Only family members can see these.</p>
          <label style={{ padding: '10px 24px', borderRadius: 50, background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
            <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={() => {}} />
            <Upload size={14} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} /> Choose Photos
          </label>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[['🔒', privatePhotos.length, 'Private Photos'], ['💾', '4.2 GB', 'Storage Used'], ['📁', '8', 'Albums'], ['♥', '445', 'Total Likes']].map(([emoji, val, label]) => (
            <div key={label} style={{ background: 'white', borderRadius: 16, padding: '20px 24px', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <div style={{ fontSize: 24, marginBottom: 8 }}>{emoji}</div>
              <div style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 900, fontSize: 24, color: '#111827' }}>{val}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Photo Grid */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <h2 style={{ fontFamily: 'Poppins,sans-serif', fontWeight: 800, fontSize: 20, color: '#111827' }}>All Photos</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9CA3AF', fontSize: 13 }}>
              <Lock size={14} color="#4F46E5" />
              <span>Only visible to family members</span>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
            {privatePhotos.map((photo, i) => (
              <div key={photo.id} style={{ borderRadius: 16, overflow: 'hidden', position: 'relative', cursor: 'pointer', background: 'white', border: '1px solid #E5E7EB', transition: 'all 0.3s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 16px 40px rgba(0,0,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ position: 'relative', height: 200, overflow: 'hidden' }} onClick={() => setLightbox(i)}>
                  <img src={photo.src} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'} />
                  <div style={{ position: 'absolute', top: 10, left: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 50, background: 'rgba(15,23,42,0.7)', color: 'white', fontSize: 11, fontWeight: 700 }}>
                      <Lock size={10} /> Private
                    </span>
                  </div>
                </div>
                <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: '#111827', lineHeight: 1.3 }}>{photo.caption}</div>
                    <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 2 }}>{photo.album}</div>
                  </div>
                  <button onClick={() => toggleLike(photo.id)} style={{ display: 'flex', alignItems: 'center', gap: 4, border: 'none', background: 'transparent', cursor: 'pointer', color: liked.has(photo.id) ? '#EF4444' : '#9CA3AF', fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}>
                    <Heart size={15} fill={liked.has(photo.id) ? '#EF4444' : 'none'} />
                    {photo.likes + (liked.has(photo.id) ? 1 : 0)}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lightbox */}
        {lightbox !== null && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
            onClick={() => setLightbox(null)}>
            <button onClick={e => { e.stopPropagation(); setLightbox(l => Math.max(l - 1, 0)); }} style={{ position: 'absolute', left: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ChevronLeft size={24} />
            </button>
            <div onClick={e => e.stopPropagation()} style={{ maxWidth: '80vw' }}>
              <img src={privatePhotos[lightbox].src} alt={privatePhotos[lightbox].caption} style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 16, objectFit: 'contain' }} />
              <p style={{ color: 'white', textAlign: 'center', marginTop: 16, fontWeight: 600 }}>{privatePhotos[lightbox].caption}</p>
            </div>
            <button onClick={e => { e.stopPropagation(); setLightbox(l => Math.min(l + 1, privatePhotos.length - 1)); }} style={{ position: 'absolute', right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <ChevronRight size={24} />
            </button>
            <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: 24, right: 24, background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%', width: 48, height: 48, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <X size={24} />
            </button>
          </div>
        )}
      </div>
    </PrivateLayout>
  );
}
