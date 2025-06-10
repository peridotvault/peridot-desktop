import React, { useState } from "react";
import { motion } from "framer-motion";
import { WalletNavigation } from "../components/WalletNavigation";
import { Home } from "./Home";
import { History } from "./History";
import { Nft } from "./Nft";
import { Settings } from "./Settings";

interface NavbarProps {
  onClose: () => void;
  onLockChanged: () => void;
}

export const Wallet: React.FC<NavbarProps> = ({ onClose, onLockChanged }) => {
  const [activeNav, setActiveNav] = useState<string>("home");

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={onClose}
      animate={{ opacity: 1 }}
      data-lenis-prevent
    >
      <motion.main
        className="w-[370px] bg-background_primary flex flex-col justify-between min-h-screen"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        {/* Content  */}
        {activeNav == "home" ? (
          <Home onLockChanged={onLockChanged} />
        ) : activeNav == "nft" ? (
          <Nft />
        ) : activeNav == "history" ? (
          <History />
        ) : activeNav == "settings" ? (
          <Settings />
        ) : (
          <div className=""></div>
        )}

        {/* Navigation  */}
        <WalletNavigation activeNav={activeNav} setActiveNav={setActiveNav} />
      </motion.main>
    </motion.div>
  );
};
