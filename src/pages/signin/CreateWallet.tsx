// @ts-ignore
import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { walletService } from "../../utils/WalletService";
import { useNavigate } from "react-router-dom";
import { PasswordPage } from "./PasswordPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { clearWalletData } from "../../utils/StoreService";
import { getUserByPrincipalId } from "../../contexts/UserContext";
// import { getUserByPrincipalId } from "../../contexts/UserContext";

export default function CreateWallet() {
  const { setWallet, wallet, isGeneratedSeedPhrase, setIsGeneratedSeedPhrase } =
    useWallet();

  const navigate = useNavigate();
  const [newSeedPhrase, setNewSeedPhrase] = useState("");

  useEffect(() => {
    async function userHandle() {
      if (wallet.encryptedPrivateKey) {
        const isUserExist = await getUserByPrincipalId("ifal12", wallet);
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
      encryptedPrivateKey: null,
      password: null,
    }));
  };

  const handleGenerateWallet = async (password: string) => {
    if (newSeedPhrase) {
      const result = await walletService.generateWallet(
        newSeedPhrase,
        password
      );

      if (result.success) {
        setWallet((prevWallet) => ({
          ...prevWallet,
          encryptedSeedPhrase: result.encryptedSeedPhrase,
          principalId: result.principalId,
          accountId: result.accountId,
          encryptedPrivateKey: result.encryptedPrivateKey,
          password: password,
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
          <button
            className="fixed left-5 top-5"
            onClick={() => {
              clearSeedPhrase();
              navigate("/login");
            }}
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </button>
          <p className="text-lg">Generate Your Wallet</p>
          <button
            className="rounded-xl text-center shadow-sunken-sm hover:shadow-flat-lg hover:bg-white/5 duration-300 border border-white/10 hover:border-white/5 p-6 w-[300px] h-[150px] text-lg"
            onClick={generateSeedPhrase}
          >
            {!newSeedPhrase ? (
              <p className="text-green-500">Tap to Reveal ur Seed Phrase</p>
            ) : (
              <p>{newSeedPhrase}</p>
            )}
          </button>
          <div className="h-3"></div>
          <button
            onClick={() => {
              if (newSeedPhrase !== "") {
                setIsGeneratedSeedPhrase(true);
              }
            }}
            className={`bg-white text-black py-3 px-10 rounded-full ${
              newSeedPhrase !== "" ? "" : "opacity-30 cursor-not-allowed"
            }`}
          >
            Continue
          </button>
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
