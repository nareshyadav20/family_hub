import { motion } from 'framer-motion';

const plans = [
  { id: 1, name: 'Basic', families: 450, price: 'Free', status: 'Active' },
  { id: 2, name: 'Premium', families: 680, price: '$49/mo', status: 'Active' },
  { id: 3, name: 'Enterprise', families: 118, price: '$199/mo', status: 'Active' },
];

export default function Subscriptions() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Subscriptions</h2>
        <p className="text-sm text-gray-500 mt-1">Manage platform pricing plans and active family subscriptions.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <motion.div key={plan.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-premium p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{plan.name} Plan</h3>
            <div className="text-3xl font-extrabold text-purple-600 mb-4">{plan.price}</div>
            <div className="text-sm text-gray-500 mb-6">{plan.families} active families</div>
            <button className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-900 font-medium rounded-xl border border-gray-200 transition-colors">Edit Plan</button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
