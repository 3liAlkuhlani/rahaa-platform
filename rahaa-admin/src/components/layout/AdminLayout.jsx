import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-rahaa-bg tech-mesh-bg flex flex-col font-tajawal" dir="rtl">
      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area (Offset by Sidebar width on Desktop in RTL mode) */}
      <div className="lg:mr-72 flex-1 flex flex-col transition-all duration-300">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        {/* Page Content Viewport */}
        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
