// @ts-ignore
import React, { useCallback, useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { walletService } from '../../features/wallet/services/WalletService';
import { useNavigate } from 'react-router-dom';
import { PasswordPage } from './PasswordPage';
import { SeedPhraseInput } from '../../features/wallet/components/input-seedphrase';
import { RedirectPage } from '../additional/redirect-page';
import { ButtonWithSound } from '../../components/atoms/button-with-sound';
import { clearWalletData } from '../../lib/utils/StoreService';

interface ImportWalletProps {
  setIsImportWallet: React.Dispatch<React.SetStateAction<boolean>>;
}

export const ImportWallet = ({ setIsImportWallet }: ImportWalletProps) => {
  const { setWallet, wallet, isGeneratedSeedPhrase, setIsGeneratedSeedPhrase } = useWallet();

  const navigate = useNavigate();
  const [tempSeedPhrase, setTempSeedPhrase] = useState('');

  useEffect(() => {
    async function userHandle() {
      try {
        if (wallet.encryptedPrivateKey) {
          navigate('/');
        }
      } catch (error) {
        console.error(error);
      }
    }

    userHandle();
  }, [wallet.encryptedPrivateKey, navigate]);

  const clearSeedPhrase = async () => {
    await clearWalletData();
    setTempSeedPhrase('');
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
        const lock = await walletService.openLock(password, result.verificationData);
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
        console.error('Error importing wallet:', result.error);
      }
    },
    [setWallet, navigate],
  );

  if (!wallet.encryptedPrivateKey) {
    if (!isGeneratedSeedPhrase) {
      return (
        <div className="flex flex-col gap-4 items-center">
          <div className="border border-foreground/20 rounded-3xl flex justify-center items-center px-8 py-6 flex-col gap-6">
            <div className="flex flex-col w-full gap-4">
              <h2 className="text-2xl font-bold">Import Your Wallet</h2>
              <hr className="border-t border-foreground/20" />
              <p className="text-sm">Enter your 12-words Seed Phrase</p>
            </div>
            <SeedPhraseInput
              onContinue={(seedPhrase) => {
                setTempSeedPhrase(seedPhrase);
                setIsGeneratedSeedPhrase(true);
              }}
            />
          </div>
          <div className="flex gap-2">
            <span>Don't have Web3 Wallet?</span>
            <ButtonWithSound
              onClick={() => setIsImportWallet(false)}
              className="text-accent-foreground font-bold hover:cursor-pointer"
            >
              Create Wallet
            </ButtonWithSound>
          </div>
        </div>
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

  return <RedirectPage />;
};
