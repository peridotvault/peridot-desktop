import React from 'react';
import { useWallet } from '../../contexts/WalletContext';
import _ from 'lodash';
import { useNavigate } from 'react-router-dom';
import { InputField } from '../atoms/InputField';
import { UserInterface } from '../../interfaces/user/UserInterface';
import { getUserInfo, saveUserInfo } from '../../utils/IndexedDb';
import { walletService } from '../../features/wallet/services/WalletService';
import { getUserData } from '../../blockchain/icp/directory/services/ICPUserService';

export const RequiredPassword = () => {
  const { wallet, isCheckingWallet, setIsCheckingWallet } = useWallet();
  const navigate = useNavigate();
  const [isRequiredPassword, setIsRequiredPassword] = React.useState(false);
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  //   const [userData, setUserData] = React.useState<UserInterface | null>(null);
  const [userData, setUserData] = React.useState<UserInterface | null>(null);

  const saveMetadata = async (
    oldUserMetadata: UserInterface | null,
    newMetadata: UserInterface,
  ): Promise<void> => {
    try {
      if (!_.isEqual(oldUserMetadata, newMetadata)) {
        console.log('check if not same');
        await saveUserInfo(newMetadata);
      }
    } catch (error) {
      console.error;
    }
  };

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
          const userInfo = await getUserInfo();
          if (userInfo) {
            setUserData(userInfo);
          }
          const lock = await walletService.getLock();
          const isValidSession = lock ? Date.now() <= lock.expiresAt : false;
          setIsCheckingWallet(false);
          if (isValidSession) {
            const isUserExist = (await getUserData({
              wallet: wallet,
            })) as UserInterface;
            if (isUserExist) {
              saveMetadata(userInfo, isUserExist);

              setIsRequiredPassword(false);
            } else {
              navigate('/create_profile');
            }
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
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent_secondary">
          Loading
        </div>
      </div>
    );
  }

  if (isRequiredPassword) {
    return (
      <div className="backdrop-blur-sm bg-black/50 fixed z-100 w-full h-full flex justify-center items-center">
        <div className="bg-background_primary rounded-xl p-10 w-[400px] flex flex-col gap-6 items-end">
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
            {error && <p className="text-danger text-sm">{error}</p>}
          </div>
          <button
            onClick={handleConfirm}
            className="border w-[100px] border-accent_secondary p-3 rounded-2xl text-accent_secondary font-bold hover:scale-105 duration-300"
          >
            Confirm
          </button>
        </div>
      </div>
    );
  }

  return '';
};
