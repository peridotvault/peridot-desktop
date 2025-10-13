// @ts-ignore
import React, { useEffect, useState } from 'react';
import { InputFieldComponent } from '../atoms/InputFieldComponent';
import { faComment, faHashtag, faHeader } from '@fortawesome/free-solid-svg-icons';
import { PGLMeta } from '../../blockchain/icp/vault/service.did.d';
import { createGame } from '../../blockchain/icp/vault/services/ICPGameService';
import { useWallet } from '../../contexts/WalletContext';
import { initAppStorage } from '../../api/wasabiClient';

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

  const [pgl1_name, set_pgl1_name] = useState('');
  const [pgl1_game_id, set_pgl1_game_id] = useState('');
  const [pgl1_description, set_pgl1_description] = useState('');
  const [seedTs] = useState<number>(() => Date.now());
  const [busy, setBusy] = useState(false);

  // auto-generate stable game_id sekali saat mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const principal = wallet?.principalId ?? '';
      const slug = await makeShortSlug(principal, pgl1_name, seedTs, { length: 8 }); // ubah 6..10 sesuai selera
      if (!cancelled) set_pgl1_game_id(slug);
    })();
    return () => {
      cancelled = true;
    };
  }, [wallet?.principalId, pgl1_name, seedTs]);

  const handleCreateGame = async () => {
    if (!wallet) return;
    try {
      setBusy(true);
      const meta: PGLMeta = {
        pgl1_name,
        pgl1_description,
        pgl1_game_id, // slug jadi gameId
        pgl1_required_age: [],
        pgl1_cover_image: [],
        pgl1_distribution: [],
        pgl1_banner_image: [],
        pgl1_metadata: [],
        pgl1_website: [],
        pgl1_price: [],
      };

      await createGame({ controllers_extra: [], meta, wallet });
      await initAppStorage(pgl1_game_id);

      // 👉 kabari parent utk re-fetch
      onCreated?.();
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      onClick={(e) => e.stopPropagation()}
      className="bg-background p-8 border border-foreground/5 rounded-lg w-full md:max-w-[500px] flex flex-col gap-6"
    >
      <h1 className="text-xl font-bold">New Game</h1>

      <div className="flex flex-col gap-4">
        <InputFieldComponent
          icon={faHashtag}
          name="pgl1_game_id"
          onChange={(e) => set_pgl1_game_id(e.target.value)}
          placeholder="Game Id"
          disabled={true}
          type="text"
          value={pgl1_game_id}
        />
        <InputFieldComponent
          icon={faHeader}
          name="title"
          onChange={(e) => set_pgl1_name(e.target.value)}
          placeholder="Game Name"
          type="text"
          value={pgl1_name}
        />
        <InputFieldComponent
          icon={faComment}
          name="description"
          onChange={(e) => set_pgl1_description(e.target.value)}
          placeholder="Game Description"
          type="text"
          value={pgl1_description}
        />
      </div>
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
