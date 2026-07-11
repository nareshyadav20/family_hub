import React, { useState } from 'react';
import { CheckCircle, XCircle, Clock, MapPin, Phone, Mail, User } from 'lucide-react';

const mockRequests = [
  { id: 1, name: 'Priya Mehta', relation: 'Daughter-in-law', phone: '+91 98765 43210', email: 'priya.mehta@email.com', location: 'Mumbai, India', requestedAt: '2 hours ago', avatar: 'https://i.pravatar.cc/150?img=25', status: 'pending' },
  { id: 2, name: 'Kiran Sharma', relation: 'Nephew', phone: '+91 87654 32109', email: 'kiran.sharma@email.com', location: 'Delhi, India', requestedAt: '5 hours ago', avatar: 'https://i.pravatar.cc/150?img=33', status: 'pending' },
  { id: 3, name: 'Ananya Patel', relation: 'Cousin', phone: '+91 76543 21098', email: 'ananya.patel@email.com', location: 'Ahmedabad, India', requestedAt: '1 day ago', avatar: 'https://i.pravatar.cc/150?img=47', status: 'pending' },
  { id: 4, name: 'Rohan Verma', relation: 'Brother-in-law', phone: '+91 65432 10987', email: 'rohan.verma@email.com', location: 'Pune, India', requestedAt: '2 days ago', avatar: 'https://i.pravatar.cc/150?img=12', status: 'pending' },
  { id: 5, name: 'Sonal Kapoor', relation: 'Granddaughter', phone: '+91 54321 09876', email: 'sonal.kapoor@email.com', location: 'Bangalore, India', requestedAt: '3 days ago', avatar: 'https://i.pravatar.cc/150?img=56', status: 'pending' },
  { id: 6, name: 'Vikram Singh', relation: 'Son', phone: '+91 91234 56789', email: 'vikram.singh@email.com', location: 'Chennai, India', requestedAt: '4 days ago', avatar: 'https://i.pravatar.cc/150?img=68', status: 'approved' },
  { id: 7, name: 'Divya Nair', relation: 'Sister', phone: '+91 80123 45678', email: 'divya.nair@email.com', location: 'Kochi, India', requestedAt: '5 days ago', avatar: 'https://i.pravatar.cc/150?img=44', status: 'rejected' },
];

const STATUS_MAP = {
  pending: { label: 'Pending', class: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  approved: { label: 'Approved', class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  rejected: { label: 'Rejected', class: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
};

export default function JoinRequests() {
  const [requests, setRequests] = useState(mockRequests);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

  const handleAction = (id, status) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
  };

  const tabs = [
    { key: 'all', label: 'All Requests', count: requests.length },
    { key: 'pending', label: 'Pending', count: requests.filter(r => r.status === 'pending').length },
    { key: 'approved', label: 'Approved', count: requests.filter(r => r.status === 'approved').length },
    { key: 'rejected', label: 'Rejected', count: requests.filter(r => r.status === 'rejected').length },
  ];

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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(req => (
          <div key={req.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <img src={req.avatar} alt={req.name} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white text-[15px] truncate">{req.name}</h3>
                <p className="text-sm font-medium text-slate-500 mt-0.5">{req.relation}</p>
                <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold mt-1.5 ${STATUS_MAP[req.status].class}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                  {STATUS_MAP[req.status].label}
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400 shrink-0">
                <Clock size={12} />
                <span>{req.requestedAt}</span>
              </div>
            </div>

            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400 border-t border-slate-50 dark:border-slate-800 pt-4">
              <div className="flex items-center gap-2.5"><Mail size={14} className="text-slate-400 shrink-0" />{req.email}</div>
              <div className="flex items-center gap-2.5"><Phone size={14} className="text-slate-400 shrink-0" />{req.phone}</div>
              <div className="flex items-center gap-2.5"><MapPin size={14} className="text-slate-400 shrink-0" />{req.location}</div>
            </div>

            {req.status === 'pending' && (
              <div className="flex gap-3 pt-1">
                <button onClick={() => handleAction(req.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-emerald-500/30">
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => handleAction(req.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-sm font-bold rounded-xl transition-colors dark:bg-slate-800">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            )}
            {req.status !== 'pending' && (
              <button onClick={() => handleAction(req.id, 'pending')} className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors text-center">
                Undo action
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
    </div>
  );
}
