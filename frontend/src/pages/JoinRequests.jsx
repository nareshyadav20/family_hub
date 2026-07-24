import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, Phone, Mail, User, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const STATUS_MAP = {
  pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  approved: { label: 'Approved', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
};

const API_URL = import.meta.env.VITE_API_URL + '/api/v1/admin/dashboard/requests';

export default function JoinRequests() {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(API_URL, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // Map backend state to frontend status labels
        const mapped = res.data.data.map(req => ({
          ...req,
          name: `${req.firstName} ${req.lastName || ''}`.trim(),
          status: (!req.isActive) ? 'rejected' : (req.status === 'PENDING_INVITE' || req.status === 'INVITATION_SENT') ? 'pending' : 'approved'
        }));
        setRequests(mapped);
      }
    } catch (err) {
      toast.error('Failed to load join requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const handleAction = async (id, action) => {
    // Optimistic UI update
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: action === 'approve' ? 'approved' : 'rejected' } : r));
    
    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(`${API_URL}/${id}`, { action }, {
         headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(`Request ${action}d successfully`);
      } else {
        toast.error('Failed to process request');
        fetchRequests(); // revert
      }
    } catch (error) {
      toast.error('Failed to process request. Reverting.');
      fetchRequests(); // revert
    }
  };

  const tabs = [
    { key: 'all', label: 'All Requests', count: requests.length },
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
  ];

  const formatDistance = (isoDate) => {
     if (!isoDate) return 'Just now';
     const diff = new Date() - new Date(isoDate);
     const hours = Math.floor(diff / 3600000);
     if (hours < 24) return `${hours || 1} hours ago`;
     return `${Math.floor(hours / 24)} days ago`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Join Requests</h1>
        <p className="text-slate-500 text-sm mt-1">Review and manage people who want to join the family.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${filter === tab.key ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 hover:bg-slate-50'}`}
          >
            {tab.label}
            <span className={`ml-2 px-1.5 py-0.5 rounded-full text-xs font-bold ${filter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
           <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      ) : (
        <>
          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(req => (
              <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <img src={req.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(req.name)}&background=random`} alt={req.name} className="w-14 h-14 rounded-2xl object-cover shadow-md bg-slate-100" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 dark:text-white text-[15px] truncate">{req.name}</h3>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">{req.relationship || 'Member'}</p>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1.5 ${STATUS_MAP[req.status].class}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                      {STATUS_MAP[req.status].label}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                    <Clock size={12} />
                    <span>{formatDistance(req.createdAt)}</span>
                  </div>
                </div>

                <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800 pt-4">
                  <div className="flex items-center gap-2.5"><Mail size={14} className="text-slate-400 shrink-0" />{req.email || '-'}</div>
                  <div className="flex items-center gap-2.5"><Phone size={14} className="text-slate-400 shrink-0" />{req.phone || '-'}</div>
                  <div className="flex items-center gap-2.5"><MapPin size={14} className="text-slate-400 shrink-0" />{req.city || 'Unknown Location'}</div>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-3 pt-1">
                    <button onClick={() => handleAction(req.id, 'approve')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/30">
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button onClick={() => handleAction(req.id, 'reject')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-bold rounded-xl transition-colors dark:bg-slate-800">
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                )}
                {req.status !== 'pending' && (
                  <button onClick={() => toast.error('You cannot undo this action currently.')} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-center cursor-not-allowed">
                    Undo action (Disabled)
                  </button>
                )}
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-20 text-slate-400">
              <User className="mx-auto mb-3 opacity-30" size={40} />
              <p className="font-medium">No requests found</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
