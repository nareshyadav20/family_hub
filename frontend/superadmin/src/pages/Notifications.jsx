import { motion } from 'framer-motion';

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
        <p className="text-sm text-gray-500 mt-1">System alerts, updates, and platform messages.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 text-center text-gray-500">
        No new notifications.
      </motion.div>
    </div>
  );
}
