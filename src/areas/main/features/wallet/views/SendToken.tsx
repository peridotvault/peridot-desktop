import { faAddressBook, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useCallback, useEffect, useState } from 'react';
import { InputField } from '@components/atoms/InputField';
import { shortenAddress } from '@shared/utils/Additional';
import { Principal } from '@dfinity/principal';
import { ICRC1Coin } from '../components/ICRC1Coin';
import { useWallet } from '@shared/contexts/WalletContext';
import { SaveContact } from '../components/SaveContact';
import theCoin from '@shared/assets/json/coins.json';
import { AlertMessage } from '../components/AlertMessage';
import { Coin } from '@features/wallet/local-db/models/Coin';
import { CoinService } from '@features/wallet/local-db/services/coinService';
import { transferTokenICRC1 } from '../blockchain/icp/services/ICPCoinService';
import { KV_KEYS } from '@shared/database/kv-keys';
import { STORAGE_EVENTS } from '@shared/database/events';
import { getKvItem } from '@shared/services/local-db/kv-key';

interface Props {
  onClose: () => void;
}

// interface Coin {
//   network: string;
//   address: string;
//   balance: number;
//   name: string;
//   symbol: string;
//   logo: string;
//   isChecked: boolean;
// }

export interface Contact {
  icon: string;
  username: string;
  address: string;
}

export const SendToken: React.FC<Props> = ({ onClose }) => {
  const { wallet } = useWallet();
  const [sendTokenAddress, setSendTokenAddress] = useState('');
  const [finalAddress, setFinalAddress] = useState<Principal | null>(null);
  const [myContacts, setMyContacts] = useState<Contact[] | null>(null);

  useEffect(() => {
    let active = true;

    async function loadContacts() {
      const savedContact = await getKvItem<Contact[]>(KV_KEYS.contacts);
      if (active) {
        setMyContacts(savedContact ?? null);
      }
    }

    loadContacts();

    const handler = () => loadContacts();
    window.addEventListener(STORAGE_EVENTS.contactsChanged, handler);

    return () => {
      active = false;
      window.removeEventListener(STORAGE_EVENTS.contactsChanged, handler);
    };
  }, []);

  // Coins
  // const [isLoading, setIsLoading] = useState(true);
  // const [tokenBalances, setTokenBalances] = useState<{
  // [canisterId: string]: number;
  // }>({});
  const [tokenBalances, setTokenBalances] = useState<number>(0);
  const defaultCoins: Coin[] = theCoin;
  const [listCoins, setListCoins] = useState<Coin[]>([]);

  async function loadCoins() {
    try {
      const savedCoins = await CoinService.getAll();

      if (savedCoins && savedCoins.length > 0) {
        // Create a merged list with both saved and default coins
        const mergedCoins = mergeCoins(defaultCoins, savedCoins);
        setListCoins(mergedCoins);
      } else {
        setListCoins(defaultCoins);
      }
    } catch (error) {
      console.error('Error loading coins:', error);
      setListCoins(defaultCoins);
    }
  }

  useEffect(() => {
    loadCoins();
  }, []);

  const mergeCoins = (defaults: Coin[], saved: Coin[]): Coin[] => {
    // Create a map for quick lookup of saved coins
    const savedCoinsMap = new Map(saved.map((coin) => [coin.coinAddress, coin]));

    // Start with processed defaults that preserve user preferences
    const result: Coin[] = defaults.map((defaultCoin) => {
      const savedCoin = savedCoinsMap.get(defaultCoin.coinAddress);

      // If user has this coin saved, use their preference for isChecked
      if (savedCoin) {
        savedCoinsMap.delete(defaultCoin.coinAddress); // Remove from map to track processed coins
        return {
          ...defaultCoin,
          isChecked: savedCoin.isChecked,
        };
      }

      // This is a new coin the user hasn't seen before
      return defaultCoin;
    });

    // Add any remaining saved coins that aren't in defaults
    // (This would be rare but ensures we don't lose user data)
    savedCoinsMap.forEach((coin) => {
      result.push(coin);
    });

    return result;
  };

  const updateTokenBalance = useCallback(
    (_canisterId: string, _balanceUsd: number, balanceToken: number) => {
      setTokenBalances(balanceToken);
    },
    [],
  );

  // Save Contact
  const [isOpenModalSaveContact, setIsOpenModalSaveContact] = useState(false);

  // Send Transaction Page
  const [finalCoinAddress, setFinalCoinAddress] = useState<Principal | null>();
  const [coinMetadata, setCoinMetadata] = useState<Coin | null>(null);
  const [amountCoin, setAmountCoin] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  const canSend = Boolean(Number(amountCoin) < tokenBalances);

  async function handleSend() {
    if (!canSend) return;
    try {
      const result = await transferTokenICRC1(
        finalAddress!,
        Number(amountCoin),
        finalCoinAddress!,
        coinMetadata!.fee,
        wallet,
      );
      if (result) {
        console.log('Success');
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setFinalCoinAddress(null);
        }, 2000);
      }
    } catch (error) {
      setShowFailed(true);
      setTimeout(() => {
        setShowFailed(false);
      }, 2000);
      console.log('Error Send : ' + error);
    }
  }

  return (
    <div className="fixed top-0 left-20 w-[370px] bg-background h-full p-6 flex flex-col gap-6">
      {/* header  */}
      <section className="flex justify-between items-center">
        <button
          onClick={onClose}
          className=" w-10 h-10 flex justify-center items-center rounded-xl"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
        </button>
        <p className="text-lg font-semibold">Send</p>
        <div className="w-10 h-10"></div>
      </section>

      {/* To  */}
      <section className="flex items-center">
        <p className="w-12 text-lg">To :</p>
        <InputField
          onChange={(e) => {
            setSendTokenAddress(e);
            try {
              const principal = Principal.fromText(e);
              setFinalAddress(principal);
            } catch (err) {
              setFinalAddress(null);
            }
          }}
          placeholder="Address, Principal or Contact"
          type="text"
          value={sendTokenAddress ? sendTokenAddress : ''}
        />
      </section>

      {/* content  */}
      {myContacts ? (
        <section className="flex flex-col gap-4">
          <p className="text-lg">My Contacts</p>
          {myContacts.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                try {
                  const address = item.address;
                  setFinalAddress(Principal.fromText(address));
                } catch (err) {
                  setFinalAddress(null);
                }
              }}
              className="flex gap-4 items-center justify-between hover:scale-105 duration-300"
            >
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                  <p className="size-5">{item.icon}</p>
                </div>
                <div className="flex flex-col items-start">
                  <p className="text-md font-semibold">{'@' + item.username}</p>
                  <p>{shortenAddress(item.address, 20, 4)}</p>
                </div>
              </div>
            </button>
          ))}
        </section>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-muted-foreground pb-20">
          <p>You Don't Have Contact</p>
        </div>
      )}

      {/* Choose Coin  */}
      {finalAddress ? (
        <div className="fixed top-0 left-0 w-[370px] bg-background h-full p-6 flex flex-col gap-6">
          {/* header  */}
          <section className="flex justify-between items-center">
            <button
              onClick={() => {
                setSendTokenAddress('');
                setFinalAddress(null);
                setFinalCoinAddress(null);
                setCoinMetadata(null);
              }}
              className=" w-10 h-10 flex justify-center items-center rounded-xl"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
            </button>
            <p className="text-lg font-semibold">Choose Coin</p>
            <div className="w-10 h-10"></div>
          </section>

          {/* To  */}
          <section className="flex items-center justify-between">
            <div className="flex items-center">
              <p className="w-12 text-lg">To :</p>
              <p>{shortenAddress(finalAddress.toText(), 12, 4)}</p>
            </div>
            <button
              onClick={() => setIsOpenModalSaveContact(true)}
              className="flex items-center gap-2 rounded-lg hover:shadow-flat-sm hover:scale-105 duration-300 shadow-arise-sm py-2 px-4"
            >
              <FontAwesomeIcon icon={faAddressBook} />
              <p>Save</p>
            </button>
          </section>

          {isOpenModalSaveContact ? (
            <SaveContact
              onClose={() => setIsOpenModalSaveContact(false)}
              address={finalAddress.toText()}
            />
          ) : (
            ''
          )}

          {finalCoinAddress == null ? (
            <section className="flex flex-col gap-4">
              <p className="text-lg font-medium">Tokens</p>
              <div className="flex flex-col gap-4">
                {/* Map through all tokens including ICP */}
                {listCoins.map((item, index) => (
                  <button
                    key={index}
                    className="hover:scale-105 duration-300 px-2"
                    onClick={async () => {
                      try {
                        const coinAddress = Principal.fromText(item.coinAddress);
                        const theCoinMetadata = await CoinService.getByAddress(item.coinAddress);

                        setFinalCoinAddress(coinAddress);
                        setCoinMetadata(theCoinMetadata!);
                      } catch (err) {
                        setFinalCoinAddress(null);
                        setCoinMetadata(null);
                      }
                    }}
                  >
                    <ICRC1Coin canisterId={item.coinAddress} onBalanceUpdate={updateTokenBalance} />
                  </button>
                ))}
              </div>
            </section>
          ) : (
            <section className="flex flex-col gap-4 justify-between h-full">
              <div className="flex flex-col gap-4">
                {/* Coin Details  */}
                <div className="p-4">
                  <ICRC1Coin
                    canisterId={finalCoinAddress.toText()}
                    onBalanceUpdate={updateTokenBalance}
                  />
                </div>

                {/* Amount  */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <InputField
                      onChange={(e) => {
                        e = e.replace(/,/g, '.');

                        if (e === '' || e === '0') {
                          setAmountCoin(e);
                          return;
                        }

                        if (/^0+[1-9][0-9]*$/.test(e)) {
                          e = e.replace(/^0+/, '');
                        }

                        if (/^(0|([1-9][0-9]*))([.,][0-9]*)?$/.test(e)) {
                          setAmountCoin(e);
                        }
                      }}
                      placeholder="Amount"
                      type="text"
                      value={amountCoin ? amountCoin : ''}
                    />
                    <div className="flex gap-8 items-center">
                      <p className="text-lg">{coinMetadata?.symbol}</p>
                      {/* <button className="text-sm shadow-arise-sm hover:shadow-flat-sm py-2 px-4 rounded-full">
                      max
                      </button> */}
                    </div>
                  </div>
                  {!canSend && (
                    <p className="text-sm text-chart-5">
                      Amount exceeds balance ({tokenBalances} {coinMetadata?.symbol})
                    </p>
                  )}
                </div>
              </div>

              {/* Send  */}
              <div className="flex flex-col gap-4">
                {/* <div>
                  <p className="text-lg">Fee</p>
                  <p className="text-lg">{0} PER</p>
                </div> */}
                <button
                  onClick={handleSend}
                  disabled={!canSend}
                  className={`w-full text-lg rounded-lg font bg-linear-to-tr from-accent-foreground to-accent p-2  duration-300 ${
                    canSend ? 'hover:scale-105' : 'opacity-50'
                  } `}
                >
                  Send
                </button>
              </div>

              {/* success modal */}
              {showSuccess && <AlertMessage msg="Success" isSuccess={showSuccess} />}
              {showFailed && <AlertMessage msg="Your Session is Over" isSuccess={showFailed} />}
            </section>
          )}
        </div>
      ) : (
        ''
      )}
    </div>
  );
};
