import React from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../atoms/InputField';
import { walletService } from '@shared/services/wallet.service';
import { LoadingPage } from '../../pages/additional/loading-page';

export const RequiredPassword = () => {
  const { wallet, isCheckingWallet, setIsCheckingWallet } = useWallet();
  const navigate = useNavigate();
  const [isRequiredPassword, setIsRequiredPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  // Check wallet and session status
  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function checkWalletAndScheduleExpiry() {
      if (
        !wallet.principalId ||
        !wallet.accountId ||
        !wallet.encryptedPrivateKey ||
        !wallet.encryptedSeedPhrase ||
        !wallet.verificationData
      ) {
        navigate('/login');
        return;
      }
      try {
        if (await walletService.isLockOpen()) {
          const lock = await walletService.getLock();
          const isValidSession = lock ? Date.now() <= lock.expiresAt : false;
          setIsCheckingWallet(false);
          if (isValidSession) {
            setIsRequiredPassword(false);
          } else {
            setIsRequiredPassword(true);
          }
        } else {
          setIsRequiredPassword(true);
        }

        // Schedule update state when lock expired
        const lock = await walletService.getLock();
        if (lock) {
          const timeLeft = lock.expiresAt - Date.now();
          if (timeLeft > 0) {
            timer = setTimeout(() => {
              setIsRequiredPassword(true);
            }, timeLeft);
          } else {
            // If expired, Change state
            setIsRequiredPassword(true);
          }
        } else {
          setIsRequiredPassword(true);
        }
      } catch (error) {
        console.error('Error checking wallet or scheduling lock expiry:', error);
        setIsRequiredPassword(true);
      }
    }

    checkWalletAndScheduleExpiry();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCheckingWallet, navigate, wallet]);

  const handleConfirm = async () => {
    try {
      setError(null);
      if (wallet.verificationData) {
        // Open lock and save to session
        await walletService.openLock(password, wallet.verificationData);
        setPassword('');
        setIsRequiredPassword(false);
      }
    } catch (err) {
      console.error('Lock error:', err);
      setError('Failed to open Lock. Please check your password.');
    }
  };

  if (isCheckingWallet) {
    return <LoadingPage />;
  }

  if (isRequiredPassword) {
    return (
      <div className="backdrop-blur-sm bg-black/50 fixed z-100 w-full h-full flex justify-center items-center">
        <div className="bg-background rounded-xl p-10 w-[400px] flex flex-col gap-6 items-end">
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

  return '';
};
