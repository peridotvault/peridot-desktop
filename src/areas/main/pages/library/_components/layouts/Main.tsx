// @ts-ignore
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { LibrarySidebar } from './Sidebar';

export default function LibraryLayout() {
  return (
    <main className="flex flex-1">
      {/* Fixed sidebar with its own scroll */}
      <div className="fixed top-12 left-16 bottom-0 overflow-hidden">
        <LibrarySidebar />
      </div>
      {/* Main content with offset and Lenis scroll */}
      <div className="ml-[250px] flex-1 w-full bg-card">
        <div className="min-h-screen bg-background overflow-hidden">
          <Outlet />
        </div>
      </div>
    </main>
  );
}
