import { motion } from 'framer-motion';

export default function AuditLogs() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Audit Logs</h2>
        <p className="text-sm text-gray-500 mt-1">Track all system-level activities and security events.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 text-center text-gray-500">
        System monitoring is active.
      </motion.div>
    </div>
  );
}
