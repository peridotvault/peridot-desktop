// @ts-ignore
import React from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktop,
  faDownload,
  faUpLong,
  faUser,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";

interface SlideProps {
  onClose: () => void;
}

export const Slide: React.FC<SlideProps> = ({ onClose }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const linkClass = (path: string) =>
    `flex gap-4 py-2 px-4 items-center rounded-xl duration-300 transition-all hover:scale-105 ${
      isActive(path)
        ? "bg-gradient-to-r from-accent_primary to-accent_secondary text-black scale-105"
        : ""
    }`;

  const allLink = [
    {
      title: "Page",
      children: [
        {
          label: "My Profile",
          url: "/profile_user",
          icon: faUser,
        },
        {
          label: "Account Setting",
          url: "/update_profile",
          icon: faUserGear,
        },
        {
          label: "Downloads",
          url: "/downloads",
          icon: faDownload,
        },
      ],
    },
    {
      title: "Developer",
      children: [
        {
          label: "Update to Developer Account",
          url: "/create_developer",
          icon: faUpLong,
        },
        {
          label: "Developer Studio",
          url: "/studio",
          icon: faDesktop,
        },
      ],
    },
  ];
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={onClose}
      animate={{ opacity: 1 }}
      data-lenis-prevent
    >
      <motion.main
        className="w-[400px] bg-background_primary h-screen overflow-y-auto p-8 flex flex-col gap-6"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        {allLink.map((item, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <h2 className="text-xl">{item.title}</h2>
            {item.children.map((child, idx) => (
              <Link
                key={idx}
                to={child.url}
                // onClick={onClose}
                className={linkClass(child.url)}
              >
                <FontAwesomeIcon icon={child.icon} />
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        ))}
      </motion.main>
    </motion.div>
  );
};
