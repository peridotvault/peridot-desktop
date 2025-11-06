import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { useNavigate } from 'react-router-dom';
import {
  faArrowRightFromBracket,
  faBitcoinSign,
  faKey,
  faLock,
  faMoneyBillTransfer,
  faPaperPlane,
  faQrcode,
  faSeedling,
  faTriangleExclamation,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICRC1Coin } from '../../../features/wallet/components/ICRC1Coin';
import { walletService } from '@shared/services/wallet.service';
import { Manage } from '../../../features/wallet/views/Manage';
import { Receive } from '../../../features/wallet/views/Receive';
import { SendToken } from '../../../features/wallet/views/SendToken';
import theCoin from './../../../assets/json/coins.json';
import {
  getCurrencyByCode,
  getWalletInfo,
  saveCurrencyToWallet,
  saveRatesByCode,
} from '@shared/lib/utils/IndexedDb';
import { Currency } from '../../../features/wallet/interfaces/Currency';
import { WalletInfo } from '../../../features/wallet/interfaces/Wallet';
import { InputField } from '../../../components/atoms/InputField';
import { CoinService } from '@features/wallet/local-db/services/coinService';
import { Coin } from '@features/wallet/local-db/models/Coin';
import { clearWalletData } from '@shared/services/store.service';

interface HomeProps {
  onLockChanged: () => void;
}

export const Home: React.FC<HomeProps> = ({ onLockChanged }) => {
  const { wallet, setWallet, setIsGeneratedSeedPhrase } = useWallet();
  const navigate = useNavigate();
  const [isOpenWalletAddress, setIsOpenWalletAddress] = useState(false);
  const [isModalOpenKey, setIsModalOpenKey] = useState(false);
  const [isModalOpenKeyPKSP, setIsModalOpenKeyPKSP] = useState('');
  const [myBalance, setMyBalance] = useState(0);
  const [currency, setCurrency] = useState<Currency>({
    currency_name: '',
    currency: '',
    symbol: '',
    flag_url: '',
    rates: 0,
  });
  const [openButton, setOpenButton] = useState({
    send: false,
    receive: false,
    manage: false,
  });
  const [_tokenBalances, setTokenBalances] = useState<{
    [canisterId: string]: number;
  }>({});
  const [activeCoins, setActiveCoins] = useState<Coin[]>([]);
  const defaultCoins: Coin[] = theCoin as Coin[];

  useEffect(() => {
    async function bootstrap() {
      try {
        // 1) Currency
        const myWallet = (await getWalletInfo()) as WalletInfo;
        await fetchAPICurrency(myWallet ? myWallet.currency.currency : 'USD');

        // 2) Seed dulu (first run), lalu pastikan coin baru di JSON ikut masuk
        await CoinService.seedIfEmpty(defaultCoins);
        await CoinService.addManyIfMissing(defaultCoins);

        // 3) Ambil coin aktif dari DB (bukan dari file JSON)
        const actives = await CoinService.getCoinActive();
        setActiveCoins(actives);
      } catch (error) {
        console.error('Error bootstrapping wallet:', error);
        // fallback visual saja kalau DB error
        setActiveCoins(defaultCoins.filter((c) => c.isChecked === 1));
      }
    }

    if (!openButton.manage) {
      bootstrap();
    }
  }, [openButton.manage]);

  // Function to update a token's balance and recalculate total
  const updateTokenBalance = useCallback((canisterId: string, balanceUsd: number) => {
    setTokenBalances((prev) => {
      const newBalances = { ...prev, [canisterId]: balanceUsd };
      const total = Object.values(newBalances).reduce((sum, value) => sum + value, 0);
      setMyBalance(total);
      return newBalances;
    });
  }, []);

  const handleClearData = async () => {
    try {
      await clearWalletData();
      setWallet({
        encryptedSeedPhrase: null,
        principalId: null,
        accountId: null,
        encryptedPrivateKey: null,
        lock: null,
        verificationData: null,
      });
      setIsGeneratedSeedPhrase(false);
      navigate('/login');
    } catch (error) {
      console.error('Error clearing wallet data:', error);
    }
  };

  const fetchAPICurrency = async (currency: string) => {
    const url = 'https://open.er-api.com/v6/latest/USD';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }

      const json = await response.json();
      const cur = (await getCurrencyByCode(currency)) as Currency;
      const result = {
        currency_name: cur.currency_name,
        currency: cur.currency,
        symbol: cur.symbol,
        rates: json.rates[currency],
        flag_url: cur.flag_url,
      };
      await saveRatesByCode(currency, json.rates[currency]);
      await saveCurrencyToWallet(result);
      setCurrency(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCloseLock = async () => {
    await walletService.closeLock();
    onLockChanged();
  };

  return (
    <div className="flex flex-col overflow-y-auto">
      {/* section 1  */}
      <section className="p-6 bg-background flex flex-col gap-8 relative ">
        {/* background  */}
        <div className="bg-radial absolute top-0 left-0 w-full h-full z-0 opacity-30"></div>
        <div className="flex items-center gap-3 justify-between z-10">
          {/* Network  */}
          <div className="flex gap-6">
            {/* <button
              className="bg-background shadow-arise-sm hover:shadow-flat-sm w-12 h-12 flex justify-center items-center rounded-xl duration-300 opacity-80 hover:opacity-100"
              onClick={() => setIsOpenWalletAddress(!isOpenWalletAddress)}
            >
              <FontAwesomeIcon icon={faGear} className="text-md" />
            </button> */}
            {/* Lock  */}
            <button
              className="bg-background shadow-arise-sm hover:shadow-flat-sm w-12 h-12 flex justify-center items-center rounded-xl duration-300 opacity-80 hover:opacity-100"
              onClick={handleCloseLock}
            >
              <FontAwesomeIcon icon={faLock} className="text-md" />
            </button>
          </div>
          {/* MODAL =================================================== */}
          <div
            className={`fixed right-[370px] top-6 ${
              isOpenWalletAddress ? 'flex' : 'hidden'
            } justify-start flex-col bg-background py-6 px-10 mx-6 rounded-b-2xl rounded-tl-2xl gap-5 duration-300`}
          >
            {/* Peridot Wallet Address */}
            <div className="flex justify-between mb-1 items-center">
              <div></div>
              <p className="text-lg font-semibold">Settings</p>
              <button onClick={() => setIsOpenWalletAddress(false)}>
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
            {/* Change Currency  */}
            <button
              onClick={() => fetchAPICurrency(currency.currency == 'USD' ? 'IDR' : 'USD')}
              className="flex gap-3 items-center hover:scale-105 duration-300"
            >
              <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                <FontAwesomeIcon icon={faMoneyBillTransfer} className="text-blue-400 size-5" />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-md font-semibold">Change Currency</p>
                <p>{currency.currency + ' - ' + currency.currency_name}</p>
              </div>
            </button>
            {/* Seed Phrase */}
            <button
              onClick={() => {
                setIsModalOpenKey(true);
                setIsModalOpenKeyPKSP('seedPhrase');
              }}
              className="flex gap-5 justify-between items-center hover:scale-105 duration-300"
            >
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                  <FontAwesomeIcon icon={faSeedling} className="text-accent size-5" />
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-md font-semibold">Seed Phrase</p>
                  <p>click to reveal your seed phrase</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faLock} className="text-muted-foreground" />
            </button>
            {/* Private Key */}
            <button
              onClick={() => {
                setIsModalOpenKey(true);
                setIsModalOpenKeyPKSP('privateKey');
              }}
              className="flex gap-5 justify-between items-center hover:scale-105 duration-300"
            >
              <div className="flex gap-3 items-center">
                <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                  <FontAwesomeIcon icon={faKey} className="text-chart-3 size-5" />
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-md font-semibold">Private Key</p>
                  <p>click to reveal your private key</p>
                </div>
              </div>
              <FontAwesomeIcon icon={faLock} className="text-muted-foreground" />
            </button>
          </div>
          {/* Logout  */}
          <button
            onClick={handleClearData}
            className="w-12 h-12 flex justify-center items-center rounded-xl bg-background shadow-arise-sm hover:shadow-flat-sm opacity-80 hover:opacity-100 duration-300"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="text-md" />
          </button>
        </div>

        <p className="text-5xl my-5 text-center z-10">
          {currency.symbol + myBalance.toLocaleString()}
        </p>

        <div className="flex gap-7 z-10 items-center justify-center">
          {/* Send */}
          <div className=" flex flex-col items-center gap-3 opacity-80 hover:opacity-100 duration-300">
            <button
              className="bg-background shadow-arise-sm hover:shadow-flat-sm w-[45px] h-[45px] flex items-center justify-center rounded-xl aspect-square hover:scale-105 duration-300"
              onClick={() =>
                setOpenButton({
                  send: true,
                  receive: false,
                  manage: false,
                })
              }
            >
              <FontAwesomeIcon icon={faPaperPlane} className="size-5" />
            </button>
            <p className="text-sm">Send</p>
          </div>
          {/* Receive */}
          <div className=" flex flex-col items-center gap-3 opacity-80 hover:opacity-100 duration-300">
            <button
              className="bg-background shadow-arise-sm hover:shadow-flat-sm w-[45px] h-[45px] flex items-center justify-center rounded-xl aspect-square hover:scale-105 duration-300"
              onClick={() =>
                setOpenButton({
                  send: false,
                  receive: true,
                  manage: false,
                })
              }
            >
              <FontAwesomeIcon icon={faQrcode} className="size-5" />
            </button>
            <p className="text-sm">Receive</p>
          </div>
          {/* Manage */}
          <div className=" flex flex-col items-center gap-3 opacity-80 hover:opacity-100 duration-300">
            <button
              className="bg-background shadow-arise-sm hover:shadow-flat-sm w-[45px] h-[45px] flex items-center justify-center rounded-xl aspect-square hover:scale-105 duration-300"
              onClick={() =>
                setOpenButton({
                  send: false,
                  receive: false,
                  manage: true,
                })
              }
            >
              <FontAwesomeIcon icon={faBitcoinSign} className="size-5" />
            </button>
            <p className="text-sm">Manage</p>
          </div>
        </div>

        {isModalOpenKey && (
          <ModalOpenKey
            pkORsp={isModalOpenKeyPKSP}
            onClose={() => setIsModalOpenKey(false)}
            onConfirm={async (password: string, pkORsp: string): Promise<string> => {
              if (wallet.encryptedPrivateKey && wallet.encryptedSeedPhrase && password) {
                try {
                  const decrypt = await walletService.decryptWalletData(
                    pkORsp === 'seedPhrase'
                      ? wallet.encryptedSeedPhrase
                      : wallet.encryptedPrivateKey,
                    password,
                  );

                  // Validate the decrypted data
                  const isSeedPhrase = decrypt.includes(' ');
                  if (isSeedPhrase) {
                    // For seed phrases: only allow letters and spaces
                    if (!/^[a-z\s]+$/i.test(decrypt)) {
                      throw new Error('Incorrect password');
                    }
                  } else {
                    // For private keys: only allow hex characters
                    if (!/^[0-9a-f]+$/i.test(decrypt)) {
                      throw new Error('Incorrect password');
                    }
                  }
                  return decrypt;
                } catch (e) {
                  throw new Error('Incorrect password');
                }
              }
              throw new Error('No encrypted data available');
            }}
          />
        )}
      </section>

      {/* section 2  */}
      <section className="flex flex-col gap-4 p-6">
        {/* Map through all tokens including ICP */}
        {activeCoins.map((item, index) => (
          <ICRC1Coin
            key={index}
            canisterId={item.coinAddress}
            onBalanceUpdate={updateTokenBalance}
          />
        ))}
      </section>

      {/* Modal Wallets  */}
      <div className="z-10">
        {openButton.send ? (
          <SendToken
            onClose={() =>
              setOpenButton({
                send: false,
                receive: false,
                manage: false,
              })
            }
            onLockChanged={onLockChanged}
          />
        ) : openButton.manage ? (
          <Manage
            onClose={() =>
              setOpenButton({
                send: false,
                receive: false,
                manage: false,
              })
            }
          />
        ) : openButton.receive ? (
          <Receive
            onClose={() =>
              setOpenButton({
                send: false,
                receive: false,
                manage: false,
              })
            }
          />
        ) : (
          ''
        )}
      </div>
    </div>
  );
};

interface ModalOpenKeyProps {
  pkORsp: string;
  onClose: () => void;
  onConfirm: (password: string, pkORsp: string) => Promise<string>;
}

const ModalOpenKey: React.FC<ModalOpenKeyProps> = ({ pkORsp, onClose, onConfirm }) => {
  // ModalOpenKey component remains unchanged
  const [password, setPassword] = useState('');
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdownHold, setCountdownHold] = useState(3);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const title =
    pkORsp === 'seedPhrase' ? 'Seed Phrase' : pkORsp === 'privateKey' ? 'Private Key' : 'none';

  const handleConfirm = async () => {
    try {
      setError(null);
      const result = await onConfirm(password, pkORsp);
      setDecryptedKey(result);
      // Start countdown from
      setCountdown(60);
    } catch (err) {
      setError('Failed to decrypt. Please check your password.');
    }
  };

  const startHolding = () => {
    if (password.length === 0) return;

    setIsHolding(true);
    setCountdownHold(3);

    const countdownInterval = window.setInterval(() => {
      setCountdownHold((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          stopHolding();
          handleConfirm(); // Call confirm function after countdown
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopHolding = () => {
    if (holdTimeRef.current) {
      clearInterval(holdTimeRef.current);
      holdTimeRef.current = null;
    }
    setIsHolding(false);
    setCountdownHold(3);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    let intervalId: number;

    if (countdown > 0) {
      intervalId = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(intervalId);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [countdown, onClose]);

  const copyToClipboard = (data: string) => {
    if (!data) return;
    navigator.clipboard.writeText(data).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div
      onClick={onClose}
      className="bg-black/40 fixed top-0 left-20 w-full h-full flex justify-center items-center  z-10"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-background p-10 rounded-2xl flex flex-col items-center gap-6 w-[400px]"
      >
        <p className="font-bold text-lg">Show {title}</p>
        <div className="flex flex-col gap-3 w-full ">
          <p>Enter your password</p>
          <InputField
            value={password}
            onChange={setPassword}
            placeholder="Password"
            disabled={decryptedKey !== null ? true : false}
          />
          {error && <p className="text-chart-5 text-sm">{error}</p>}
          {decryptedKey && (
            <button
              className="bg-card p-3 rounded-lg break-all hover:scale-105 duration-300"
              onClick={() => {
                copyToClipboard(decryptedKey);
              }}
            >
              <p className="text-start animate-pulse">{decryptedKey}</p>
            </button>
          )}
        </div>
        <div className="bg-chart-5/10 font-bold p-3 pr-5 items-start flex gap-3 border-l-4 border-chart-5 rounded-r-lg">
          <FontAwesomeIcon icon={faTriangleExclamation} className="size-6 text-chart-5" />
          <p className="">
            {decryptedKey !== null
              ? 'Your ' +
                title +
                ' provides full access to your wallet and funds. Do not share this with anyone.'
              : 'Warning: Never disclose this key. Anyone with your ' +
                title +
                ' can steal any assets held in your account.'}
          </p>
        </div>
        <div className="flex w-full gap-6">
          <button
            onClick={onClose}
            className="border w-1/2 border-accent_secondary p-3 rounded-2xl text-accent_secondary font-bold hover:scale-105 duration-300"
          >
            Cancel
          </button>
          <button
            onMouseDown={startHolding}
            onMouseUp={stopHolding}
            onMouseLeave={stopHolding}
            onTouchStart={startHolding}
            onTouchEnd={stopHolding}
            className={`w-1/2 ${
              password.length === 0 || decryptedKey !== null
                ? 'bg-accent_secondary/30 text-muted-foreground'
                : 'bg-accent_secondary hover:scale-105'
            } p-3 rounded-2xl font-bold duration-300 overflow-hidden`}
            disabled={password.length === 0 || decryptedKey !== null}
          >
            <span className="relative z-10">
              {isHolding ? `Hold... ${countdownHold}` : 'Confirm'}
            </span>
          </button>
        </div>
        {decryptedKey && (
          <p className="text-sm text-muted-foreground">
            This page will close in {countdown} seconds
          </p>
        )}
      </div>
    </div>
  );
};
