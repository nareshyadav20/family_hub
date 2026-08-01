import { useState, useEffect } from 'react';
import { Search, Eye, Plus, X, Loader2, Mail, Trash2, Globe, Server } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/v1/superadmin/families`;
const API_URL_RESEND = `${API_BASE_URL}/api/v1/superadmin/families/resend-email`;

export default function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const navigate = useNavigate();

  const fetchFamilies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL);
      if (res.data.success) {
        setFamilies(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load families.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  const resendWelcomeEmail = async (familyId) => {
    const loadingToast = toast.loading('Resending credentials...');
    try {
      const res = await axios.post(API_URL_RESEND, { familyId });
      if (res.data.success) {
        toast.success('Credentials sent successfully!', { id: loadingToast });
      } else {
        toast.error('Failed to send credentials.', { id: loadingToast });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error resending email.', { id: loadingToast });
    }
  };

  const filteredFamilies = families.filter(f => 
    f.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    f.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Families</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage all registered families across the platform.</p>
        </div>
        <button 
          onClick={() => setIsOptionModalOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-md shadow-purple-600/20 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Family</span>
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-premium overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-slate-500" />
            <input 
              type="text" 
              placeholder="Search families..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredFamilies.length === 0 ? (
            <div className="flex justify-center items-center h-48 flex-col text-gray-500 dark:text-slate-400">
              <p className="mb-4">No families found</p>
              <button onClick={() => setIsOptionModalOpen(true)} className="flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-xl transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Add Family
              </button>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-900/50/50">
                <tr>
                  <th className="px-6 py-4 font-semibold">Family Name & Code</th>
                  <th className="px-6 py-4 font-semibold">Head & Admin</th>
                  <th className="px-6 py-4 font-semibold">Contact Info</th>
                  <th className="px-6 py-4 font-semibold">Plan</th>
                  <th className="px-6 py-4 font-semibold text-center">Members</th>
                  <th className="px-6 py-4 font-semibold">Storage</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFamilies.map((family) => (
                  <tr key={family.id} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{family.name}</div>
                      <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 font-mono">{family.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-1 mb-1">H: {family.head}</div>
                      <div className="text-gray-600 dark:text-slate-300">A: {family.admin}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">
                      <div className="mb-1">{family.email}</div>
                      <div className="text-xs">{family.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
                        {family.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700 dark:text-slate-200">{family.members || 1}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{family.storage || '0 GB'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{family.date}</td>
                    <td className="px-6 py-4">
                      {family.status === 'Pending' || family.status === 'PENDING_SETUP' || family.status === 'Pending Setup' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-amber-50 text-amber-800 border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-amber-500 animate-pulse"></span>
                          Pending
                        </span>
                      ) : family.status === 'Suspended' || family.status === 'Inactive' || family.status === 'FAILED' ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-red-50 text-red-800 border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-red-500"></span>
                          {family.status}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-800 border-emerald-200">
                          <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></span>
                          {family.status || 'Active'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/families/${family.id}`)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => resendWelcomeEmail(family.id)} className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Resend Credentials">
                          <Mail className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={async () => {
                            if (window.confirm("Are you SURE you want to delete this family? This will permanently wipe all members, events, photos, and messages associated with them. This action cannot be undone.")) {
                               const loadingToast = toast.loading('Deleting family...');
                               try {
                                 const res = await axios.delete(`${API_URL}/${family.id}`);
                                 if (res.data.success) {
                                   toast.success('Family deleted successfully', { id: loadingToast });
                                   fetchFamilies();
                                 }
                               } catch (err) {
                                 toast.error(err.response?.data?.message || 'Failed to delete family', { id: loadingToast });
                               }
                            }
                          }} 
                          className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                          title="Delete Family"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Domain Option Selection Modal */}
      <AnimatePresence>
        {isOptionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsOptionModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-3xl z-10 overflow-hidden flex flex-col relative"
            >
              <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 text-center relative bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-900/20 dark:to-indigo-900/20">
                <button 
                  onClick={() => setIsOptionModalOpen(false)}
                  className="absolute right-6 top-6 p-2 hover:bg-white/50 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Family</h3>
                <p className="text-gray-500 dark:text-slate-400 mt-2">How will this family's domain be managed?</p>
              </div>

              <div className="p-8 bg-gray-50/50 dark:bg-slate-900 flex flex-col sm:flex-row gap-6">
                
                {/* Option 1 */}
                <button 
                  onClick={() => {
                    setIsOptionModalOpen(false);
                    navigate('/families/create?domainOption=OPTION_1');
                  }}
                  className="flex-1 text-left bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-transparent hover:border-purple-500 hover:shadow-lg transition-all group relative overflow-hidden animate-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Globe className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Family already owns a domain</h4>
                  <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                    The family already owns their domain. Our technical team will provide DNS instructions to connect it to FamilyHub.
                  </p>
                </button>

                {/* Option 2 */}
                <button 
                  onClick={() => {
                    setIsOptionModalOpen(false);
                    navigate('/families/create?domainOption=OPTION_2');
                  }}
                  className="flex-1 text-left bg-white dark:bg-slate-800 p-8 rounded-2xl border-2 border-transparent hover:border-purple-500 hover:shadow-lg transition-all group relative overflow-hidden animate-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 dark:bg-purple-900/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                  <div className="w-14 h-14 bg-purple-100 dark:bg-purple-900/50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <Server className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">FamilyHub purchases domain</h4>
                  <p className="text-gray-500 dark:text-slate-400 text-sm leading-relaxed">
                    Our technical team will purchase and configure the domain on behalf of the family.
                  </p>
                </button>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
