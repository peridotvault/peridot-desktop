import React, { useCallback, useState } from "react";
import { useWallet } from "../../../contexts/WalletContext";
import { motion } from "framer-motion";
import { ButtonTransaction } from "../../../components/atoms/ButtonTransaction";
import { ICRC1Coin } from "../components/ICRC1Coin";
import { buyApp } from "../../../contexts/AppContext";
import { transferTokenICRC1 } from "../hooks/CoinContext";
import { Principal } from "@dfinity/principal";
import { AlertMessage } from "../components/AlertMessage";

interface Props {
  onClose: () => void;
  price: number;
  app_id: number;
}

interface AlertInterface {
  isSuccess: boolean | null;
  msg: string;
}

export const AppPayment: React.FC<Props> = ({ onClose, price, app_id }) => {
  const { wallet } = useWallet();

  const [_tokenBalances, setTokenBalances] = useState<{
    [canisterId: string]: number;
  }>({});
  const [myBalance, setMyBalance] = useState(0);
  const [alertData, setAlertData] = useState<AlertInterface>({
    isSuccess: null,
    msg: "",
  });
  const updateTokenBalance = useCallback(
    (canisterId: string, balanceUsd: number, balanceToken: number) => {
      setTokenBalances((prev) => {
        const newBalances = { ...prev, [canisterId]: balanceToken };
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

  function balanceLeft() {
    return myBalance - price;
  }

  async function handlePayment() {
    try {
      await buyApp(app_id, wallet);
      if (price > 0) {
        await transferTokenICRC1(
          Principal.fromText(
            "rvvbq-hdxby-qp72d-rkwmw-vfmiv-yf3e7-y3x2c-womvx-sylp2-23jfe-qae"
          ),
          price,
          Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
          10000,
          wallet
        );
      }
      setAlertData({ isSuccess: true, msg: "Success" });
    } catch (error) {
      setAlertData({ isSuccess: false, msg: "Error : " + error });
      throw new Error("error");
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex justify-end"
      onClick={onClose}
      animate={{ opacity: 1 }}
      data-lenis-prevent
    >
      <motion.main
        className="w-[370px] bg-background_primary flex flex-col justify-between min-h-screen p-8 gap-8"
        onClick={(e) => e.stopPropagation()}
        initial={{ x: 400 }}
        animate={{ x: 0 }}
        exit={{ x: 400 }}
        transition={{ type: "tween", duration: 0.2 }}
      >
        {alertData.isSuccess !== null && (
          <AlertMessage msg={alertData.msg} isSuccess={alertData.isSuccess} />
        )}
        {/* header  */}
        <h1 className="text-lg font-semibold text-center">Payment</h1>

        {/* content  */}
        <section className="flex flex-col gap-8 justify-between h-full">
          <div className="flex flex-col gap-8">
            {/* my balance  */}
            <div className="flex flex-col gap-4">
              <h2>My Balance</h2>
              <ICRC1Coin
                canisterId={"ryjl3-tyaaa-aaaaa-aaaba-cai"}
                onBalanceUpdate={updateTokenBalance}
              />
            </div>

            {/* my  */}
            <div className="flex flex-col gap-4">
              <h2>You Need to Pay</h2>
              <div className="flex gap-2 items-center">
                <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
                  <img
                    src="./assets/logo-icp.svg"
                    alt=""
                    className={`w-full p-3`}
                  />
                </div>
                <span className="text-danger">{price + " ICP"}</span>
              </div>
            </div>
          </div>

          <div className="">
            <h2>Your Balance Left</h2>
            <p className="text-xl">{balanceLeft().toString()}</p>
          </div>
        </section>

        {/* content  */}
        <section className="flex flex-col gap-6">
          <ButtonTransaction
            text="Pay Now"
            onClick={handlePayment}
            disabled={balanceLeft() < 0}
          />
        </section>
      </motion.main>
    </motion.div>
  );
};
