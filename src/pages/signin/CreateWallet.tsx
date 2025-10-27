// @ts-ignore
import React, { useEffect, useState } from 'react';
import { useWallet } from '../../contexts/WalletContext';
import { walletService } from '../../features/wallet/services/WalletService';
import { useNavigate } from 'react-router-dom';
import { PasswordPage } from './PasswordPage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faDice } from '@fortawesome/free-solid-svg-icons';
import { SeedPhraseInput } from '../../features/wallet/components/input-seedphrase';
import { ButtonWithSound } from '../../shared/components/ui/button-with-sound';
import { clearWalletData } from '../../lib/utils/StoreService';

interface CreateWalletProps {
  setIsImportWallet: React.Dispatch<React.SetStateAction<boolean>>;
}

export const CreateWallet = ({ setIsImportWallet }: CreateWalletProps) => {
  const { setWallet, wallet, isGeneratedSeedPhrase, setIsGeneratedSeedPhrase } = useWallet();

  const navigate = useNavigate();
  const [newSeedPhrase, setNewSeedPhrase] = useState('');

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

    generateSeedPhrase();
    userHandle();
  }, [wallet.encryptedPrivateKey, navigate]);

  const generateSeedPhrase = () => {
    setNewSeedPhrase(walletService.generateNewSeedPhrase());
  };

  const clearSeedPhrase = async () => {
    await clearWalletData();
    setNewSeedPhrase('');
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
      const result = await walletService.generateWallet(newSeedPhrase, password);
      if (result.success) {
        const ol = await walletService.openLock(password, result.verificationData);
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
        console.error('Failed to generate wallet:', result.error);
      }
    }
  };

  const handlePasswordSubmit = (password: string) => {
    handleGenerateWallet(password);
  };

  if (!wallet.encryptedPrivateKey) {
    if (!isGeneratedSeedPhrase) {
      return (
        <div className="flex flex-col gap-4 items-center">
          <div className="flex items-center justify-between w-full">
            <ButtonWithSound
              className="flex items-center gap-2 border px-6 py-3 rounded-xl border-foreground/20 hover:cursor-pointer"
              onClick={() => {
                clearSeedPhrase();
                setIsImportWallet(true);
              }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
              <span>Back</span>
            </ButtonWithSound>
          </div>

          <div className="border border-foreground/20 rounded-3xl flex justify-center items-center px-8 py-6 flex-col gap-6">
            <div className="flex flex-col w-full gap-4">
              <h2 className="text-2xl font-bold">Create Your Wallet</h2>
              <hr className="border-t border-foreground/20" />
              <p className="text-sm">Choose your Seed Phrase Combination</p>
            </div>

            {/* Generate another Seed Phrase  */}
            <div className="flex w-full max-w-md justify-end gap-4">
              <ButtonWithSound
                className="rounded-xl text-center shadow-sunken-sm hover:cursor-pointer hover:shadow-flat-lg hover:bg-foreground/5 duration-300 border border-foreground/10 hover:border-foreground/5 py-3 px-4 text-lg flex gap-2 w-full items-center justify-center"
                onClick={generateSeedPhrase}
              >
                <FontAwesomeIcon icon={faDice} />
                <p className="text-base">Generate another seed phrase</p>
              </ButtonWithSound>
            </div>

            <SeedPhraseInput
              seedPhrase={newSeedPhrase}
              onContinue={() => {
                if (newSeedPhrase !== '') {
                  setIsGeneratedSeedPhrase(true);
                }
              }}
            />
          </div>
        </div>
      );
    }

    return <PasswordPage backFunction={clearSeedPhrase} handlePassword={handlePasswordSubmit} />;
  }

  return <div className="flex justify-center items-center">Redirecting...</div>;
};
