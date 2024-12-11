import React, { useCallback, useEffect } from "react";

import { useWallet } from "../../contexts/WalletContext";
import { walletService } from "../../utils/WalletService";
import { useNavigate } from "react-router-dom";
import { PasswordPage } from "./PasswordPage";

export default function ImportWallet() {
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

  const clearSeedPhrase = () => {
    setIsGeneratedSeedPhrase(false);
    setWallet((prevWallet) => ({
      ...prevWallet,
      seedPhrase: null,
    }));
  };

  const handleImport = useCallback(
    async (seedPhrase: string) => {
      const result = walletService.generateWallet(seedPhrase);
      if (result.success) {
        setWallet((prevWallet) => ({
          ...prevWallet,
          principalId: result.principalId,
          accountId: result.accountId,
          privateKey: result.privateKey,
        }));
        navigate("/home");
      } else {
        console.error("Error importing wallet:", result.error);
      }
    },
    [setWallet, navigate]
  );

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
          <textarea
            className="border p-3 w-[300px] text-lg text-black"
            onChange={(e) =>
              setWallet((prev) => ({
                ...prev,
                seedPhrase: e.target.value,
              }))
            }
          ></textarea>
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
      <PasswordPage
        backFunction={clearSeedPhrase}
        handlePassword={() => {
          handleImport(wallet.seedPhrase || "");
          setIsPasswordCreated(true);
        }}
      />
    );
  }

  // Return a loading state or empty div while redirecting
  return <div className="flex justify-center items-center">Redirecting...</div>;
}
