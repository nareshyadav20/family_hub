import React from 'react';
import { motion } from 'framer-motion';
import { 
  User, Shield, Mail, Smartphone, Lock, Globe, Image as ImageIcon, Save 
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function Profile() {
  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 mb-1">My Profile</h2>
        <p className="text-slate-500 font-medium">Manage your Super Admin account and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="space-y-8">
          {/* Profile Card */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 flex flex-col items-center text-center">
             <div className="relative mb-5 mt-2">
                <img src="https://ui-avatars.com/api/?name=Super+Admin&background=4f46e5&color=fff&size=150" alt="Avatar" className="w-28 h-28 rounded-full shadow-md" />
                <button className="absolute bottom-0 right-0 bg-white text-indigo-600 p-2 rounded-full shadow border border-slate-100 hover:bg-slate-50 transition-colors">
                  <ImageIcon size={16} />
                </button>
             </div>
             <h3 className="text-2xl font-bold text-slate-900">Alex Carter</h3>
             <span className="mt-2 flex items-center gap-1.5 text-[11px] font-bold bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full uppercase tracking-wider">
               <Shield size={14} /> Super Admin
             </span>
             <div className="mt-6 space-y-3 w-full text-sm font-medium text-slate-600">
                <div className="flex items-center justify-center gap-2.5 bg-slate-50 py-2 rounded-xl border border-slate-100"><Mail size={16} className="text-slate-400" /> alex@familyhub.os</div>
                <div className="flex items-center justify-center gap-2.5 bg-slate-50 py-2 rounded-xl border border-slate-100"><Smartphone size={16} className="text-slate-400" /> +1 (555) 000-0000</div>
             </div>
          </div>

          {/* Account Information (Read Only) */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-5">Account Info</h4>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="text-slate-500 font-medium">Role</span>
                <span className="font-bold text-slate-900">Super Admin</span>
              </div>
              <div className="flex justify-between border-b border-slate-50 pb-3">
                <span className="text-slate-500 font-medium">Account Created</span>
                <span className="font-bold text-slate-900">Oct 12, 2024</span>
              </div>
              <div className="flex justify-between pb-1">
                <span className="text-slate-500 font-medium">Last Login</span>
                <span className="font-bold text-slate-900">Just now</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          <form onSubmit={handleSave} className="space-y-8">
            
            {/* Personal Information */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><User size={20} /></div>
                <h3 className="text-xl font-bold text-slate-800">Personal Information</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">First Name</label>
                  <input type="text" defaultValue="Alex" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Last Name</label>
                  <input type="text" defaultValue="Carter" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Email Address</label>
                  <input type="email" defaultValue="alex@familyhub.os" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Mobile Number</label>
                  <input type="text" defaultValue="+1 (555) 000-0000" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300" />
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Globe size={20} /></div>
                <h3 className="text-xl font-bold text-slate-800">Preferences</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Theme</label>
                  <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300">
                    <option>Light</option>
                    <option>Dark</option>
                    <option>System Default</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Language</label>
                  <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300">
                    <option>English (US)</option>
                    <option>French (FR)</option>
                    <option>Spanish (ES)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Time Zone</label>
                  <select className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300">
                    <option>UTC-5 (EST)</option>
                    <option>UTC (GMT)</option>
                    <option>UTC+5:30 (IST)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl"><Lock size={20} /></div>
                <h3 className="text-xl font-bold text-slate-800">Security</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Change Password</label>
                  <input type="password" placeholder="Enter new password" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5 ml-1">Confirm Password</label>
                  <input type="password" placeholder="Confirm new password" className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-4 py-3.5 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-medium hover:border-slate-300" />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-slate-200">
              <button type="button" className="w-full sm:w-auto px-6 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                Cancel
              </button>
              <button type="submit" className="w-full sm:w-auto px-6 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md shadow-indigo-500/20 transition-all flex justify-center items-center gap-2">
                <Save size={18} /> Save Changes
              </button>
            </div>
            
          </form>
        </div>
      </div>
    </div>
  );
}
