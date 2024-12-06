import React, { useEffect } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { wallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    function checkWallet() {
      if (wallet.principalId && wallet.accountId && wallet.privateKey) {
        navigate("/home");
      }
    }

    checkWallet();
  });

  return (
    <main className="flex flex-col justify-center w-full min-h-dvh items-center gap-5">
      <p>PerWallet</p>
      <a href="/import_wallet" className="p-2 bg-white text-black">
        Import Wallet
      </a>
      <a href="/create_wallet" className="p-2 bg-white text-black">
        Create Wallet
      </a>
    </main>
  );
}
