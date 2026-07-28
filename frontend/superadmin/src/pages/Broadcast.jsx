import { motion } from 'framer-motion';

export default function Broadcast() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Broadcast Center</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Send platform-wide notifications via Email, SMS, or Push.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
        <div className="max-w-lg space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Target Audience</label>
            <select className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 bg-gray-50 dark:bg-slate-900/50">
              <option>All Families</option>
              <option>Family Admins Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-slate-200 mb-1">Message</label>
            <textarea className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-3 bg-gray-50 dark:bg-slate-900/50 h-32" placeholder="Type your broadcast message here..."></textarea>
          </div>
          <button className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium shadow-sm">Send Broadcast</button>
        </div>
      </motion.div>
    </div>
  );
}
