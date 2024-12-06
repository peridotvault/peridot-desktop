import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { clearWalletData } from "../../utils/StoreService";
import { useNavigate } from "react-router-dom";
import { Actor, HttpAgent } from "@dfinity/agent";
import { icrc1IdlFactory } from "../../hooks/idl/icrc1";
import { Principal } from "@dfinity/principal";
import { motion } from "framer-motion";

interface NavbarProps {
  onClose: () => void;
}

export const Profile: React.FC<NavbarProps> = ({ onClose }) => {
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

  return (
    <motion.div
      className="bg-black/40 fixed top-0 right-0 w-full h-full z-50 flex justify-end py-10 overflow-x-hidden"
      onClick={onClose}
      animate={{ opacity: 1 }}
    >
      <motion.main
        className="w-[400px] h-full bg-background_primary rounded-l-3xl"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        <div className="p-6 flex flex-col gap-3">
          <button className="text-red-500" onClick={handleClearData}>
            Logout
          </button>
          <p className="text-xl font-bold text-center mb-5">Wallet Details</p>
          <div className="">
            <p>Seed Phrase: {wallet.seedPhrase}</p>
            <p>Principal ID: {wallet.principalId}</p>
            <p>Account ID: {wallet.accountId}</p>
            <p>Private Key: {wallet.privateKey}</p>
            <p>Password: {wallet.password}</p>
          </div>
          <section className="flex flex-col gap-3">
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
