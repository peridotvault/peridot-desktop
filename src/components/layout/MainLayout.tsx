// @ts-ignore
import React, { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { Wallet } from "../../pages/profile/Wallet";
import { AnimatePresence } from "framer-motion";
import { useWallet } from "../../contexts/WalletContext";
import Lenis from "lenis";

export default function MainLayout() {
  const [isOpenWallet, setIOpenWallet] = useState(false);
  const { wallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

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
    <main className="min-h-screen flex flex-col">
      <Navbar onOpenWallet={() => setIOpenWallet(true)} />
      <div className="flex-1">
        <Outlet />
      </div>
      <AnimatePresence>
        {isOpenWallet ? <Wallet onClose={() => setIOpenWallet(false)} /> : ""}
      </AnimatePresence>
    </main>
  );
}
