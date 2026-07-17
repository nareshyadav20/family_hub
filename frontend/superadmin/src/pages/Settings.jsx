import React from 'react';
import { motion } from 'framer-motion';
import { Settings2, Mail, Database, Globe, ShieldAlert, Activity } from 'lucide-react';

export default function Settings() {
  const sections = [
    {
      title: 'General',
      icon: Settings2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      items: [
        { label: 'Platform Name', value: 'FamilyHub OS' },
        { label: 'Platform Version', value: 'v1.0.0' },
        { label: 'Timezone', value: 'Asia/Kolkata' },
        { label: 'Language', value: 'English' },
        { label: 'Maintenance Mode', value: 'OFF', highlight: 'text-slate-500 bg-slate-100' },
      ]
    },
    {
      title: 'Email Configuration',
      icon: Mail,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      items: [
        { label: 'Provider', value: 'Brevo' },
        { label: 'Sender Name', value: 'FamilyHub' },
        { label: 'Sender Email', value: 'support@familyhub.com' },
        { label: 'SMTP Status', value: 'Connected', highlight: 'text-emerald-600 bg-emerald-50' },
      ]
    },
    {
      title: 'Storage',
      icon: Database,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      items: [
        { label: 'Provider', value: 'Cloudinary' },
        { label: 'Usage', value: '42 GB / 200 GB' },
        { label: 'Status', value: 'Connected', highlight: 'text-emerald-600 bg-emerald-50' },
      ]
    },
    {
      title: 'Google Services',
      icon: Globe,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      items: [
        { label: 'Google Calendar', value: 'Connected', highlight: 'text-emerald-600 bg-emerald-50' },
        { label: 'Google OAuth', value: 'Enabled', highlight: 'text-emerald-600 bg-emerald-50' },
        { label: 'Client ID', value: '*************' },
        { label: 'Redirect URI', value: 'Configured' },
      ]
    },
    {
      title: 'Security',
      icon: ShieldAlert,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      items: [
        { label: 'JWT Expiry', value: '7 Days' },
        { label: 'Password Policy', value: 'Strong' },
        { label: '2FA', value: 'Disabled', highlight: 'text-slate-500 bg-slate-100' },
        { label: 'Session Timeout', value: '30 Minutes' },
      ]
    },
    {
      title: 'Platform Statistics',
      icon: Activity,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      items: [
        { label: 'Total Families', value: '40' },
        { label: 'Total Admins', value: '52' },
        { label: 'Total Members', value: '1,280' },
        { label: 'Storage Used', value: '42 GB' },
        { label: 'Active Users', value: '864' },
        { label: 'Total Events', value: '327' },
        { label: 'Gallery Photos', value: '5,420' },
        { label: 'Documents', value: '1,150' },
      ]
    }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Platform Settings</h2>
        <p className="text-sm text-gray-500 mt-1">Global configurations including APIs, Email, Storage and Security.</p>
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
