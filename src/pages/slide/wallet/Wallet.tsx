import React, { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "../../../contexts/WalletContext";
import { clearWalletData } from "../../../utils/StoreService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  faArrowRightFromBracket,
  faBitcoinSign,
  faBuildingColumns,
  // faClone,
  faKey,
  faLock,
  faPaperPlane,
  faPuzzlePiece,
  faQrcode,
  faSeedling,
  faTriangleExclamation,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICRC1Coin } from "../../../components/wallet/ICRC1Coin";
import { InputField } from "../../../components/InputField";
import { walletService } from "../../../utils/WalletService";
import { EncryptedData } from "@antigane/encryption";
import { Manage } from "./Manage";
import { Receive } from "./Receive";
import { Nft } from "./Nft";
import { SendToken } from "./SendToken";
import localforage from "localforage";
import theCoin from "./../../../assets/json/coins.json";

interface NavbarProps {
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

export const Wallet: React.FC<NavbarProps> = ({ onClose, onLockChanged }) => {
  const { wallet, setWallet, setIsGeneratedSeedPhrase } = useWallet();
  const navigate = useNavigate();
  const [isOpenWalletAddress, setIsOpenWalletAddress] = useState(false);
  const [isModalOpenKey, setIsModalOpenKey] = useState(false);
  const [isModalOpenKeyPKSP, setIsModalOpenKeyPKSP] = useState("");
  const [myBalance, setMyBalance] = useState(0);
  const [openButton, setOpenButton] = useState({
    send: false,
    receive: false,
    manage: false,
    nft: false,
  });
  const [_tokenBalances, setTokenBalances] = useState<{
    [canisterId: string]: number;
  }>({});
  const [activeCoins, setActiveCoins] = useState<Coin[]>([]);
  const defaultCoins: Coin[] = theCoin;

  useEffect(() => {
    async function loadCoins() {
      try {
        const savedCoins = await localforage.getItem<Coin[]>("coins");

        if (savedCoins && savedCoins.length > 0) {
          const activeSavedCoins = savedCoins.filter((coin) => coin.isChecked);
          setActiveCoins(activeSavedCoins);
        } else {
          const activeDefaultCoins = defaultCoins.filter(
            (coin) => coin.isChecked
          );
          setActiveCoins(activeDefaultCoins);
        }
      } catch (error) {
        console.error("Error loading coins:", error);
        setActiveCoins(defaultCoins);
      }
    }

    if (!openButton.manage) {
      loadCoins();
    }
  }, [openButton.manage]);

  // Function to update a token's balance and recalculate total
  const updateTokenBalance = useCallback(
    (canisterId: string, balanceUsd: number) => {
      setTokenBalances((prev) => {
        const newBalances = { ...prev, [canisterId]: balanceUsd };
        const total = Object.values(newBalances).reduce(
          (sum, value) => sum + value,
          0
        );
        setMyBalance(total);
        return newBalances;
      });
    },
    []
  );

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
      navigate("/login");
    } catch (error) {
      console.error("Error clearing wallet data:", error);
    }
  };

  const shortenAddress = (
    address: string | null,
    firstSlice: number,
    secondSlice: number
  ) => {
    if (address)
      return `${address.slice(0, firstSlice)}...${address.slice(-secondSlice)}`;
  };

  const copyToClipboard = (data: EncryptedData | string | null) => {
    if (!data) return;
    const textToCopy = typeof data === "string" ? data : data.data;
    navigator.clipboard.writeText(textToCopy).catch((err) => {
      console.error("Failed to copy: ", err);
    });
  };

  const handleCloseLock = async () => {
    await walletService.closeLock();
    onLockChanged();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={onClose}
      animate={{ opacity: 1 }}
      data-lenis-prevent
    >
      <motion.main
        className="w-[370px] bg-background_primary h-screen overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        <div className="flex flex-col ">
          {/* section 1  */}
          <section className="p-6 bg-background_primary flex flex-col gap-8 relative ">
            {/* background  */}
            <div className="bg-radial absolute top-0 left-0 w-full h-full z-0 opacity-30"></div>
            <div className="flex items-center gap-3 justify-between z-10">
              {/* Network  */}
              <div className="flex gap-6">
                {/* <button
                  className="bg-background_primary shadow-arise-sm hover:shadow-flat-sm w-12 h-12 flex justify-center items-center rounded-xl duration-300 opacity-80 hover:opacity-100"
                  onClick={() => setIsOpenWalletAddress(!isOpenWalletAddress)}
                >
                  <FontAwesomeIcon icon={faClone} className="text-md" />
                </button> */}
                {/* Lock  */}
                <button
                  className="bg-background_primary shadow-arise-sm hover:shadow-flat-sm w-12 h-12 flex justify-center items-center rounded-xl duration-300 opacity-80 hover:opacity-100"
                  onClick={handleCloseLock}
                >
                  <FontAwesomeIcon icon={faLock} className="text-md" />
                </button>
              </div>
              {/* MODAL =================================================== */}
              <div
                className={`absolute right-[370px] top-6 ${
                  isOpenWalletAddress ? "flex" : "hidden"
                } justify-start flex-col bg-background_primary py-6 px-10 mx-6 rounded-b-2xl rounded-tl-2xl gap-5 duration-300`}
              >
                {/* Peridot Wallet Address */}
                <div className="flex justify-between mb-1 items-center">
                  <div></div>
                  <p className="text-lg font-semibold">
                    Peridot Wallet Address
                  </p>
                  <button onClick={() => setIsOpenWalletAddress(false)}>
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                {/* Principal ID */}
                <button
                  onClick={() => copyToClipboard(wallet.principalId)}
                  className="flex gap-3 items-center hover:scale-105 duration-300"
                >
                  <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                    <img
                      src="/assets/logo-icp.svg"
                      alt="ICP Logo"
                      className="size-5"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Principal ID</p>
                    <p>{shortenAddress(wallet.principalId, 15, 10)}</p>
                  </div>
                </button>
                {/* Account ID  */}
                <button
                  onClick={() => copyToClipboard(wallet.accountId)}
                  className="flex gap-3 items-center hover:scale-105 duration-300"
                >
                  <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                    <FontAwesomeIcon
                      icon={faBuildingColumns}
                      className="text-yellow-100 size-5"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Account ID</p>
                    <p>{shortenAddress(wallet.accountId, 15, 10)}</p>
                  </div>
                </button>
                {/* Seed Phrase */}
                <button
                  onClick={() => {
                    setIsModalOpenKey(true);
                    setIsModalOpenKeyPKSP("seedPhrase");
                  }}
                  className="flex gap-5 justify-between items-center hover:scale-105 duration-300"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                      <FontAwesomeIcon
                        icon={faSeedling}
                        className="text-accent_primary size-5"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-md font-semibold">Seed Phrase</p>
                      <p>click to reveal your seed phrase</p>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-text_disabled"
                  />
                </button>
                {/* Private Key */}
                <button
                  onClick={() => {
                    setIsModalOpenKey(true);
                    setIsModalOpenKeyPKSP("privateKey");
                  }}
                  className="flex gap-5 justify-between items-center hover:scale-105 duration-300"
                >
                  <div className="flex gap-3 items-center">
                    <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                      <FontAwesomeIcon
                        icon={faKey}
                        className="text-yellow-300 size-5"
                      />
                    </div>
                    <div className="flex flex-col items-start">
                      <p className="text-md font-semibold">Private Key</p>
                      <p>click to reveal your private key</p>
                    </div>
                  </div>
                  <FontAwesomeIcon
                    icon={faLock}
                    className="text-text_disabled"
                  />
                </button>
              </div>
              {/* Logout  */}
              <button
                onClick={handleClearData}
                className="w-12 h-12 flex justify-center items-center rounded-xl bg-background_primary shadow-arise-sm hover:shadow-flat-sm opacity-80 hover:opacity-100 duration-300"
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className="text-md"
                />
              </button>
            </div>

            <p className="text-5xl my-5 text-center z-10">
              ${myBalance.toLocaleString()}
            </p>

            <div className="flex gap-7 z-10 items-center justify-center">
              {/* Send */}
              <div className=" flex flex-col items-center gap-3 opacity-80 hover:opacity-100 duration-300">
                <button
                  className="bg-background_primary shadow-arise-sm hover:shadow-flat-sm w-[45px] h-[45px] flex items-center justify-center rounded-xl aspect-square hover:scale-105 duration-300"
                  onClick={() =>
                    setOpenButton({
                      send: true,
                      receive: false,
                      manage: false,
                      nft: false,
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
                  className="bg-background_primary shadow-arise-sm hover:shadow-flat-sm w-[45px] h-[45px] flex items-center justify-center rounded-xl aspect-square hover:scale-105 duration-300"
                  onClick={() =>
                    setOpenButton({
                      send: false,
                      receive: true,
                      manage: false,
                      nft: false,
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
                  className="bg-background_primary shadow-arise-sm hover:shadow-flat-sm w-[45px] h-[45px] flex items-center justify-center rounded-xl aspect-square hover:scale-105 duration-300"
                  onClick={() =>
                    setOpenButton({
                      send: false,
                      receive: false,
                      manage: true,
                      nft: false,
                    })
                  }
                >
                  <FontAwesomeIcon icon={faBitcoinSign} className="size-5" />
                </button>
                <p className="text-sm">Manage</p>
              </div>

              {/* Nft */}
              <div className=" flex flex-col items-center gap-3 opacity-80 hover:opacity-100 duration-300">
                <button
                  className="bg-background_primary shadow-arise-sm hover:shadow-flat-sm w-[45px] h-[45px] flex items-center justify-center rounded-xl aspect-square hover:scale-105 duration-300"
                  onClick={() =>
                    setOpenButton({
                      send: false,
                      receive: false,
                      manage: false,
                      nft: true,
                    })
                  }
                >
                  <FontAwesomeIcon icon={faPuzzlePiece} className="size-5" />
                </button>
                <p className="text-sm">NFT</p>
              </div>
            </div>

            {isModalOpenKey && (
              <ModalOpenKey
                pkORsp={isModalOpenKeyPKSP}
                onClose={() => setIsModalOpenKey(false)}
                onConfirm={async (
                  password: string,
                  pkORsp: string
                ): Promise<string> => {
                  if (
                    wallet.encryptedPrivateKey &&
                    wallet.encryptedSeedPhrase &&
                    password
                  ) {
                    try {
                      const decrypt = await walletService.decryptWalletData(
                        pkORsp === "seedPhrase"
                          ? wallet.encryptedSeedPhrase
                          : wallet.encryptedPrivateKey,
                        password
                      );

                      // Validate the decrypted data
                      const isSeedPhrase = decrypt.includes(" ");
                      if (isSeedPhrase) {
                        // For seed phrases: only allow letters and spaces
                        if (!/^[a-z\s]+$/i.test(decrypt)) {
                          throw new Error("Incorrect password");
                        }
                      } else {
                        // For private keys: only allow hex characters
                        if (!/^[0-9a-f]+$/i.test(decrypt)) {
                          throw new Error("Incorrect password");
                        }
                      }
                      return decrypt;
                    } catch (e) {
                      throw new Error("Incorrect password");
                    }
                  }
                  throw new Error("No encrypted data available");
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
                canisterId={item.address}
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
                    nft: false,
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
                    nft: false,
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
                    nft: false,
                  })
                }
              />
            ) : openButton.nft ? (
              <Nft
                onClose={() =>
                  setOpenButton({
                    send: false,
                    receive: false,
                    manage: false,
                    nft: false,
                  })
                }
              />
            ) : (
              ""
            )}
          </div>
        </div>
      </motion.main>
    </motion.div>
  );
};

interface ModalOpenKeyProps {
  pkORsp: string;
  onClose: () => void;
  onConfirm: (password: string, pkORsp: string) => Promise<string>;
}

const ModalOpenKey: React.FC<ModalOpenKeyProps> = ({
  pkORsp,
  onClose,
  onConfirm,
}) => {
  // ModalOpenKey component remains unchanged
  const [password, setPassword] = useState("");
  const [decryptedKey, setDecryptedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [countdownHold, setCountdownHold] = useState(3);
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeRef = useRef<number | null>(null);
  const [countdown, setCountdown] = useState<number>(60);
  const title =
    pkORsp === "seedPhrase"
      ? "Seed Phrase"
      : pkORsp === "privateKey"
      ? "Private Key"
      : "none";

  const handleConfirm = async () => {
    try {
      setError(null);
      const result = await onConfirm(password, pkORsp);
      setDecryptedKey(result);
      // Start countdown from
      setCountdown(60);
    } catch (err) {
      setError("Failed to decrypt. Please check your password.");
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
      console.error("Failed to copy: ", err);
    });
  };

  return (
    <div
      onClick={onClose}
      className="bg-black/40 fixed top-0 right-0 w-full h-full flex justify-center items-center"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-background_primary p-10 rounded-2xl flex flex-col items-center gap-6 w-[400px]"
      >
        <p className="font-bold text-lg">Show {title}</p>
        <div className="flex flex-col gap-3 w-full ">
          <p>Enter your password</p>
          <InputField
            text={password}
            onChange={setPassword}
            placeholder="Password"
            disabled={decryptedKey !== null ? true : false}
          />
          {error && <p className="text-danger text-sm">{error}</p>}
          {decryptedKey && (
            <button
              className="bg-background_secondary p-3 rounded-lg break-all hover:scale-105 duration-300"
              onClick={() => {
                copyToClipboard(decryptedKey);
              }}
            >
              <p className="text-start animate-pulse">{decryptedKey}</p>
            </button>
          )}
        </div>
        <div className="bg-danger/10 font-bold p-3 pr-5 items-start flex gap-3 border-l-4 border-danger rounded-r-lg">
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="size-6 text-danger"
          />
          <p className="">
            {decryptedKey !== null
              ? "Your " +
                title +
                " provides full access to your wallet and funds. Do not share this with anyone."
              : "Warning: Never disclose this key. Anyone with your " +
                title +
                " can steal any assets held in your account."}
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
                ? "bg-accent_secondary/30 text-text_disabled"
                : "bg-accent_secondary hover:scale-105"
            } p-3 rounded-2xl font-bold duration-300 overflow-hidden`}
            disabled={password.length === 0 || decryptedKey !== null}
          >
            <span className="relative z-10">
              {isHolding ? `Hold... ${countdownHold}` : "Confirm"}
            </span>
          </button>
        </div>
        {decryptedKey && (
          <p className="text-sm text-text_disabled">
            This page will close in {countdown} seconds
          </p>
        )}
      </div>
    </div>
  );
};
