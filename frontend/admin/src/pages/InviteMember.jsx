import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Users, User, Link as LinkIcon, Send, Settings, Mail, MessageCircle, X, Check, QrCode, ClipboardList, Info, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function InviteMember() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [inviteResult, setInviteResult] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '', phone: '', email: '', gender: '', relationship: '', familyBranch: '', role: 'MEMBER',
    fatherId: '', motherId: '', spouseId: '',
    expiry: '7 Days',
    sendVia: { whatsapp: true, sms: true, email: false },
    generateQr: true,
    allowEdit: false,
    requireApproval: true
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith('sendVia.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({ ...prev, sendVia: { ...prev.sendVia, [key]: checked } }));
    } else {
      setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    }
  };

  const handleToggle = (key) => setFormData(p => ({ ...p, [key]: !p[key] }));

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.post('http://localhost:5000/api/v1/admin/members/invite', payload);
      if (res.data.success === false) {
        if (res.data.status === 'EMAIL_FAILED') {
           throw new Error(`Invitation could not be sent. ${res.data.error}`);
        }
        throw new Error(res.data.error || 'Server rejected payload');
      }
      return res.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      if (variables.isDraft) {
        toast.success(data.message || 'Saved as draft');
        navigate('/admin/dashboard/members');
      } else {
        toast.success('Invitation successfully processed');
        setInviteResult({
          memberId: data.user?.memberId || 'MEM-000245',
          link: data.inviteLink || `http://localhost:5174/invite?token=mock_123`,
          status: 'Pending Acceptance'
        });
        setShowSuccessDialog(true);
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Failed to generate invite');
    }
  });

  const handleSubmit = (e, isDraft = false) => {
    e.preventDefault();
    if (!formData.fullName || !formData.phone || !formData.email) {
      toast.error('Full Name, Mobile Number, and Email Address are required.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    const nameParts = formData.fullName.trim().split(' ');
    const fName = nameParts[0] || '';
    const lName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : ' ';

    mutation.mutate({
      firstName: fName,
      lastName: lName,
      phone: formData.phone,
      email: formData.email,
      gender: formData.gender,
      relationship: formData.relationship,
      familyBranch: formData.familyBranch,
      role: formData.role,
      isDraft
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(inviteResult?.link);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-950 min-h-screen pb-32 animate-in fade-in duration-500">
      
      {/* Page Header */}
      <div className="max-w-5xl mx-auto pt-8 px-6 lg:px-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-6">
          <ArrowLeft size={16} /> Back to Members
        </button>
        <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Invite Family Member</h1>
          <p className="text-slate-500 max-w-3xl leading-relaxed text-sm">
            Invite a family member to join your FamilyHub. They'll receive a secure invitation link to verify their mobile number, create their account, and complete their profile themselves.
          </p>
        </div>

        <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-10">
          
          {/* Section 1: Invitation Details */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 md:p-8">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><User size={20} /></div>
               <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Invitation Details</h2>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Full Name *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="e.g. Rahul Kumar" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mobile Number *</label>
                  <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="+91 9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email Address *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
                    <option value="">▼ Select Gender</option>
                    <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Relationship to Family *</label>
                  <select name="relationship" value={formData.relationship} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
                    <option value="">▼ Select Relationship</option>
                    {['Father','Mother','Son','Daughter','Brother','Sister','Husband','Wife','Grandfather','Grandmother','Uncle','Aunt','Cousin','Nephew','Niece','Friend','Other'].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Family Branch *</label>
                  <select name="familyBranch" value={formData.familyBranch} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
                    <option value="">▼ Select Branch</option>
                    <option value="Hyderabad Branch">Hyderabad Branch</option>
                    <option value="Main Branch">Main Branch</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role *</label>
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm">
                    <option value="MEMBER">Member</option>
                    <option value="ADMIN">Family Admin</option>
                  </select>
                </div>
             </div>
          </section>

          {/* Section 2: Family Placement */}
          <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6 md:p-8">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><Users size={20} /></div>
               <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Family Placement</h2>
             </div>
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <div className="space-y-5">
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Father</label>
                    <input type="text" name="fatherId" value={formData.fatherId} onChange={handleChange} placeholder="Search Existing Member..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mother</label>
                    <input type="text" name="motherId" value={formData.motherId} onChange={handleChange} placeholder="Search Existing Member..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                 </div>
                 <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spouse</label>
                    <input type="text" name="spouseId" value={formData.spouseId} onChange={handleChange} placeholder="Search Existing Member..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm" />
                 </div>
               </div>
               
               <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="mb-2"><Users size={32} className="text-slate-300 mx-auto" /></div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">Family Tree Preview</h4>
                  <p className="text-xs text-slate-500 mb-3">Generation: <span className="font-semibold text-slate-700">Auto-calculated</span></p>
                  <p className="text-xs text-slate-400">Position preview will appear here upon assigning relatives.</p>
               </div>
             </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Section 3: Invitation Settings */}
            <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Settings size={20} /></div>
                <h2 className="text-lg font-semibold text-slate-900">Invitation Settings</h2>
              </div>
              
              <div className="space-y-6">
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-2">Invitation Expiry</label>
                   <select name="expiry" value={formData.expiry} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm">
                     {['24 Hours','3 Days','7 Days','15 Days','30 Days'].map(t => <option key={t} value={t}>▼ {t}</option>)}
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-sm font-semibold text-slate-700 mb-3">Send Invitation Via</label>
                   <div className="flex gap-4">
                     {Object.entries({ whatsapp: 'WhatsApp', sms: 'SMS', email: 'Email' }).map(([k,v]) => (
                        <label key={k} className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-600">
                           <input type="checkbox" name={`sendVia.${k}`} checked={formData.sendVia[k]} onChange={handleChange} className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-600" />
                           {v}
                        </label>
                     ))}
                   </div>
                 </div>

                 <div className="space-y-4 pt-4 border-t border-slate-100">
                    {[
                      { key: 'generateQr', label: 'Generate QR Code' },
                      { key: 'allowEdit', label: 'Allow Member to Edit Relationship' },
                      { key: 'requireApproval', label: 'Require Admin Approval After Registration' }
                    ].map(t => (
                      <div key={t.key} className="flex items-center justify-between">
                         <span className="text-sm font-semibold text-slate-700">{t.label}</span>
                         <button type="button" onClick={() => handleToggle(t.key)} className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${formData[t.key] ? 'bg-blue-600' : 'bg-slate-200'}`}>
                            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${formData[t.key] ? 'translate-x-4' : 'translate-x-0'}`} />
                         </button>
                      </div>
                    ))}
                 </div>
              </div>
            </section>

            {/* Section 4: Invitation Preview */}
            <section className="bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner overflow-hidden p-6 flex flex-col">
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider mb-6">Invitation Preview</h2>
              <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-100 p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
                 <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 left-0"></div>
                 <h3 className="text-slate-800 font-bold mb-1">FamilyHub Directory</h3>
                 <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center my-4">
                   <User size={32} className="text-blue-500" />
                 </div>
                 <p className="text-lg font-bold text-slate-900 mb-1">{formData.fullName || 'Member Name'}</p>
                 <p className="text-sm text-slate-500 font-medium mb-3">{formData.relationship || 'Relationship'} • {formData.familyBranch || 'Branch'}</p>
                 
                 <div className="w-full bg-slate-50 rounded-lg p-3 text-xs text-left grid grid-cols-2 gap-2 mt-2">
                    <div><span className="text-slate-400">Role</span><br/><strong className="text-slate-700">{formData.role}</strong></div>
                    <div><span className="text-slate-400">Expiry</span><br/><strong className="text-slate-700">{formData.expiry}</strong></div>
                 </div>
                 <div className="mt-4 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full w-max mx-auto shadow-sm">
                   Ready to Send
                 </div>
              </div>
            </section>
          </div>

          <div style={{ height: '80px' }}></div> {/* Spacer for sticky footer */}
          
          {/* Sticky Footer */}
          <div className="fixed bottom-0 left-0 w-full bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 z-40 py-4 px-6 md:px-8 shadow-2xl">
             <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-500 hidden md:block">Requires secure verification.</p>
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                   <button type="button" onClick={() => navigate(-1)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-all">Cancel</button>
                   <button type="button" onClick={(e) => handleSubmit(e, true)} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all">Save Draft</button>
                   <button type="button" className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-xl shadow-sm transition-all hidden lg:block">Preview Invitation</button>
                   <button type="button" disabled={mutation.isPending} className="px-5 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-sm transition-all hidden lg:block">Generate Invite Link</button>
                   
                   <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-lg flex items-center gap-2 transition-all">
                      <Send size={16} /> {mutation.isPending ? 'Sending...' : 'Send Invitation'}
                   </button>
                </div>
             </div>
          </div>
        </form>
      </div>

      {/* Success Dialog Modal */}
      <AnimatePresence>
        {showSuccessDialog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
             <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
                <div className="p-8 text-center relative">
                   <button onClick={() => setShowSuccessDialog(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                   
                   <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} strokeWidth={3} />
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900 mb-1">Invitation Sent Successfully</h3>
                   <p className="text-slate-500 text-sm mb-6">A secure verification link has been delivered.</p>

                   <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-left space-y-3 mb-6">
                       <div className="flex justify-between border-b border-slate-200 pb-2">
                         <span className="text-sm font-semibold text-slate-500">Member ID</span>
                         <span className="text-sm font-bold text-slate-900">{inviteResult.memberId}</span>
                       </div>
                       <div className="flex justify-between border-b border-slate-200 pb-2">
                         <span className="text-sm font-semibold text-slate-500">Status</span>
                         <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">{inviteResult.status}</span>
                       </div>
                       <div className="flex justify-between pb-1">
                         <span className="text-sm font-semibold text-slate-500">Delivery Status</span>
                         <div className="text-right">
                           {formData.sendVia.sms && <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end"><Check size={12}/> SMS Sent</div>}
                           {formData.sendVia.whatsapp && <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end mt-1"><Check size={12}/> WhatsApp Sent</div>}
                           {formData.sendVia.email && <div className="text-xs font-bold text-emerald-600 flex items-center gap-1 justify-end mt-1"><Check size={12}/> Email Sent</div>}
                         </div>
                       </div>
                   </div>

                   <div className="flex items-center gap-2 mb-6">
                      <div className="flex-1 bg-slate-100 rounded-lg p-2.5 flex items-center">
                         <input type="text" readOnly value={inviteResult.link} className="bg-transparent w-full outline-none text-xs text-slate-600 font-mono truncate" />
                      </div>
                      <button onClick={copyLink} className="p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg" title="Copy Link"><ClipboardList size={18} /></button>
                      <button className="p-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg" title="View QR"><QrCode size={18} /></button>
                   </div>

                   <div className="flex gap-3 justify-center">
                      <button onClick={() => navigate('/admin/dashboard/members')} className="flex-1 px-4 py-3 rounded-xl font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm">View Invitations</button>
                      <button onClick={() => navigate('/admin/dashboard')} className="flex-1 px-4 py-3 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 text-sm shadow-md">Done</button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
