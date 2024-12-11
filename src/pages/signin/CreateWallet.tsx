import React, { useEffect } from "react";

import { useWallet } from "../../contexts/WalletContext";
import { walletService } from "../../utils/WalletService";
import { useNavigate } from "react-router-dom";
import { PasswordPage } from "./PasswordPage";

export default function CreateWallet() {
  const {
    wallet,
    setWallet,
    isGeneratedSeedPhrase,
    setIsGeneratedSeedPhrase,
    isPasswordCreated,
    setIsPasswordCreated,
  } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (isPasswordCreated) {
      navigate("/home");
    }
  }, [isPasswordCreated, navigate]);

  const generateSeedPhrase = () => {
    const seedPhrase = walletService.generateNewSeedPhrase();
    setWallet((prevWallet) => ({
      ...prevWallet,
      seedPhrase,
    }));
  };

  const clearSeedPhrase = () => {
    setIsGeneratedSeedPhrase(false);
    setWallet((prevWallet) => ({
      ...prevWallet,
      seedPhrase: null,
    }));
  };

  const handleGenerateWallet = () => {
    if (wallet.seedPhrase) {
      const result = walletService.generateWallet(wallet.seedPhrase);
      if (result.success) {
        setWallet((prevWallet) => ({
          ...prevWallet,
          principalId: result.principalId,
          accountId: result.accountId,
          privateKey: result.privateKey,
        }));
      }
    }
  };

  if (!isPasswordCreated) {
    if (!isGeneratedSeedPhrase) {
      return (
        <main className="flex justify-center items-center h-screen p-6 flex-col gap-6">
          <button
            className="fixed left-5 top-5"
            onClick={() => {
              navigate("/");
            }}
          >
            back
          </button>
          <p className="text-lg">Generate Your Wallet</p>
          <button
            className="rounded-xl text-center shadow-sunken-sm hover:shadow-flat-lg hover:bg-white/5 duration-300 border border-white/10 hover:border-white/5 p-6 w-[300px] h-[150px] text-lg"
            onClick={generateSeedPhrase}
          >
            {!wallet.seedPhrase ? (
              <p className="text-green-500">Tap to Reveal ur Seed Phrase</p>
            ) : (
              <p>{wallet.seedPhrase}</p>
            )}
          </button>
          <div className="h-3"></div>
          <button
            onClick={() => setIsGeneratedSeedPhrase(true)}
            className="bg-white text-black py-3 px-10 rounded-full"
          >
            Continue
          </button>
        </main>
      );
    }

    return (
      <PasswordPage
        backFunction={clearSeedPhrase}
        handlePassword={() => {
          handleGenerateWallet();
          setIsPasswordCreated(true);
        }}
      />
    );
  }

  // Return a loading state or empty div while redirecting
  return <div className="flex justify-center items-center">Redirecting...</div>;
}
