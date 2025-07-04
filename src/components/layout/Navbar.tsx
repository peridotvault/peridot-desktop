import React, { useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import {
  faArrowLeft,
  faArrowRight,
  faWallet,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { getProfileImage } from "../../utils/Additional";
import { AnimatePresence } from "framer-motion";
import { Slide } from "../../pages/Slide";

interface NavbarProps {
  onOpenWallet: () => void;
  profileImage: string | undefined | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenWallet,
  profileImage,
}) => {
  const { wallet } = useWallet();
  const [isOpenSettings, setIsOpenSettings] = useState(false);

  const shortenAddress = (address: string | null) => {
    if (address) return `${address.slice(0, 4)}...${address.slice(-3)}`;
    return "Connect Wallet"; // Tampilkan pesan jika tidak ada alamat
  };

  const handleBack = () => {
    window.electronAPI.goBack();
  };

  const handleForward = () => {
    window.electronAPI.goForward();
  };

  return (
    <div className="bg-background_primary shadow-lg flex justify-between items-center gap-5 px-6 fixed w-full z-50">
      <div className="flex gap-5 py-6 font-bold text-lg items-center">
        {/* Button Action  */}
        <div className="flex items-center gap-3">
          <button
            className="h-7 aspect-square justify-center flex items-center text-2xl"
            onClick={handleBack}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button
            className="h-7 aspect-square justify-center flex items-center text-2xl"
            onClick={handleForward}
          >
            <FontAwesomeIcon icon={faArrowRight} />
          </button>
        </div>
        {/* Menu  */}
        <Link to="/">Vault</Link>
        <Link to="/library">Library</Link>
        <Link to="/market">Market</Link>
      </div>
      <div className="flex gap-5 items-center">
        <button
          className="bg-background_primary py-3 px-6 rounded-xl hover:shadow-arise-sm shadow-flat-sm duration-300 flex items-center gap-2 text-text_disabled hover:text-white"
          onClick={onOpenWallet}
        >
          <FontAwesomeIcon icon={faWallet} />
          <p>{shortenAddress(wallet.principalId)}</p>
        </button>
        <button
          onClick={() => setIsOpenSettings(true)}
          // to="/profile_user"
          className="bg-background_primary pt-6 pb-3 mb-3 px-3 rounded-b-full hover:shadow-arise-sm shadow-flat-sm duration-300"
        >
          <div className="w-8 h-8 rounded-full bg-background_secondary overflow-hidden">
            <img
              src={getProfileImage(profileImage)}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </button>
      </div>

      <AnimatePresence>
        {isOpenSettings ? (
          <Slide onClose={() => setIsOpenSettings(false)} />
        ) : (
          ""
        )}
      </AnimatePresence>
    </div>
  );
};
