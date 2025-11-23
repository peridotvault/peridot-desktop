// @ts-ignore
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { StudioSidebar } from './Sidebar';
import { Toaster } from 'react-hot-toast';

export default function StudioMainLayout() {
  return (
    <main className="flex">
      {/* Fixed sidebar with its own scroll */}
      <div className="fixed h-full mt-12 w-[70px] top-0 left-0 z-10" data-lenis-prevent>
        <StudioSidebar />
      </div>
      {/* Main content with offset and Lenis scroll */}
      <div className="ml-16 flex justify-center w-full ">
        <Outlet />
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
