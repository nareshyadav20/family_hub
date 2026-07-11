import React from 'react';
import { Button } from '@/components/ui/Button';
import { Image as ImageIcon, Upload, Filter, Heart, MessageCircle } from 'lucide-react';

export default function Gallery() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10 mt-4">
         <div className="space-y-2">
           <h1 className="text-4xl font-serif italic text-slate-800 dark:text-white">Memories</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Relive our favorite moments together.</p>
         </div>
         <div className="flex gap-3">
           <Button variant="outline" className="rounded-full bg-white/50 dark:bg-black/50 backdrop-blur-md border border-slate-200 dark:border-white/10 h-11 px-6 shadow-sm shadow-black/5">
             <Filter className="h-4 w-4 mr-2" /> Years
           </Button>
           <Button className="rounded-full bg-black text-white dark:bg-white dark:text-black h-11 px-6 shadow-md hover:scale-105 transition-transform">
             <Upload className="h-4 w-4 mr-2" /> Add Photos
           </Button>
         </div>
      </div>
      
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
         {[
           { h: 300, hearts: 12, user: 1 }, { h: 200, hearts: 5, user: 2 }, { h: 400, hearts: 23, user: 3 }, { h: 250, hearts: 8, user: 4 },
           { h: 280, hearts: 15, user: 5 }, { h: 350, hearts: 4, user: 1 }, { h: 200, hearts: 2, user: 2 }, { h: 320, hearts: 19, user: 3 },
           { h: 250, hearts: 7, user: 4 }, { h: 380, hearts: 31, user: 5 }, { h: 220, hearts: 6, user: 1 }, { h: 290, hearts: 11, user: 2 }
         ].map((item, idx) => (
           <div key={idx} className="break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-white" style={{ height: item.h + 'px' }}>
              
              <img src={`https://images.unsplash.com/photo-${151000000+idx}?w=500&q=70`} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" alt="gallery item" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="absolute flex gap-3 right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                 <button className="flex items-center gap-1.5 text-white/90 hover:text-white bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold">
                    <Heart className="w-3.5 h-3.5" /> {item.hearts}
                 </button>
                 <button className="flex items-center justify-center w-8 h-8 text-white/90 hover:text-white bg-black/30 backdrop-blur-md rounded-full">
                    <MessageCircle className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="absolute left-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 rounded-full border-2 border-white/50 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${item.user}`} alt="uploader" />
                </div>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
}
