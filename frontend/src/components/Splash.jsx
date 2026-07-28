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
    <div className="fixed inset-0 z-[10000] bg-gradient-to-br from-[#faf9fc] to-[#e6e0f5] flex flex-col items-center justify-center overflow-hidden">
      
      {/* Decorative background elements */}
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[radial-gradient(circle,rgba(124,92,252,0.08)_0%,rgba(255,255,255,0)_70%)] pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[radial-gradient(circle,rgba(124,92,252,0.05)_0%,rgba(255,255,255,0)_70%)] pointer-events-none"></div>

      {/* Watermark Family Background */}
      <img src="/hero-family.png" className="absolute bottom-0 left-0 w-full max-h-[50vh] object-cover object-bottom opacity-[0.15] pointer-events-none z-[1]" alt="" />

      <div className="flex flex-col items-center animate-in fade-in zoom-in duration-700 w-full px-6 z-10">
        {/* Logo Circle (Middle round tree) */}
        <div className="w-[120px] h-[120px] sm:w-[130px] sm:h-[130px] bg-white rounded-full flex items-center justify-center mb-6 sm:mb-8 shadow-[0_20px_40px_-10px_rgba(124,92,252,0.2),0_0_0_8px_rgba(255,255,255,0.5)] overflow-hidden animate-pulse duration-2000">
          <img src="/hero-tree.jpg" className="w-full h-full object-cover" alt="Family Tree Logo" />
        </div>
        
        <h1 className="text-[32px] sm:text-[42px] font-black mb-2 tracking-tight text-gray-900">
          Family<span className="text-[#7C5CFC]">Hub</span>
        </h1>
        <p className="text-gray-500 text-sm sm:text-[15px] font-medium mb-12 sm:mb-[60px] text-center">Your Digital Family Operating System</p>
        
        <div className="w-full max-w-[240px] sm:max-w-[280px]">
          <div className="h-[6px] w-full bg-[#ede9f7] rounded-full overflow-hidden mb-3 shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-[#9f84fa] to-[#7C5CFC] rounded-full transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-center text-[#7C5CFC] text-xs sm:text-[14px] font-bold tracking-wide">
            {Math.round(progress)}%
          </p>
        </div>
      </div>
    </div>
  );
}
