// Layout.tsx
import React, { useState } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const handleToggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleCloseSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Sidebar: tampil di mobile jika isSidebarOpen true */}
      <Sidebar isOpen={isSidebarOpen} onClose={handleCloseSidebar} />

      {/* Optional: Overlay di mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-25 md:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Main content */}
      <div className="flex flex-col flex-1 z-10 relative">
        <TopBar onMenuClick={handleToggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
