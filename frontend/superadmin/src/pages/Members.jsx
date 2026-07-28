import { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Mail, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

const defaultMembers = [
  { id: 'MEM-001', name: 'Alice Smith', email: 'alice@example.com', family: 'The Smith Family', branch: 'Main', role: 'MEMBER', profileScore: 90, status: 'Active', lastActive: '2 hours ago' },
  { id: 'MEM-002', name: 'Bob Johnson', email: 'bob@example.com', family: 'Johnson Legacy', branch: 'Texas', role: 'FAMILY_ADMIN', profileScore: 100, status: 'Active', lastActive: '10 mins ago' },
  { id: 'MEM-003', name: 'Charlie Williams', email: 'charlie@example.com', family: 'Williams Tribe', branch: 'Main', role: 'MEMBER', profileScore: 40, status: 'Inactive', lastActive: '3 days ago' },
  { id: 'MEM-004', name: 'Diana Brown', email: 'diana@example.com', family: 'Brown Dynasty', branch: 'London', role: 'MEMBER', profileScore: 85, status: 'Active', lastActive: '1 hour ago' },
  { id: 'MEM-005', name: 'Eve Davis', email: 'eve@example.com', family: 'Davis Household', branch: 'Main', role: 'FAMILY_ADMIN', profileScore: 95, status: 'Active', lastActive: 'Just now' },
];

export default function Members() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Members</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Directory of all users across all families.</p>
        </div>
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
              placeholder="Search members by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500"
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:bg-slate-900/50 text-sm font-medium rounded-xl transition-colors w-full sm:w-auto justify-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-900/50/50">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Family / Branch</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold text-center">Profile %</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Active</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {defaultMembers.map((member, idx) => (
                <tr key={member.id} className="border-b border-gray-50 hover:bg-purple-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-purple-100 to-blue-100 text-purple-700 font-bold flex items-center justify-center mr-3">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{member.name}</div>
                        <div className="text-xs text-gray-500 dark:text-slate-400">{member.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-white">{member.family}</div>
                    <div className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Branch: {member.branch}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      member.role === 'FAMILY_ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-50 text-blue-700'
                    }`}>
                      {member.role === 'FAMILY_ADMIN' && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {member.role === 'FAMILY_ADMIN' ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 min-w-[64px]">
                        <div 
                          className={`h-2 rounded-full ${member.profileScore >= 80 ? 'bg-emerald-500' : member.profileScore >= 50 ? 'bg-amber-400' : 'bg-rose-500'}`} 
                          style={{ width: `${member.profileScore}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-xs font-medium text-gray-600 dark:text-slate-300">{member.profileScore}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      member.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 border-gray-200 dark:border-slate-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400 text-xs">
                    {member.lastActive}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="View Profile">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors" title="Send Email">
                        <Mail className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-gray-900 dark:text-white hover:bg-gray-100 dark:bg-slate-800 rounded-lg transition-colors" title="More Options">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-sm text-gray-500 dark:text-slate-400">
          <div>Showing <span className="font-medium text-gray-900 dark:text-white">1</span> to <span className="font-medium text-gray-900 dark:text-white">5</span> of <span className="font-medium text-gray-900 dark:text-white">8,439</span> results</div>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-lg disabled:opacity-50">Previous</button>
            <button className="px-3 py-1 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-900/50 font-medium text-gray-900 dark:text-white">Next</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
