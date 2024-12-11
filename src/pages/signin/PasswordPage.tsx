import React from "react";
import { useWallet } from "../../contexts/WalletContext";

interface PasswordProps {
  backFunction: () => void;
  handlePassword: () => void;
}

export const PasswordPage: React.FC<PasswordProps> = ({
  backFunction,
  handlePassword,
}) => {
  const { wallet, setWallet } = useWallet();

  return (
    <main className="flex justify-center items-center h-screen p-6 flex-col gap-6">
      <button className="fixed left-5 top-5" onClick={backFunction}>
        back
      </button>
      <p className="text-lg">Create Password</p>
      <div className=""></div>
      <input
        type="password"
        name="password"
        className="border border-white/10 shadow-sunken-lg p-3 w-72 rounded-lg text-white bg-background_primary outline-none"
        placeholder="Enter your password"
        value={wallet.password || ""}
        onChange={(e) =>
          setWallet((prev) => ({
            ...prev,
            password: e.target.value,
          }))
        }
      />
      <input
        type="password"
        name="password"
        className="border border-white/10 shadow-sunken-lg p-3 w-72 rounded-lg text-white bg-background_primary outline-none"
        placeholder="Confirm your password"
        value={wallet.password || ""}
        onChange={(e) =>
          setWallet((prev) => ({
            ...prev,
            password: e.target.value,
          }))
        }
      />
      <div className=""></div>
      <button
        onClick={handlePassword}
        className="bg-white text-black py-3 px-10 rounded-full"
      >
        Create Password
      </button>
    </main>
  );
};
