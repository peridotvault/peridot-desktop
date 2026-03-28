import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { MenuAvatar } from '@shared/components/menu-avatar';
import { Sidebar } from './Sidebar';
import DownloadModal from '@main/features/download/components/layouts/DownloadModal';
import AIChatbot from '@main/features/ai/components/AIChatbot';
import { WalletSidebar } from '@features/wallet/components/WalletSidebar';

export default function MainLayout() {
  const [isOpenWallet, setIOpenWallet] = useState(false);
  const [isOpenPeri, setIOpenPeri] = useState(false);
  const [isOpenDownload, setIOpenDownload] = useState(false);
  const [isOpenMenuAvatar, setIOpenMenuAvatar] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.target === 'PERIDOT_CS') {
        const isCurrentlyOpen = isOpenWallet;
        setIOpenWallet(true);
        
        const forwardMessage = () => {
          const walletIframe = document.getElementById('peridotwallet') as HTMLIFrameElement;
          if (walletIframe?.contentWindow) {
            walletIframe.contentWindow.postMessage(event.data, '*');
          } else if (!isCurrentlyOpen) {
            setTimeout(forwardMessage, 100);
          }
        };

        if (isCurrentlyOpen) {
          forwardMessage();
        } else {
          setTimeout(forwardMessage, 300);
        }
      }
      
      if (event.data?.target === 'PERIDOT_INPAGE') {
        const vaultIframe = document.querySelector("iframe[title='PeridotVault Store']") as HTMLIFrameElement;
        if (vaultIframe?.contentWindow) {
          vaultIframe.contentWindow.postMessage(event.data, '*');
        }
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [isOpenWallet]);

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
    <div className="h-screen w-screen flex flex-col overflow-hidden">
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

      <main className="h-full w-full pl-16 pt-12 relative">
        <div className="w-full h-full">
          <Outlet />
        </div>
      </main>

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

      {/* Peridot Wallet Sidebar */}
      <WalletSidebar 
        open={isOpenWallet} 
        onClose={() => setIOpenWallet(false)} 
        title="Peridot Wallet"
      />

      <MenuAvatar
        open={isOpenMenuAvatar}
        onClose={() => setIOpenMenuAvatar(false)}
        leftClassName="left-20"
      />
    </div>
  );
}
