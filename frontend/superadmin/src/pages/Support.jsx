import { motion } from 'framer-motion';

export default function Support() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Support</h2>
        <p className="text-sm text-gray-500 mt-1">Manage family support tickets and inquiries.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium overflow-hidden">
        <div className="p-6 text-center text-gray-500">No open tickets at the moment.</div>
      </motion.div>
    </div>
  );
}
