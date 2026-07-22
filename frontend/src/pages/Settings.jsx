import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon, Bell, Shield, Palette, Globe,
  ChevronRight, Moon, Sun, Check, User, Loader2, Save, Lock
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = `${import.meta.env.VITE_API_URL}/api/v1/admin/dashboard`;

function authHeaders() {
  return { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } };
}

const sections = [
  { id: 'general',       label: 'Family Info',       icon: Globe },
  { id: 'notifications', label: 'Notifications',     icon: Bell },
  { id: 'appearance',    label: 'Appearance',         icon: Palette },
  { id: 'security',      label: 'Security',           icon: Shield },
];

// ──────────────── Reusable Toggle ────────────────
function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  );
}

// ──────────────── Skeleton ────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 dark:bg-slate-700 rounded-xl ${className}`} />;
}

export default function Settings() {
  const queryClient = useQueryClient();
  const [activeSection, setActiveSection] = useState('general');

  // ── Fetch family info ──
  const { data: familyData, isLoading: loadingFamily } = useQuery({
    queryKey: ['settings_family'],
    queryFn: async () => (await axios.get(`${API}/settings/family`, authHeaders())).data.data,
  });

  // ── Fetch current user + settings ──
  const { data: meData, isLoading: loadingMe } = useQuery({
    queryKey: ['settings_me'],
    queryFn: async () => (await axios.get(`${API}/settings/me`, authHeaders())).data.data,
  });

  // ── Local form states (initialised from fetched data) ──
  const [familyForm, setFamilyForm] = useState({ name: '', address: '', city: '', state: '', country: '' });
  const [notifForm, setNotifForm]   = useState({
    email_notifications: true, push_notifications: true, birthday_notifications: true,
    event_notifications: true, announcement_notifications: true, whatsapp_notifications: false,
  });
  const [appearForm, setAppearForm] = useState({ theme: 'System', language: 'English', timezone: 'UTC' });
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', phone: '' });
  const [pwForm, setPwForm]         = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  useEffect(() => {
    if (familyData) {
      setFamilyForm({
        name:    familyData.name    || '',
        address: familyData.address || '',
        city:    familyData.city    || '',
        state:   familyData.state   || '',
        country: familyData.country || '',
      });
    }
  }, [familyData]);

  useEffect(() => {
    if (meData) {
      const s = meData.memberSettings || {};
      setNotifForm({
        email_notifications:        s.email_notifications        ?? true,
        push_notifications:         s.push_notifications         ?? true,
        birthday_notifications:     s.birthday_notifications     ?? true,
        event_notifications:        s.event_notifications        ?? true,
        announcement_notifications: s.announcement_notifications ?? true,
        whatsapp_notifications:     s.whatsapp_notifications     ?? false,
      });
      setAppearForm({
        theme:    s.theme    || 'System',
        language: s.language || 'English',
        timezone: s.timezone || 'UTC',
      });
      setProfileForm({
        firstName: meData.firstName || '',
        lastName:  meData.lastName  || '',
        phone:     meData.phone     || '',
      });
    }
  }, [meData]);

  // ── Mutations ──
  const familyMutation = useMutation({
    mutationFn: (data) => axios.put(`${API}/settings/family`, data, authHeaders()),
    onSuccess:  () => { queryClient.invalidateQueries(['settings_family']); toast.success('Family info saved!'); },
    onError:    () => toast.error('Failed to save family info'),
  });

  const notifMutation = useMutation({
    mutationFn: (data) => axios.put(`${API}/settings/notifications`, data, authHeaders()),
    onSuccess:  () => { queryClient.invalidateQueries(['settings_me']); toast.success('Notification preferences saved!'); },
    onError:    () => toast.error('Failed to save notification settings'),
  });

  const appearMutation = useMutation({
    mutationFn: (data) => axios.put(`${API}/settings/appearance`, data, authHeaders()),
    onSuccess:  () => { queryClient.invalidateQueries(['settings_me']); toast.success('Appearance settings saved!'); },
    onError:    () => toast.error('Failed to save appearance settings'),
  });

  const profileMutation = useMutation({
    mutationFn: (data) => axios.put(`${API}/settings/profile`, data, authHeaders()),
    onSuccess:  (res) => {
      queryClient.invalidateQueries(['settings_me']);
      // update localStorage user so TopNav reflects new name
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, ...res.data.data }));
      toast.success('Profile updated!');
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const pwMutation = useMutation({
    mutationFn: (data) => axios.put(`${import.meta.env.VITE_API_URL}/api/v1/auth/change-password`, data, authHeaders()),
    onSuccess:  () => { setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' }); toast.success('Password changed!'); },
    onError:    (err) => toast.error(err?.response?.data?.message || 'Failed to change password'),
  });

  const handleSave = () => {
    if (activeSection === 'general')       familyMutation.mutate(familyForm);
    if (activeSection === 'notifications') notifMutation.mutate(notifForm);
    if (activeSection === 'appearance')    appearMutation.mutate(appearForm);
    if (activeSection === 'profile')       profileMutation.mutate(profileForm);
    if (activeSection === 'security') {
      if (!pwForm.newPassword) return toast.error('Enter a new password');
      if (pwForm.newPassword !== pwForm.confirmPassword) return toast.error('Passwords do not match');
      pwMutation.mutate({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
    }
  };

  const isLoading = loadingFamily || loadingMe;
  const isSaving  = familyMutation.isPending || notifMutation.isPending || appearMutation.isPending || profileMutation.isPending || pwMutation.isPending;

  const fullName    = meData ? `${meData.firstName || ''} ${meData.lastName || ''}`.trim() : '';
  const roleName    = meData?.role === 'ADMIN' ? 'Family Admin' : meData?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Member';
  const displayEmail = meData?.email || '';

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage family preferences, notifications, security and profile.</p>
      </div>

      <div className="grid grid-cols-[220px_1fr] gap-6 items-start">
        {/* ── Sidebar nav ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm">
          {sections.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 last:mb-0 ${
                activeSection === id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon size={18} />
              <span className="flex-1 text-left">{label}</span>
              {activeSection !== id && <ChevronRight size={14} className="opacity-40" />}
            </button>
          ))}
        </div>

        {/* ── Content panel ── */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="p-8">
            {/* ───── General / Family Info ───── */}
            {activeSection === 'general' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Family Information</h2>
                {isLoading ? (
                  <div className="grid grid-cols-2 gap-4">
                    {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-5">
                    {[
                      ['Family Name', 'name'],
                      ['Address',     'address'],
                      ['City',        'city'],
                      ['State',       'state'],
                      ['Country',     'country'],
                    ].map(([label, key]) => (
                      <div key={key}>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
                        <input
                          type="text"
                          value={familyForm[key] || ''}
                          onChange={e => setFamilyForm(f => ({ ...f, [key]: e.target.value }))}
                          className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ───── Notifications ───── */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
                {isLoading ? (
                  <div className="space-y-3">{[...Array(6)].map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
                ) : (
                  <div className="space-y-3">
                    {[
                      ['email_notifications',        'Email Notifications',        'Receive updates and alerts by email', '📧'],
                      ['push_notifications',         'Push Notifications',         'Real-time browser/app alerts',        '🔔'],
                      ['birthday_notifications',     'Birthday & Anniversary',     'Alerts for member birthdays',         '🎂'],
                      ['event_notifications',        'Event Reminders',            'Upcoming event notifications',        '📅'],
                      ['announcement_notifications', 'Announcements',              'Family-wide announcements',           '📢'],
                      ['whatsapp_notifications',     'WhatsApp Notifications',     'Alerts via WhatsApp (if configured)', '💬'],
                    ].map(([key, title, desc, emoji]) => (
                      <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <span className="text-2xl w-8 text-center">{emoji}</span>
                        <div className="flex-1">
                          <div className="font-bold text-sm text-slate-900 dark:text-white">{title}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                        </div>
                        <Toggle checked={notifForm[key]} onChange={v => setNotifForm(n => ({ ...n, [key]: v }))} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ───── Appearance ───── */}
            {activeSection === 'appearance' && (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>

                {/* Theme */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-4 max-w-sm">
                    {[['Light', 'light', Sun], ['Dark', 'dark', Moon], ['System', 'System', SettingsIcon]].map(([label, val, Icon]) => (
                      <button
                        key={val}
                        onClick={() => setAppearForm(a => ({ ...a, theme: val }))}
                        className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                          appearForm.theme === val
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <Icon size={24} className={appearForm.theme === val ? 'text-indigo-600' : 'text-slate-400'} />
                        <span className={`text-sm font-bold ${appearForm.theme === val ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Language</label>
                  <select
                    value={appearForm.language}
                    onChange={e => setAppearForm(a => ({ ...a, language: e.target.value }))}
                    className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Marathi', 'Gujarati'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>

                {/* Timezone */}
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
                  <select
                    value={appearForm.timezone}
                    onChange={e => setAppearForm(a => ({ ...a, timezone: e.target.value }))}
                    className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    {['UTC', 'UTC+5:30 (IST)', 'UTC-5 (EST)', 'UTC-8 (PST)', 'UTC+1 (CET)', 'UTC+8 (SGT)'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            )}

            {/* ───── Security ───── */}
            {activeSection === 'security' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Change Password</h2>
                <div className="max-w-md space-y-4">
                  {[
                    ['Current Password', 'currentPassword'],
                    ['New Password',     'newPassword'],
                    ['Confirm Password', 'confirmPassword'],
                  ].map(([label, key]) => (
                    <div key={key}>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="password"
                          value={pwForm[key]}
                          onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))}
                          placeholder={`Enter ${label.toLowerCase()}`}
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                        />
                      </div>
                    </div>
                  ))}
                  <p className="text-xs text-slate-400">Use at least 8 characters with a mix of letters and numbers.</p>
                </div>
              </div>
            )}

          </div>

          {/* ── Footer save bar ── */}
          <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex gap-3 items-center">
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                if (familyData && activeSection === 'general') setFamilyForm({ name: familyData.name || '', address: familyData.address || '', city: familyData.city || '', state: familyData.state || '', country: familyData.country || '' });
                if (meData) {
                  const s = meData.memberSettings || {};
                  if (activeSection === 'notifications') setNotifForm({ email_notifications: s.email_notifications ?? true, push_notifications: s.push_notifications ?? true, birthday_notifications: s.birthday_notifications ?? true, event_notifications: s.event_notifications ?? true, announcement_notifications: s.announcement_notifications ?? true, whatsapp_notifications: s.whatsapp_notifications ?? false });
                  if (activeSection === 'appearance') setAppearForm({ theme: s.theme || 'System', language: s.language || 'English', timezone: s.timezone || 'UTC' });
                  if (activeSection === 'profile') setProfileForm({ firstName: meData.firstName || '', lastName: meData.lastName || '', phone: meData.phone || '' });
                }
                if (activeSection === 'security') setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
              }}
              className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
