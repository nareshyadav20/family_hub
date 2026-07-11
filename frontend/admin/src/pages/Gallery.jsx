import React, { useState } from 'react';
import { Heart, MessageCircle, Upload, Grid3X3, LayoutGrid, Search, Trash2, Download } from 'lucide-react';

const photos = [
  { id: 1, url: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&q=80', h: 320, hearts: 24, comments: 8, uploader: 'Sarah M.', avatar: 'https://i.pravatar.cc/100?img=1', tag: 'Reunion', year: '2024' },
  { id: 2, url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&q=80', h: 220, hearts: 15, comments: 4, uploader: 'Arjun M.', avatar: 'https://i.pravatar.cc/100?img=2', tag: 'Travel', year: '2024' },
  { id: 3, url: 'https://images.unsplash.com/photo-1530103862676-de8892cb7370?w=600&q=80', h: 400, hearts: 42, comments: 17, uploader: 'Emily S.', avatar: 'https://i.pravatar.cc/100?img=3', tag: 'Birthday', year: '2023' },
  { id: 4, url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&q=80', h: 260, hearts: 18, comments: 6, uploader: 'James S.', avatar: 'https://i.pravatar.cc/100?img=4', tag: 'Reunion', year: '2024' },
  { id: 5, url: 'https://images.unsplash.com/photo-1470116945706-e6bf5d5a53ca?w=600&q=80', h: 300, hearts: 33, comments: 11, uploader: 'Sarah M.', avatar: 'https://i.pravatar.cc/100?img=5', tag: 'Holiday', year: '2023' },
  { id: 6, url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=600&q=80', h: 240, hearts: 9, comments: 2, uploader: 'Priya K.', avatar: 'https://i.pravatar.cc/100?img=6', tag: 'Festival', year: '2024' },
  { id: 7, url: 'https://images.unsplash.com/photo-1542773998-9325f0a098d7?w=600&q=80', h: 360, hearts: 51, comments: 23, uploader: 'Arjun M.', avatar: 'https://i.pravatar.cc/100?img=7', tag: 'Wedding', year: '2022' },
  { id: 8, url: 'https://images.unsplash.com/photo-1454023492550-5696f8ff10e1?w=600&q=80', h: 280, hearts: 21, comments: 9, uploader: 'Emily S.', avatar: 'https://i.pravatar.cc/100?img=8', tag: 'Travel', year: '2023' },
  { id: 9, url: 'https://images.unsplash.com/photo-1425421669292-0c3da3b8f529?w=600&q=80', h: 200, hearts: 7, comments: 1, uploader: 'James S.', avatar: 'https://i.pravatar.cc/100?img=9', tag: 'Festival', year: '2024' },
  { id: 10, url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=80', h: 340, hearts: 38, comments: 14, uploader: 'Sarah M.', avatar: 'https://i.pravatar.cc/100?img=10', tag: 'Birthday', year: '2022' },
  { id: 11, url: 'https://images.unsplash.com/photo-1444418776041-9c7e33cc5a9c?w=600&q=80', h: 220, hearts: 12, comments: 3, uploader: 'Priya K.', avatar: 'https://i.pravatar.cc/100?img=11', tag: 'Holiday', year: '2023' },
  { id: 12, url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80', h: 290, hearts: 29, comments: 10, uploader: 'Arjun M.', avatar: 'https://i.pravatar.cc/100?img=12', tag: 'Reunion', year: '2023' },
];

const tags = ['All', 'Reunion', 'Birthday', 'Wedding', 'Travel', 'Holiday', 'Festival'];

export default function Gallery() {
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
  const [likedIds, setLikedIds] = useState([]);

  const filtered = photos.filter(p => 
    (activeTag === 'All' || p.tag === activeTag) && 
    (search === '' || p.uploader.toLowerCase().includes(search.toLowerCase()) || p.tag.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleLike = (id) => setLikedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gallery</h1>
          <p className="text-slate-500 text-sm mt-1">{photos.length} memories shared by the family</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-500/30">
          <Upload size={16} /> Upload Photos
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text" placeholder="Search by uploader or tag..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTag === tag ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
            >{tag}</button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
        {filtered.map(photo => (
          <div key={photo.id} className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-500" style={{ height: photo.h }}>
            <img src={photo.url} alt="family" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Tag */}
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-full border border-white/10">{photo.tag}</span>
            </div>

            {/* Admin Delete btn */}
            <button className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={14} />
            </button>

            {/* Bottom actions */}
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-2">
                <img src={photo.avatar} className="w-7 h-7 rounded-full border border-white/30" alt="" />
                <span className="text-white text-xs font-semibold">{photo.uploader}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleLike(photo.id)} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md ${likedIds.includes(photo.id) ? 'bg-red-500 text-white' : 'bg-black/30 text-white/90'}`}>
                  <Heart size={12} fill={likedIds.includes(photo.id) ? 'white' : 'none'} />
                  {photo.hearts + (likedIds.includes(photo.id) ? 1 : 0)}
                </button>
                <button className="flex items-center gap-1 text-xs font-bold bg-black/30 backdrop-blur-md text-white/90 px-2 py-1 rounded-full">
                  <MessageCircle size={12} /> {photo.comments}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="font-medium">No photos found</p>
        </div>
      )}
    </div>
  );
}
