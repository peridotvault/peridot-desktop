import React, { useEffect, useState } from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { walletService } from '@shared/services/wallet';
import { deriveEvmAddressFromSeed } from '@shared/utils/evm';
import { createPublicClient, http, formatEther } from 'viem';
import { baseSepolia } from 'viem/chains';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCopy, faExternalLinkAlt, faWallet, faLock, faSync } from '@fortawesome/free-solid-svg-icons';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';
import toast from 'react-hot-toast';

const RPC_URL = 'https://base-sepolia.g.alchemy.com/v2/1DVQw8E8nb2dYnSH0GwPm';

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

interface NativeWalletProps {
  onClose: () => void;
}

export const NativeWallet: React.FC<NativeWalletProps> = ({ onClose }) => {
  const { wallet } = useWallet();
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  const fetchWalletData = async () => {
    setLoading(true);
    setError(null);
    try {
      const isLockOpen = await walletService.isLockOpen();
      if (!isLockOpen) {
        setIsLocked(true);
        setLoading(false);
        return;
      }
      setIsLocked(false);

      if (!wallet.encryptedSeedPhrase) {
        setError('No wallet found. Please set up your wallet first.');
        setLoading(false);
        return;
      }

      const seedPhrase = await walletService.decryptWalletData(wallet.encryptedSeedPhrase);
      const derivedAddress = deriveEvmAddressFromSeed(seedPhrase);
      setAddress(derivedAddress);

      const bal = await publicClient.getBalance({ address: derivedAddress as `0x${string}` });
      setBalance(formatEther(bal));
    } catch (err) {
      console.error('Failed to load wallet data:', err);
      setError('Failed to decrypt wallet. Please ensure your wallet is unlocked.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, [wallet]);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    }
  };

  const openExplorer = () => {
    if (address) {
      window.open(`https://sepolia.basescan.org/address/${address}`, '_blank');
    }
  };

  return (
    <div className="fixed top-12 left-16 bottom-0 right-0 z-40 bg-background/60 backdrop-blur-xl flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-card border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden relative group">
        <div className="absolute -inset-1 bg-gradient-to-br from-primary/20 to-accent/20 blur opacity-50 group-hover:opacity-100 transition duration-1000" />
        
        <div className="relative bg-card rounded-[2.4rem] p-8">
          <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <FontAwesomeIcon icon={faWallet} className="text-xl" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Peridot Wallet</h2>
            </div>
            <button 
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              ✕
            </button>
          </header>

          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
              <p className="text-muted-foreground animate-pulse">Syncing with Base Sepolia...</p>
            </div>
          ) : isLocked ? (
            <div className="py-12 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <FontAwesomeIcon icon={faLock} className="text-3xl text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wallet Locked</h3>
              <p className="text-muted-foreground mb-8 text-sm max-w-xs">
                Your wallet is currently locked. Please interact with the app to trigger an unlock or restart the application.
              </p>
              <ButtonWithSound 
                onClick={fetchWalletData}
                className="bg-primary hover:scale-105 px-8 py-3 rounded-2xl font-bold transition-all"
              >
                Try Again
              </ButtonWithSound>
            </div>
          ) : error ? (
            <div className="py-12 text-center">
              <p className="text-chart-5 mb-8">{error}</p>
              <ButtonWithSound 
                onClick={onClose}
                className="bg-muted px-8 py-3 rounded-2xl font-bold"
              >
                Go Back
              </ButtonWithSound>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-[2rem] text-white shadow-xl shadow-primary/20">
                <p className="text-sm opacity-80 mb-2 font-medium tracking-wide uppercase">Total Balance</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black">{parseFloat(balance ?? '0').toFixed(4)}</span>
                  <span className="text-xl font-bold opacity-80 uppercase">ETH</span>
                </div>
                <div className="mt-6 inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-xs font-semibold">
                  BASE SEPOLIA
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-muted-foreground ml-2">Wallet Address</p>
                <div className="bg-muted/30 border border-white/5 rounded-2xl p-4 flex items-center justify-between group/addr">
                  <span className="text-sm font-mono truncate mr-4 text-foreground/80 lowercase italic">
                    {address}
                  </span>
                  <div className="flex gap-2 opacity-0 group-hover/addr:opacity-100 transition-opacity">
                    <button 
                      onClick={copyAddress}
                      className="w-8 h-8 rounded-lg bg-card border border-white/5 flex items-center justify-center hover:bg-muted transition-colors"
                      title="Copy Address"
                    >
                      <FontAwesomeIcon icon={faCopy} className="text-xs" />
                    </button>
                    <button 
                      onClick={openExplorer}
                      className="w-8 h-8 rounded-lg bg-card border border-white/5 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
                      title="View on Basescan"
                    >
                      <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                  <ButtonWithSound
                    onClick={fetchWalletData}
                    className="flex-1 bg-secondary hover:bg-secondary/80 py-4 rounded-2xl flex items-center justify-center gap-2 font-bold transition-all"
                  >
                      <FontAwesomeIcon icon={faSync} />
                      Refresh
                  </ButtonWithSound>
                  <ButtonWithSound
                    onClick={onClose}
                    className="flex-1 bg-primary py-4 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20"
                  >
                      Understood
                  </ButtonWithSound>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
