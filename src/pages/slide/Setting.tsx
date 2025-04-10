// @ts-ignore
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onClose: () => void;
}

export const Setting: React.FC<NavbarProps> = ({ onClose }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={onClose}
      animate={{ opacity: 1 }}
      data-lenis-prevent
    >
      <motion.main
        className="w-[400px] bg-background_primary h-screen overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        <div className="flex flex-col gap-6">
          <button
            className="shadow-arise-sm w-full py-4 px-6 text-start rounded-xl"
            onClick={() => navigate("/update_profile")}
          >
            Account Setting
          </button>
          <button
            className="shadow-arise-sm w-full py-4 px-6 text-start rounded-xl"
            onClick={() => navigate("/create_developer")}
          >
            Update to Developer Account
          </button>
        </div>
      </motion.main>
    </motion.div>
  );
};
