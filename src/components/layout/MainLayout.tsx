// @ts-ignore
import React, { useEffect, useState } from "react";
import { Navbar } from "./Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { Wallet } from "../../features/wallet/views/Wallet";
import { AnimatePresence } from "framer-motion";
import { useWallet } from "../../contexts/WalletContext";
import Lenis from "lenis";
import { getUserByPrincipalId } from "../../contexts/UserContext";
import { InputField } from "../atoms/InputField";
import { walletService } from "../../features/wallet/services/WalletService";
import { getUserInfo } from "../../utils/IndexedDb";
import { MetadataUser } from "../../interfaces/User";
import { saveUserInfo } from "../../utils/IndexedDb";
import _ from "lodash";

export default function MainLayout() {
  const [isOpenWallet, setIOpenWallet] = useState(false);
  const { wallet, isCheckingWallet, setIsCheckingWallet } = useWallet();
  const navigate = useNavigate();
  const [isRequiredPassword, setIsRequiredPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<MetadataUser | null>(null);

  // Lenis smooth scroll setup
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  const saveMetadata = async (
    oldUserMetadata: MetadataUser | null,
    newMetadata: MetadataUser
  ): Promise<void> => {
    try {
      if (!_.isEqual(oldUserMetadata, newMetadata)) {
        console.log("check if not same");
        await saveUserInfo(newMetadata);
      }
    } catch (error) {
      console.error;
    }
  };

  const isValidUser = (u: unknown): u is MetadataUser => {
    return typeof u === "object" && u !== null && "ok" in u;
  };

  // Check wallet and session status
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;

    async function checkWalletAndScheduleExpiry() {
      if (
        !wallet.principalId ||
        !wallet.accountId ||
        !wallet.encryptedPrivateKey ||
        !wallet.encryptedSeedPhrase ||
        !wallet.verificationData
      ) {
        navigate("/login");
        return;
      }
      try {
        if (await walletService.isLockOpen()) {
          const userInfo = await getUserInfo();
          if (userInfo) {
            setUserData(userInfo);
          }
          const lock = await walletService.getLock();
          const isValidSession = lock ? Date.now() <= lock.expiresAt : false;
          setIsCheckingWallet(false);
          if (isValidSession) {
            const isUserExist = (await getUserByPrincipalId(
              wallet.encryptedPrivateKey
            )) as MetadataUser;
            if (isValidUser(isUserExist)) {
              saveMetadata(userInfo, isUserExist);

              setIsRequiredPassword(false);
            } else {
              navigate("/create_profile");
            }
          } else {
            setIsRequiredPassword(true);
          }
        } else {
          setIsRequiredPassword(true);
        }

        // Schedule update state when lock expired
        const lock = await walletService.getLock();
        if (lock) {
          const timeLeft = lock.expiresAt - Date.now();
          if (timeLeft > 0) {
            timer = setTimeout(() => {
              setIsRequiredPassword(true);
            }, timeLeft);
          } else {
            // If expired, Change state
            setIsRequiredPassword(true);
          }
        } else {
          setIsRequiredPassword(true);
        }
      } catch (error) {
        console.error(
          "Error checking wallet or scheduling lock expiry:",
          error
        );
        setIsRequiredPassword(true);
      }
    }

    checkWalletAndScheduleExpiry();

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isCheckingWallet, navigate, wallet]);

  const handleConfirm = async () => {
    try {
      setError(null);
      if (wallet.verificationData) {
        // Open lock and save to session
        await walletService.openLock(password, wallet.verificationData);
        setPassword("");
        setIsRequiredPassword(false);
      }
    } catch (err) {
      console.error("Lock error:", err);
      setError("Failed to open Lock. Please check your password.");
    }
  };

  if (isCheckingWallet) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent_secondary">
          Loading
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col">
      <Navbar
        onOpenWallet={() => setIOpenWallet(true)}
        profileImage={userData?.ok.image_url}
      />
      <div
        className={`flex-1  ${
          isRequiredPassword || isOpenWallet ? "overflow-y-hidden" : ""
        } `}
      >
        <div
          className={` ${isRequiredPassword || isOpenWallet ? "h-dvh" : ""} `}
        >
          <Outlet />
        </div>
      </div>

      <AnimatePresence>
        {isOpenWallet && (
          <Wallet
            onClose={() => setIOpenWallet(false)}
            onLockChanged={() => setIsRequiredPassword(true)}
          />
        )}
      </AnimatePresence>

      {isRequiredPassword && (
        <div className="backdrop-blur-sm bg-black/50 fixed z-[100] w-full h-full flex justify-center items-center">
          <div className="bg-background_primary rounded-xl p-10 w-[400px] flex flex-col gap-6 items-end">
            <div className="flex flex-col gap-3 w-full ">
              <p>Password Required</p>
              <InputField
                type="password"
                text={password}
                onChange={setPassword}
                placeholder="Password"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleConfirm();
                  }
                }}
              />
              {error && <p className="text-danger text-sm">{error}</p>}
            </div>
            <button
              onClick={handleConfirm}
              className="border w-[100px] border-accent_secondary p-3 rounded-2xl text-accent_secondary font-bold hover:scale-105 duration-300"
            >
              Confirm
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
