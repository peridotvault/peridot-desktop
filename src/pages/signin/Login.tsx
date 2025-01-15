// @ts-ignore
import React, { useEffect, useState } from "react";
import { useWallet } from "../../contexts/WalletContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const { wallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    function checkWallet() {
      if (
        wallet.principalId &&
        wallet.accountId &&
        wallet.encryptedPrivateKey
      ) {
        navigate("/");
      }
    }

    checkWallet();
  });

  return (
    <main className="flex flex-col justify-center w-full min-h-dvh items-center gap-6">
      <p className="text-lg">Sign In</p>
      <Link
        to="/import_wallet"
        className="px-6 py-4 text-white w-72 rounded-xl text-center shadow-sunken-sm hover:shadow-flat-lg hover:bg-white/5 duration-300 border border-white/10 hover:border-white/5"
      >
        Import Wallet
      </Link>
      <Link
        to="/create_wallet"
        className="px-6 py-4 text-whites w-72 rounded-xl text-center shadow-sunken-sm hover:shadow-flat-lg hover:bg-white/5 duration-300 border border-white/10 hover:border-white/5"
      >
        Create Wallet
      </Link>
    </main>
  );
}
