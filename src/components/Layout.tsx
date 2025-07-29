// src/components/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar'; // Import Sidebar
import TopBar from './TopBar'; // Import TopBar

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex w-full">
      {' '}
      {/* Parent flex container */}
      <Sidebar /> {/* Sidebar */}
      <div className="flex-1 flex flex-col">
        {' '}
        {/* Main content area, takes remaining space */}
        <TopBar />
        <main className="flex-1 p-6">
          <Outlet /> {/* Renders child routes */}
        </main>
      </div>
    </div>
  );
};
export default Layout;
