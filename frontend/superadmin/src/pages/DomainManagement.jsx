import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Globe, CheckCircle, Clock, AlertCircle, RefreshCw, XCircle } from 'lucide-react';

const DomainManagement = ({ familyId }) => {
  const [domains, setDomains] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);

  const fetchDomains = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/v1/superadmin/domain/history/${familyId}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('superadmin_token')}` }
      });
      if (res.data.success) {
        setDomains(res.data.data);
      }
    } catch (err) {
      toast.error('Failed to load domain status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (familyId) fetchDomains();
  }, [familyId]);

  const updateDomainStatus = async (domainId, newStatus) => {
    try {
      setVerifying(true);
      const res = await axios.put('http://localhost:5000/api/v1/superadmin/domain/update-status', { domainId, status: newStatus }, {
         headers: { Authorization: `Bearer ${localStorage.getItem('superadmin_token')}` }
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Status updated successfully!');
        fetchDomains();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setVerifying(false);
    }
  };

  const deleteDomain = async (domainId) => {
    if (!window.confirm("Are you sure you want to delete this domain record permanently?")) return;
    try {
      const res = await axios.delete(`http://localhost:5000/api/v1/superadmin/domain/delete/${domainId}`, {
         headers: { Authorization: `Bearer ${localStorage.getItem('superadmin_token')}` }
      });
      if (res.data.success) {
        toast.success('Domain deleted.');
        fetchDomains();
      }
    } catch (err) {
      toast.error('Failed to delete domain.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <RefreshCw className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (domains.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-8 text-center">
        <Globe className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Custom Domain</h3>
        <p className="text-gray-500 dark:text-slate-400 mb-6">This family does not have a custom domain configured yet.</p>
        <p className="text-sm text-gray-400">You can add one by editing the family details or creating a new family.</p>
      </div>
    );
  }

  const activeDomain = domains[0]; // For simplicity, we just use the first/most recent

  const StatusBadge = ({ status }) => {
    switch(status) {
      case 'LIVE':
      case 'ACTIVE':
      case 'DNS_VERIFIED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> {status}</span>;
      case 'PENDING':
      case 'DNS_PENDING':
      case 'SSL_PENDING':
      case 'PENDING_SETUP':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200"><Clock className="w-3.5 h-3.5" /> {status}</span>;
      case 'FAILED':
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200"><AlertCircle className="w-3.5 h-3.5" /> {status}</span>;
    }
  };

  const statusOrder = ['PENDING_SETUP', 'PURCHASED', 'DNS_CONFIGURED', 'DNS_VERIFIED', 'SSL_ENABLED', 'LIVE'];
  
  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/50 flex flex-wrap justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                {activeDomain.domainName}
              </h3>
              <p className="text-sm text-gray-500 flex gap-4 mt-1">
                <span>Ownership: <strong className="text-gray-700 dark:text-gray-300">{activeDomain.ownership === 'FAMILY_OWNED' ? 'Family Owned' : 'Managed by FamilyHub'}</strong></span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
             <div className="flex items-center gap-2">
               <span className="text-sm text-gray-500 font-medium">Update Status:</span>
               <select 
                 value={activeDomain.domainStatus}
                 onChange={(e) => updateDomainStatus(activeDomain.id, e.target.value)}
                 disabled={verifying}
                 className="px-3 py-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none disabled:opacity-50"
               >
                 <option value="PENDING_SETUP">Pending Setup</option>
                 <option value="PURCHASED">Purchased</option>
                 <option value="DNS_CONFIGURED">DNS Configured</option>
                 <option value="DNS_VERIFIED">DNS Verified</option>
                 <option value="SSL_ENABLED">SSL Enabled</option>
                 <option value="LIVE">Live</option>
                 <option value="FAILED">Failed</option>
               </select>
             </div>
             <button onClick={() => fetchDomains()} className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-gray-50 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors">
               <RefreshCw className="w-4 h-4" />
               Refresh
             </button>
          </div>
        </div>
        
        <div className="p-6">
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-6">Workflow Timeline</h4>
          
          <div className="relative pl-6 border-l-2 border-gray-200 dark:border-slate-700 space-y-8 mb-8">
             {statusOrder.map((status, index) => {
               const historyRecord = activeDomain.histories?.find(h => h.status === status);
               const isCurrent = activeDomain.domainStatus === status;
               const isCompleted = statusOrder.indexOf(activeDomain.domainStatus) >= index || historyRecord;
               
               return (
                 <div key={status} className="relative">
                   <div className={`absolute -left-[33px] w-4 h-4 rounded-full border-2 bg-white dark:bg-slate-900 ${isCompleted ? 'border-purple-600 bg-purple-600' : 'border-gray-300 dark:border-slate-600'}`}></div>
                   <div className="flex justify-between items-start">
                     <div>
                       <h5 className={`font-semibold ${isCompleted ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-slate-500'}`}>
                         {status.replace('_', ' ')}
                       </h5>
                       {historyRecord && (
                         <div className="mt-1 text-sm text-gray-500">
                           <p className="font-medium">By: {historyRecord.updatedBy}</p>
                           <p>{historyRecord.notes}</p>
                         </div>
                       )}
                     </div>
                     {historyRecord && (
                       <div className="text-xs text-gray-400 font-mono">
                         {new Date(historyRecord.createdAt).toLocaleString()}
                       </div>
                     )}
                   </div>
                 </div>
               )
             })}
          </div>

          {activeDomain.domainStatus !== 'LIVE' && activeDomain.dnsInstructions && (
            <div className="border border-blue-200 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-900 rounded-xl p-6 mb-6">
              <h4 className="text-base font-bold text-blue-900 dark:text-blue-100 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600" /> Setup Instructions
              </h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 whitespace-pre-wrap">
                {activeDomain.dnsInstructions}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-6 border-t border-gray-100 dark:border-slate-800">
            <button onClick={() => deleteDomain(activeDomain.id)} className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-100 text-sm font-medium rounded-lg transition-colors">
              Delete Domain Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DomainManagement;
