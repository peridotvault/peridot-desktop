import React, { useState } from "react";
import { InputField } from "../../../components/atoms/InputField";
import { Principal } from "@dfinity/principal";
import { useWallet } from "../../../contexts/WalletContext";
import localforage from "localforage";
import { Coin } from "../interfaces/Coin";
import { checkBalance } from "../hooks/CoinContext";

interface NavbarProps {
  onClose: () => void;
}

export const AddCoin: React.FC<NavbarProps> = ({ onClose }) => {
  const { wallet } = useWallet();
  const [coinAddress, setCoinAddress] = useState("");
  const [isCoinAvailable, setIsCoinAvailable] = useState(false);
  const [metadata, setMetadata] = useState<Coin>({
    network: "icp",
    address: "",
    balance: 0,
    name: "",
    symbol: "",
    fee: 0,
    logo: "",
    isChecked: false,
  });

  async function handleOnChange(text: string) {
    setCoinAddress(text);
    try {
      const address = Principal.fromText(text);
      const result = await checkBalance(address, wallet);
      setMetadata({
        network: "icp",
        address: text,
        balance: result.balance!,
        name: result.name!,
        symbol: result.symbol!,
        fee: result.fee!,
        logo: result.logo!,
        isChecked: false,
      });
      setIsCoinAvailable(true);
    } catch (error) {
      setIsCoinAvailable(false);
      console.log(error);
    }
  }

  const handleSubmit = async () => {
    const newCoin: Coin = metadata;
    try {
      const currentCoins = await localforage.getItem<Coin[]>("coins");
      const updatedCoins = currentCoins
        ? [...currentCoins, newCoin]
        : [newCoin];

      await localforage.setItem("coins", updatedCoins);
      onClose();
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div
      className="bg-black/40 absolute w-full h-full left-0 top-0 flex flex-col justify-end"
      onClick={onClose}
    >
      <div
        className="bg-background_primary p-10 rounded-t-2xl flex flex-col items-center gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-lg font-semibold">Add Coin</p>
        <InputField
          value={coinAddress}
          onChange={(e) => handleOnChange(e)}
          placeholder="Coin Address"
          type="text"
        />
        {isCoinAvailable ? (
          <div className="flex flex-col gap-5 w-full">
            <InputField
              value={metadata.name}
              onChange={(e) => setMetadata((prev) => ({ ...prev, name: e }))}
              placeholder="Name"
              type="text"
              disabled={true}
            />
            <InputField
              value={metadata.symbol}
              onChange={(e) => setMetadata((prev) => ({ ...prev, symbol: e }))}
              placeholder="Symbol"
              type="text"
              disabled={true}
            />
          </div>
        ) : (
          ""
        )}
        <button
          onClick={handleSubmit}
          className={`w-full text-lg rounded-lg font bg-gradient-to-tr from-accent_primary to-accent_secondary p-2  duration-300 ${
            !isCoinAvailable
              ? "opacity-30 cursor-not-allowed "
              : "hover:scale-105 cursor-pointer"
          }`}
          disabled={!isCoinAvailable}
        >
          Add Coin
        </button>
      </div>
    </div>
  );
};
