import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, Plus, Edit, Trash2, Eye, Loader2, X, AlertCircle } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_BASE_URL from '../config/api';

const API_URL = `${API_BASE_URL}/api/v1/superadmin/support`;

export default function ContactInquiries() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [activeModal, setActiveModal] = useState(null); // 'create' | 'view' | 'edit' | 'delete'
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  
  // Form state
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchInquiries = async () => {
    try {
      const res = await axios.get(API_URL);
      if (res.data.success) {
        const allTickets = res.data.data?.tickets || [];
        const contactTickets = allTickets.filter(ticket => 
          ticket.family.includes('(Phone:') && ticket.subject.includes('Email:')
        );
        setInquiries(contactTickets);
      }
    } catch (err) {
      toast.error('Failed to load contact inquiries');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const parseInquiry = (ticket) => {
    if (!ticket) return { name: '', phone: '', email: '', message: '' };
    const nameMatch = ticket.family.match(/^(.*?)\s*\(Phone:\s*(.*?)\)$/);
    const name = nameMatch ? nameMatch[1] : ticket.family;
    const phone = nameMatch ? nameMatch[2] : 'N/A';

    const emailMatch = ticket.subject.match(/^Email:\s*(.*?)\s*\|\s*Message:\s*(.*)$/);
    const email = emailMatch ? emailMatch[1] : '';
    const message = emailMatch ? emailMatch[2] : ticket.subject;

    return { name, phone, email, message };
  };

  const handleOpenCreate = () => {
    setForm({ name: '', email: '', phone: '', message: '' });
    setActiveModal('create');
  };

  const handleOpenView = (inquiry) => {
    setSelectedInquiry(inquiry);
    setActiveModal('view');
  };

  const handleOpenEdit = (inquiry) => {
    setSelectedInquiry(inquiry);
    const details = parseInquiry(inquiry);
    setForm(details);
    setActiveModal('edit');
  };

  const handleOpenDelete = (inquiry) => {
    setSelectedInquiry(inquiry);
    setActiveModal('delete');
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        family: `${form.name} (Phone: ${form.phone || 'N/A'})`,
        subject: `Email: ${form.email} | Message: ${form.message || 'Contact Inquiry'}`,
        priority: 'High',
        status: 'Open'
      };
      const res = await axios.post(API_URL, payload);
      if (res.data.success) {
        toast.success('Inquiry created successfully!');
        setActiveModal(null);
        fetchInquiries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create inquiry');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    try {
      const payload = {
        family: `${form.name} (Phone: ${form.phone || 'N/A'})`,
        subject: `Email: ${form.email} | Message: ${form.message || 'Contact Inquiry'}`,
        priority: selectedInquiry.priority,
        status: selectedInquiry.status
      };
      const res = await axios.put(`${API_URL}/${selectedInquiry.id}`, payload);
      if (res.data.success) {
        toast.success('Inquiry updated successfully!');
        setActiveModal(null);
        fetchInquiries();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update inquiry');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async () => {
    setSubmitLoading(true);
    try {
      const res = await axios.delete(`${API_URL}/${selectedInquiry.id}`);
      if (res.data.success) {
        toast.success('Inquiry deleted successfully!');
        setActiveModal(null);
        fetchInquiries();
      }
    } catch (err) {
      toast.error('Failed to delete inquiry');
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-left">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Inquiries</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Review messages and contact details submitted by visitors from the landing page.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 bg-[#7C5CFC] hover:bg-[#6B49F6] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-purple-500/20 transition-all hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
        >
          <Plus size={16} />
          Add Inquiry
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-48">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      ) : (
        /* Full-width Table View */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto min-h-[300px]">
            {inquiries.length === 0 ? (
              <div className="flex flex-col justify-center items-center h-64 text-slate-500 dark:text-slate-400">
                <CheckCircle className="w-12 h-12 text-emerald-400 mb-4 animate-bounce" />
                <p className="font-semibold text-slate-700 dark:text-slate-200">No Inquiries Found</p>
                <p className="text-sm">You haven't received or logged any contact inquiries yet.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-600 dark:text-slate-300">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-6">Email</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inquiries.map((inquiry) => {
                    const details = parseInquiry(inquiry);
                    return (
                      <tr key={inquiry.id} className="hover:bg-slate-50 dark:bg-slate-900/50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white text-sm">{details.name}</td>
                        <td className="py-4 px-6 font-medium text-slate-700 dark:text-slate-200">{details.email}</td>
                        <td className="py-4 px-6 text-slate-600 dark:text-slate-300 font-medium">{details.phone}</td>
                        <td className="py-4 px-6 text-xs text-gray-400 font-semibold">
                          {new Date(inquiry.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenView(inquiry)}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                              title="View message details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenEdit(inquiry)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                              title="Edit inquiry"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleOpenDelete(inquiry)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                              title="Delete inquiry"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ─── MODALS LAYER ─── */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/55 backdrop-blur-sm">
            
            {/* Modal Body */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[24px] border border-slate-100 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden text-left"
            >
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white capitalize">
                  {activeModal === 'create' && 'Add Contact Inquiry'}
                  {activeModal === 'view' && 'Inquiry Details'}
                  {activeModal === 'edit' && 'Edit Contact Inquiry'}
                  {activeModal === 'delete' && 'Delete Contact Inquiry'}
                </h3>
                <button
                  onClick={() => setActiveModal(null)}
                  className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-lg p-1 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              {/* View Modal */}
              {activeModal === 'view' && selectedInquiry && (
                <div className="p-6 space-y-4">
                  {(() => {
                    const details = parseInquiry(selectedInquiry);
                    return (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Submitted By</span>
                            <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{details.name}</p>
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Date Submitted</span>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                              {new Date(selectedInquiry.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Email Address</span>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{details.email}</p>
                          </div>
                          <div>
                            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Phone Number</span>
                            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-0.5">{details.phone}</p>
                          </div>
                        </div>
                        <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Message Details</span>
                          <div className="mt-2 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-medium">
                              {details.message}
                            </p>
                          </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                          <button
                            onClick={() => setActiveModal(null)}
                            className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition cursor-pointer"
                          >
                            Close
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}

              {/* Create or Edit Form Modal */}
              {(activeModal === 'create' || activeModal === 'edit') && (
                <form onSubmit={activeModal === 'create' ? handleCreate : handleUpdate} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1F2430] dark:text-slate-300 ml-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter Name"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-sm text-[#1F2430] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1F2430] dark:text-slate-300 ml-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-sm text-[#1F2430] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1F2430] dark:text-slate-300 ml-1">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={e => setForm({ ...form, phone: e.target.value })}
                      placeholder="Phone details"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-sm text-[#1F2430] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#1F2430] dark:text-slate-300 ml-1">Message Details</label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      placeholder="Inquiry message"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 text-sm text-[#1F2430] dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-semibold resize-none"
                    />
                  </div>
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-5 py-2 bg-[#7C5CFC] hover:bg-[#6B49F6] text-white rounded-xl font-bold text-sm shadow-md shadow-purple-500/10 transition cursor-pointer disabled:opacity-75"
                    >
                      {submitLoading ? 'Saving...' : activeModal === 'create' ? 'Create' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              )}

              {/* Delete Confirmation Modal */}
              {activeModal === 'delete' && selectedInquiry && (
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-4 rounded-xl">
                    <AlertCircle size={24} className="shrink-0" />
                    <div>
                      <p className="text-sm font-bold">This action cannot be undone.</p>
                      <p className="text-xs text-rose-500 font-semibold mt-0.5">Are you sure you want to delete this contact inquiry?</p>
                    </div>
                  </div>
                  {(() => {
                    const details = parseInquiry(selectedInquiry);
                    return (
                      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{details.name}</p>
                        <p className="text-xs text-gray-500 font-semibold">{details.email}</p>
                      </div>
                    );
                  })()}
                  <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => setActiveModal(null)}
                      className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={submitLoading}
                      className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold text-sm shadow-md transition cursor-pointer disabled:opacity-75"
                    >
                      {submitLoading ? 'Deleting...' : 'Delete Inquiry'}
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
