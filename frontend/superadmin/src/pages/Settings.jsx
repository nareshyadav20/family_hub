import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings2, Mail, Database, Globe, ShieldAlert, Activity, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/settings';

export default function Settings() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(API_URL);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load settings data');
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const sections = [
    {
      title: 'General',
      icon: Settings2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      items: [
        { label: 'Platform Name', value: data.config.platformName },
        { label: 'Platform Version', value: data.config.version },
        { label: 'Timezone', value: data.config.timezone },
        { label: 'Maintenance Mode', value: data.config.maintenance, highlight: 'text-slate-500 bg-slate-100' },
      ]
    },
    {
      title: 'Email Configuration',
      icon: Mail,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      items: [
        { label: 'Provider', value: data.config.emailProvider },
        { label: 'Sender Name', value: data.config.senderName },
        { label: 'Sender Email', value: data.config.senderEmail },
        { label: 'SMTP Status', value: data.config.emailProvider !== 'Not Configured' ? 'Connected' : 'Warning', highlight: data.config.emailProvider !== 'Not Configured' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50' },
      ]
    },
    {
      title: 'Storage',
      icon: Database,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: [
        { label: 'Provider', value: 'Cloudinary' },
        { label: 'Usage', value: `${data.stats.storageUsed} / 200 GB` },
        { label: 'Status', value: 'Connected', highlight: 'text-emerald-600 bg-emerald-50' },
      ]
    },
    {
      title: 'Google Services',
      icon: Globe,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      items: [
        { label: 'Google OAuth', value: data.config.googleOAuth, highlight: data.config.googleOAuth === 'Enabled' ? 'text-emerald-600 bg-emerald-50' : 'text-slate-500 bg-slate-100' },
        { label: 'Redirect URI', value: 'Configured' },
      ]
    },
    {
      title: 'Security',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      items: [
        { label: 'JWT Expiry', value: data.config.jwtExpiry },
        { label: 'Password Policy', value: 'Strong' },
        { label: '2FA', value: 'Disabled', highlight: 'text-slate-500 bg-slate-100' },
      ]
    },
    {
      title: 'Platform Statistics',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      items: [
        { label: 'Total Families', value: data.stats.totalFamilies.toString() },
        { label: 'Total Admins', value: data.stats.totalAdmins.toString() },
        { label: 'Total Members', value: data.stats.totalMembers.toString() },
        { label: 'Total Events', value: data.stats.totalEvents.toString() },
        { label: 'Documents', value: data.stats.totalDocuments.toString() },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Global configurations including APIs, Email, Storage and Live Database Statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {sections.map((section, idx) => (
          <motion.div 
            key={section.title} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
          >
            <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100 bg-slate-50/50">
              <div className={`p-2 rounded-lg ${section.bg} ${section.color}`}>
                <section.icon size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">{section.title}</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-4">
                {section.items.map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-sm">
                    <span className="font-medium text-slate-500">{item.label}</span>
                    <span className={`font-bold text-slate-900 ${item.highlight ? `px-2 py-0.5 rounded-md ${item.highlight}` : ''}`}>
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
