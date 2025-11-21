// @ts-ignore
import React from 'react';
import { StudioGameSidebar } from './sidebar';
import { Outlet } from 'react-router-dom';

export default function StudioGameLayout() {
  return (
    <main className="flex w-full">
      {/* Fixed sidebar with its own scroll */}
      <div className="fixed h-full w-[220px] top-0 left-0" data-lenis-prevent>
        <StudioGameSidebar />
      </div>
      {/* Main content with offset and Lenis scroll */}
      <div className="ml-[220px] flex justify-center w-full">
        <Outlet />
      </div>
    </main>
  );
}
