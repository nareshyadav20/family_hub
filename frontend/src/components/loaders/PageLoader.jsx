import React from 'react';
import { Loader2 } from 'lucide-react';

export default function PageLoader() {
  return (
    <div className="w-full h-[calc(100vh-100px)] flex flex-col items-center justify-center">
      <div className="relative">
        <div className="absolute inset-0 rounded-full blur-xl bg-blue-500/20 animate-pulse"></div>
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin relative z-10" />
      </div>
      <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm mt-4">
        Loading...
      </p>
    </div>
  );
}
