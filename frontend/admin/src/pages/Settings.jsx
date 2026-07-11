import React, { useState } from 'react';
import { Settings as SettingsIcon, Bell, Shield, Palette, Globe, ChevronRight, Moon, Sun, Check, User } from 'lucide-react';

const settingsSections = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'profile', label: 'My Profile', icon: User },
];

export default function Settings() {
  const [activeSection, setActiveSection] = useState('general');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState({
    emailEvents: true, emailBirthdays: true, pushAlerts: true, smsOtp: false, weeklyDigest: true
  });
  const [familyInfo, setFamilyInfo] = useState({
    name: 'The Smith Family', motto: 'Together We Stand, Together We Thrive', established: '1952', location: 'Springfield, IL'
  });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Manage family preferences, security, and account settings.</p>
      </div>

      <div className="grid grid-cols-[240px_1fr] gap-6">
        {/* Sidebar nav */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm h-fit">
          {settingsSections.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveSection(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all mb-1 last:mb-0 ${activeSection === id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <Icon size={18} />
              <span>{label}</span>
              {activeSection !== id && <ChevronRight size={14} className="ml-auto opacity-50" />}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
          {activeSection === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Family Information</h2>
              <div className="grid grid-cols-2 gap-6">
                {[['Family Name', 'name', 'text'], ['Family Motto', 'motto', 'text'], ['Established Year', 'established', 'text'], ['Home Location', 'location', 'text']].map(([label, key, type]) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
                    <input type={type} value={familyInfo[key]} onChange={e => setFamilyInfo(f => ({ ...f, [key]: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Privacy Level</label>
                <div className="grid grid-cols-3 gap-3">
                  {[['Public', 'Anyone can view basic info'], ['Members Only', 'Only verified members'], ['Private', 'Invite-only access']].map(([level, desc], i) => (
                    <div key={level} className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${i === 1 ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        {i === 1 && <Check size={14} className="text-indigo-600" />}
                        {level}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notification Preferences</h2>
              <div className="space-y-4">
                {[
                  ['emailEvents', 'Event Reminders via Email', 'Get notified about upcoming family events', '📅'],
                  ['emailBirthdays', 'Birthday & Anniversary Alerts', 'Receive birthday and anniversary notifications', '🎂'],
                  ['pushAlerts', 'Push Notifications', 'Real-time alerts for important family updates', '🔔'],
                  ['smsOtp', 'SMS OTP Verification', 'Use SMS for two-factor authentication', '📱'],
                  ['weeklyDigest', 'Weekly Family Digest', 'A weekly summary of family activities', '📰'],
                ].map(([key, title, desc, emoji]) => (
                  <div key={key} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-2xl">{emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
                    </div>
                    <button onClick={() => setNotifications(n => ({ ...n, [key]: !n[key] }))} className={`w-12 h-6 rounded-full transition-all duration-300 relative ${notifications[key] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300 ${notifications[key] ? 'left-6' : 'left-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Security Settings</h2>
              <div className="space-y-4">
                {[
                  { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', badge: 'Enabled', badgeColor: '#10B981', bg: 'rgba(16,185,129,0.1)', emoji: '🔐' },
                  { title: 'Active Sessions', desc: '3 active sessions across devices', badge: 'Manage', badgeColor: '#4F46E5', bg: 'rgba(79,70,229,0.1)', emoji: '💻' },
                  { title: 'Change Password', desc: 'Last changed 3 months ago', badge: 'Update', badgeColor: '#F59E0B', bg: 'rgba(245,158,11,0.1)', emoji: '🔑' },
                  { title: 'Login History', desc: 'View recent login activity', badge: 'View Log', badgeColor: '#6B7280', bg: 'rgba(107,114,128,0.1)', emoji: '📋' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group">
                    <span className="text-2xl">{item.emoji}</span>
                    <div className="flex-1">
                      <div className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                    <span style={{ background: item.bg, color: item.badgeColor }} className="text-xs font-bold px-3 py-1 rounded-full">{item.badge}</span>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Appearance</h2>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Theme Mode</label>
                <div className="grid grid-cols-2 gap-4 max-w-md">
                  {[['light', 'Light Mode', Sun], ['dark', 'Dark Mode', Moon]].map(([val, label, Icon]) => (
                    <button key={val} onClick={() => setTheme(val)} className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${theme === val ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10' : 'border-slate-200 dark:border-slate-700'}`}>
                      <Icon size={28} className={theme === val ? 'text-indigo-600' : 'text-slate-400'} />
                      <span className={`text-sm font-bold ${theme === val ? 'text-indigo-600' : 'text-slate-600 dark:text-slate-400'}`}>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Primary Color</label>
                <div className="flex gap-3">
                  {['#4F46E5', '#7C3AED', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444'].map(color => (
                    <button key={color} style={{ width: 36, height: 36, borderRadius: '50%', background: color, border: color === '#4F46E5' ? '3px solid #111827' : '3px solid transparent', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h2>
              <div className="flex items-center gap-6 p-5 bg-indigo-50 dark:bg-indigo-500/10 rounded-2xl">
                <img src="https://i.pravatar.cc/100?u=a04258" style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid #4F46E5' }} alt="Profile" />
                <div className="flex-1">
                  <div className="font-black text-xl text-slate-900 dark:text-white">Arjun Mehta</div>
                  <div className="text-sm text-slate-500 mt-1">Family Admin • arjun@smith.com</div>
                </div>
                <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-sm">Change Photo</button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[['Full Name', 'Arjun Mehta'], ['Email', 'arjun@smith.com'], ['Phone', '+1 555 007 1234'], ['Role', 'Family Admin'], ['Location', 'San Francisco, CA'], ['Joined', 'March 2022']].map(([label, val]) => (
                  <div key={label}>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">{label}</label>
                    <input defaultValue={val} className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button onClick={handleSave} className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/30'}`}>
              {saved ? <><Check size={16} /> Saved!</> : 'Save Changes'}
            </button>
            <button className="px-6 py-2.5 rounded-xl font-semibold text-sm border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
