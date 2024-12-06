import React, { createContext, useContext, useEffect, useState } from "react";
import { WalletData } from "../utils/WalletService";
import { saveWalletData, getWalletData } from "../utils/StoreService";

interface WalletContextData {
  wallet: WalletData;
  setWallet: React.Dispatch<React.SetStateAction<WalletData>>;
  isGeneratedSeedPhrase: boolean;
  setIsGeneratedSeedPhrase: React.Dispatch<React.SetStateAction<boolean>>;
  isPasswordCreated: boolean;
  setIsPasswordCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

const WalletContext = createContext<WalletContextData | undefined>(undefined);

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [wallet, setWallet] = useState<WalletData>({
    seedPhrase: null,
    principalId: null,
    accountId: null,
    privateKey: null,
    password: null,
  });

  const [isGeneratedSeedPhrase, setIsGeneratedSeedPhrase] = useState(false);
  const [isPasswordCreated, setIsPasswordCreated] = useState(false);

  // Load wallet data when component mounts
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedWallet = await getWalletData();
        if (storedWallet) {
          setWallet(storedWallet);
          // Set other states based on stored data
          setIsGeneratedSeedPhrase(!!storedWallet.seedPhrase);
          setIsPasswordCreated(!!storedWallet.password);
        }
      } catch (error) {
        console.error("Error loading initial wallet data:", error);
      }
    };

    loadInitialData();
  }, []);

  // Save wallet data whenever it changes
  useEffect(() => {
    const saveWallet = async () => {
      try {
        if (wallet.seedPhrase || wallet.password) {
          await saveWalletData(wallet);
        }
      } catch (error) {
        console.error("Error saving wallet:", error);
      }
    };

    saveWallet();
  }, [wallet]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        setWallet,
        isGeneratedSeedPhrase,
        setIsGeneratedSeedPhrase,
        isPasswordCreated,
        setIsPasswordCreated,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
