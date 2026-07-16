import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Shield, Calendar, Image, FileText, HardDrive, CreditCard, Activity, Settings } from 'lucide-react';

const tabs = [
  { id: 'overview', name: 'Overview', icon: Activity },
  { id: 'members', name: 'Members', icon: Users },
  { id: 'admins', name: 'Admins', icon: Shield },
  { id: 'events', name: 'Events', icon: Calendar },
  { id: 'gallery', name: 'Gallery', icon: Image },
  { id: 'documents', name: 'Documents', icon: FileText },
  { id: 'storage', name: 'Storage Usage', icon: HardDrive },
  { id: 'subscription', name: 'Subscription', icon: CreditCard },
  { id: 'logs', name: 'Activity Logs', icon: Activity },
  { id: 'settings', name: 'Settings', icon: Settings },
];

export default function FamilyDetails() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/families" className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">The Smith Family</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">Active</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Code: SMTH123 &bull; Created on Jan 12, 2024</p>
        </div>
      </div>

      <div className="card-premium">
        <div className="border-b border-gray-200">
          <nav className="flex overflow-x-auto hide-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center whitespace-nowrap px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    isActive ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
        
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Total Members", value: "12" },
                  { label: "Total Admins", value: "2" },
                  { label: "Storage Used", value: "45 GB / 100 GB" },
                  { label: "Subscription", value: "Premium Plan" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab !== 'overview' && (
              <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-gray-400">🚧</span>
                </div>
                <p>The {tabs.find(t => t.id === activeTab)?.name} panel is currently under development.</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
