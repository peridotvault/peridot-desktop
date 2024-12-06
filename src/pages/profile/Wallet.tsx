import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { clearWalletData } from "../../utils/StoreService";
import { useNavigate } from "react-router-dom";
import { Actor, HttpAgent } from "@dfinity/agent";
import { icrc1IdlFactory } from "../../hooks/idl/icrc1";
import { Principal } from "@dfinity/principal";
import { motion } from "framer-motion";
import {
  faArrowRightFromBracket,
  faClone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface NavbarProps {
  onClose: () => void;
}

export const Wallet: React.FC<NavbarProps> = ({ onClose }) => {
  const { wallet, setWallet } = useWallet();
  const navigate = useNavigate();
  const [ifalBalance, setIfalBalance] = useState("");
  const [icpBalance, setICPBalance] = useState("");

  useEffect(() => {
    async function fetchBalance() {
      if (wallet.principalId) {
        try {
          const resultIfal = await checkBalance("4u7dm-7qaaa-aaaam-acvdq-cai");
          const resultICP = await checkBalance("ryjl3-tyaaa-aaaaa-aaaba-cai");

          setIfalBalance(resultIfal);
          setICPBalance(resultICP);
        } catch (error) {
          setIfalBalance("Error fetching balance");
          setICPBalance("Error fetching balance");
        }
      }
    }

    fetchBalance();
  }, [wallet.principalId]);

  async function checkBalance(icrc1CanisterId: string) {
    if (!wallet.principalId) {
      throw new Error("Not Logged in");
    }
    try {
      // Initialize agent with identity
      const agent = new HttpAgent({
        host: "https://ic0.app",
      });

      const actor = Actor.createActor(icrc1IdlFactory, {
        agent,
        canisterId: icrc1CanisterId,
      });

      // Call balance method
      const balanceResult = await actor.icrc1_balance_of({
        owner: Principal.fromText(wallet.principalId),
        subaccount: [],
      });

      // Convert balance to number and format
      const standardBalance = Number(balanceResult) / 100000000;
      return standardBalance.toString();
    } catch (error) {
      return (error as Error).message.toString();
    }
  }

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
        <div className="flex flex-col gap-3">
          {/* section 1  */}
          <section className="p-6 bg-gradient-to-tr from-accent_primary/50 via-accent_secondary/50 to-accent_secondary/50 flex flex-col gap-5">
            <div className="flex items-center gap-3 justify-between">
              {/* copy address  */}
              <button className="bg-white/20 w-10 h-10 flex justify-center items-center rounded-xl">
                <FontAwesomeIcon icon={faClone} className="text-md" />
              </button>
              <div className="absolute right-[370px] top-16 flex justify-start flex-col bg-background_primary py-6 px-10 mx-6 rounded-2xl gap-5">
                {/* Peridot Wallet Address */}
                <div className="flex justify-between mb-1">
                  <div></div>
                  <p className="text-lg font-semibold">
                    Peridot Wallet Address
                  </p>
                  <p>x</p>
                </div>
                {/* Principal ID */}
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
                  <div className="w-12 h-12 bg-white rounded-full">
                    <img src="" alt="" />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Principal ID</p>
                    <p>{shortenAddress(wallet.principalId, 15, 10)}</p>
                  </div>
                </button>
                {/* Account ID */}
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
                  <div className="w-12 h-12 bg-white rounded-full">
                    <img src="" alt="" />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Account ID</p>
                    <p>{shortenAddress(wallet.accountId, 15, 10)}</p>
                  </div>
                </button>
                {/* Seed Phrase */}
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
                  <div className="w-12 h-12 bg-white rounded-full">
                    <img src="" alt="" />
                  </div>
                  <div className="flex flex-col items-start">
                    <p className="text-md font-semibold">Seed Phrase</p>
                    <p>{shortenAddress(wallet.seedPhrase, 15, 10)}</p>
                  </div>
                </button>
                {/* Private Key */}
                <button className="flex gap-3 items-center hover:scale-105 duration-300">
                  <div className="w-12 h-12 bg-white rounded-full">
                    <img src="" alt="" />
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
          <section className="flex flex-col gap-3 p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 aspect-square bg-white rounded-full"></div>
              <div className="">
                <p className="">ICP</p>
                <p className="text-xs">{icpBalance} ICP</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 aspect-square bg-white rounded-full"></div>
              <div className="">
                <p className="">IFAL</p>
                <p className="text-xs">{ifalBalance} IFAL</p>
              </div>
            </div>
          </section>
        </div>
      </motion.main>
    </motion.div>
  );
};
