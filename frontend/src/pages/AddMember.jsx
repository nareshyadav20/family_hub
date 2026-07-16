import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, X, User, Lock } from 'lucide-react';

import { useMutation, useQueryClient } from '@tanstack/react-query';

export default function AddMember() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: '',
    dob: '',
    relationship: '',
    familyBranch: '',
    role: 'MEMBER',
    fatherId: '',
    motherId: '',
    spouseId: '',
    status: 'ACTIVE',
    notes: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const mutation = useMutation({
    mutationFn: async ({ payload }) => {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api/v1/admin/members/add`, payload, {
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
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.gender || !formData.relationship || !formData.familyBranch || !formData.status || !formData.role || !formData.password || !formData.confirmPassword) {
      toast.error('Please fill all required fields, including password.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!pwdRegex.test(formData.password)) {
      toast.error('Password must be at least 8 characters long, contain an uppercase letter, lowercase letter, number, and special character.');
      return;
    }
    mutation.mutate({ payload: { ...formData, isDraft } });
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-500 pt-8 px-6 lg:px-8">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-500">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight">Add Family Member</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Create a family member record manually (e.g. children, elders). No invitation link will be generated.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form className="space-y-8" onSubmit={(e) => handleSubmit(e, false)}>
          
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <User size={18} className="text-blue-500" /> Basic Identification
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. John" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Doe" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex justify-between">Email Address *</label>
                <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Date of Birth (Optional)</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Lock size={18} className="text-blue-500" /> Account Credentials
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Password *</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Minimum 8 characters" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Confirm Password *</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Type password again" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-2">
              Family Placement
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Relationship to Head *</label>
                <input type="text" name="relationship" value={formData.relationship} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="e.g. Son, Daughter, Ancestor" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Family Branch *</label>
                <select name="familyBranch" value={formData.familyBranch} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                   <option value="">Select Branch</option>
                   <option value="Main">Main Branch</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Father (Optional)</label>
                <input type="text" name="fatherId" value={formData.fatherId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Existing member ID" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Mother (Optional)</label>
                <input type="text" name="motherId" value={formData.motherId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Existing member ID" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Spouse (Optional)</label>
                <input type="text" name="spouseId" value={formData.spouseId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" placeholder="Existing member ID" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Status *</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                   <option value="ACTIVE">Active (Children/Elders)</option>
                   <option value="DECEASED">Deceased</option>
                   <option value="PENDING_PROFILE">Pending Profile</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Role *</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500">
                   <option value="MEMBER">Member</option>
                   <option value="ADMIN">Family Admin</option>
                </select>
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Admin Notes</label>
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
