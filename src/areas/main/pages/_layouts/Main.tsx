// @ts-ignore
import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Wallet } from '../../features/wallet/views/Wallet';
import { MenuAvatar } from '@shared/components/menu-avatar';
import { Sidebar } from './Sidebar';
import DownloadModal from '@features/download/components/layouts/DownloadModal';
import AIChatbot from '@features/ai/components/AIChatbot';

export default function MainLayout() {
  const [isOpenWallet, setIOpenWallet] = useState(false);
  const [isOpenPeri, setIOpenPeri] = useState(false);
  const [isOpenDownload, setIOpenDownload] = useState(false);
  const [isOpenMenuAvatar, setIOpenMenuAvatar] = useState(false);

  const togglePeri = () => {
    setIOpenPeri((prev) => {
      const next = !prev;
      if (next) {
        setIOpenMenuAvatar(false);
        setIOpenWallet(false);
        setIOpenDownload(false);
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
        setIOpenDownload(false);
      }
      return next;
    });
  };

  const toggleDownload = () => {
    setIOpenDownload((prev) => {
      const next = !prev;
      if (next) {
        setIOpenPeri(false);
        setIOpenMenuAvatar(false);
        setIOpenWallet(false);
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
    <div className="h-screen flex flex-col overflow-hidden">
      <main className="flex flex-col overflow-auto mt-12 ">
        <Sidebar
          onOpenWallet={toggleWallet}
          onOpenPeri={togglePeri}
          onOpenDownload={toggleDownload}
          onOpenMenuAvatar={toggleAvatar}
          walletActive={isOpenWallet}
          periActive={isOpenPeri}
          downloadActive={isOpenDownload}
          avatarActive={isOpenMenuAvatar}
        />

        {/* Content Area */}
        <div className={`flex-1 ml-16 relative`}>
          <div className={``}>
            <Outlet />
          </div>
        </div>

        {/* Store Modal ========================= */}
        <AIChatbot
          open={isOpenPeri}
          onClose={() => setIOpenPeri(false)}
          leftClassName="left-16"
          title="Peri Chat"
        />

        <DownloadModal
          open={isOpenDownload}
          onClose={() => setIOpenDownload(false)}
          leftClassName="left-16"
          title="Download Modal"
        />

        <Wallet open={isOpenWallet} onClose={() => setIOpenWallet(false)} leftClassName="left-16" />

        <MenuAvatar
          open={isOpenMenuAvatar}
          onClose={() => setIOpenMenuAvatar(false)}
          leftClassName="left-20"
        />
      </main>
    </div>
  );
}
