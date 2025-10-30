// @ts-ignore
import React, { useEffect, useState } from 'react';
import { InputFieldComponent } from '@components/atoms/InputFieldComponent';
import { faComment, faHashtag, faHeader } from '@fortawesome/free-solid-svg-icons';
import { useWallet } from '@shared/contexts/WalletContext';
import { initAppStorage } from '@shared/api/wasabi.api';
import { createGamePaid, createGameVoucher } from '@shared/blockchain/icp/services/game.service';
import type { InitCreateGame } from '@shared/blockchain/icp/types/factory.types';
import { Principal } from '@dfinity/principal';
import { USDT_ADDRESS } from '@shared/constants/token.const';

/* ---------------- Helpers: slug & IDs ---------------- */

const CROCK32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ' as const; // Crockford Base32 (tanpa I,L,O,U)

/** Base32 Crockford encoder */
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

/** FNV-1a 32-bit (fallback kalau SubtleCrypto tidak tersedia) */
function fnv1a32(str: string): Uint8Array {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return new Uint8Array([(h >>> 24) & 0xff, (h >>> 16) & 0xff, (h >>> 8) & 0xff, h & 0xff]);
}

/** bikin slug pendek (4..10 char, default 8) dari principal + name */
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
    const b32 = toBase32Crockford(new Uint8Array(dig));
    return b32.slice(0, len);
  } catch {
    const b32 = toBase32Crockford(fnv1a32(payload));
    return b32.slice(0, len);
  }
}

interface NewGameProps {
  onCreated?: () => void;
}

export const NewGame = ({ onCreated }: NewGameProps) => {
  const { wallet } = useWallet();

  const [name, set_name] = useState('');
  const [game_id, set_game_id] = useState('');
  const [description, set_description] = useState('');
  const tokenCanister = USDT_ADDRESS;
  const [price, setPrice] = useState('');
  const [mode, setMode] = useState<'paid' | 'voucher'>('paid');
  const [voucherCode, setVoucherCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [seedTs] = useState<number>(() => Date.now());
  const [busy, setBusy] = useState(false);

  // auto-generate stable game_id sekali saat mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const principal = wallet?.principalId ?? '';
      const slug = await makeShortSlug(principal, name, seedTs, { length: 8 }); // ubah 6..10 sesuai selera
      if (!cancelled) set_game_id(slug);
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet?.principalId, name, seedTs]);

  const parsePriceToE6s = (value: number): bigint => {
    if (value <= 0) {
      return 0n;
    } else {
      return BigInt(value ^ 6);
    }
  };

  const handleCreateGame = async () => {
    if (!wallet) return;
    try {
      setBusy(true);
      setError(null);
      setSuccess(null);

      const metadataUri = import.meta.env.VITE_API_BASE + '/api/games/' + game_id + 'metadata';

      if (!name.trim()) throw new Error('Game name is required.');
      if (!description.trim()) throw new Error('Description is required.');
      if (!metadataUri.trim()) throw new Error('Metadata URI is required.');
      if (!tokenCanister.trim()) throw new Error('Token canister is required.');
      if (mode === 'voucher' && !voucherCode.trim()) {
        throw new Error('Voucher code is required for voucher mode.');
      }

      const meta: InitCreateGame = {
        initGameId: game_id.trim(),
        initName: name.trim(),
        initDescription: description.trim(),
        initMetadataURI: metadataUri,
        initPrice: parsePriceToE6s(Number(price)),
        initMaxSupply: 0n,
        initTokenCanister: Principal.fromText(tokenCanister.trim()),
      };

      if (mode === 'voucher') {
        await createGameVoucher({
          voucher_code: voucherCode.trim(),
          controllers_extra: null,
          meta,
          wallet,
        });
      } else {
        await createGamePaid({
          controllers_extra: null,
          meta,
          wallet,
        });
      }

      await initAppStorage(game_id);

      // 👉 kabari parent utk re-fetch
      onCreated?.();
      setSuccess('Game created successfully.');
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
      className="bg-background p-8 border max-h-[80dvh] overflow-auto border-foreground/5 rounded-lg w-full md:max-w-[500px] flex flex-col gap-6"
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
          Paid (uses PER token)
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
        <InputFieldComponent
          icon={faHashtag}
          name="game_id"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set_game_id(e.target.value)}
          placeholder="Game Id"
          disabled={true}
          type="text"
          value={game_id}
        />
        <InputFieldComponent
          icon={faHeader}
          name="title"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set_name(e.target.value)}
          placeholder="Game Name"
          type="text"
          value={name}
        />
        <InputFieldComponent
          icon={faComment}
          name="description"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => set_description(e.target.value)}
          placeholder="Game Description"
          type="text"
          value={description}
        />
        <InputFieldComponent
          icon={faComment}
          name="price"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)}
          placeholder="Price (USD)"
          type="number"
          value={price}
        />
        {mode === 'voucher' && (
          <InputFieldComponent
            icon={faComment}
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
          {busy ? 'Creating…' : 'Create'}
        </button>
      </div>
    </div>
  );
};
