import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  Calendar, Clock, MapPin, Users, Check, X,
  Save, UploadCloud, Info, Video, MessageSquare,
  Globe, Shield, PlayCircle, Image as ImageIcon, Eye
} from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '', category: 'Wedding', description: '', bannerImage: '',
    eventDate: '', startTime: '', endTime: '', venue: '', address: '',
    city: '', state: '', country: '', googleMapsUrl: '',
    organizerId: 'ADM-001', familyBranch: '', visibility: 'Public',
    inviteType: 'All Members', invitedMembers: [],
    rsvpEnabled: false, maxGuests: '', rsvpDeadline: '',
    liveStream: false, streamId: '', streamLink: '', streamVisibility: 'Public', streamingPlatform: 'Jitsi Meet', liveChat: false, recordEvent: false,
    allowPhotos: true, allowComments: true, reminders: [], status: 'Publish'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => {
      const nextState = { ...prev, [name]: type === 'checkbox' ? checked : value };
      if (name === 'liveStream' && checked && !prev.streamId) {
         nextState.streamId = 'FH-' + Math.random().toString(36).substring(2, 10).toUpperCase();
         nextState.streamLink = `https://family-hub-seven-ecru.vercel.app/live/${nextState.streamId}`;
      }
      return nextState;
    });
  };

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${window.location.hostname === 'localhost' ? import.meta.env.VITE_API_URL + '' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/events`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['events']);
      alert(`Event ${data.event.status} Successfully!`);
      navigate('/admin/dashboard/events');
    },
    onError: (err) => {
      alert(err.response?.data?.error || 'Failed to submit event.');
    }
  });

  const onSubmit = (status) => {
    mutation.mutate({ ...formData, status });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-32 font-sans text-slate-800 animate-in fade-in duration-500">
      
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
             <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Create New Event</h1>
             <p className="text-sm text-slate-500 mt-1 font-medium">Plan, schedule, and manage your FamilyHub event beautifully.</p>
          </div>
          <div className="flex gap-3 items-center">
             <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-5 py-2.5 bg-transparent hover:bg-slate-100 text-slate-600 font-semibold border border-transparent rounded-xl transition-colors text-sm">
               <X size={16} /> Cancel
             </button>
             <button onClick={() => onSubmit('Draft')} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-[#2563EB] font-bold border-2 border-[#2563EB] rounded-xl transition-colors text-sm">
               <Save size={16} /> Save Draft
             </button>
             <button onClick={() => onSubmit('Publish')} disabled={mutation.isPending} className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold bg-[#2563EB] hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30 transition-all hover:-translate-y-0.5">
               <Check size={18} /> {mutation.isPending ? 'Publishing...' : 'Publish Event'}
             </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 space-y-6">
             
             {/* Basic Information */}
             <CardSection icon={<Info className="text-blue-500" size={20} />} title="Basic Information" badge="Required">
                <div className="space-y-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Event Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. 50th Family Reunion" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all shadow-sm" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                        <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                           <option>Wedding</option><option>Birthday</option><option>Anniversary</option>
                           <option>Reunion</option><option>Engagement</option><option>Housewarming</option>
                           <option>Naming Ceremony</option><option>Festival</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Family Branch *</label>
                        <select name="familyBranch" value={formData.familyBranch} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                           <option value="">Select Branch</option>
                           <option>Hyderabad</option><option>Bangalore</option><option>Mumbai</option>
                        </select>
                      </div>
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                      <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the event details..." className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#FACC15] focus:border-transparent transition-all shadow-sm"></textarea>
                   </div>
                   
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Event Banner</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all group">
                         <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm text-[#2563EB] group-hover:scale-110 transition-transform mb-4">
                           <UploadCloud size={28} />
                         </div>
                         <span className="text-base font-bold text-slate-700">Click to upload banner image</span>
                         <span className="text-sm text-slate-400 mt-2">1200 × 400px recommended (JPG, PNG)</span>
                      </div>
                   </div>
                </div>
             </CardSection>

             {/* Date & Time */}
             <CardSection icon={<Calendar className="text-blue-500" size={20} />} title="Date & Time">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="relative">
                      <label className="block text-sm font-bold text-slate-700 mb-2">Event Date *</label>
                      <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm appearance-none" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">Start Time *</label>
                         <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm" />
                      </div>
                      <div>
                         <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                         <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm" />
                      </div>
                   </div>
                </div>
             </CardSection>

             {/* Location */}
             <CardSection icon={<MapPin className="text-blue-500" size={20} />} title="Location">
                <div className="space-y-6">
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Venue Name *</label>
                      <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Taj Hotel" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Address *</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="Street Address" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm" />
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm" />
                      <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm" />
                      <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country *" className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-sm" />
                   </div>
                   <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Google Maps Link</label>
                      <input type="url" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-600 focus:outline-none focus:ring-2 focus:ring-[#FACC15] shadow-inner font-medium" />
                      <div className="mt-4 bg-slate-100 rounded-xl h-24 border border-slate-200 flex items-center justify-center overflow-hidden relative">
                         <div className="absolute inset-0 opacity-20 bg-[url('https://maps.gstatic.com/tactile/map_roadmap_1.png')] bg-cover bg-center"></div>
                         <span className="relative text-sm font-bold text-slate-400 flex items-center gap-2"><MapPin size={16} /> Map Preview Placeholder</span>
                      </div>
                   </div>
                </div>
             </CardSection>
          </div>

          {/* Right Column Sidebar (30%) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8 lg:h-[calc(100vh-4rem)] overflow-y-auto pb-12 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
             
             {/* Visibility & Invitations */}
             <CardSection icon={<Globe className="text-[#FACC15]" size={20} />} title="Visibility">
                <div className="space-y-5">
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Event Visibility</label>
                     <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#2563EB]">
                       <option>Public (Visible on Website)</option>
                       <option>Family Only</option>
                       <option>Private</option>
                     </select>
                   </div>
                   <div>
                     <label className="block text-sm font-bold text-slate-700 mb-2">Invite Members</label>
                     <select name="inviteType" value={formData.inviteType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium focus:outline-none focus:ring-2 focus:border-transparent focus:ring-[#2563EB]">
                       <option>All Members</option>
                       <option>Selected Members</option>
                       <option>Branch Members</option>
                     </select>
                   </div>
                </div>
             </CardSection>

             {/* RSVP Settings */}
             <CardSection icon={<Shield className="text-[#FACC15]" size={20} />} title="RSVP Settings">
                <div className="space-y-4">
                   <label className="flex items-center justify-between cursor-pointer p-1">
                      <div>
                         <span className="font-bold text-sm text-slate-800 block">Enable RSVP Tracking</span>
                         <span className="text-xs text-slate-500 font-medium">Track attendee confirmations</span>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors flex items-center ${formData.rsvpEnabled ? 'bg-[#2563EB]' : 'bg-slate-200'}`}>
                         <div className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.rsvpEnabled ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </div>
                      <input type="checkbox" name="rsvpEnabled" checked={formData.rsvpEnabled} onChange={handleChange} className="hidden" />
                   </label>
                   
                   {formData.rsvpEnabled && (
                      <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 p-1">
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">Max Guests Limit</label>
                            <input type="number" name="maxGuests" value={formData.maxGuests} onChange={handleChange} placeholder="e.g. 100" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                         </div>
                         <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">RSVP Deadline</label>
                            <input type="date" name="rsvpDeadline" value={formData.rsvpDeadline} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                         </div>
                      </div>
                   )}
                </div>
             </CardSection>

             {/* Live Stream */}
             <CardSection icon={<Video className="text-[#FACC15]" size={20} />} title="Live Stream">
                <div className="space-y-4">
                   <label className="flex items-center justify-between cursor-pointer p-1">
                      <div>
                         <span className="font-bold text-sm text-slate-800 block">Enable Virtual Streaming</span>
                         <span className="text-xs text-slate-500 font-medium">Allow members to watch online</span>
                      </div>
                      <div className={`relative w-12 h-6 rounded-full transition-colors flex items-center ${formData.liveStream ? 'bg-[#FACC15]' : 'bg-slate-200'}`}>
                         <div className={`absolute w-4 h-4 bg-white rounded-full shadow transition-transform ${formData.liveStream ? 'translate-x-7' : 'translate-x-1'}`}></div>
                      </div>
                      <input type="checkbox" name="liveStream" checked={formData.liveStream} onChange={handleChange} className="hidden" />
                   </label>

                   {formData.liveStream && (
                      <div className="pt-4 border-t border-slate-100 space-y-4 animate-in fade-in slide-in-from-top-2 p-1">
                         <div>
                             <label className="block text-xs font-bold text-slate-500 mb-1 tracking-wide uppercase">Secure Virtual Stream Link</label>
                             <div className="flex items-center gap-2">
                               <input type="text" readOnly value={formData.streamLink} className="flex-1 bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-500 font-mono" />
                               <button 
                                 type="button" 
                                 onClick={() => { navigator.clipboard.writeText(formData.streamLink); alert('Link Copied!'); }}
                                 className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-lg transition-colors shadow"
                               >
                                 Copy Link
                               </button>
                             </div>
                             <p className="text-[11px] font-medium text-slate-500 mt-1.5">This secure session will automatically host via Jitsi Meet under your Family ID.</p>
                         </div>
                         
                         <label className="flex items-center gap-3 cursor-pointer mt-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <input type="checkbox" name="liveChat" checked={formData.liveChat} onChange={handleChange} className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]" />
                            <div>
                               <span className="text-sm font-bold text-slate-700 block leading-tight">Allow Live Chat</span>
                               <span className="text-[11px] font-medium text-slate-500">Enable meeting chat panel</span>
                            </div>
                         </label>
                         <label className="flex items-center gap-3 cursor-pointer bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <input type="checkbox" name="recordEvent" checked={formData.recordEvent} onChange={handleChange} className="w-4 h-4 rounded text-[#2563EB] focus:ring-[#2563EB]" />
                            <div>
                               <span className="text-sm font-bold text-slate-700 block leading-tight">Record Event</span>
                               <span className="text-[11px] font-medium text-slate-500">Save recording after stream ends</span>
                            </div>
                         </label>
                      </div>
                   )}
                </div>
             </CardSection>
             
             {/* Interactions */}
             <CardSection icon={<MessageSquare className="text-[#FACC15]" size={20} />} title="Interactions">
                <div className="space-y-3 p-1">
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="allowPhotos" checked={formData.allowPhotos} onChange={handleChange} className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-[#2563EB]" />
                      <span className="text-sm font-semibold text-slate-700">Allow members to upload photos</span>
                   </label>
                   <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleChange} className="w-4 h-4 rounded text-[#2563EB] border-slate-300 focus:ring-[#2563EB]" />
                      <span className="text-sm font-semibold text-slate-700">Allow event comments/discussions</span>
                   </label>
                </div>
             </CardSection>

             {/* Publish Preview Card */}
             <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[24px] p-6 shadow-xl border border-slate-700 text-white">
                <h2 className="text-base font-black border-b border-slate-700/50 pb-3 mb-4 flex items-center gap-2">Ready to Publish?</h2>
                <div className="space-y-2 mb-6">
                   <p className="text-sm font-medium text-slate-300 flex justify-between">Name: <span className="text-white font-bold truncate ml-2 max-w-[150px]">{formData.name || 'Untitled'}</span></p>
                   <p className="text-sm font-medium text-slate-300 flex justify-between">Date: <span className="text-white font-bold">{formData.eventDate || '-'}</span></p>
                   <p className="text-sm font-medium text-slate-300 flex justify-between">Visibility: <span className="text-[#FACC15] font-bold">{formData.visibility}</span></p>
                   <p className="text-sm font-medium text-slate-300 flex justify-between">Streaming: <span className={formData.liveStream ? 'text-emerald-400 font-bold' : 'text-slate-500 font-bold'}>{formData.liveStream ? 'Enabled' : 'Disabled'}</span></p>
                </div>
                <p className="text-xs text-slate-400 mb-6 font-medium leading-relaxed">Complete the required fields, then publish the event to notify family members.</p>
                <div className="space-y-3">
                   <button className="w-full py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                     <Eye size={16} /> Preview Event
                   </button>
                   <button onClick={() => onSubmit('Publish')} disabled={mutation.isLoading} className="w-full py-3 bg-[#2563EB] hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2">
                     <Check size={18} /> {mutation.isLoading ? 'Publishing...' : 'Publish Event'}
                   </button>
                </div>
             </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function CardSection({ title, icon, badge, children }) {
   return (
      <div className="bg-white rounded-[24px] p-6 sm:p-8 shadow-sm border border-slate-200/60 hover:shadow-md transition-shadow">
         <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
            <h2 className="text-lg font-black text-slate-800 flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                 {icon}
               </div>
               {title}
            </h2>
            {badge && <span className="px-3 py-1 bg-blue-50 text-[#2563EB] text-xs font-black rounded-full uppercase tracking-wider">{badge}</span>}
         </div>
         {children}
      </div>
   )
}
