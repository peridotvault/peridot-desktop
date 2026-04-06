import { useEffect, useState, useRef } from 'react';
import Dexie from 'dexie';
import { useWallet } from '@shared/contexts/WalletContext';
import { walletService } from '@shared/services/wallet';
import { deriveEvmAddressFromSeed } from '@shared/utils/evm';
import { deriveSvmAddressFromSeed } from '@shared/utils/solana';
import { getMyGamesEvm } from '@shared/blockchain/evm/services/game';
import { getMyGamesSvm } from '@shared/blockchain/solana/services/game';
import { libraryService } from '../services/localDb';
import { downloadAndCompressToDataUrl, createEmptyImageDataUrl } from '../utils/imageCompression';
import type { LibraryEntry, CreateLibraryEntryInput } from '@shared/interfaces/library';
import type { PGCGame } from '@shared/interfaces/game';

export type RealLibraryGame = {
  gameId: string;
  name: string;
  description: string;
  coverVerticalImage: string;
  bannerImage: string;
  status: 'owned' | 'installed' | 'installing';
  localEntry?: LibraryEntry;
  remoteData?: PGCGame;
};

let hasSyncedThisSession = false;

async function cacheImage(url: string | undefined): Promise<string> {
  if (!url) return createEmptyImageDataUrl();
  if (url.startsWith('data:')) return url;
  try {
    return await downloadAndCompressToDataUrl(url, {
      maxWidth: 400, maxHeight: 600, quality: 0.7, mimeType: 'image/jpeg',
    });
  } catch (err) {
    console.warn('[cacheImage] Failed:', err);
    return createEmptyImageDataUrl();
  }
}

async function saveGameToLibrary(game: PGCGame): Promise<void> {
  try {
    const existing = await libraryService.getById(game.gameId);
    const webDist = game.distribution?.find((d): d is { web: { url: string } } => 'web' in d);
    const webUrl = webDist?.web?.url;
    let coverVerticalImage = game.coverVerticalImage || '';
    let bannerImage = game.bannerImage || '';
    if (!existing) {
      console.log(`[saveGameToLibrary] Caching images for ${game.gameId}...`);
      coverVerticalImage = await cacheImage(coverVerticalImage || game.coverHorizontalImage);
      bannerImage = await cacheImage(bannerImage);
    } else {
      coverVerticalImage = existing.coverVerticalImage || coverVerticalImage;
      bannerImage = existing.bannerImage || bannerImage;
    }
    const entry: CreateLibraryEntryInput = {
      gameId: game.gameId, gameName: game.name, description: game.description ?? '',
      coverVerticalImage, bannerImage, launchType: 'web', webUrl,
      status: existing?.status || 'not-installed',
      stats: {
        totalPlayTimeSeconds: existing?.stats.totalPlayTimeSeconds || 0,
        launchCount: existing?.stats.launchCount || 0,
        lastLaunchedAt: existing?.stats.lastLaunchedAt,
      },
    };
    if (!existing) {
      await libraryService.create(entry);
      console.log(`[saveGameToLibrary] Created: ${game.gameId}`);
    } else {
      await libraryService.update(game.gameId, {
        gameName: entry.gameName, description: entry.description, webUrl: entry.webUrl,
      });
    }
  } catch (err) {
    console.warn(`[saveGameToLibrary] Failed ${game.gameId}:`, err);
  }
}

function convertAndSort(entries: LibraryEntry[]): RealLibraryGame[] {
  const games = entries.map(entry => ({
    gameId: entry.gameId, name: entry.gameName, description: entry.description,
    coverVerticalImage: entry.coverVerticalImage, bannerImage: entry.bannerImage,
    status: entry.status as 'owned' | 'installed' | 'installing', localEntry: entry,
  }));
  return games.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function useMyGames() {
  const { wallet } = useWallet();
  const [games, setGames] = useState<RealLibraryGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => { return () => { isMounted.current = false; }; }, []);

  useEffect(() => {
    if (!wallet) { setLoading(false); setGames([]); return; }
    let cancelled = false;
    const loadGames = async () => {
      setLoading(true); setError(null);
      try {
        const localEntries = await libraryService.getAll();
        if (localEntries.length > 0 && !cancelled) {
          setGames(convertAndSort(localEntries)); setLoading(false);
          console.log(`[useMyGames] Loaded ${localEntries.length} games from local DB`);
        }
        if (!hasSyncedThisSession) {
          hasSyncedThisSession = true;
          await new Promise(r => setTimeout(r, 100));
          if (cancelled || !isMounted.current) return;
          setSyncing(true);
          try {
            let seedPhrase: string | null = null;
            if (wallet.runtimeWallet?.secret?.seedPhrase) seedPhrase = wallet.runtimeWallet.secret.seedPhrase;
            else if (wallet.encryptedSeedPhrase) {
              const isLockOpen = await walletService.isLockOpen();
              if (isLockOpen) seedPhrase = await walletService.decryptWalletData(wallet.encryptedSeedPhrase);
            }
            if (!seedPhrase) { setSyncing(false); if (!localEntries.length) setLoading(false); return; }
            let evmAddress = '', svmAddress = '';
            try {
              const db = new Dexie('peridotwallet');
              db.version(3).stores({ accounts: '++id, kind, publicKey, updatedAt' });
              const evmAcc = await db.table('accounts').where('kind').equals('evm').first();
              const svmAcc = await db.table('accounts').where('kind').equals('svm').first();
              if (evmAcc) evmAddress = evmAcc.publicKey;
              if (svmAcc) svmAddress = svmAcc.publicKey;
              db.close();
            } catch (dbErr) { console.warn('[useMyGames] DB error:', dbErr); }
            if (!evmAddress) evmAddress = deriveEvmAddressFromSeed(seedPhrase);
            if (!svmAddress) svmAddress = deriveSvmAddressFromSeed(seedPhrase);
            console.log('[useMyGames] Syncing from blockchain...');
            const [evmGames, svmGames] = await Promise.all([
              getMyGamesEvm({ address: evmAddress }), getMyGamesSvm({ address: svmAddress }),
            ]);
            for (const game of [...evmGames, ...svmGames]) {
              if (!game.name || game.name === 'Unknown Game') continue;
              await saveGameToLibrary(game);
            }
            const updatedEntries = await libraryService.getAll();
            if (!cancelled && isMounted.current) {
              setGames(convertAndSort(updatedEntries)); setLoading(false);
              console.log(`[useMyGames] Synced ${updatedEntries.length} games`);
            }
          } catch (syncErr) {
            console.error('[useMyGames] Sync error:', syncErr);
            if (isMounted.current) setError('Failed to sync games');
          } finally {
            if (isMounted.current) setSyncing(false);
          }
        }
      } catch (err) {
        console.error('[useMyGames] Error:', err);
        if (isMounted.current) setError('Failed to load library');
        setLoading(false);
      }
    };
    loadGames();
    return () => { cancelled = true; };
  }, [wallet]);

  return {
    games, loading, syncing, error,
    isEmpty: !loading && games.length === 0,
    reload: () => { hasSyncedThisSession = false; setLoading(true); },
  };
}
