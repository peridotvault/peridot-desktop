// @ts-ignore
import React, { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { Wallet } from "../../pages/profile/Wallet";
import { AnimatePresence } from "framer-motion";
import { useWallet } from "../../contexts/WalletContext";

export default function MainLayout() {
  const [isOpenWallet, setIOpenWallet] = useState(false);
  const { wallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    function checkWallet() {
      if (
        !wallet.principalId &&
        !wallet.accountId &&
        !wallet.encryptedPrivateKey &&
        !wallet.encryptedSeedPhrase
      ) {
        navigate("/login");
      }
    }

    checkWallet();
  });
  return (
    <main className="overflow-x-hidden">
      <Navbar onOpenWallet={() => setIOpenWallet(true)} />
      <Outlet />
      <AnimatePresence>
        {isOpenWallet ? <Wallet onClose={() => setIOpenWallet(false)} /> : ""}
      </AnimatePresence>
    </main>
  );
}
