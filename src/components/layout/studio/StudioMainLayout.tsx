// @ts-ignore
import React from "react";
import { Outlet } from "react-router-dom";
import { StudioSidebar } from "./StudioSidebar";

export const StudioMainLayout = () => {
  return (
    <main className="pt-20 flex flex-1">
      {/* Fixed sidebar with its own scroll */}
      <div className="fixed w-[70px] top-20 left-0 bottom-0" data-lenis-prevent>
        <StudioSidebar />
      </div>
      {/* Main content with offset and Lenis scroll */}
      <div className="ml-[70px] flex-1 w-full">
        <Outlet />
      </div>
    </main>
  );
};
