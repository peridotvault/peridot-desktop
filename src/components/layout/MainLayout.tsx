import React, { useState } from "react";
import { Navbar } from "./Navbar";
import { Outlet } from "react-router-dom";
import { Wallet } from "../../pages/profile/Wallet";
import { AnimatePresence } from "framer-motion";

export const MainLayout = () => {
  const [isOpenProfile, setIsOpenProfile] = useState(false);
  return (
    <main className="overflow-x-hidden">
      <Navbar onOpenProfile={() => setIsOpenProfile(true)} />
      <Outlet />
      <AnimatePresence>
        {isOpenProfile ? (
          <Wallet onClose={() => setIsOpenProfile(false)} />
        ) : (
          ""
        )}
      </AnimatePresence>
    </main>
  );
};
