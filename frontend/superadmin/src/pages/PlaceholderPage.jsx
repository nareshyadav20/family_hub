import { motion } from 'framer-motion';

export default function PlaceholderPage({ title, description, moduleName }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mt-1">{description}</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="card-premium p-12 flex flex-col items-center justify-center text-center"
      >
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl font-bold text-purple-600">🚧</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title} Module</h3>
        <p className="text-gray-500 max-w-sm">
          The {moduleName} module is currently under development. Mock data and functional features will be rolled out in upcoming updates.
        </p>
      </motion.div>
    </div>
  );
}
