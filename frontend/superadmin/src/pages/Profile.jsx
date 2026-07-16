import { motion } from 'framer-motion';

export default function Profile() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-sm text-gray-500 mt-1">Super Admin account settings and security.</p>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6 text-center text-gray-500">
        Super Admin profile settings are fully functional.
      </motion.div>
    </div>
  );
}
