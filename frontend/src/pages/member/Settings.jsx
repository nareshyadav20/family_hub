import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useForm, Controller } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Lock, Bell, Palette, Database, Camera, Smartphone, 
  Mail, Save, Key, AlertCircle, LogOut, CheckCircle2, Moon, Sun, Monitor, X
} from 'lucide-react';
import { io } from 'socket.io-client';

const API_URL =  `${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}/api`;
const socket = io(`${window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://family-hub-z48l.onrender.com'}`);

export default function Settings() {
  const [activeTab, setActiveTab] = useState('account');
  const [otpModal, setOtpModal] = useState({ open: false, type: '', value: '' });
  const queryClient = useQueryClient();
  const token = localStorage.getItem('token');

  // React Hook Form for different sections
  const accountForm = useForm();
  const securityForm = useForm();
  
  // Real-time synchronization
  useEffect(() => {
    socket.on('member.updated', (data) => {
      // Refresh settings if our member was updated
      queryClient.invalidateQueries(['memberSettings']);
    });
    return () => socket.off('member.updated');
  }, [queryClient]);

  // Fetch Settings
  const { data, isLoading } = useQuery({
    queryKey: ['memberSettings'],
    queryFn: async () => {
      const res = await axios.get(`${API_URL}/settings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data.settings) {
        accountForm.reset({
          display_name: data.settings.display_name || '',
          username: data.settings.username || '',
          email: data.settings.email || '',
          mobile: data.settings.mobile || ''
        });
      }
    }
  });

  const settings = data?.settings || {};
  const user = data?.user || {};

  // Auto-save Mutations
  const updateSettings = useMutation({
    mutationFn: async ({ endpoint, payload }) => {
      const res = await axios.put(`${API_URL}/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: (res, variables) => {
      queryClient.setQueryData(['memberSettings'], (old) => {
        return { ...old, settings: { ...old.settings, ...variables.payload } };
      });
      toast.success('Settings automatically saved');
    },
    onError: (err) => {
      toast.error('Failed to save settings');
    }
  });

  const handleToggle = (endpoint, key, currentValue) => {
    updateSettings.mutate({ endpoint, payload: { [key]: !currentValue } });
  };

  const handleSelectChange = (endpoint, key, value) => {
    updateSettings.mutate({ endpoint, payload: { [key]: value } });
  };

  const handleAccountSave = (data) => {
    updateSettings.mutate({ endpoint: 'settings', payload: { display_name: data.display_name, username: data.username } });
  };

  // OTP Verification flows
  const sendOtp = useMutation({
    mutationFn: async ({ type, value }) => {
      const endpoint = type === 'email' ? 'send-email-otp' : 'send-mobile-otp';
      const res = await axios.post(`${API_URL}/${endpoint}`, { value }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: (_, variables) => {
      setOtpModal({ open: true, type: variables.type, value: variables.value, step: 'verify', otp: '' });
      toast.success(`Verification code sent to ${variables.type}`);
    }
  });

  const verifyOtp = useMutation({
    mutationFn: async ({ type, value, otp }) => {
      const endpoint = type === 'email' ? 'verify-email-otp' : 'verify-mobile-otp';
      const payload = type === 'email' ? { newEmail: value, otp } : { newMobile: value, otp };
      const res = await axios.post(`${API_URL}/${endpoint}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Successfully updated!');
      setOtpModal({ open: false, type: '', value: '' });
      queryClient.invalidateQueries(['memberSettings']);
    },
    onError: () => toast.error('Invalid verification code')
  });

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-slate-50"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>;
  }

  const navItems = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'data', label: 'Data & Account', icon: Database },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full mt-16 font-sans">
      <div className="mb-8 pl-1">
         <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Settings</h1>
         <p className="text-sm text-slate-500 font-medium mt-1">Manage your account preferences and personal information.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Navigation */}
        <div className="w-full md:w-64 shrink-0">
          <div className="flex flex-col gap-1 sticky top-24 relative hidden md:flex">
             {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-blue-50/70 text-blue-700 font-bold' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <item.icon size={18} className={activeTab === item.id ? 'text-blue-600' : 'text-slate-400'} />
                  {item.label}
                </button>
             ))}
          </div>
          
          {/* Mobile Nav Dropsown */}
          <div className="md:hidden block mb-6">
             <select 
               value={activeTab} 
               onChange={(e) => setActiveTab(e.target.value)}
               className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 shadow-sm"
             >
                {navItems.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
             </select>
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              
              {/* Account Section */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  {/* Profile Photo */}
                  <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-base font-bold text-slate-800 mb-4">Profile Photo</h3>
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white text-3xl font-semibold shadow-md ring-4 ring-slate-50 cursor-pointer overflow-hidden group">
                           {settings.profile_photo ? (
                             <img src={settings.profile_photo} alt="Profile" className="w-full h-full object-cover" />
                           ) : (
                             <span>{settings.display_name?.charAt(0) || user.firstName?.charAt(0)}</span>
                           )}
                           <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera className="w-6 h-6 text-white" />
                           </div>
                        </div>
                      </div>
                      <div>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors shadow-sm">
                            Upload Photo
                          </button>
                          <button className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors">
                            Remove
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 font-medium">Recommended: Square JPG or PNG, at least 500x500px.</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <form onSubmit={accountForm.handleSubmit(handleAccountSave)} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                       <h3 className="text-base font-bold text-slate-800">Basic Information</h3>
                       <button type="submit" disabled={updateSettings.isPending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                         {updateSettings.isPending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={16} />} 
                         Save Changes
                       </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700">Display Name</label>
                        <input {...accountForm.register('display_name')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[13px] font-bold text-slate-700">Username</label>
                        <div className="relative flex items-center">
                           <span className="absolute left-3 font-bold text-slate-400 text-sm">@</span>
                           <input {...accountForm.register('username')} className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-lg pl-8 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 shadow-sm transition-colors" placeholder="johndoe" />
                        </div>
                      </div>
                    </div>
                  </form>

                  {/* Contact Info (Requires OTP) */}
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 space-y-6">
                     <h3 className="text-lg font-semibold text-slate-900 mb-2">Contact Information</h3>
                     
                     <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                              <Mail size={18} />
                           </div>
                           <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Email Address</p>
                              <p className="text-sm font-semibold text-slate-900">{settings.email || 'Not provided'}</p>
                           </div>
                        </div>
                        <button onClick={() => setOtpModal({ open: true, type: 'email', step: 'request', value: '' })} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors whitespace-nowrap">
                           Update Email
                        </button>
                     </div>

                     <div className="p-4 rounded-lg border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                              <Smartphone size={18} />
                           </div>
                           <div>
                              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">Mobile Number</p>
                              <p className="text-sm font-semibold text-slate-900">{settings.mobile || 'Not provided'}</p>
                           </div>
                        </div>
                        <button onClick={() => setOtpModal({ open: true, type: 'mobile', step: 'request', value: '' })} className="px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm transition-colors whitespace-nowrap">
                           Update Number
                        </button>
                     </div>
                  </div>

                  {/* Read-Only Meta Info */}
                  <div className="bg-slate-50 rounded-lg border border-slate-200 p-6">
                    <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Account Metadata</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Member ID</p>
                        <p className="text-sm font-semibold text-slate-900 font-mono bg-white px-3 py-1.5 rounded-lg border border-slate-200 inline-block">{user.memberId}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Family Branch</p>
                        <p className="text-sm font-semibold text-slate-900">{user.familyBranch || 'Main'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-500 mb-1">Role</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/50">
                          {user.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Other sections can simply use the ToggleComponent helper */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-900">Privacy Preferences</h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Control who can see your personal information on the digital directory.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                       <ToggleRow title="Show Mobile Number" desc="Allow family members to see your phone number." checked={settings.show_mobile} onChange={() => handleToggle('privacy', 'show_mobile', settings.show_mobile)} />
                       <ToggleRow title="Show Email Address" desc="Allow family members to see your email address." checked={settings.show_email} onChange={() => handleToggle('privacy', 'show_email', settings.show_email)} />
                       <ToggleRow title="Show Date of Birth" desc="Show your full DOB instead of just birthday and month." checked={settings.show_dob} onChange={() => handleToggle('privacy', 'show_dob', settings.show_dob)} />
                       <ToggleRow title="Show Full Address" desc="Allow members to view your home address." checked={settings.show_address} onChange={() => handleToggle('privacy', 'show_address', settings.show_address)} />
                       <ToggleRow title="Public Profile" desc="Make your basic profile visible on the public Family Website." checked={settings.show_public_profile} onChange={() => handleToggle('privacy', 'show_public_profile', settings.show_public_profile)} />
                       <ToggleRow title="Receive Direct Messages" desc="Allow other members to message you directly." checked={settings.allow_direct_messages} onChange={() => handleToggle('privacy', 'allow_direct_messages', settings.allow_direct_messages)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                      <h3 className="text-lg font-semibold text-slate-900">Notification Settings</h3>
                      <p className="text-sm text-slate-500 mt-1 font-medium">Choose how and when you want to be notified.</p>
                    </div>
                    <div className="divide-y divide-slate-100">
                       <ToggleRow title="Email Notifications" desc="Receive general updates via email." checked={settings.email_notifications} onChange={() => handleToggle('notifications', 'email_notifications', settings.email_notifications)} />
                       <ToggleRow title="WhatsApp Notifications" desc="Receive urgent alerts over WhatsApp." checked={settings.whatsapp_notifications} onChange={() => handleToggle('notifications', 'whatsapp_notifications', settings.whatsapp_notifications)} />
                       <ToggleRow title="Push Notifications" desc="Browser push notifications for real-time events." checked={settings.push_notifications} onChange={() => handleToggle('notifications', 'push_notifications', settings.push_notifications)} />
                       <ToggleRow title="Birthday Reminders" desc="Get notified about upcoming family birthdays." checked={settings.birthday_notifications} onChange={() => handleToggle('notifications', 'birthday_notifications', settings.birthday_notifications)} />
                       <ToggleRow title="Event Invites" desc="Get notified when invited to family events." checked={settings.event_notifications} onChange={() => handleToggle('notifications', 'event_notifications', settings.event_notifications)} />
                       <ToggleRow title="Important Announcements" desc="Notifications for critical family announcements." checked={settings.announcement_notifications} onChange={() => handleToggle('notifications', 'announcement_notifications', settings.announcement_notifications)} />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                   <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-6">Appearance Interface</h3>
                      
                      <div className="space-y-8">
                         <div>
                            <label className="text-sm font-semibold text-slate-700 block mb-3">Theme Preference</label>
                            <div className="grid grid-cols-3 gap-4">
                               <button onClick={() => handleSelectChange('appearance', 'theme', 'Light')} className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${settings.theme === 'Light' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                 <Sun size={24} className={settings.theme === 'Light' ? 'text-blue-600' : 'text-slate-400'} />
                                 <span className={`text-sm font-semibold ${settings.theme === 'Light' ? 'text-blue-700' : 'text-slate-600'}`}>Light</span>
                               </button>
                               <button onClick={() => handleSelectChange('appearance', 'theme', 'Dark')} className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${settings.theme === 'Dark' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                 <Moon size={24} className={settings.theme === 'Dark' ? 'text-blue-600' : 'text-slate-400'} />
                                 <span className={`text-sm font-semibold ${settings.theme === 'Dark' ? 'text-blue-700' : 'text-slate-600'}`}>Dark</span>
                               </button>
                               <button onClick={() => handleSelectChange('appearance', 'theme', 'System')} className={`flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all ${settings.theme === 'System' ? 'border-blue-600 bg-blue-50/50' : 'border-slate-200 hover:border-slate-300'}`}>
                                 <Monitor size={24} className={settings.theme === 'System' ? 'text-blue-600' : 'text-slate-400'} />
                                 <span className={`text-sm font-semibold ${settings.theme === 'System' ? 'text-blue-700' : 'text-slate-600'}`}>System</span>
                               </button>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-slate-700">Language</label>
                              <select 
                                value={settings.language} 
                                onChange={(e) => handleSelectChange('appearance', 'language', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                              >
                                 <option value="English">English (US)</option>
                                 <option value="Spanish">Español</option>
                                 <option value="French">Français</option>
                                 <option value="Hindi">Hindi</option>
                              </select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-sm font-semibold text-slate-700">Time Zone</label>
                              <select 
                                value={settings.timezone} 
                                onChange={(e) => handleSelectChange('appearance', 'timezone', e.target.value)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors"
                              >
                                 <option value="UTC">UTC (Coordinated Universal Time)</option>
                                 <option value="EST">EST (Eastern Standard Time)</option>
                                 <option value="PST">PST (Pacific Standard Time)</option>
                                 <option value="IST">IST (Indian Standard Time)</option>
                              </select>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-4">Change Password</h3>
                    <form className="space-y-4 max-w-md">
                       <div className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-700">Current Password</label>
                         <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                       </div>
                       <div className="space-y-1.5">
                         <label className="text-sm font-semibold text-slate-700">New Password</label>
                         <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                       </div>
                       <div className="space-y-1.5 mb-2">
                         <label className="text-sm font-semibold text-slate-700">Confirm New Password</label>
                         <input type="password" placeholder="••••••••" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
                       </div>
                       <button type="button" className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors mt-2">
                          Update Password
                       </button>
                    </form>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between">
                         <div>
                            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">Two-Factor Authentication <span className="bg-amber-100 text-amber-700 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full">Recommended</span></h3>
                            <p className="text-sm text-slate-500 mt-1 font-medium">Add an extra layer of security to your account.</p>
                         </div>
                         <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={settings.two_factor_enabled} onChange={() => handleToggle('security', 'two_factor_enabled', settings.two_factor_enabled)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                         </label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-900">Active Devices</h3>
                      <button className="text-sm font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors">
                        Logout All Devices
                      </button>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 shrink-0">
                            <Monitor size={20} />
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-900">Windows PC - Chrome Browser</p>
                            <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-0.5"><CheckCircle2 size={12}/> Current Session • San Francisco, CA</p>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Download Your Data</h3>
                    <p className="text-sm text-slate-500 mb-6 font-medium">Get a copy of your personal data, posts, photos, and family tree connections.</p>
                    <button className="px-4 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                       <Database size={16} /> Request Data Archive
                    </button>
                  </div>

                  <div className="bg-rose-50/50 rounded-lg border border-rose-100 shadow-sm p-6">
                    <h3 className="text-lg font-semibold text-rose-700 mb-2">Account Deletion</h3>
                    <p className="text-sm text-rose-600/80 mb-6 font-medium">Permanently delete your account and all associated data. This action cannot be undone and requires Admin approval.</p>
                    <button onClick={async () => {
                       if (window.confirm("Are you entirely sure you want to request account deletion?")) {
                          await axios.post(`${API_URL}/request-account-deletion`, {}, { headers: { Authorization: `Bearer ${token}` }});
                          toast.success("Account deletion requested.");
                       }
                    }} className="px-4 py-2.5 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center gap-2">
                       <AlertCircle size={16} /> Request Deletion
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* OTP Modal */}
      {otpModal.open && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
               <div className="flex items-center justify-between p-4 border-b border-slate-100">
                  <h3 className="font-semibold text-slate-900">Update {otpModal.type === 'email' ? 'Email Address' : 'Mobile Number'}</h3>
                  <button onClick={() => setOtpModal({ open: false })} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
               </div>
               
               <div className="p-6">
                  {otpModal.step === 'request' ? (
                     <div className="space-y-4">
                        <div>
                           <label className="text-sm font-semibold text-slate-700 block mb-1.5">New {otpModal.type === 'email' ? 'Email' : 'Number'}</label>
                           <input type="text" value={otpModal.value} onChange={(e) => setOtpModal(prev => ({ ...prev, value: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500" placeholder={otpModal.type === 'email' ? "new@example.com" : "+1234567890"} />
                        </div>
                        <button onClick={() => sendOtp.mutate({ type: otpModal.type, value: otpModal.value })} disabled={sendOtp.isPending || !otpModal.value} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                           {sendOtp.isPending ? 'Sending...' : 'Send Verification Code'}
                        </button>
                     </div>
                  ) : (
                     <div className="space-y-4">
                        <p className="text-sm text-slate-600 font-medium">Enter the 6-digit code sent to <span className="font-semibold text-slate-900">{otpModal.value}</span></p>
                        <div>
                           <input type="text" value={otpModal.otp} onChange={(e) => setOtpModal(prev => ({ ...prev, otp: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-center text-xl tracking-[0.5em] font-mono focus:ring-2 focus:ring-blue-500" placeholder="••••••" maxLength={6} />
                        </div>
                        <button onClick={() => verifyOtp.mutate({ type: otpModal.type, value: otpModal.value, otp: otpModal.otp })} disabled={verifyOtp.isPending || otpModal.otp.length !== 6} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50">
                           {verifyOtp.isPending ? 'Verifying...' : 'Verify & Update'}
                        </button>
                        <p className="text-xs text-center text-slate-500 pt-2 font-medium">Use "123456" for testing.</p>
                     </div>
                  )}
               </div>
            </motion.div>
         </div>
      )}

    </div>
  );
}

// Reusable Toggle Component
function ToggleRow({ title, desc, checked, onChange }) {
  return (
    <div className="p-6 flex items-center justify-between gap-4">
      <div>
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <p className="text-xs text-slate-500 font-medium mt-0.5">{desc}</p>
      </div>
      <label className="relative inline-flex items-center cursor-pointer shrink-0">
         <input type="checkbox" className="sr-only peer" checked={checked} onChange={onChange} />
         <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );
}

function SettingsIcon({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
