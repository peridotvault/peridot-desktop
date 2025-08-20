// @ts-ignore
import React, { useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface StudioSidebarProps {
  setIsCreateAppModal: () => void;
}

export const StudioSidebar: React.FC<StudioSidebarProps> = ({
  setIsCreateAppModal,
}) => {
  return (
    <div className="flex flex-col h-full shadow-flat-sm z-10 py-4">
      {/* List Path  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col">
          <button
            onClick={setIsCreateAppModal}
            className={
              "mx-4 my-2 flex aspect-square rounded-lg items-center justify-center duration-300 shadow-flat-sm hover:shadow-arise-sm"
            }
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
      </div>
    </div>
  );
};
