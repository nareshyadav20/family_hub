import { motion } from 'framer-motion';

export default function Roles() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h2>
        <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">Configure access control across the Super Admin portal.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 text-center text-gray-500 dark:text-slate-400">
        SUPER_ADMIN, FAMILY_ADMIN, and MEMBER roles configured.
      </motion.div>
    </div>
  );
}
