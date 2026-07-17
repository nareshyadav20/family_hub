import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Heart, UploadCloud, Calendar, Clock, MapPin, Search, Users, Activity, Check, CheckSquare } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    name: '', category: 'Wedding', description: '', bannerImage: '',
    eventDate: '', startTime: '', endTime: '', venue: '', address: '',
    city: '', state: '', country: '', googleMapsUrl: '',
    organizerId: 'ADM-001', familyBranch: '', visibility: 'Private',
    inviteType: 'All Members', invitedMembers: [],
    rsvpEnabled: false, maxGuests: '', rsvpDeadline: '',
    liveStream: false, streamVisibility: 'Public', liveChat: false, recordEvent: false,
    allowPhotos: true, allowComments: true, reminders: [], status: 'Publish'
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev, [name]: type === 'checkbox' ? checked : value
    }));
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
    <div className="max-w-5xl mx-auto pb-32 animate-in fade-in duration-500 pt-6 px-4 md:px-0">
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
        <div>
           <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Create Event</h1>
           <p className="text-sm text-slate-500 mt-1">Schedule and manage a new FamilyHub event seamlessly.</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors text-sm">Cancel</button>
           <button onClick={() => onSubmit('Draft')} className="px-6 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 font-bold rounded-xl transition-colors text-sm">Save Draft</button>
           <button onClick={() => onSubmit('Publish')} disabled={mutation.isLoading} className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all">
             <Check size={16} /> {mutation.isLoading ? 'Publishing...' : 'Publish Event'}
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
           
           <CardSection title="Basic Information">
              <div className="space-y-5">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Event Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. 50th Family Reunion" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                 </div>
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium">
                         <option>Wedding</option><option>Birthday</option><option>Anniversary</option>
                         <option>Reunion</option><option>Engagement</option><option>Housewarming</option>
                         <option>Naming Ceremony</option><option>Festival</option><option>Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Family Branch *</label>
                      <select name="familyBranch" value={formData.familyBranch} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-medium">
                         <option value="">Select Branch</option>
                         <option>Hyderabad</option><option>Bangalore</option><option>Mumbai</option>
                      </select>
                    </div>
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Description *</label>
                    <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Describe the event details..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3"></textarea>
                 </div>
                 
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Event Banner</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                       <UploadCloud size={32} className="text-blue-500 mb-3" />
                       <span className="text-sm font-bold text-slate-600">Click to upload banner image</span>
                       <span className="text-xs text-slate-400 mt-1">1200 x 400px recommended (JPG, PNG)</span>
                    </div>
                 </div>
              </div>
           </CardSection>

           <CardSection title="Date & Time">
              <div className="grid grid-cols-2 gap-5">
                 <div className="col-span-2 md:col-span-1">
                    <label className="block text-sm font-bold text-slate-700 mb-2">Event Date *</label>
                    <input type="date" name="eventDate" value={formData.eventDate} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                 </div>
                 <div className="grid grid-cols-2 gap-3 col-span-2 md:col-span-1">
                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">Start Time *</label>
                       <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                    </div>
                    <div>
                       <label className="block text-sm font-bold text-slate-700 mb-2">End Time</label>
                       <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                    </div>
                 </div>
              </div>
           </CardSection>

           <CardSection title="Location">
              <div className="space-y-5">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Venue Name *</label>
                    <input type="text" name="venue" value={formData.venue} onChange={handleChange} placeholder="e.g. Taj Hotel" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Address *</label>
                    <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                    <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                    <input type="text" name="country" value={formData.country} onChange={handleChange} placeholder="Country*" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">Google Maps Link</label>
                    <input type="url" name="googleMapsUrl" value={formData.googleMapsUrl} onChange={handleChange} placeholder="https://maps.google.com/..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-blue-600" />
                 </div>
              </div>
           </CardSection>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
           <CardSection title="Visibility & Invitations">
              <div className="space-y-5">
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Visibility *</label>
                   <select name="visibility" value={formData.visibility} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                     <option>Public (Visible on Website)</option>
                     <option>Family Members Only</option>
                     <option>Private (Invite Only)</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-sm font-bold text-slate-700 mb-2">Invite Members</label>
                   <select name="inviteType" value={formData.inviteType} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                     <option>All Members</option>
                     <option>Family Branch</option>
                     <option>Selected Members</option>
                   </select>
                 </div>
              </div>
           </CardSection>

           <CardSection title="RSVP Settings">
              <div className="space-y-4">
                 <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${formData.rsvpEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}>
                       <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.rsvpEnabled ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <input type="checkbox" name="rsvpEnabled" checked={formData.rsvpEnabled} onChange={handleChange} className="hidden" />
                    <span className="font-bold text-sm">Enable RSVP tracking</span>
                 </label>
                 
                 {formData.rsvpEnabled && (
                    <div className="pt-3 border-t border-slate-100 space-y-4">
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">Max Guests Limit</label>
                          <input type="number" name="maxGuests" value={formData.maxGuests} onChange={handleChange} placeholder="e.g. 100" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 mb-1">RSVP Deadline</label>
                          <input type="date" name="rsvpDeadline" value={formData.rsvpDeadline} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2" />
                       </div>
                    </div>
                 )}
              </div>
           </CardSection>

           <CardSection title="Live Stream">
              <div className="space-y-4">
                 <label className="flex items-center gap-3 cursor-pointer">
                    <div className={`w-12 h-6 rounded-full flex items-center p-1 transition-colors ${formData.liveStream ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                       <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.liveStream ? 'translate-x-6' : ''}`}></div>
                    </div>
                    <input type="checkbox" name="liveStream" checked={formData.liveStream} onChange={handleChange} className="hidden" />
                    <span className="font-bold text-sm">Enable Virtual Streaming</span>
                 </label>

                 {formData.liveStream && (
                    <div className="pt-3 border-t border-slate-100 space-y-3">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="liveChat" checked={formData.liveChat} onChange={handleChange} className="rounded text-blue-600" />
                          <span className="text-sm font-medium">Allow Live Chat</span>
                       </label>
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" name="recordEvent" checked={formData.recordEvent} onChange={handleChange} className="rounded text-blue-600" />
                          <span className="text-sm font-medium">Record Event</span>
                       </label>
                    </div>
                 )}
              </div>
           </CardSection>
           
           <CardSection title="Interactions">
              <div className="space-y-3">
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="allowPhotos" checked={formData.allowPhotos} onChange={handleChange} className="rounded text-blue-600 border-slate-300" />
                    <span className="text-sm font-medium">Allow members to upload photos</span>
                 </label>
                 <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="allowComments" checked={formData.allowComments} onChange={handleChange} className="rounded text-blue-600 border-slate-300" />
                    <span className="text-sm font-medium">Allow event comments/discussions</span>
                 </label>
              </div>
           </CardSection>
        </div>
      </div>
    </div>
  );
}

function CardSection({ title, children }) {
   return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-800">
         <h2 className="text-lg font-black text-slate-800 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-3 mb-5 inline-flex items-center gap-2 relative">
            {title}
            <div className="absolute -bottom-px left-0 w-8 h-1 bg-blue-600 rounded-full"></div>
         </h2>
         {children}
      </div>
   )
}
