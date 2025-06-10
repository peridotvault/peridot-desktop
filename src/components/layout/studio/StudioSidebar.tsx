// @ts-ignore
import React, { useState } from "react";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link, useLocation, useNavigate } from "react-router-dom";

export const StudioSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [path] = useState([
    {
      title: "Assassin's Creed Mirage",
      path: "/studio/create",
      icon: faPlus,
    },
  ]);

  const handleGameClick = (path: string) => {
    navigate(path);
  };
  return (
    <div className="flex flex-col h-full shadow-flat-sm z-10 py-4">
      {/* List Path  */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-col">
          {path.map((item, i) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={i}
                to={item.path}
                onClick={() => handleGameClick(item.path)}
                className={`mx-4 my-2 flex aspect-square rounded-lg items-center justify-center duration-300 shadow-flat-sm
                   ${
                     isActive
                       ? "bg-gradient-to-tr from-accent_primary to-accent_secondary"
                       : "hover: "
                   }`}
              >
                <FontAwesomeIcon icon={item.icon} />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};
