import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X, User, Lock, Eye, EyeOff, Search, ChevronDown } from 'lucide-react';

import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import API_BASE_URL from '../config/api';

const RELATIONSHIP_OPTIONS = [
  'SPOUSE', 'SON', 'DAUGHTER', 'FATHER', 'MOTHER', 'BROTHER', 'SISTER', 
  'GRANDFATHER', 'GRANDMOTHER', 'GRANDSON', 'GRANDDAUGHTER', 
  'UNCLE', 'AUNT', 'NEPHEW', 'NIECE', 'OTHER'
];

function SearchableMemberDropdown({ label, name, value, onChange, members, required, placeholder = "Search family member..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMembers = members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.relationship && m.relationship.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedMember = members.find(m => m.id === value);

  return (
    <div className="relative" ref={wrapperRef}>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label} {required && '*'}</label>
      <div 
        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedMember ? 'text-slate-900' : 'text-slate-400'}>
          {selectedMember ? `${selectedMember.firstName} ${selectedMember.lastName} ${selectedMember.relationship ? `— ${selectedMember.relationship}` : ''}` : 'Select Family Member'}
        </span>
        <ChevronDown size={16} className="text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100 flex items-center gap-2">
            <Search size={16} className="text-slate-400" />
            <input 
              type="text" 
              className="w-full text-sm outline-none bg-transparent" 
              placeholder={placeholder}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-48 overflow-y-auto">
            {filteredMembers.length === 0 ? (
              <div className="p-3 text-sm text-slate-500 text-center">No members found</div>
            ) : (
              filteredMembers.map(m => (
                <div 
                  key={m.id}
                  className="px-4 py-2 hover:bg-slate-50 cursor-pointer flex items-center gap-3"
                  onClick={() => {
                    onChange({ target: { name, value: m.id } });
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                    <User size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-900">{m.firstName} {m.lastName}</div>
                    <div className="text-[11px] text-slate-500">{m.relationship || 'Member'}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AddMember() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const { data: familyMembers = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      const res = await axios.get(`${API_BASE_URL}/api/v1/admin/members`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      return res.data;
    }
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dob: '',
    relatedToMemberId: '',
    relationship: '',
    customRelationship: '',
    role: 'MEMBER',
    fatherId: '',
    motherId: '',
    spouseId: '',
    status: 'ACTIVE',
    notes: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mutation = useMutation({
    mutationFn: async ({ payload }) => {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${API_BASE_URL}/api/v1/admin/members/add`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success === false) {
        throw new Error(res.data.error || 'Server rejected payload');
      }
      return res.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      toast.success(variables.payload.isDraft ? 'Member saved as draft' : 'Member created successfully');
      navigate('/admin/dashboard/members');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || error.message || 'Failed to add member');
    }
  });

  const handleSubmit = (e, isDraft = false) => {
    e.preventDefault();
    if (!isDraft && (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.gender || !formData.relatedToMemberId || !formData.relationship)) {
      toast.error('Please fill all required fields, including relationship and phone number.');
      return;
    }
    if (formData.relationship === 'CUSTOM' && !formData.customRelationship) {
      toast.error('Please specify the custom relationship.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    
    mutation.mutate({ payload: { ...formData, isDraft } });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500 pt-8 px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Add Family Member</h1>
          <p className="text-sm text-slate-500">Create a family member record manually and establish their position in the family tree.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
        <form className="space-y-8" onSubmit={(e) => handleSubmit(e, false)}>
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <User size={18} className="text-blue-500" /> Basic Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. John" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex justify-between">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} autoComplete="new-email" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. +1234567890" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date of Birth (Optional)</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              Family Relationship
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Belongs To / Related To *</label>
                <select name="relatedToMemberId" value={formData.relatedToMemberId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select Family Member</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.firstName} {m.lastName} {m.role === 'ADMIN' || m.role === 'SUPER_ADMIN' ? '— Family Head' : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Relationship *</label>
                <select name="relationship" value={formData.relationship} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select Relationship</option>
                  <option value="SPOUSE">Spouse</option>
                  <option value="SON">Son</option>
                  <option value="DAUGHTER">Daughter</option>
                  <option value="FATHER">Father</option>
                  <option value="MOTHER">Mother</option>
                  <option value="BROTHER">Brother</option>
                  <option value="SISTER">Sister</option>
                  <option value="GRANDFATHER">Grandfather</option>
                  <option value="GRANDMOTHER">Grandmother</option>
                  <option value="GRANDSON">Grandson</option>
                  <option value="GRANDDAUGHTER">Granddaughter</option>
                  <option value="UNCLE">Uncle</option>
                  <option value="AUNT">Aunt</option>
                  <option value="NEPHEW">Nephew</option>
                  <option value="NIECE">Niece</option>
                  <option value="CUSTOM">Custom</option>
                </select>
              </div>
              
              {formData.relationship === 'CUSTOM' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Specify Relationship *</label>
                  <input type="text" name="customRelationship" value={formData.customRelationship} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Cousin" />
                </div>
              )}
              
              {formData.relatedToMemberId && formData.relationship && (
                <div className="md:col-span-2 bg-blue-50 p-4 rounded-xl border border-blue-100 flex flex-col items-center justify-center space-y-2 mt-2">
                  <span className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Relationship Preview</span>
                  {formData.relationship === 'SPOUSE' ? (
                     <div className="flex items-center space-x-4 text-sm font-medium text-slate-800">
                        <span>{familyMembers.find(m => m.id === formData.relatedToMemberId)?.firstName}</span>
                        <span className="text-blue-500">───── Spouse ─────</span>
                        <span>{formData.firstName || 'New Member'}</span>
                     </div>
                  ) : (
                     <div className="flex flex-col items-center text-sm font-medium text-slate-800">
                        <span>{familyMembers.find(m => m.id === formData.relatedToMemberId)?.firstName}</span>
                        <div className="flex flex-col items-center text-blue-500 my-1">
                          <span className="text-xs border-x-2 border-blue-300 h-3"></span>
                          <span className="bg-blue-100 px-2 py-0.5 rounded-full text-xs">{formData.relationship === 'CUSTOM' ? formData.customRelationship || 'Custom' : formData.relationship}</span>
                          <span className="text-xs border-x-2 border-blue-300 h-3"></span>
                          <span>▼</span>
                        </div>
                        <span>{formData.firstName || 'New Member'}</span>
                     </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Father (Optional)</label>
                <select name="fatherId" value={formData.fatherId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select Family Member</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mother (Optional)</label>
                <select name="motherId" value={formData.motherId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select Family Member</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Spouse (Optional)</label>
                <select name="spouseId" value={formData.spouseId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select Family Member</option>
                  {familyMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                   <option value="ACTIVE">Active (Children/Elders)</option>
                   <option value="DECEASED">Deceased</option>
                   <option value="PENDING_PROFILE">Pending Profile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                   <option value="MEMBER">Member</option>
                   <option value="ADMIN">Family Admin</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Admin Notes</label>
            <textarea name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-24" placeholder="Any internal notes..."></textarea>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50">
              <X size={16} className="inline mr-2"/> Cancel
            </button>
            <button type="button" onClick={(e) => handleSubmit(e, true)} disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-sm">
              <Save size={16} className="inline mr-2"/> Save Draft
            </button>
            <button type="submit" disabled={mutation.isPending} className="px-6 py-2.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30">
              <Save size={16} className="inline mr-2"/> {mutation.isPending ? 'Saving...' : 'Save Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
