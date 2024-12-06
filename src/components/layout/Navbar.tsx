import React, { useState } from "react";
import CSS from "csstype";
import { useWallet } from "../../contexts/WalletContext";

interface NavbarProps {
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile }) => {
  const { wallet } = useWallet();

  const profileStyle: CSS.Properties = {
    boxShadow: "3px 3px 6px #181a19, -3px -3px 6px #202421",
  };

  const shortenAddress = (address: string | null) => {
    if (address) return `${address.slice(0, 4)}...${address.slice(-3)}`;
  };

  return (
    <div className="bg-background_primary shadow-lg flex justify-between items-center gap-5 px-6 fixed w-full z-50">
      <div className="flex gap-5 py-6">
        <a href="">Vault</a>
        <a href="">Library</a>
        <a href="">Market</a>
      </div>
      <div className="flex gap-5 items-center">
        <button className="bg-background_primary py-3 px-6 rounded-xl shadow-sunken-sm hover:shadow-arise-sm duration-300">
          {shortenAddress(wallet.principalId)}
        </button>
        <button
          className="bg-background_primary pt-6 pb-3 mb-3 px-3 rounded-b-full"
          style={profileStyle}
          onClick={onOpenProfile}
        >
          <div className="w-8 h-8 rounded-full bg-background_secondary overflow-hidden">
            <img
              src="https://cdn.antaranews.com/cache/1200x800/2022/03/19/WhatsApp-Image-2022-03-19-at-09.29.12.jpeg"
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>
    </div>
  );
};
