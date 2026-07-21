import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Shield, Calendar, Image, FileText, HardDrive, CreditCard, Activity, Settings, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/superadmin/families';

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
  const [family, setFamily] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFamilyDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/${id}`);
        if (res.data.success) {
          setFamily(res.data.data);
        }
      } catch (err) {
        toast.error('Failed to load family details');
      } finally {
        setLoading(false);
      }
    };
    fetchFamilyDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (!family) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>Family not found.</p>
        <Link to="/families" className="text-purple-600 hover:underline mt-4 inline-block">Back to Families</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link to="/families" className="p-2 text-gray-500 hover:text-gray-900 bg-white rounded-full shadow-sm hover:bg-gray-50 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">{family.name}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${family.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
              {family.status}
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Code: {family.code} &bull; Created on {new Date(family.createdAt).toLocaleDateString()}</p>
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
                  { label: "Total Members", value: family.totalMembers || 0 },
                  { label: "Total Admins", value: family.totalAdmins || 0 },
                  { label: "Storage Used", value: family.storageUsed || "0 GB" },
                  { label: "Subscription", value: family.plan || "Free Plan" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-sm text-gray-500 mb-1">{item.label}</p>
                    <p className="text-xl font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            )}
            
            {activeTab === 'members' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Members</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Joined</th></tr>
                    </thead>
                    <tbody>
                      {family.members?.filter(m => m.role !== 'ADMIN').map(m => (
                        <tr key={m.id} className="border-b">
                          <td className="px-4 py-3">{m.firstName} {m.lastName}</td><td className="px-4 py-3">{m.email || '-'}</td>
                          <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{m.status}</span></td><td className="px-4 py-3">{new Date(m.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                      {family.members?.filter(m => m.role !== 'ADMIN').length === 0 && (
                        <tr><td colSpan="4" className="px-4 py-4 text-center text-gray-500">No members found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'admins' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Admins</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-500 uppercase">
                      <tr><th className="px-4 py-3">Name</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Status</th></tr>
                    </thead>
                    <tbody>
                      {family.members?.filter(m => m.role === 'ADMIN').map(m => (
                        <tr key={m.id} className="border-b">
                          <td className="px-4 py-3">{m.firstName} {m.lastName}</td><td className="px-4 py-3">{m.email || '-'}</td><td className="px-4 py-3"><span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs">{m.status}</span></td>
                        </tr>
                      ))}
                      {family.members?.filter(m => m.role === 'ADMIN').length === 0 && (
                        <tr><td colSpan="3" className="px-4 py-4 text-center text-gray-500">No admins found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {activeTab === 'events' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Events</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {family.events?.map(e => (
                    <div key={e.id} className="p-4 border rounded-xl bg-white shadow-sm">
                      <h4 className="font-bold text-gray-900 truncate">{e.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{new Date(e.eventDate).toLocaleDateString()}</p>
                      <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full mt-3 inline-block">{e.status}</span>
                    </div>
                  ))}
                  {(!family.events || family.events.length === 0) && <p className="text-gray-500 col-span-full">No events found.</p>}
                </div>
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Documents</h3>
                <ul className="divide-y border rounded-xl bg-white">
                  {family.documents?.map(d => (
                    <li key={d.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                      <div><p className="font-medium text-gray-900">{d.name}</p><p className="text-xs text-gray-500">{d.type} &bull; {d.size}</p></div>
                      <span className="text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">{d.visibility}</span>
                    </li>
                  ))}
                  {(!family.documents || family.documents.length === 0) && <li className="p-4 text-gray-500 text-center">No documents found.</li>}
                </ul>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Gallery</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {family.documents?.filter(d => d.type.startsWith('image/')).map(d => (
                    <div key={d.id} className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                        <Image className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs truncate w-full">{d.name}</span>
                      </div>
                    </div>
                  ))}
                  {(!family.documents || family.documents.filter(d => d.type.startsWith('image/')).length === 0) && (
                    <p className="text-gray-500 col-span-full">No gallery images found.</p>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'storage' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Storage Usage</h3>
                <div className="bg-white p-6 rounded-xl border border-gray-200 w-full max-w-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Used Storage</span>
                    <span className="text-sm font-medium text-gray-900">{family.storageUsed || "0 GB / 100 GB"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-purple-600 h-2.5 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-4">Storage is shared across {family.totalMembers} members.</p>
                </div>
              </div>
            )}

            {activeTab === 'subscription' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Subscription Plan</h3>
                <div className="bg-purple-50 p-6 rounded-xl border border-purple-100 max-w-lg">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xl font-bold text-purple-900">{family.plan || "Free Plan"}</h4>
                    <span className="px-3 py-1 bg-purple-200 text-purple-800 text-xs font-semibold rounded-full">Active</span>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-2"></span> Up to 100 GB Storage</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-2"></span> Unlimited Members</li>
                    <li className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-purple-600 mr-2"></span> Priority Support</li>
                  </ul>
                  <button className="mt-6 w-full py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition">Manage Plan</button>
                </div>
              </div>
            )}
            
            {activeTab === 'logs' && (
              <div>
                <h3 className="text-lg font-bold mb-4">Activity Logs</h3>
                <div className="bg-white border text-sm rounded-xl divide-y max-w-3xl">
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div><p className="font-medium text-gray-900">Family Account Created</p><p className="text-xs text-gray-500">System Action</p></div>
                    <span className="text-xs text-gray-400">{new Date(family.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-gray-50">
                    <div><p className="font-medium text-gray-900">Plan Assigned: {family.plan || 'Free'}</p><p className="text-xs text-gray-500">System Action</p></div>
                    <span className="text-xs text-gray-400">{new Date(family.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
               <div>
                 <h3 className="text-lg font-bold mb-4">Family Settings</h3>
                 <div className="bg-white p-6 border rounded-xl max-w-2xl">
                   <div className="space-y-5">
                     <div>
                       <label className="block text-sm font-medium text-gray-700 mb-1">Family Status</label>
                       <select className="w-full border border-gray-200 rounded-lg p-2.5 bg-white focus:ring-purple-500 focus:border-purple-500" defaultValue={family.status}>
                         <option value="Active">Active</option>
                         <option value="Suspended">Suspended</option>
                         <option value="Trial">Trial</option>
                       </select>
                     </div>
                     <button className="px-4 py-2 bg-purple-600 text-sm font-medium text-white rounded-lg hover:bg-purple-700 transition-colors">Save Changes</button>
                   </div>
                 </div>
               </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
