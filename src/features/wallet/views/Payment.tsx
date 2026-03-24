import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { motion } from 'framer-motion';
import { ICRC1Coin } from '../components/ICRC1Coin';
import { AlertMessage } from '../components/AlertMessage';
import { walletService } from '@shared/services/wallet';
import { hexToArrayBuffer } from '@shared/utils/crypto';
import { Actor, ActorSubclass, HttpAgent } from '@dfinity/agent';
import { Secp256k1KeyIdentity } from '@dfinity/identity-secp256k1';
import { ICPLedgerFactory } from '../blockchain/icp/ICPLedgerFactory';
import { Principal } from '@dfinity/principal';
import { ICRCLedgerActor } from '../blockchain/icp/ICRCLedgerFactory';
import { ButtonTransaction } from '@shared/components/atoms/ButtonTransaction';

interface Props {
  onClose: () => void;
  price: number | string;
  SPENDER: string;
  onExecute: () => Promise<void>;
  tokenCanisterId?: string;
  tokenSymbol?: string;
  tokenLogoUrl?: string;
}

interface AlertInterface {
  isSuccess: boolean | null;
  msg: string;
}

const DEFAULT_TOKEN_CANISTER = import.meta.env.VITE_PERIDOT_TOKEN_CANISTER;
const DEFAULT_TOKEN_SYMBOL = 'PER';
const DEFAULT_TOKEN_LOGO = './assets/logo-peridot.svg';

export const AppPayment: React.FC<Props> = ({
  onClose,
  price,
  onExecute,
  SPENDER,
  tokenCanisterId = DEFAULT_TOKEN_CANISTER,
  tokenSymbol = DEFAULT_TOKEN_SYMBOL,
  tokenLogoUrl = DEFAULT_TOKEN_LOGO,
}) => {
  const { wallet } = useWallet();
  const [spenderPrincipal, setSpenderPrincipal] = useState<Principal | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [_tokenBalances, setTokenBalances] = useState<{ [id: string]: number }>({});
  const [myBalance, setMyBalance] = useState(0);
  // const [fee, setFee] = useState<bigint>(0n);

  // info ledger
  const [decimals, setDecimals] = useState<number>(8);
  // const [allowance, setAllowance] = useState<bigint>(0n);

  // ui
  const [busy, setBusy] = useState(false);
  const [alertData, setAlertData] = useState<AlertInterface>({
    isSuccess: null,
    msg: '',
  });

  const humanPriceStr = String(price);
  const balanceLeft = useMemo(() => myBalance - Number(humanPriceStr), [myBalance, humanPriceStr]);
  const requiresPayment = Number(humanPriceStr) > 0;

  useEffect(() => {
    if (!requiresPayment) {
      setSpenderPrincipal(null);
      setConfigError(null);
      return;
    }

    if (!SPENDER || typeof SPENDER !== 'string' || !SPENDER.trim()) {
      setSpenderPrincipal(null);
      setConfigError('Payment configuration is missing the spender canister id.');
      setAlertData({
        isSuccess: false,
        msg: 'Payment configuration is missing the spender canister id.',
      });
      return;
    }
    try {
      const principal = Principal.fromText(SPENDER);
      setSpenderPrincipal(principal);
      setConfigError(null);
      setAlertData((prev) =>
        prev.isSuccess === false && prev.msg.includes('configuration')
          ? { isSuccess: null, msg: '' }
          : prev,
      );
    } catch (err) {
      console.error('[AppPayment] Invalid spender principal:', err);
      setSpenderPrincipal(null);
      setConfigError('Payment configuration contains an invalid spender canister id.');
      setAlertData({
        isSuccess: false,
        msg: 'Payment configuration contains an invalid spender canister id.',
      });
    }
  }, [SPENDER, requiresPayment]);

  const updateTokenBalance = useCallback(
    (canisterId: string, _balanceUsd: number, balanceToken: number) => {
      setTokenBalances((prev) => {
        const next = { ...prev, [canisterId]: balanceToken };
        const total = Object.values(next).reduce((s, v) => s + v, 0);
        setMyBalance(total);
        return next;
      });
    },
    [],
  );

  // setup agent+actor ledger
  async function makeLedgerActor() {
    if (!wallet?.encryptedPrivateKey) {
      throw new Error('Wallet is not available. Please connect your wallet first.');
    }
    const privateKey = await walletService.decryptWalletData(wallet.encryptedPrivateKey!);
    const secretKey = hexToArrayBuffer(privateKey);

    const agent = new HttpAgent({
      host: import.meta.env.VITE_HOST,
      identity: Secp256k1KeyIdentity.fromSecretKey(new Uint8Array(secretKey)),
    });
    // if (import.meta.env.DEV) await agent.fetchRootKey();

    const actor: ActorSubclass<ICRCLedgerActor> = Actor.createActor(ICPLedgerFactory, {
      agent,
      canisterId: tokenCanisterId,
    });

    return { actor, agent };
  }

  function toSubunits(amount: string, dec: number): bigint {
    if (!/^\d+(\.\d+)?$/.test(amount)) throw new Error('Invalid amount format');
    const [i, f = ''] = amount.split('.');
    const fpad = (f + '0'.repeat(dec)).slice(0, dec);
    // hindari 10**dec overflow ke number: pakai BigInt string builder
    const base = BigInt('1' + '0'.repeat(dec));
    return BigInt(i) * base + BigInt(fpad || '0');
  }

  // load decimals + allowance saat modal dibuka
  useEffect(() => {
    if (!wallet?.encryptedPrivateKey) {
      setAlertData({
        isSuccess: false,
        msg: 'Wallet is not available. Please connect and try again.',
      });
      return;
    }
    (async () => {
      try {
        const { actor } = await makeLedgerActor();
        const dec = Number(await actor.icrc1_decimals());
        setDecimals(dec);

        // const feeOnChain = await actor.icrc1_fee();
        // setFee(BigInt(feeOnChain));

        // const owner = await agent.getPrincipal(); // ✅
        // const account = { owner, subaccount: [] as [] };
        // const spender = { owner: spenderPrincipal, subaccount: [] as [] };

        // const alw = await actor.icrc2_allowance({ account, spender });
        // setAllowance(alw.allowance);
      } catch (e: any) {
        setAlertData({ isSuccess: false, msg: e?.message ?? String(e) });
      }
    })();
  }, [wallet?.encryptedPrivateKey, tokenCanisterId]);

  let _nonce = 0;
  const uniqueCreatedAtNs = (): bigint => {
    const base = BigInt(Date.now()) * 1_000_000n; // ms -> ns
    _nonce = (_nonce + 1) & 0xffff; // 0..65535
    return base + BigInt(_nonce);
  };

  // biar ringkas
  type Opt<T> = [] | [T];
  const ToOpt = <T,>(v: T | null | undefined): Opt<T> => (v == null ? [] : [v]);

  async function safeApprove(params: {
    actor: ICRCLedgerActor;
    account: { owner: Principal; subaccount: [] };
    spender: { owner: Principal; subaccount: [] };
    targetAllowance: bigint;
  }) {
    const { actor, account, spender, targetAllowance } = params;

    // 1) allowance sekarang
    const { allowance: cur } = await actor.icrc2_allowance({
      account,
      spender,
    });

    // 2) kalau belum perlu berubah, skip
    if (cur === targetAllowance) return;

    // 3) kalau non-zero, clear dulu → 0
    if (cur !== 0n) {
      const clearRes = await actor.icrc2_approve({
        from_subaccount: [],
        spender,
        amount: 0n,
        expected_allowance: [cur], // proteksi balapan
        expires_at: [],
        fee: [],
        memo: [],
        created_at_time: ToOpt(uniqueCreatedAtNs()),
      });
      if ('Err' in clearRes) {
        // Duplicate di step ini boleh dianggap ok (idempotent)
        if (!('Duplicate' in clearRes.Err)) {
          const k = Object.keys(clearRes.Err)[0];
          throw new Error(`Approve(clear->0) failed: ${k}`);
        }
      }
    }

    // 4) set ke target
    const setRes = await actor.icrc2_approve({
      from_subaccount: [],
      spender,
      amount: targetAllowance,
      expected_allowance: [0n],
      expires_at: [],
      fee: [],
      memo: [],
      created_at_time: ToOpt(uniqueCreatedAtNs()), // ← HARUS beda
    });

    if ('Err' in setRes) {
      // Jika Duplicate, verifikasi hasil akhirnya
      if ('Duplicate' in setRes.Err) {
        const { allowance: after } = await actor.icrc2_allowance({
          account,
          spender,
        });
        if (after >= targetAllowance) return; // treat as success
      }
      const k = Object.keys(setRes.Err)[0];
      throw new Error(`Approve(set target) failed: ${k}`);
    }
  }

  async function handlePayment() {
    try {
      setBusy(true);
      setAlertData({ isSuccess: null, msg: '' });

      if (requiresPayment) {
        if (configError) {
          throw new Error(configError);
        }
        if (!spenderPrincipal) {
          throw new Error('Unable to initiate payment without a valid spender canister.');
        }
        const { actor, agent } = await makeLedgerActor();

        // 1) konversi harga ke subunit
        const need = toSubunits(humanPriceStr, decimals);

        // 2) ambil owner & akun spender
        const owner = await agent.getPrincipal();
        const account = { owner, subaccount: [] as [] };
        const spender = { owner: spenderPrincipal, subaccount: [] as [] };

        // 3) ambil fee transfer (kalau fungsi fee tidak ada, anggap 0)
        let txFee = 0n;
        try {
          const f = await actor.icrc1_fee();
          txFee = BigInt(f);
        } catch {
          txFee = 0n;
        }

        // 4) target allowance = amount + fee (banyak ledger meminta ini)
        const targetAllowance = need + txFee;

        // 5) SAFE APPROVE (clear -> set)
        await safeApprove({ actor, account, spender, targetAllowance });

        // 6) verifikasi allowance (opsional, tapi bagus)
        const { allowance: newAlw } = await actor.icrc2_allowance({
          account,
          spender,
        });
        if (newAlw < need) {
          throw new Error(`Allowance insufficient after approve: ${newAlw} < ${need}`);
        }
      }

      // 7) jalankan pembayaran di backend (akan panggil transfer_from)
      await onExecute();

      setAlertData({ isSuccess: true, msg: 'Payment succeeded 🎉' });
      setTimeout(() => onClose(), 800);
    } catch (error: any) {
      console.error('Payment error:', error);
      setAlertData({
        isSuccess: false,
        msg: error?.message ? `Error: ${error.message}` : 'Payment failed',
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/40 z-50 flex justify-start"
      onClick={onClose}
      animate={{ opacity: 1 }}
      data-lenis-prevent
    >
      <motion.main
        className="w-[370px] bg-background flex flex-col justify-between min-h-screen p-8 gap-8"
        initial={{ x: '-100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '-100%', opacity: 0 }}
        transition={{ type: 'spring', stiffness: 480, damping: 42, mass: 0.8 }}
        onClick={(e) => e.stopPropagation()}
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
              <ICRC1Coin canisterId={tokenCanisterId} onBalanceUpdate={updateTokenBalance} />
            </div>

            {/* my  */}
            <div className="flex flex-col gap-4">
              <h2>You Need to Pay</h2>
              <div className="flex gap-2 items-center">
                <div className="w-12 h-12 shadow-arise-sm rounded-full flex justify-center items-center overflow-hidden">
                  {tokenLogoUrl ? (
                    <img src={tokenLogoUrl} alt={tokenSymbol} className="w-full p-4" />
                  ) : (
                    <span className="text-sm font-semibold">{tokenSymbol}</span>
                  )}
                </div>
                <span className="text-danger">
                  {humanPriceStr} {tokenSymbol}
                </span>
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
            text={busy ? 'Processing...' : 'Pay Now'}
            onClick={handlePayment}
            disabled={
              busy || balanceLeft < 0 || (requiresPayment && (!!configError || !spenderPrincipal))
            }
          />
        </section>
      </motion.main>
    </motion.div>
  );
};
