// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
import { useWallet } from '@shared/contexts/WalletContext';
import { initAppStorage } from '@shared/api/wasabi.api';
import { createGamePaid, createGameVoucher } from '@shared/blockchain/icp/services/game.service';
import type { InitCreateGame } from '@shared/blockchain/icp/types/factory.types';
import { Principal } from '@dfinity/principal';
import { AppPayment } from '@features/wallet/views/Payment';
import { USDT_ADDRESS } from '@shared/constants/token';
import { ICP_FACTORY_CANISTER } from '@shared/config/icp';
import { InputFloating } from '@shared/components/ui/input-floating';

const CROCK32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' as const;
const CKUSDT_DECIMALS = 6;
const CKUSDT_SYMBOL = 'ckUSDT';
const CKUSDT_LOGO = '';

function toBase32Crockford(bytes: Uint8Array): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += CROCK32[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) out += CROCK32[(value << (5 - bits)) & 31];
  return out;
}

function fnv1a32(str: string): Uint8Array {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return new Uint8Array([(h >>> 24) & 0xff, (h >>> 16) & 0xff, (h >>> 8) & 0xff, h & 0xff]);
}

async function makeShortSlug(
  developerPrincipal: string,
  gameName: string,
  seedTs: number,
  opts?: { length?: number },
): Promise<string> {
  const len = Math.max(4, Math.min(10, opts?.length ?? 8));
  const payload = `${developerPrincipal}|${seedTs}|${gameName.normalize('NFKC').toLowerCase().trim()}`;
  const enc = new TextEncoder().encode(payload);

  try {
    const dig = await crypto.subtle.digest('SHA-256', enc);
    return toBase32Crockford(new Uint8Array(dig)).slice(0, len);
  } catch {
    return toBase32Crockford(fnv1a32(payload)).slice(0, len);
  }
}

const toSubunits = (value: string, decimals: number): bigint => {
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Amount must be numeric with up to ${decimals} decimals.`);
  }
  const [whole, fraction = ''] = trimmed.split('.');
  const fracPadded = (fraction + '0'.repeat(decimals)).slice(0, decimals);
  return BigInt(whole + fracPadded);
};

const parseMaxSupply = (value: string): bigint => {
  const trimmed = value.trim();
  if (!trimmed) return 0n;
  const parsed = BigInt(trimmed);
  if (parsed < 0n) throw new Error('Max supply must be non-negative.');
  return parsed;
};

interface NewGameProps {
  onCreated?: () => void;
}

export const NewGame = ({ onCreated }: NewGameProps) => {
  const { wallet } = useWallet();

  const [name, setName] = useState('');
  const [gameId, setGameId] = useState('');
  const [description, setDescription] = useState('');
  const [metadataUri, setMetadataUri] = useState('');
  const [maxSupply, setMaxSupply] = useState('');
  const [price, setPrice] = useState('');
  const [mode, setMode] = useState<'paid' | 'voucher'>('paid');
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [showPayment, setShowPayment] = useState(false);
  const [pendingMeta, setPendingMeta] = useState<InitCreateGame | null>(null);
  const [pendingControllers, setPendingControllers] = useState<string[] | null>(null);
  const [pendingPrice, setPendingPrice] = useState('0');

  const seedTs = useMemo(() => Date.now(), []);

  const derivedMetadataUri = useMemo(() => {
    if (!gameId) return '';
    const base = import.meta.env.VITE_API_BASE ?? '';
    return `${base}/api/games/${gameId}/metadata`;
  }, [gameId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const principal = wallet?.principalId ?? '';
      const slug = await makeShortSlug(principal, name, seedTs, { length: 8 });
      if (!cancelled) setGameId(slug);
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet?.principalId, name, seedTs]);

  useEffect(() => {
    setMetadataUri(derivedMetadataUri);
  }, [derivedMetadataUri]);

  const tokenCanister = USDT_ADDRESS;

  const resetPaymentState = () => {
    setShowPayment(false);
    setPendingMeta(null);
    setPendingControllers(null);
    setPendingPrice('0');
  };

  const validateInputs = () => {
    if (!name.trim()) throw new Error('Game name is required.');
    if (!description.trim()) throw new Error('Description is required.');
    if (!metadataUri.trim()) throw new Error('Metadata URI is required.');
    if (!tokenCanister.trim()) throw new Error('Token canister is required.');
    if (mode === 'voucher' && !voucherCode.trim()) {
      throw new Error('Voucher code is required for voucher mode.');
    }
  };

  const handleCreateGame = async () => {
    if (!wallet) return;
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);

      validateInputs();

      const meta: InitCreateGame = {
        initGameId: gameId.trim(),
        initName: name.trim(),
        initDescription: description.trim(),
        initMetadataURI: metadataUri.trim(),
        initMaxSupply: parseMaxSupply(maxSupply),
        initTokenCanister: Principal.fromText(tokenCanister.trim()),
        initPrice: toSubunits(price || '0', CKUSDT_DECIMALS),
      };

      if (mode === 'voucher') {
        await createGameVoucher({
          voucher_code: voucherCode.trim(),
          controllers_extra: null,
          meta,
          wallet,
        });
        await initAppStorage(meta.initGameId);
        setSuccess('Game created successfully with voucher.');
        onCreated?.();
      } else {
        setPendingMeta(meta);
        setPendingControllers(null);
        setPendingPrice(price || '0');
        setShowPayment(true);
        return;
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      onClick={(e) => e.stopPropagation()}
      className="bg-background p-8 border max-h-[80dvh] overflow-auto border-foreground/5 rounded-lg w-full md:max-w-[520px] flex flex-col gap-6"
    >
      <h1 className="text-xl font-bold">New Game</h1>

      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="create-mode"
            value="paid"
            checked={mode === 'paid'}
            onChange={() => setMode('paid')}
            disabled={busy}
          />
          Paid (ckUSDT)
        </label>
        <label className="flex items-center gap-2">
          <input
            type="radio"
            name="create-mode"
            value="voucher"
            checked={mode === 'voucher'}
            onChange={() => setMode('voucher')}
            disabled={busy}
          />
          Voucher
        </label>
      </div>

      <div className="flex flex-col gap-4">
        <InputFloating
          name="game_id"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGameId(e.target.value)}
          placeholder="Game Id"
          disabled
          type="text"
          value={gameId}
        />

        <InputFloating
          name="title"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
          placeholder="Game Name"
          type="text"
          value={name}
        />

        <InputFloating
          name="description"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value)}
          placeholder="Game Description"
          type="text"
          value={description}
        />

        <InputFloating
          name="max_supply"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMaxSupply(e.target.value)}
          placeholder="Max Supply (0 = unlimited)"
          type="text"
          value={maxSupply}
        />

        <InputFloating
          name="price"
          type="text"
          placeholder={`Price (${CKUSDT_SYMBOL})`}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
          value={price}
        />

        {mode === 'voucher' && (
          <InputFloating
            name="voucher"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoucherCode(e.target.value)}
            placeholder="Voucher Code"
            type="text"
            value={voucherCode}
          />
        )}
      </div>

      {error && <p className="text-sm text-chart-5">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}

      <div className="flex justify-end mt-8">
        <button
          onClick={handleCreateGame}
          disabled={busy}
          className="bg-accent px-6 py-2 rounded-lg"
        >
          {busy
            ? 'Processing…'
            : mode === 'voucher'
              ? 'Redeem & Create'
              : `Create & Pay (${CKUSDT_SYMBOL})`}
        </button>
      </div>

      {showPayment && pendingMeta && (
        <AppPayment
          price={pendingPrice || '0'}
          SPENDER={ICP_FACTORY_CANISTER}
          tokenCanisterId={USDT_ADDRESS}
          tokenSymbol={CKUSDT_SYMBOL}
          tokenLogoUrl={CKUSDT_LOGO}
          onClose={() => {
            resetPaymentState();
            setBusy(false);
          }}
          onExecute={async () => {
            if (!wallet || !pendingMeta) throw new Error('Missing wallet or metadata payload.');
            await createGamePaid({
              controllers_extra: pendingControllers,
              meta: pendingMeta,
              wallet,
            });
            await initAppStorage(pendingMeta.initGameId);
            setSuccess('Game created successfully.');
            resetPaymentState();
            setBusy(false);
            onCreated?.();
          }}
        />
      )}
    </div>
  );
};
