import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopNav from '../components/TopNav';

export default function MainLayout() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64 min-w-0 transition-all duration-300">
        <TopNav />
        <main className="flex-1 overflow-x-hidden px-4 sm:px-6 md:px-8 pb-6 md:pb-8 pt-24 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
