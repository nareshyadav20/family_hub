import React, { useState, useRef, useEffect } from 'react';
import {
  User, Mail, Phone, MapPin, Camera, Edit2, Shield,
  CalendarDays, Lock, Key, CheckCircle2, X, Loader2,
  Save, Eye, EyeOff, Fingerprint
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const BASE = import.meta.env.VITE_API_URL;
const authH = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

export default function Profile() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);

  // ── Fetch profile ──────────────────────────────────────────────
  const { data: profileData, isLoading } = useQuery({
    queryKey: ['member_profile_page'],
    queryFn: async () => {
      const [profile, settings] = await Promise.all([
        axios.get(`${BASE}/api/v1/member/profile`, authH()),
        axios.get(`${BASE}/api/settings`, authH()),
      ]);
      return { user: profile.data.user, memberProfile: profile.data.profile, settings: settings.data.settings };
    },
  });

  const user    = profileData?.user    || {};
  const mp      = profileData?.memberProfile || {};
  const ms      = profileData?.settings || {};

  // ── Edit Profile modal ─────────────────────────────────────────
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({});
  useEffect(() => {
    if (user.id) {
      setEditForm({
        firstName:   user.firstName   || '',
        lastName:    user.lastName    || '',
        phone:       user.phone       || '',
        gender:      user.gender      || '',
        familyBranch: user.familyBranch || '',
        dob:         mp.dob ? mp.dob.split('T')[0] : '',
        bloodGroup:  mp.bloodGroup   || '',
        occupation:  mp.occupation   || '',
        address:     mp.address      || '',
      });
    }
  }, [user.id, editOpen]);

  const editMutation = useMutation({
    mutationFn: (data) => axios.put(`${BASE}/api/profile-info`, data, authH()),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['member_profile_page']);
      // sync localStorage
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.data }));
      toast.success('Profile updated!');
      setEditOpen(false);
    },
    onError: () => toast.error('Failed to update profile'),
  });

  // ── Avatar upload ──────────────────────────────────────────────
  const avatarMutation = useMutation({
    mutationFn: (avatar) => axios.put(`${BASE}/api/avatar`, { avatar }, authH()),
    onSuccess: () => {
      queryClient.invalidateQueries(['member_profile_page']);
      toast.success('Avatar updated!');
    },
    onError: () => toast.error('Failed to upload avatar'),
  });

  const handleAvatarClick = () => fileInputRef.current?.click();
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Select an image file');
    if (file.size > 2 * 1024 * 1024) return toast.error('Image must be under 2MB');
    const reader = new FileReader();
    reader.onloadend = () => avatarMutation.mutate(reader.result);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Change Password modal ──────────────────────────────────────
  const [pwOpen, setPwOpen] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);

  const pwMutation = useMutation({
    mutationFn: (data) => axios.put(`${BASE}/api/change-password`, data, authH()),
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setPwOpen(false);
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    },
    onError: (err) => toast.error(err?.response?.data?.error || 'Failed to change password'),
  });

  const handlePwSave = () => {
    if (!pwForm.newPassword) return toast.error('Enter a new password');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
    pwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
  };

  // ── Two-Factor Auth ────────────────────────────────────────────
  const twoFaMutation = useMutation({
    mutationFn: (two_factor_enabled) => axios.put(`${BASE}/api/security`, { two_factor_enabled }, authH()),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries(['member_profile_page']);
      toast.success(`Two-Factor Authentication ${vars ? 'enabled' : 'disabled'}`);
    },
    onError: () => toast.error('Failed to update 2FA setting'),
  });

  // ── Derived values ─────────────────────────────────────────────
  const firstName   = user.firstName   || '';
  const lastName    = user.lastName    || '';
  const email       = user.email       || 'Not provided';
  const phone       = user.phone       || 'Not provided';
  const roleRaw     = user.role        || 'MEMBER';
  const branch      = user.familyBranch || 'Headquarters';
  const gender      = user.gender      || 'N/A';
  const dob         = mp.dob ? new Date(mp.dob).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
  const twoFaOn     = ms.two_factor_enabled || false;

  const displayRole = roleRaw === 'SUPER_ADMIN' ? 'Super Admin' : roleRaw === 'ADMIN' ? 'Family Admin' : 'Member';
  const initials    = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl animate-pulse">
        <div className="h-8 w-48 bg-slate-200 rounded-xl" />
        <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
          <div className="h-48 bg-slate-200" />
          <div className="px-10 pb-10 -mt-20 space-y-6">
            <div className="w-40 h-40 rounded-full bg-slate-300 border-8 border-white" />
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 rounded-xl" />
              <div className="h-5 w-40 bg-slate-100 rounded-xl" />
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1,2,3,4].map(i => <div key={i} className="h-24 bg-slate-100 rounded-2xl" />)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
      <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">My Profile</h1>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/60 dark:border-slate-800 overflow-hidden shadow-xl shadow-slate-200/20 dark:shadow-none">

        {/* ── Banner ── */}
        <div className="h-48 relative bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        </div>

        {/* ── Profile Info Section ── */}
        <div className="px-6 md:px-10 pb-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-6 sm:gap-8 -mt-16 sm:-mt-20 mb-8 relative z-10">

            {/* Avatar */}
            <div className="relative group" onClick={handleAvatarClick} style={{ cursor: 'pointer' }}>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center font-black text-4xl sm:text-5xl shadow-2xl border-4 sm:border-[6px] border-white dark:border-slate-950 overflow-hidden relative">
                {avatarMutation.isPending ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <Loader2 size={32} className="text-white animate-spin" />
                  </div>
                ) : user.avatar ? (
                  <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span>{initials}</span>
                )}
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={28} className="text-white" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 w-7 h-7 bg-emerald-500 border-4 border-white dark:border-slate-950 rounded-full shadow-sm" />
            </div>

            {/* Name / Role */}
            <div className="flex-1 pb-2">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-800 dark:text-white capitalize">
                {firstName} {lastName}
              </h2>
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1.5 px-3 py-1 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-full border border-indigo-100 dark:border-indigo-500/20">
                  <Shield size={12} strokeWidth={3} /> {displayRole}
                </span>
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <MapPin size={14} /> {branch} Branch
                </span>
              </div>
            </div>

            {/* Edit Profile Button */}
            <div className="pb-2">
              <button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 shadow-lg transition-all"
              >
                <Edit2 size={16} strokeWidth={2.5} /> Edit Profile
              </button>
            </div>
          </div>

          {/* ── Info Cards ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {[
              { icon: <Mail size={18}/>,        label: 'Email Address', val: email,  color: 'text-blue-500',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { icon: <Phone size={18}/>,       label: 'Phone Number',  val: phone,  color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
              { icon: <User size={18}/>,        label: 'Gender',        val: gender, color: 'text-purple-500',  bg: 'bg-purple-50 dark:bg-purple-500/10' },
              { icon: <CalendarDays size={18}/>,label: 'Date of Birth', val: dob,    color: 'text-rose-500',    bg: 'bg-rose-50 dark:bg-rose-500/10' },
            ].map((f, i) => (
              <div key={i} className="flex flex-col gap-3 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${f.bg} ${f.color}`}>{f.icon}</div>
                <div>
                  <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">{f.label}</p>
                  <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate">{f.val}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ── Account Security ── */}
          <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4">Account Security</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Change Password */}
              <button
                onClick={() => setPwOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-50 hover:bg-indigo-50 dark:bg-slate-800/50 dark:hover:bg-indigo-500/10 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 py-3.5 rounded-xl font-bold text-sm transition-all text-slate-700 dark:text-slate-300 hover:text-indigo-600 group"
              >
                <Key size={16} className="text-slate-400 group-hover:text-indigo-500" />
                Change Password
              </button>

              {/* Two-Factor Auth */}
              <button
                onClick={() => twoFaMutation.mutate(!twoFaOn)}
                disabled={twoFaMutation.isPending}
                className={`flex-1 flex items-center justify-center gap-2 border py-3.5 rounded-xl font-bold text-sm transition-all ${
                  twoFaOn
                    ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-300 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-amber-50 hover:border-amber-300 hover:text-amber-700'
                }`}
              >
                {twoFaMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : twoFaOn ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Fingerprint size={16} />
                )}
                Two-Factor Authentication
                <span className={`ml-1 text-[10px] font-black px-2 py-0.5 rounded-full ${twoFaOn ? 'bg-emerald-200 text-emerald-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                  {twoFaOn ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ Edit Profile Modal ══════════ */}
      {editOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Edit Profile</h3>
              <button onClick={() => setEditOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                {[
                  ['First Name',    'firstName'],
                  ['Last Name',     'lastName'],
                  ['Phone',         'phone'],
                  ['Family Branch', 'familyBranch'],
                  ['Date of Birth', 'dob'],
                  ['Blood Group',   'bloodGroup'],
                  ['Occupation',    'occupation'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
                    <input
                      type={key === 'dob' ? 'date' : 'text'}
                      value={editForm[key] || ''}
                      onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Gender</label>
                  <select
                    value={editForm.gender || ''}
                    onChange={e => setEditForm(f => ({ ...f, gender: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Address</label>
                <textarea
                  value={editForm.address || ''}
                  onChange={e => setEditForm(f => ({ ...f, address: e.target.value }))}
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all resize-none"
                />
              </div>
            </div>
            <div className="flex gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => editMutation.mutate(editForm)}
                disabled={editMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              >
                {editMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Save Changes
              </button>
              <button onClick={() => setEditOpen(false)} className="px-6 py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════ Change Password Modal ══════════ */}
      {pwOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Lock size={20} className="text-indigo-500" /> Change Password
              </h3>
              <button onClick={() => setPwOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>
            <div className="px-8 py-6 space-y-4">
              {[
                ['Current Password',  'currentPassword'],
                ['New Password',      'newPassword'],
                ['Confirm Password',  'confirmPassword'],
              ].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{label}</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={pwForm[key]}
                      onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                      placeholder={`Enter ${label.toLowerCase()}`}
                      className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all"
                    />
                    {key === 'newPassword' && (
                      <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400">Password must be at least 6 characters.</p>
            </div>
            <div className="flex gap-3 px-8 py-5 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={handlePwSave}
                disabled={pwMutation.isPending}
                className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
              >
                {pwMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                Change Password
              </button>
              <button onClick={() => setPwOpen(false)} className="px-6 py-3 rounded-xl font-bold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 transition-all">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
