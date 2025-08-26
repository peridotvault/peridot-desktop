// @ts-ignore
import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faDesktop,
  faUpLong,
  faUser,
  faUserGear,
} from "@fortawesome/free-solid-svg-icons";
import { useWallet } from "../contexts/WalletContext";
import { getAmIDeveloper } from "../blockchain/icp/user/services/ICPDeveloperService";

interface SlideProps {
  onClose: () => void;
}

type Visibility = "always" | "devOnly" | "nonDevOnly";

type LinkItem = {
  label: string;
  url: string;
  icon: any;
  show: Visibility;
};

type LinkSection = {
  title: string;
  children: LinkItem[];
};

export const Slide: React.FC<SlideProps> = ({ onClose }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const { wallet } = useWallet();
  const [isDeveloper, setIsDeveloper] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!wallet) {
        if (mounted) setIsDeveloper(false);
        return;
      }
      try {
        const res = await getAmIDeveloper({ wallet });
        if (mounted) setIsDeveloper(Boolean(res));
      } catch {
        if (mounted) setIsDeveloper(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [wallet]);

  const linkClass = (path: string) =>
    `flex gap-4 py-2 px-4 items-center rounded-xl duration-300 transition-all hover:scale-105 ${
      isActive(path)
        ? "bg-gradient-to-r from-accent_primary to-accent_secondary text-black scale-105"
        : ""
    }`;

  // === Single Source of Truth ===========================
  const allLink: LinkSection[] = useMemo(
    () => [
      {
        title: "Page",
        children: [
          {
            label: "My Profile",
            url: "/profile_user",
            icon: faUser,
            show: "always",
          },
          {
            label: "Account Setting",
            url: "/update_profile",
            icon: faUserGear,
            show: "always",
          },
          // {
          //   label: "Downloads",
          //   url: "/downloads",
          //   icon: faDownload,
          //   show: "always",
          // },
        ],
      },
      {
        title: "Developer",
        children: [
          // CTA ini hanya muncul untuk non-developer
          {
            label: "Update to Developer Account",
            url: "/create_developer",
            icon: faUpLong,
            show: "nonDevOnly",
          },
          {
            label: "Developer Studio",
            url: "/studio",
            icon: faDesktop,
            show: "devOnly",
          },
        ],
      },
    ],
    []
  );

  const filterByVisibility = (item: LinkItem, dev: boolean | null) => {
    if (item.show === "always") return true;
    if (dev === null) return false; // saat status belum diketahui, sembunyikan item kondisional
    if (item.show === "devOnly") return dev === true;
    if (item.show === "nonDevOnly") return dev === false;
    return false;
  };

  const visibleSections = useMemo(
    () =>
      allLink
        .map((section) => ({
          ...section,
          children: section.children.filter((c) =>
            filterByVisibility(c, isDeveloper)
          ),
        }))
        .filter((section) => section.children.length > 0),
    [allLink, isDeveloper]
  );

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
        {visibleSections.map((section, idx) => (
          <div key={idx} className="flex flex-col gap-2">
            <h2 className="text-xl">{section.title}</h2>
            {section.children.map((child, cidx) => (
              <Link key={cidx} to={child.url} className={linkClass(child.url)}>
                <FontAwesomeIcon icon={child.icon} />
                <span>{child.label}</span>
              </Link>
            ))}
          </div>
        ))}

        {/* (Opsional) indikator saat status developer masih dicek */}
        {isDeveloper === null && (
          <div className="opacity-60 text-sm px-1">
            Checking developer status…
          </div>
        )}
      </motion.main>
    </motion.div>
  );
};
