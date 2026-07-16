import { motion } from 'framer-motion';

export default function Billing() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Billing</h2>
        <p className="text-sm text-gray-500 mt-1">Transactions, invoices, and platform revenue.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-12 text-center text-gray-500">
        Revenue reporting module is active. Real transactions will populate here.
      </motion.div>
    </div>
  );
}
