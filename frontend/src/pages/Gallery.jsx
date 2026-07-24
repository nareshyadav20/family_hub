import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Upload, Grid3X3, LayoutGrid, Search, Trash2, Download, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const tags = ['All', 'Reunion', 'Birthday', 'Wedding', 'Travel', 'Holiday', 'Festival'];
const uploadTags = ['Reunion', 'Birthday', 'Wedding', 'Travel', 'Holiday', 'Festival'];

export default function Gallery() {
  const [activeTag, setActiveTag] = useState('All');
  const [search, setSearch] = useState('');
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

  const deleteMutation = useMutation({
      mutationFn: async (id) => {
          const res = await axios.delete(`${API_URL}/gallery/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          return res.data;
      },
      onSuccess: () => {
          queryClient.invalidateQueries(['gallery']);
      }
  });

  const filtered = photos.filter(p => 
    (activeTag === 'All' || p.tag === activeTag) && 
    (search === '' || p.uploader.toLowerCase().includes(search.toLowerCase()) || p.tag.toLowerCase().includes(search.toLowerCase()))
  );

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
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Gallery</h1>
          <p className="text-slate-500 text-sm mt-1">{photos.length} memories shared by the family</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-[#7C5CFC] hover:bg-[#6B49F6] text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-[#7C5CFC]/20 cursor-pointer">
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
            className="w-full pl-9 pr-4 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {tags.map(tag => (
            <button key={tag} onClick={() => setActiveTag(tag)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeTag === tag ? 'bg-[#7C5CFC] text-white shadow-md shadow-[#7C5CFC]/20' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
            >{tag}</button>
          ))}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="columns-2 md:columns-3 xl:columns-4 gap-4 space-y-4">
        {isLoading && <div className="text-slate-500 col-span-full">Loading gallery...</div>}
        {filtered.map(photo => (
          <div key={photo.id} className="break-inside-avoid relative rounded-2xl overflow-hidden group cursor-pointer bg-slate-100 dark:bg-slate-800 shadow-sm hover:shadow-xl transition-all duration-500" style={{ height: photo.h }}>
            <img src={photo.url} alt="family" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Tag */}
            <div className="absolute top-3 left-3">
              <span className="text-[10px] font-bold bg-black/40 backdrop-blur-md text-white px-2 py-1 rounded-full border border-white/10">{photo.tag}</span>
            </div>

            {/* Admin Delete btn */}
            <button onClick={(e) => { e.stopPropagation(); if(window.confirm('Delete photo?')) deleteMutation.mutate(photo.id); }} className="absolute top-3 right-3 w-8 h-8 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white/70 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
              <Trash2 size={14} />
            </button>

            {/* Bottom actions */}
            <div className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between translate-y-2 group-hover:translate-y-0">
              <div className="flex items-center gap-2">
                <img src={photo.avatar} className="w-7 h-7 rounded-full border border-white/30" alt="" />
                <span className="text-white text-xs font-semibold truncate w-16">{photo.uploader}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); toggleLike(photo.id); }} className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full backdrop-blur-md ${likedIds.includes(photo.id) ? 'bg-red-500 text-white' : 'bg-black/30 text-white/90'}`}>
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
      {!isLoading && filtered.length === 0 && (
         <div className="py-16 text-center bg-[#FAF8FF] rounded-3xl border border-dashed border-[#E9E5F8] w-full mt-4">
            <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 text-[#7C5CFC] shadow-sm">
               <ImageIcon size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No photos found</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">Preserve and share your family's most precious memories. Upload your first photo to start the gallery.</p>
            <button onClick={() => setShowModal(true)} className="px-6 py-2 bg-[#7C5CFC] hover:bg-[#6B49F6] text-white font-semibold rounded-full shadow-md shadow-[#7C5CFC]/20 flex items-center justify-center gap-2 transition-all mx-auto">
               <Upload size={16} /> Upload Photos
            </button>
         </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 p-6 relative">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Upload Photos</h2>
              
              <div className="mb-4">
                 <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Category</label>
                 <select 
                    value={uploadCategory} 
                    onChange={e => setUploadCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#7C5CFC]/20"
                 >
                    {uploadTags.map(tag => (
                       <option key={tag} value={tag}>{tag}</option>
                    ))}
                 </select>
              </div>

              <label className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors w-full relative">
                 <input type="file" accept="image/jpeg, image/png" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                 
                 {uploadPreview ? (
                     <div className="text-center">
                        <img src={uploadPreview} alt="Preview" className="w-24 h-24 object-cover rounded-lg mx-auto mb-2 shadow-md" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{selectedFile?.name}</span>
                     </div>
                 ) : (
                     <div className="text-center flex flex-col items-center">
                        <Upload size={40} className="text-[#7C5CFC] mb-3" />
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300 mb-1">No file chosen</span>
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Browse or drop photos here</span>
                        <span className="text-xs text-slate-400 mt-1">Supports JPG, PNG (Max 5MB each)</span>
                     </div>
                 )}
              </label>

              <div className="mt-5 flex gap-3">
                 <button onClick={handleUpload} disabled={uploadMutation.isPending || !selectedFile} className="flex-1 bg-[#7C5CFC] hover:bg-[#6B49F6] disabled:opacity-50 text-white py-3 rounded-xl font-bold text-sm transition-colors shadow-md shadow-[#7C5CFC]/20">
                    {uploadMutation.isPending ? 'Uploading...' : 'Upload Now'}
                 </button>
                 <button onClick={() => { setShowModal(false); setSelectedFile(null); setUploadPreview(null); }} className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 py-3 rounded-xl font-bold text-sm transition-colors">Cancel</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
