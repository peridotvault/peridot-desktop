import React, { useEffect } from "react";

import { useWallet } from "../../contexts/WalletContext";
import { walletService } from "../../utils/WalletService";
import { useNavigate } from "react-router-dom";

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
        <main className="flex justify-center items-center p-6 flex-col gap-5">
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            back
          </button>
          <p>Generate Your Wallet</p>
          <button
            className="border p-3 w-[300px] text-lg"
            onClick={generateSeedPhrase}
          >
            {!wallet.seedPhrase ? (
              <p className="text-green-500">Tap to Reveal ur Seed Phrase</p>
            ) : (
              <p>{wallet.seedPhrase}</p>
            )}
          </button>
          <button
            onClick={() => setIsGeneratedSeedPhrase(true)}
            className="bg-white text-black py-2 px-5 rounded-full"
          >
            Continue
          </button>
        </main>
      );
    }

    return (
      <main className="flex justify-center items-center p-6 flex-col gap-5">
        <button onClick={clearSeedPhrase}>back</button>
        <p>Create Password</p>
        <input
          type="password"
          name="password"
          className="border p-2 rounded text-black"
          placeholder="Enter your password"
          value={wallet.password || ""}
          onChange={(e) =>
            setWallet((prev) => ({
              ...prev,
              password: e.target.value,
            }))
          }
        />
        <button
          onClick={() => {
            handleGenerateWallet();
            setIsPasswordCreated(true);
          }}
          className="bg-white text-black py-2 px-5 rounded-full"
        >
          Create Password
        </button>
      </main>
    );
  }

  // Return a loading state or empty div while redirecting
  return <div className="flex justify-center items-center">Redirecting...</div>;
}
