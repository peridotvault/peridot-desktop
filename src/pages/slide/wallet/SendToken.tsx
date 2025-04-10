import {
  faAddressBook,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useState } from "react";
import { InputField } from "../../../components/InputField";
import { shortenAddress } from "../../../components/AdditionalComponent";
import { Principal } from "@dfinity/principal";
import localforage from "localforage";
import { ICRC1Coin } from "../../../components/wallet/ICRC1Coin";
import { transferTokenICRC1 } from "../../../contexts/CoinContext";
import { useWallet } from "../../../contexts/WalletContext";
import { TransactionSuccess } from "../../additional/TransactionSuccess";
import { SaveContact } from "../../additional/SaveContact";
import { TransactionFailed } from "../../additional/TransactionFailed";
import theCoin from "./../../../assets/json/coins.json";

interface Props {
  onClose: () => void;
  onLockChanged: () => void;
}

interface Coin {
  network: string;
  address: string;
  balance: number;
  name: string;
  symbol: string;
  logo: string;
  isChecked: boolean;
}

export interface Contact {
  icon: string;
  username: string;
  address: string;
}

export const SendToken: React.FC<Props> = ({ onClose, onLockChanged }) => {
  const { wallet } = useWallet();
  const [sendTokenAddress, setSendTokenAddress] = useState("");
  const [finalAddress, setFinalAddress] = useState<Principal | null>(null);
  const [myContacts, setMyContacts] = useState<Contact[] | null>(null);

  useEffect(() => {
    async function loadContacts() {
      const savedContact = await localforage.getItem<Contact[]>("contacts");
      setMyContacts(savedContact);
    }

    loadContacts();
  }, []);

  // Coins
  // const [isLoading, setIsLoading] = useState(true);
  const [_tokenBalances, setTokenBalances] = useState<{
    [canisterId: string]: number;
  }>({});
  const defaultCoins: Coin[] = theCoin;
  const [listCoins, setListCoins] = useState<Coin[]>([]);

  async function loadCoins() {
    try {
      const savedCoins = await localforage.getItem<Coin[]>("coins");

      if (savedCoins && savedCoins.length > 0) {
        // Create a merged list with both saved and default coins
        const mergedCoins = mergeCoins(defaultCoins, savedCoins);
        setListCoins(mergedCoins);
      } else {
        setListCoins(defaultCoins);
      }
    } catch (error) {
      console.error("Error loading coins:", error);
      setListCoins(defaultCoins);
    }
  }

  useEffect(() => {
    loadCoins();
  }, []);

  const mergeCoins = (defaults: Coin[], saved: Coin[]): Coin[] => {
    // Create a map for quick lookup of saved coins
    const savedCoinsMap = new Map(saved.map((coin) => [coin.address, coin]));

    // Start with processed defaults that preserve user preferences
    const result: Coin[] = defaults.map((defaultCoin) => {
      const savedCoin = savedCoinsMap.get(defaultCoin.address);

      // If user has this coin saved, use their preference for isChecked
      if (savedCoin) {
        savedCoinsMap.delete(defaultCoin.address); // Remove from map to track processed coins
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
    (canisterId: string, balanceUsd: number) => {
      setTokenBalances((prev) => {
        const newBalances = { ...prev, [canisterId]: balanceUsd };
        return newBalances;
      });
    },
    []
  );

  // Save Contact
  const [isOpenModalSaveContact, setIsOpenModalSaveContact] = useState(false);

  // Send Transaction Page
  const [finalCoinAddress, setFinalCoinAddress] = useState<Principal | null>();
  const [amountCoin, setAmountCoin] = useState<number>(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  async function handleSend() {
    try {
      const result = await transferTokenICRC1(
        finalAddress!,
        amountCoin,
        finalCoinAddress!,
        wallet
      );
      if (result) {
        console.log("Success");
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
        onLockChanged();
      }, 2000);
      console.log("Error Send : " + error);
    }
  }

  return (
    <div className="fixed top-0 right-0 w-[370px] bg-background_primary h-full p-6 flex flex-col gap-6">
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
          text={sendTokenAddress ? sendTokenAddress : ""}
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
                  <p className="text-md font-semibold">{"@" + item.username}</p>
                  <p>{shortenAddress(item.address, 20, 4)}</p>
                </div>
              </div>
            </button>
          ))}
        </section>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-text_disabled pb-20">
          <p>You Don't Have Contact</p>
        </div>
      )}

      {/* Choose Coin  */}
      {finalAddress ? (
        <div className="fixed top-0 right-0 w-[370px] bg-background_primary h-full p-6 flex flex-col gap-6">
          {/* header  */}
          <section className="flex justify-between items-center">
            <button
              onClick={() => {
                setSendTokenAddress("");
                setFinalAddress(null);
                setFinalCoinAddress(null);
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
            ""
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
                    onClick={() => {
                      try {
                        const coinAddress = Principal.fromText(item.address);
                        setFinalCoinAddress(coinAddress);
                      } catch (err) {
                        setFinalCoinAddress(null);
                      }
                    }}
                  >
                    <ICRC1Coin
                      canisterId={item.address}
                      onBalanceUpdate={updateTokenBalance}
                    />
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
                <div className="flex items-center gap-2">
                  <InputField
                    onChange={(e) => {
                      setAmountCoin(Number(e));
                    }}
                    placeholder="Amount"
                    type="number"
                    text={amountCoin ? amountCoin.toString() : ""}
                  />
                  <div className="flex gap-8 items-center">
                    <p className="text-lg">PER</p>
                    {/* <button className="text-sm shadow-arise-sm hover:shadow-flat-sm py-2 px-4 rounded-full">
                      max
                    </button> */}
                  </div>
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
                  className="w-full text-lg rounded-lg font bg-gradient-to-tr from-accent_primary to-accent_secondary p-2 hover:scale-105 duration-300"
                >
                  Send
                </button>
              </div>

              {/* success modal */}
              {showSuccess ? <TransactionSuccess msg="Success" /> : ""}
              {showFailed ? (
                <TransactionFailed msg="Your Session is Over" />
              ) : (
                ""
              )}
            </section>
          )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
};
