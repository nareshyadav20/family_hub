import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      {/* Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-30 lg:hidden" 
          onClick={() => setMobileMenuOpen(false)} 
        />
      )}
      <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0 transition-all duration-300 w-full">
        <TopNav setMobileMenuOpen={setMobileMenuOpen} />
        <main className="flex-1 overflow-x-hidden px-4 sm:px-6 md:px-8 pb-6 md:pb-8 pt-24 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
