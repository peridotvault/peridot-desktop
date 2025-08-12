import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useWallet } from "../../../contexts/WalletContext";
import { motion } from "framer-motion";
import { ButtonTransaction } from "../../../components/atoms/ButtonTransaction";
import { ICRC1Coin } from "../components/ICRC1Coin";
import { AlertMessage } from "../components/AlertMessage";
import { walletService } from "../services/WalletService";
import { hexToArrayBuffer } from "../../../utils/crypto";
import { Actor, ActorSubclass, HttpAgent } from "@dfinity/agent";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import { ICPLedgerFactory } from "../blockchain/icp/ICPLedgerFactory";
import { Principal } from "@dfinity/principal";
import { ICRCLedgerActor } from "../blockchain/icp/ICRCLedgerFactory";

const PERIDOT_TOKEN_CANISTER = import.meta.env.VITE_PERIDOT_TOKEN_CANISTER;
const SPENDER = Principal.fromText(
  import.meta.env.VITE_PERIDOT_CANISTER_USER_BACKEND
);

interface Props {
  onClose: () => void;
  price: number | string;
  onExecute: () => Promise<void>;
}

interface AlertInterface {
  isSuccess: boolean | null;
  msg: string;
}

export const AppPayment: React.FC<Props> = ({ onClose, price, onExecute }) => {
  const { wallet } = useWallet();

  const [_tokenBalances, setTokenBalances] = useState<{ [id: string]: number }>(
    {}
  );
  const [myBalance, setMyBalance] = useState(0);
  const [fee, setFee] = useState<bigint>(0n);

  // info ledger
  const [decimals, setDecimals] = useState<number>(8);
  const [allowance, setAllowance] = useState<bigint>(0n);

  // ui
  const [busy, setBusy] = useState(false);
  const [alertData, setAlertData] = useState<AlertInterface>({
    isSuccess: null,
    msg: "",
  });

  const humanPriceStr = String(price);
  const balanceLeft = useMemo(
    () => myBalance - Number(humanPriceStr),
    [myBalance, humanPriceStr]
  );

  const updateTokenBalance = useCallback(
    (canisterId: string, _balanceUsd: number, balanceToken: number) => {
      setTokenBalances((prev) => {
        const next = { ...prev, [canisterId]: balanceToken };
        const total = Object.values(next).reduce((s, v) => s + v, 0);
        setMyBalance(total);
        return next;
      });
    },
    []
  );

  // setup agent+actor ledger
  async function makeLedgerActor() {
    const privateKey = await walletService.decryptWalletData(
      wallet.encryptedPrivateKey!
    );
    const secretKey = hexToArrayBuffer(privateKey);

    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(secretKey),
    });
    // if (import.meta.env.DEV) await agent.fetchRootKey();

    const actor: ActorSubclass<ICRCLedgerActor> = Actor.createActor(
      ICPLedgerFactory,
      {
        agent,
        canisterId: PERIDOT_TOKEN_CANISTER,
      }
    );

    return { actor, agent };
  }

  function toSubunits(amount: string, dec: number): bigint {
    if (!/^\d+(\.\d+)?$/.test(amount)) throw new Error("Invalid amount format");
    const [i, f = ""] = amount.split(".");
    const fpad = (f + "0".repeat(dec)).slice(0, dec);
    // hindari 10**dec overflow ke number: pakai BigInt string builder
    const base = BigInt("1" + "0".repeat(dec));
    return BigInt(i) * base + BigInt(fpad || "0");
  }

  // load decimals + allowance saat modal dibuka
  useEffect(() => {
    (async () => {
      try {
        const { actor, agent } = await makeLedgerActor();
        const dec = Number(await actor.icrc1_decimals());
        setDecimals(dec);

        const feeOnChain = await actor.icrc1_fee();
        setFee(BigInt(feeOnChain));

        const owner = await agent.getPrincipal(); // ✅
        const account = { owner, subaccount: [] as [] };
        const spender = { owner: SPENDER, subaccount: [] as [] };

        const alw = await actor.icrc2_allowance({ account, spender });
        setAllowance(alw.allowance);
      } catch (e: any) {
        setAlertData({ isSuccess: false, msg: e?.message ?? String(e) });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePayment() {
    try {
      setBusy(true);
      setAlertData({ isSuccess: null, msg: "" });

      const { actor, agent } = await makeLedgerActor();

      // 1) Convert price to subunits correctly
      const need = toSubunits(humanPriceStr, decimals);

      // 2) Get current allowance to check actual state
      const owner = await agent.getPrincipal();
      const account = { owner, subaccount: [] as [] };
      const spender = { owner: SPENDER, subaccount: [] as [] };

      const currentAllowance = await actor.icrc2_allowance({
        account,
        spender,
      });

      console.log("Need:", need.toString());
      console.log("Current allowance:", currentAllowance.allowance.toString());
      console.log("Fee:", fee.toString());

      // 3) Always approve the full amount needed (including fee)
      // Don't rely on existing allowance state, refresh it
      const totalNeeded = need + fee; // Remove the arbitrary buffer

      const approveRes = await actor.icrc2_approve({
        from_subaccount: [],
        spender,
        amount: totalNeeded,
        expected_allowance: [], // Let ledger handle existing allowance
        expires_at: [],
        fee: [], // Let ledger use default fee for approve
        memo: [],
        created_at_time: [],
      });

      if ("Err" in approveRes) {
        const errorKey = Object.keys(approveRes.Err)[0];
        const errorDetail =
          approveRes.Err[errorKey as keyof typeof approveRes.Err];
        throw new Error(
          `Approve failed: ${errorKey} - ${JSON.stringify(errorDetail)}`
        );
      }

      console.log("Approve successful, block index:", approveRes.Ok);

      // 4) Verify the new allowance
      const newAllowanceCheck = await actor.icrc2_allowance({
        account,
        spender,
      });
      console.log(
        "New allowance after approve:",
        newAllowanceCheck.allowance.toString()
      );

      if (newAllowanceCheck.allowance < need) {
        throw new Error(
          `Allowance still insufficient: ${newAllowanceCheck.allowance} < ${need}`
        );
      }

      // 5) Now execute the backend payment
      await onExecute();

      setAlertData({ isSuccess: true, msg: "Payment succeeded 🎉" });
      setTimeout(() => onClose(), 800);
    } catch (error: any) {
      console.error("Payment error:", error);
      setAlertData({
        isSuccess: false,
        msg: error?.message ? `Error: ${error.message}` : "Payment failed",
      });
    } finally {
      setBusy(false);
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
                canisterId={PERIDOT_TOKEN_CANISTER}
                onBalanceUpdate={updateTokenBalance}
              />
            </div>

            {/* my  */}
            <div className="flex flex-col gap-4">
              <h2>You Need to Pay</h2>
              <div className="flex gap-2 items-center">
                <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
                  <img
                    src="./assets/logo-peridot.svg"
                    alt=""
                    className={`w-full p-4`}
                  />
                </div>
                <span className="text-danger">{price + " PER"}</span>
              </div>
            </div>
          </div>

          <div className="">
            <h2>Your Balance Left</h2>
            <p className="text-xl">{balanceLeft.toString()}</p>
          </div>
        </section>

        {/* content  */}
        <section className="flex flex-col gap-6">
          <ButtonTransaction
            text={busy ? "Processing..." : "Pay Now"}
            onClick={handlePayment}
            disabled={busy || balanceLeft < 0}
          />
        </section>
      </motion.main>
    </motion.div>
  );
};
