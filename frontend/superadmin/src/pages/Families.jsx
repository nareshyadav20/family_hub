import { useState, useEffect } from 'react';
import { Search, Eye, LogIn, Plus, X, Loader2, Mail, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/v1/superadmin/families';
const API_URL_RESEND = 'http://localhost:5000/api/v1/superadmin/families/resend-email';

export default function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    familyName: '',
    familyCode: '',
    familyHead: '',
    adminName: '',
    adminMobile: '',
    adminEmail: '',
    adminPassword: '',
    plan: 'Free',
    status: 'Active',
    address: '',
    city: '',
    state: '',
    country: ''
  });

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateFamily = async (e) => {
    e.preventDefault();
    if (!formData.familyName || !formData.familyHead || !formData.adminName || !formData.adminEmail || !formData.adminPassword) {
      toast.error('Please fill all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await axios.post(API_URL, formData);
      if (res.data.success) {
        if (res.data.emailSent === false) {
           toast.success('Family created, but welcome email could not be sent. You can resend it later.');
        } else {
           toast.success('Family and admin created successfully!');
        }
        setIsModalOpen(false);
        fetchFamilies();
        // Reset form
        setFormData({
          familyName: '', familyCode: '', familyHead: '',
          adminName: '', adminMobile: '', adminEmail: '', adminPassword: '',
          plan: 'Free', status: 'Active', address: '', city: '', state: '', country: ''
        });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating family.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <h2 className="text-2xl font-bold text-gray-900">Families</h2>
          <p className="text-sm text-gray-500 mt-1">Manage all registered families across the platform.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors shadow-sm shadow-purple-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Family
        </button>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-premium overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search families..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto min-h-[300px]">
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
            </div>
          ) : filteredFamilies.length === 0 ? (
            <div className="flex justify-center items-center h-48 flex-col text-gray-500">
              <p className="mb-4">No families found</p>
              <button onClick={() => setIsModalOpen(true)} className="flex items-center px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm font-medium rounded-xl transition-colors">
                <Plus className="w-4 h-4 mr-2" /> Create Family
              </button>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
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
                      <div className="font-medium text-gray-900">{family.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5 font-mono">{family.code}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900 border-b border-gray-100 pb-1 mb-1">H: {family.head}</div>
                      <div className="text-gray-600">A: {family.admin}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div className="mb-1">{family.email}</div>
                      <div className="text-xs">{family.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
                        {family.plan || 'Free'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-medium text-gray-700">{family.members || 1}</td>
                    <td className="px-6 py-4 text-gray-600">{family.storage || '0 GB'}</td>
                    <td className="px-6 py-4 text-gray-500">{family.date}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-emerald-500"></span>
                        {family.status || 'Active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/families/${family.id}`)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Login as Admin">
                          <LogIn className="w-4 h-4" />
                        </button>
                        <button onClick={() => resendWelcomeEmail(family.id)} className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors" title="Resend Credentials">
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
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
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

      {/* CREATE FAMILY MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => !isSubmitting && setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              <form onSubmit={handleCreateFamily} className="flex flex-col min-h-0 h-full max-h-[90vh]">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50 shrink-0">
                  <h3 className="text-lg font-bold text-gray-900">Create New Family</h3>
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isSubmitting} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wider">Family Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Family Name *</label>
                        <input required type="text" name="familyName" value={formData.familyName} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" placeholder="e.g. The Smith Family" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Family Code (Auto-generated)</label>
                        <input type="text" disabled value={formData.familyCode} className="w-full border border-gray-200 bg-gray-50 text-gray-500 rounded-lg p-2 outline-none" placeholder="Leave empty to auto-generate" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Family Head *</label>
                        <input required type="text" name="familyHead" value={formData.familyHead} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" placeholder="Head of Family" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wider">Primary Admin</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Name *</label>
                        <input required type="text" name="adminName" value={formData.adminName} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Mobile</label>
                        <input type="text" name="adminMobile" value={formData.adminMobile} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email *</label>
                        <input required type="email" name="adminEmail" value={formData.adminEmail} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Admin Password *</label>
                        <input required type="password" name="adminPassword" value={formData.adminPassword} onChange={handleChange} placeholder="Set admin password" className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-6">
                    <h4 className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wider">Subscription & Location</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                        <select name="plan" value={formData.plan} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                          <option>Free</option>
                          <option>Basic</option>
                          <option>Professional</option>
                          <option>Enterprise</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 bg-white outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500">
                          <option>Active</option>
                          <option>Trial</option>
                          <option>Suspended</option>
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                        <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none mb-3" placeholder="Street Address" />
                        <div className="grid grid-cols-3 gap-3">
                          <input type="text" name="city" value={formData.city} onChange={handleChange} className="border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" placeholder="City" />
                          <input type="text" name="state" value={formData.state} onChange={handleChange} className="border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" placeholder="State" />
                          <input type="text" name="country" value={formData.country} onChange={handleChange} className="border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" placeholder="Country" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 mt-auto shrink-0">
                  <button type="button" disabled={isSubmitting} onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={isSubmitting} className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 shadow-sm shadow-purple-200 flex items-center gap-2">
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {isSubmitting ? 'Creating...' : 'Create Family'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
