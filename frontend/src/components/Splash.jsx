import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function Splash({ onFinish }) {
  const [progress, setProgress] = useState(() => {
    return window.__splashProgress || 0;
  });

  useEffect(() => {
    // Clear the static HTML interval if it exists
    if (window.__splashInterval) {
      clearInterval(window.__splashInterval);
      window.__splashInterval = null;
    }
    // Simulate loading progress over ~2 seconds
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          setTimeout(() => {
            onFinish();
          }, 300); // Small delay at 100% before closing
          return 100;
        }
        const diff = Math.random() * 10 + 5;
        return Math.min(oldProgress + diff, 100);
      });
    }, 150);

    return () => clearInterval(timer);
  }, [onFinish]);

  return (
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-[#2f6ce6] to-[#16417C] flex flex-col items-center justify-center text-white">
      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full px-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-white/10 backdrop-blur-md rounded-[28px] flex items-center justify-center mb-6 sm:mb-8 shadow-2xl border border-white/20">
          <Sparkles className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
        </div>
        
        <h1 className="text-[32px] sm:text-[40px] font-black mb-2 tracking-tight">FamilyHub</h1>
        <p className="text-white/80 text-sm sm:text-[15px] font-medium mb-12 sm:mb-16 text-center">Your Digital Family Operating System</p>
        
        <div className="w-full max-w-[240px] sm:max-w-[280px]">
          <div className="h-[4px] w-full bg-white/20 rounded-full overflow-hidden mb-3">
            <div 
              className="h-full bg-white rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-white/60 text-xs sm:text-[13px] font-semibold tracking-wider">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
