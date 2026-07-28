import { motion } from 'framer-motion';

const defaultAdmins = [
  { id: 'ADM-1', name: 'Sarah Smith', email: 'sarah@example.com', phone: '+1 234 567 8900', family: 'The Smith Family', status: 'Active', lastLogin: '2 hours ago' },
  { id: 'ADM-2', name: 'Robert Johnson', email: 'robert@example.com', phone: '+1 987 654 3210', family: 'Johnson Legacy', status: 'Active', lastLogin: '1 day ago' },
];

export default function FamilyAdmins() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Family Admins</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Manage all administrative accounts across families.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-slate-400 uppercase bg-gray-50 dark:bg-slate-900/50/50 border-b border-gray-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-4 font-semibold">Admin Name</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Family</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {defaultAdmins.map(admin => (
                <tr key={admin.id} className="border-b border-gray-50 hover:bg-purple-50/30">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{admin.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{admin.email}<br/><span className="text-xs">{admin.phone}</span></td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">{admin.family}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">{admin.status}</span></td>
                  <td className="px-6 py-4 text-gray-500 dark:text-slate-400">{admin.lastLogin}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
