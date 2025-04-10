// @ts-ignore
import React, { useCallback, useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { walletService } from "../../utils/WalletService";
import { useNavigate } from "react-router-dom";
import { PasswordPage } from "./PasswordPage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { clearWalletData } from "../../utils/StoreService";
import { getUserByPrincipalId } from "../../contexts/UserContext";
import { SeedPhraseInput } from "../../components/wallet/SeedPhraseInput";

export default function ImportWallet() {
  const { setWallet, wallet, isGeneratedSeedPhrase, setIsGeneratedSeedPhrase } =
    useWallet();

  const navigate = useNavigate();
  const [tempSeedPhrase, setTempSeedPhrase] = useState("");

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

    userHandle();
  }, [wallet.encryptedPrivateKey, navigate]);

  const clearSeedPhrase = async () => {
    await clearWalletData();
    setTempSeedPhrase("");
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

  const handleImport = useCallback(
    async (seedPhrase: string, password: string) => {
      const result = await walletService.generateWallet(seedPhrase, password);
      if (result.success) {
        const lock = await walletService.openLock(
          password,
          result.verificationData
        );
        setWallet((prevWallet) => ({
          ...prevWallet,
          encryptedSeedPhrase: result.encryptedSeedPhrase,
          principalId: result.principalId,
          accountId: result.accountId,
          encryptedPrivateKey: result.encryptedPrivateKey,
          verificationData: result.verificationData,
          lock: lock,
        }));
      } else {
        console.error("Error importing wallet:", result.error);
      }
    },
    [setWallet, navigate]
  );

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
            <h1 className="text-lg">Import Your Wallet</h1>
            <div className="w-6"></div>
          </header>
          <SeedPhraseInput
            onContinue={(seedPhrase) => {
              setTempSeedPhrase(seedPhrase);
              setIsGeneratedSeedPhrase(true);
            }}
          />
        </main>
      );
    }

    return (
      <PasswordPage
        backFunction={clearSeedPhrase}
        handlePassword={(password: string) => {
          handleImport(tempSeedPhrase, password);
        }}
      />
    );
  }

  return <div className="flex justify-center items-center">Redirecting...</div>;
}
