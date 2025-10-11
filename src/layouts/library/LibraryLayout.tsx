// @ts-ignore
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './LibrarySidebar';

export default function LibraryLayout() {
  return (
    <main className="flex flex-1">
      {/* Fixed sidebar with its own scroll */}
      <div className="fixed top-20 left-20 bottom-0">
        <Sidebar />
      </div>
      {/* Main content with offset and Lenis scroll */}
      <div className="ml-[230px] flex-1 w-full">
        <Outlet />
      </div>
    </main>
  );
}
