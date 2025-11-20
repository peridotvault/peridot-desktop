import React from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import _ from 'lodash';
import { InputField } from '../atoms/InputField';
import { LoadingPage } from '../../pages/additional/loading-page';
import { useStartupStage } from '@shared/contexts/StartupStageContext';
import { useWalletLockStore } from '@shared/states/wallet-lock.store';

export const RequiredPassword = () => {
  const { wallet } = useWallet();
  const { goToLogin } = useStartupStage();
  const { status, error, unlockWithPassword } = useWalletLockStore();

  const [password, setPassword] = React.useState('');

  // inisialisasi lock di awal
  React.useEffect(() => {
    // cek kalau wallet belum lengkap → lempar ke login
    if (
      !wallet.principalId ||
      !wallet.accountId ||
      !wallet.encryptedPrivateKey ||
      !wallet.encryptedSeedPhrase ||
      !wallet.verificationData
    ) {
      goToLogin();
      return;
    }

    // init lock state dari KV
    useWalletLockStore.getState().initFromStorage();
  }, [wallet, goToLogin]);

  const handleConfirm = async () => {
    if (!wallet.verificationData) return;
    try {
      await unlockWithPassword(password, wallet.verificationData, 30);
      setPassword('');
    } catch {
      // error sudah di-set di store
    }
  };

  if (status === 'checking') {
    return <LoadingPage />;
  }

  if (status === 'locked') {
    return (
      <div className="backdrop-blur-sm bg-black/50 fixed z-80 w-full h-full flex justify-center items-center">
        <div className="bg-background rounded-lg p-10 w-[400px] flex flex-col gap-6 items-end">
          <div className="flex flex-col gap-3 w-full ">
            <p>Password Required</p>
            <InputField
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="Password"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleConfirm();
                }
              }}
            />
            {error && <p className="text-chart-5 text-sm">{error}</p>}
          </div>
          <button
            onClick={handleConfirm}
            className="border w-[100px] border-accent p-3 rounded-2xl text-accent font-bold hover:scale-105 duration-300"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  return null;
};
