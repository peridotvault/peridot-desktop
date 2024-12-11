import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { clearWalletData } from "../../utils/StoreService";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  faArrowRightFromBracket,
  faBuildingColumns,
  faClone,
  faKey,
  faSeedling,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ICRC1Coin } from "../../components/wallet/ICRC1Coin";

interface NavbarProps {
  onClose: () => void;
}

export const Wallet: React.FC<NavbarProps> = ({ onClose }) => {
  const { wallet, setWallet } = useWallet();
  const navigate = useNavigate();
  const [isOpenWalletAddress, setIsOpenWalletAddress] = useState(false);

  const handleClearData = async () => {
    try {
      // Clear data from electron store
      await clearWalletData();

      // Reset wallet state to initial values
      setWallet({
        seedPhrase: null,
        principalId: null,
        accountId: null,
        privateKey: null,
        password: null,
      });

      // Navigate back to login page
      navigate("/");
    } catch (error) {
      console.error("Error clearing wallet data:", error);
    }
  };

  function shortenAddress(
    address: string | null,
    firstSlice: number,
    seccondSlice: number
  ) {
    if (address)
      return `${address.slice(0, firstSlice)}...${address.slice(
        -seccondSlice
      )}`;
  }

  return (
    <motion.div
      className="bg-black/40 fixed top-0 right-0 w-full h-full z-50 flex justify-end py-10 overflow-x-hidden"
      onClick={onClose}
      animate={{ opacity: 1 }}
    >
      <motion.main
        className="w-[370px] h-full bg-background_primary rounded-l-3xl overflow-x-hidden"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        <div className="flex flex-col">
          {/* section 1  */}
          <section className="p-6 bg-gradient-to-tr from-accent_primary/50 via-accent_secondary/50 to-accent_secondary/50 flex flex-col gap-5">
            <div className="flex items-center gap-3 justify-between">
              {/* copy address  */}
              <button
                className="bg-white/20 w-10 h-10 flex justify-center items-center rounded-xl duration-300"
                onClick={() => {
                  setIsOpenWalletAddress(!isOpenWalletAddress);
                }}
              >
                <FontAwesomeIcon icon={faClone} className="text-md" />
              </button>
              {/* MODAL =================================================== */}
              <div
                className={`absolute right-[370px] top-16 ${
                  isOpenWalletAddress ? "flex" : "hidden"
                }  justify-start flex-col bg-background_primary py-6 px-10 mx-6 rounded-b-2xl rounded-tl-2xl gap-5 duration-300`}
              >
                {/* Peridot Wallet Address */}
                <div className="flex justify-between mb-1 items-center">
                  <div></div>
                  <p className="text-lg font-semibold">
                    Peridot Wallet Address
                  </p>
                  <button
                    onClick={() => {
                      setIsOpenWalletAddress(false);
                    }}
                  >
                    <FontAwesomeIcon icon={faXmark} />
                  </button>
                </div>
                {/* Principal ID */}
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
                  <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                    <img
                      src="./assets/logo-icp.svg"
                      alt=""
                      className="size-5"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Principal ID</p>
                    <p>{shortenAddress(wallet.principalId, 15, 10)}</p>
                  </div>
                </button>
                {/* Account ID */}
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
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
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
                  <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                    <FontAwesomeIcon
                      icon={faSeedling}
                      className="text-accent_primary size-5"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Seed Phrase</p>
                    <p>{shortenAddress(wallet.seedPhrase, 15, 10)}</p>
                  </div>
                </button>
                {/* Private Key */}
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
                  <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                    <FontAwesomeIcon
                      icon={faKey}
                      className="text-yellow-300 size-5"
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Private Key</p>
                    <p>{shortenAddress(wallet.privateKey, 15, 10)}</p>
                  </div>
                </button>
              </div>

              {/* address  */}
              <p className="py-3 px-6 shadow-sunken-md-green rounded-xl">
                {shortenAddress(wallet.principalId, 5, 3)}
              </p>
              {/* Logout  */}
              <button
                onClick={handleClearData}
                className="bg-white/20 w-10 h-10 flex justify-center items-center rounded-xl"
              >
                <FontAwesomeIcon
                  icon={faArrowRightFromBracket}
                  className="text-md"
                />
              </button>
            </div>
            <p className="text-3xl font-semibold">$26,345,600</p>
            <div className="flex flex-col gap-3">
              <div className="">
                <p className="text-sm">Return</p>
                <p className="text-lg font-medium">3.2%</p>
              </div>
              <div className="">
                <p className="text-sm">P&L</p>
                <p className="text-lg font-medium">$12,920</p>
              </div>
            </div>
            <div className="flex gap-4">
              <p className="bg-white/20 py-2 px-4 rounded-2xl">Send</p>
              <p className="bg-white/20 py-2 px-4 rounded-2xl">Receive</p>
            </div>
          </section>

          {/* section 2  */}
          <section className="flex flex-col gap-4 p-6">
            <ICRC1Coin canisterId="ryjl3-tyaaa-aaaaa-aaaba-cai" />
            <ICRC1Coin canisterId="4u7dm-7qaaa-aaaam-acvdq-cai" />
            <ICRC1Coin canisterId="cngnf-vqaaa-aaaar-qag4q-cai" />
            <ICRC1Coin canisterId="" />
          </section>
        </div>
      </motion.main>
    </motion.div>
  );
};
