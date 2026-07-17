import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Image as ImageIcon, Upload, Filter, Heart, MessageCircle, Search } from 'lucide-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const tags = ['All', 'Reunion', 'Birthday', 'Wedding', 'Travel', 'Holiday', 'Festival'];
const uploadTags = ['Reunion', 'Birthday', 'Wedding', 'Travel', 'Holiday', 'Festival'];

export default function Gallery() {
  const [activeTag, setActiveTag] = useState('All');
  const [likedIds, setLikedIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploadCategory, setUploadCategory] = useState(uploadTags[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);

  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');
  const API_URL = `${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1`;

  const { data: photos = [], isLoading } = useQuery({
      queryKey: ['gallery'],
      queryFn: async () => {
          const res = await axios.get(`${API_URL}/gallery`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      }
  });

  const uploadMutation = useMutation({
      mutationFn: async (payload) => {
          const res = await axios.post(`${API_URL}/gallery`, payload, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      onSuccess: () => {
          queryClient.invalidateQueries(['gallery']);
          setShowModal(false);
          setSelectedFile(null);
          setUploadPreview(null);
      }
  });

  const filtered = photos.filter(p => activeTag === 'All' || p.tag === activeTag);

  const toggleLike = (id) => setLikedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
          if (file.size > 5 * 1024 * 1024) {
              alert('File size exceeds 5MB limit.');
              return;
          }
          setSelectedFile(file);
          const reader = new FileReader();
          reader.onloadend = () => {
              setUploadPreview(reader.result);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleUpload = () => {
      if (!selectedFile || !uploadPreview) {
          alert('Please select a file first.');
          return;
      }
      uploadMutation.mutate({
          category: uploadCategory,
          fileUrl: uploadPreview, 
          fileName: selectedFile.name,
          fileSize: (selectedFile.size / (1024*1024)).toFixed(2) + 'MB',
          fileType: selectedFile.type
      });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 relative z-10 mt-4">
         <div className="space-y-4">
           <h1 className="text-4xl font-serif italic text-slate-800 dark:text-white">Memories</h1>
           <p className="text-slate-500 dark:text-slate-400 font-medium">Relive our favorite moments together.</p>
           <div className="flex gap-2 flex-wrap">
              {tags.map(tag => (
                <button key={tag} onClick={() => setActiveTag(tag)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTag === tag ? 'bg-black text-white dark:bg-white dark:text-black shadow-md' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 hover:bg-slate-50'}`}
                >{tag}</button>
              ))}
            </div>
         </div>
         <div className="flex gap-3">
           <Button onClick={() => setShowModal(true)} className="rounded-full bg-black text-white dark:bg-white dark:text-black h-11 px-6 shadow-md hover:scale-105 transition-transform">
             <Upload className="h-4 w-4 mr-2" /> Add Photos
           </Button>
         </div>
      </div>
      
      <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
         {isLoading && <div className="text-slate-500 col-span-full">Loading memories...</div>}
         {filtered.map((item, idx) => (
           <div key={item.id} className="break-inside-avoid relative rounded-3xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 bg-white" style={{ height: item.h + 'px' }}>
              
              <img src={item.url} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" alt="gallery item" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Tag */}
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-[10px] font-bold bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-full border border-white/10">{item.tag}</span>
              </div>
              
              <div className="absolute flex gap-3 right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                 <button onClick={(e) => { e.stopPropagation(); toggleLike(item.id); }} className={`flex items-center gap-1.5 text-white/90 hover:text-white backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold ${likedIds.includes(item.id) ? 'bg-red-500 text-white' : 'bg-black/30'}`}>
                    <Heart className="w-3.5 h-3.5" fill={likedIds.includes(item.id) ? 'white' : 'none'} /> {item.hearts + (likedIds.includes(item.id) ? 1 : 0)}
                 </button>
                 <button className="flex items-center justify-center w-8 h-8 text-white/90 hover:text-white bg-black/30 backdrop-blur-md rounded-full">
                    <MessageCircle className="w-4 h-4" />
                 </button>
              </div>
              
              <div className="absolute left-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full border-2 border-white/50 overflow-hidden bg-slate-200">
                    <img src={item.avatar} alt="uploader" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-white text-xs font-semibold truncate max-w-[80px]">{item.uploader}</span>
                </div>
              </div>
           </div>
         ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          <p className="font-medium">No family memories uploaded yet.</p>
        </div>
      )}

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold font-serif italic text-slate-900 dark:text-white mb-4">Add Memory</h2>
              
              <div className="mb-4">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">When was this?</label>
                 <select 
                    value={uploadCategory} 
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white"
                 >
                    {uploadTags.map(tag => (
                       <option key={tag} value={tag}>{tag}</option>
                    ))}
                 </select>
              </div>

              <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full relative">
                 <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 
                 {uploadPreview ? (
                     <div className="text-center w-full flex flex-col items-center">
                        <img src={uploadPreview} alt="Preview" className="w-32 h-32 object-cover rounded-xl mx-auto mb-3 shadow-md border-2 border-white" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 truncate w-3/4">{selectedFile?.name}</span>
                     </div>
                 ) : (
                     <div className="text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-white dark:bg-slate-700 rounded-full flex items-center justify-center shadow-sm mb-3">
                           <Upload size={24} className="text-black dark:text-white" />
                        </div>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">No file chosen</span>
                        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Browse or drop photos here</span>
                        <span className="text-xs text-slate-400 mt-2 font-medium">Supports JPG, PNG (Max 5MB each)</span>
                     </div>
                 )}
              </label>

              <div className="mt-6 flex gap-3">
                 <button onClick={handleUpload} disabled={uploadMutation.isPending || !selectedFile} className="flex-1 bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-bold text-sm transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-md">
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Now'}
                 </button>
                 <button onClick={() => { setShowModal(false); setSelectedFile(null); setUploadPreview(null); }} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
