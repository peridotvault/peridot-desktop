// @ts-ignore
import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { walletService } from "../../features/wallet/services/WalletService";
import { useNavigate } from "react-router-dom";
import { PasswordPage } from "./PasswordPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faDice } from "@fortawesome/free-solid-svg-icons";
import { clearWalletData } from "../../utils/StoreService";
import { getUserByPrincipalId } from "../../contexts/UserContext";
import { SeedPhraseInput } from "../../features/wallet/components/SeedPhraseInput";
// import { getUserByPrincipalId } from "../../contexts/UserContext";

export default function CreateWallet() {
  const { setWallet, wallet, isGeneratedSeedPhrase, setIsGeneratedSeedPhrase } =
    useWallet();

  const navigate = useNavigate();
  const [newSeedPhrase, setNewSeedPhrase] = useState("");

  useEffect(() => {
    async function userHandle() {
      if (wallet.encryptedPrivateKey) {
        const isUserExist = await getUserByPrincipalId(
          wallet.encryptedPrivateKey
        );
        if (
          isUserExist &&
          typeof isUserExist === "object" &&
          "ok" in isUserExist
        ) {
          navigate("/");
        } else {
          navigate("/create_profile");
        }
      }
    }
    generateSeedPhrase();
    userHandle();
  }, [wallet.encryptedPrivateKey, navigate]);

  const generateSeedPhrase = () => {
    setNewSeedPhrase(walletService.generateNewSeedPhrase());
  };

  const clearSeedPhrase = async () => {
    await clearWalletData();
    setNewSeedPhrase("");
    setIsGeneratedSeedPhrase(false);
    setWallet((prevWallet) => ({
      ...prevWallet,
      encryptedSeedPhrase: null,
      principalId: null,
      accountId: null,
      encryptedPrivateKey: null,
      lock: null,
      verificationData: null,
    }));
  };

  const handleGenerateWallet = async (password: string) => {
    if (newSeedPhrase) {
      const result = await walletService.generateWallet(
        newSeedPhrase,
        password
      );
      if (result.success) {
        const ol = await walletService.openLock(
          password,
          result.verificationData
        );
        console.log(ol);
        setWallet((prevWallet) => ({
          ...prevWallet,
          encryptedSeedPhrase: result.encryptedSeedPhrase,
          principalId: result.principalId,
          accountId: result.accountId,
          encryptedPrivateKey: result.encryptedPrivateKey,
          verificationData: result.verificationData,
        }));
      } else {
        console.error("Failed to generate wallet:", result.error);
      }
    }
  };

  const handlePasswordSubmit = (password: string) => {
    handleGenerateWallet(password);
  };

  if (!wallet.encryptedPrivateKey) {
    if (!isGeneratedSeedPhrase) {
      return (
        <main className="flex justify-center items-center h-screen p-6 flex-col gap-6">
          <header className="fixed left-0 top-0 flex items-center justify-between w-full p-5">
            <button
              className="w-6"
              onClick={() => {
                clearSeedPhrase();
                navigate("/login");
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <h1 className="text-lg">Create Your Wallet</h1>
            <div className="w-6"></div>
          </header>
          {/* button  */}
          <div className="flex w-full max-w-md justify-end gap-4">
            <button
              className="rounded-xl text-center shadow-sunken-sm hover:shadow-flat-lg hover:bg-white/5 duration-300 border border-white/10 hover:border-white/5 py-3 px-4 text-lg flex gap-2 w-full items-center justify-center"
              onClick={generateSeedPhrase}
            >
              <FontAwesomeIcon icon={faDice} />
              <p className="text-base">Generate another seed phrase</p>
            </button>
          </div>
          <SeedPhraseInput
            seedPhrase={newSeedPhrase}
            onContinue={() => {
              if (newSeedPhrase !== "") {
                setIsGeneratedSeedPhrase(true);
              }
            }}
          />
        </main>
      );
    }

    return (
      <PasswordPage
        backFunction={clearSeedPhrase}
        handlePassword={handlePasswordSubmit}
      />
    );
  }

  return <div className="flex justify-center items-center">Redirecting...</div>;
}
