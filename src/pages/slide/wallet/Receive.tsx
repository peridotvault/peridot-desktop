import { faChevronLeft, faClone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { useWallet } from "../../../contexts/WalletContext";
import {
  copyToClipboard,
  shortenAddress,
} from "../../../components/AdditionalComponent";

interface Props {
  onClose: () => void;
}

export const Receive: React.FC<Props> = ({ onClose }) => {
  const { wallet } = useWallet();
  const [walletAddress] = useState([
    {
      address: wallet.principalId,
      network: "Principal ID",
      logo: "./assets/logo-icp.svg",
    },
    {
      address: wallet.accountId,
      network: "Account ID",
      logo: "./assets/logo-icp.svg",
    },
  ]);

  return (
    <div className="fixed top-0 right-0 w-[370px] bg-background_primary h-full p-6 flex flex-col gap-8">
      {/* header  */}
      <div className="flex justify-between items-center">
        <button
          onClick={onClose}
          className=" w-10 h-10 flex justify-center items-center rounded-xl"
        >
          <FontAwesomeIcon icon={faChevronLeft} className="text-md" />
        </button>
        <p className="text-lg font-semibold">Receive</p>
        <div className="w-10 h-10"></div>
      </div>

      {/* content  */}
      <section className="flex flex-col gap-6">
        {walletAddress.map((item, index) => (
          <button
            key={index}
            onClick={() => copyToClipboard(item.address)}
            className="flex gap-4 items-center justify-between hover:scale-105 duration-300"
          >
            <div className="flex gap-4 items-center">
              <div className="w-12 h-12 shadow-arise-sm rounded-xl flex justify-center items-center">
                <img
                  src={item.logo}
                  alt={item.network + "Logo"}
                  className="size-5"
                />
              </div>
              <div className="flex flex-col items-start">
                <p className="text-md font-semibold">{item.network}</p>
                <p>{shortenAddress(item.address, 15, 4)}</p>
              </div>
            </div>
            <div className="">
              <FontAwesomeIcon icon={faClone} />
            </div>
          </button>
        ))}
      </section>
    </div>
  );
};
