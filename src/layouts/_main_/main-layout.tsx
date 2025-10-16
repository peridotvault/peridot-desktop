// @ts-ignore
import React, { useEffect, useState } from 'react';
import { MainNavbar } from './main-navbar';
import { Outlet } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Wallet } from '../../features/wallet/views/Wallet';
import { MainSidebar } from './main-sidebar';
import AIChatbot from '../../components/organisms/ai-chatbot';
import { MenuAvatar } from '../../components/organisms/menu-avatar';

export default function MainLayout() {
  const [isOpenWallet, setIOpenWallet] = useState(false);
  const [isOpenPeri, setIOpenPeri] = useState(false);
  const [isOpenMenuAvatar, setIOpenMenuAvatar] = useState(false);
  const [isOpenSettings, setIsOpenSettings] = useState(false);

  const togglePeri = () => {
    setIOpenPeri((prev) => {
      const next = !prev;
      if (next) {
        setIOpenMenuAvatar(false);
        setIOpenWallet(false);
      }
      return next;
    });
  };
  const toggleWallet = () => {
    setIOpenWallet((prev) => {
      const next = !prev;
      if (next) {
        setIOpenPeri(false);
        setIOpenMenuAvatar(false);
      }
      return next;
    });
  };

  const toggleAvatar = () => {
    setIOpenMenuAvatar((prev) => {
      const next = !prev;
      if (next) {
        setIOpenPeri(false);
        setIOpenWallet(false);
      }
      return next;
    });
  };

  return (
    <main className="min-h-screen flex flex-col">
      <MainSidebar
        onOpenWallet={toggleWallet}
        onOpenPeri={togglePeri}
        onOpenMenuAvatar={toggleAvatar}
        walletActive={isOpenWallet}
        periActive={isOpenPeri}
        avatarActive={isOpenMenuAvatar}
      />

      {/* Content Area */}
      <div className={`flex-1 ml-20 relative`}>
        <MainNavbar />
        <div className={``}>
          <Outlet />
        </div>
      </div>

      {/* Store Modal ========================= */}
      <AIChatbot
        open={isOpenPeri}
        onClose={() => setIOpenPeri(false)}
        leftClassName="left-20" // selaras dengan lebar sidebar w-20
        title="Peri Chat"
      />

      <Wallet
        open={isOpenWallet}
        onClose={() => setIOpenWallet(false)}
        // onLockChanged={() => setIsRequiredPassword(true)}
        onLockChanged={() => {}}
        leftClassName="left-20"
      />

      <MenuAvatar
        open={isOpenMenuAvatar}
        onClose={() => setIOpenMenuAvatar(false)}
        leftClassName="left-24"
      />
    </main>
  );
}
