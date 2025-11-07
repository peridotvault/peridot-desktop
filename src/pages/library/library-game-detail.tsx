// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
import { faClock, faDownload, faPlay, faRocket, faStore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  getGameByGameId,
  getLiveManifestForPlatform,
} from '@shared/blockchain/icp/services/game.service';
// import { isNative, isWeb } dari GameInterface mungkin perlu disesuaikan jika tipe berubah
// import { isNative, isWeb } from '../../interfaces/app/GameInterface'; // Tidak digunakan karena struktur berbeda
import { useParams } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import { AnnouncementContainer } from '../../features/announcement/components/ann-container.component';
import { useInstalled } from '../../features/download/hooks/useInstalled';
import { useDownloadManager } from '../../components/molecules/DownloadManager';
import type { Distribution, PGCGame } from '@shared/blockchain/icp/types/game.types';
import type { GameAnnouncementType } from '@shared/blockchain/icp/types/game.types';
import { getAllAnnouncementsByGameId } from '@features/game/services/announcement.service';
// import { optGetOr } from '../../interfaces/helpers/icp.helpers'; // Tidak digunakan di sini
import { ImageLoading } from '../../constants/lib.const';
import { getInstalledRecord } from '@shared/lib/utils/installedStorage';
import { PriceCoin } from '@shared/lib/constants/const-price';
import { isZeroTokenAmount, resolveTokenInfo } from '@shared/utils/token-info';
import { getGameRecordById } from '@features/game/services/record.service';
import type { Manifest as PGCLiveManifest } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';
import { ButtonWithSound } from '@shared/components/ui/button-with-sound';

// helper deteksi OSKey
function detectOSKey(): 'windows' | 'macos' | 'linux' {
  const p = (navigator.platform || '').toLowerCase();
  const ua = (navigator.userAgent || '').toLowerCase();
  if (p.includes('win') || ua.includes('windows')) return 'windows';
  if (p.includes('mac') || ua.includes('mac') || ua.includes('darwin')) return 'macos';
  return 'linux';
}

// Fungsi helper untuk mengecek apakah distribusi adalah NativeBuild
// Karena struktur data sekarang adalah Array<Array<Distribution>>, kita periksa dalam resolveFromApp
// Tapi jika Anda perlu di sini, Anda harus mengiterasi struktur yang salah terlebih dahulu
// Lebih baik tetap di DownloadManager.tsx
// function isNative(d: any): d is { native: NativeBuild } { return 'native' in d; }
// function isWeb(d: any): d is { web: WebBuild } { return 'web' in d; }

export default function LibraryGameDetail() {
  const { gameId } = useParams();
  const { openInstallModal } = useDownloadManager();
  const { wallet } = useWallet();
  const [announcements, setAnnouncements] = useState<GameAnnouncementType[] | null>(null);

  const [theGame, setTheGame] = useState<PGCGame | null>(null);
  const [chainWebUrl, setChainWebUrl] = useState<string | null>(null);

  const tokenCanister = theGame?.tokenPayment;
  const rawPrice = theGame?.price ?? 0;
  const tokenInfo = resolveTokenInfo(tokenCanister);
  const priceIsFree = isZeroTokenAmount(rawPrice, tokenInfo.decimals);

  // normalize appId untuk localStorage key
  const appIdKey = useMemo(() => {
    try {
      return gameId ? gameId : undefined;
    } catch {
      return gameId;
    }
  }, [gameId]);

  const installHere = () => {
    if (!theGame || !hasNativeForOS) return;
    openInstallModal(theGame);
  };

  const normalizeStringValue = (value: unknown): string => {
    if (Array.isArray(value)) {
      const first = value[0];
      return typeof first === 'string' ? first : '';
    }
    return typeof value === 'string' ? value : '';
  };

  const storageRefToUrl = (manifest: PGCLiveManifest | null): string | null => {
    if (!manifest) return null;
    const storage = (manifest as any).storage ?? (manifest as any).storageRef;
    if (!storage) return null;
    if ('url' in storage) {
      const url = storage.url?.url;
      return typeof url === 'string' ? url : null;
    }
    return null;
  };

  const resolvedDistributions: Distribution[] = useMemo(() => {
    const game = theGame;
    if (!game) return [];
    if (Array.isArray(game.distribution) && game.distribution.length) {
      return game.distribution;
    }
    const meta = game.metadata as
      | { distribution?: Distribution[]; distributions?: Distribution[] }
      | null
      | undefined;
    if (meta) {
      if (Array.isArray(meta.distribution) && meta.distribution.length) {
        return meta.distribution;
      }
      if (Array.isArray(meta.distributions) && meta.distributions.length) {
        return meta.distributions;
      }
    }
    return [];
  }, [theGame]);

  // pilih OS aktif (untuk native)
  const osKey = useMemo(() => detectOSKey(), []);
  const { installed, latest } = useInstalled(appIdKey!, osKey); // status ter-install untuk OS ini

  // apakah ada native dist utk OS ini?
  // Perubahan: Gunakan unwrapOptVec dan sesuaikan dengan struktur array dalam array
  const hasNativeForOS = useMemo(() => {
    if (!resolvedDistributions.length) return false;
    return resolvedDistributions.some(
      (dist) => 'native' in dist && dist.native.os.toLowerCase() === osKey,
    );
  }, [resolvedDistributions, osKey]);

  const webUrl = useMemo(() => {
    const game = theGame;
    if (!game) return null;
    if (resolvedDistributions.length) {
      const distEntry = resolvedDistributions.find((dist) => 'web' in dist && !!dist.web.url);
      if (distEntry && 'web' in distEntry) {
        const url = normalizeStringValue(distEntry.web.url);
        if (url.trim()) return url.trim();
      }
    }
    const fallback = chainWebUrl ?? game.metadata?.website ?? '';
    return fallback.trim() ? fallback.trim() : null;
  }, [resolvedDistributions, theGame, chainWebUrl]);

  const hasWeb = useMemo(() => !!webUrl, [webUrl]);

  const heroImage =
    theGame?.bannerImage ??
    theGame?.coverHorizontalImage ??
    theGame?.coverVerticalImage ??
    theGame?.metadata?.bannerImage ??
    theGame?.metadata?.coverHorizontalImage ??
    theGame?.metadata?.coverVerticalImage ??
    ImageLoading;

  const onLaunch = async () => {
    if (hasWeb && webUrl) {
      openWebApp(webUrl);
      return;
    }

    const rec = appIdKey ? getInstalledRecord(appIdKey) : null;
    const entry = latest || rec?.entries[0];
    if (!entry) {
      alert('App belum terpasang.');
      return;
    }

    // Gunakan launchPath jika tersedia, jika tidak, coba filePath atau installDir
    const candidate = entry.launchPath || entry.filePath || entry.installDir;
    if (!candidate) {
      alert('Lokasi aplikasi tidak ditemukan. Silakan install ulang.');
      return;
    }

    if ((window as any).electronAPI?.launchApp) {
      const res = await (window as any).electronAPI.launchApp(candidate);
      if (!res?.ok) alert('Gagal menjalankan aplikasi: ' + (res?.error || 'unknown'));
    } else {
      // Fallback: buka folder (browser) jika launchPath tidak tersedia
      if (entry.installDir) {
        alert('Tidak berjalan di Electron. Buka folder: ' + entry.installDir);
      } else if (entry.filePath) {
        alert('Tidak berjalan di Electron. Buka file: ' + entry.filePath);
      } else {
        alert('Tidak berjalan di Electron. Tidak ada lokasi file/folder yang dikenali.');
      }
    }
  };

  useEffect(() => {
    // scroll ke atas tiap ganti game (opsional)
    window.scrollTo(0, 0);

    // validasi appId
    const idNum = gameId;
    if (!gameId || Number.isNaN(idNum)) {
      setTheGame(null);
      return;
    }

    let cancelled = false;
    async function fetchData() {
      let isMounted = true;
      try {
        setTheGame(null); // reset agar tidak menampilkan data lama
        const res = await getGameByGameId({ gameId: gameId! });
        if (!cancelled) setTheGame(res);

        let listAnnouncement =
          (await getAllAnnouncementsByGameId({
            gameId: gameId!,
            wallet,
          })) ?? [];
        // Filter only published announcements
        listAnnouncement = listAnnouncement.filter(
          (item) =>
            item.status &&
            typeof item.status === 'object' &&
            Object.keys(item.status)[0] === 'published',
        );
        // Sort: pinned first, then by createdAt descending
        listAnnouncement = listAnnouncement.sort((a, b) => {
          // Pinned first
          if (a.pinned && !b.pinned) return -1;
          if (!a.pinned && b.pinned) return 1;
          // Then by createdAt descending
          const aCreated = a.createdAt ? Number(a.createdAt) : 0;
          const bCreated = b.createdAt ? Number(b.createdAt) : 0;
          return bCreated - aCreated;
        });

        if (isMounted) setAnnouncements(listAnnouncement);
      } catch (e) {
        if (!cancelled) setTheGame(null);
        // optionally: tampilkan notifikasi error
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [gameId, wallet]);

  useEffect(() => {
    if (!gameId) return;
    let cancelled = false;
    (async () => {
      try {
        const record = await getGameRecordById({ gameId });
        if (!record || cancelled) return;
        const canisterId =
          typeof record.canister_id === 'string'
            ? record.canister_id
            : record.canister_id?.toText();
        if (!canisterId) return;
        const manifest = await getLiveManifestForPlatform({
          canisterId,
          platform: 'web',
        });
        if (cancelled) return;
        const url = storageRefToUrl(manifest);
        if (url?.trim()) {
          setChainWebUrl(url.trim());
        }
      } catch (error) {
        console.warn('[Library] Unable to resolve live web manifest', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const openWebApp = (url?: string | null) => {
    const target = url ?? webUrl;
    if (!target) {
      alert('Web build URL tidak tersedia untuk app ini.');
      return;
    }

    if ((window as any).electronAPI?.openWebGame) {
      (window as any).electronAPI.openWebGame(target);
    } else {
      window.open(target, '_blank', 'noopener,noreferrer');
    }
  };

  const getWebStatus = () => {
    if (installed) {
      return `Installed${latest?.version ? ` v${latest.version}` : ''}`;
    }
    if (hasWeb) {
      return 'Playable instantly via browser';
    }
    if (hasNativeForOS) {
      return 'Download required before playing';
    }
    return 'No build for this OS';
  };

  return (
    <main className="flex flex-col items-center gap-5 mb-32">
      <div className="bg-foreground w-full h-96 relative">
        <img src={heroImage} className="object-cover w-full h-120 bg-card" alt="" />
        <div className="bg-linear-to-t from-background via-background/50 w-full h-28 absolute bottom-0 translate-y-[6.2rem]"></div>
      </div>

      {/* column */}
      <div className="container flex gap-8 px-6 z-10 ">
        {/* left column ========================================== */}
        <div className="flex flex-col gap-8 w-2/3">
          {/* Header  */}
          <section className="flex flex-col gap-4">
            <p className="text-3xl font-medium">{theGame?.name ?? 'Untitled Game'}</p>
            <div className="flex gap-4">
              <p className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faClock} className="text-muted-foreground" />
                <label className="text-muted-foreground">Play Time : </label> 2038 hours
              </p>
              <div className="border border-muted"></div>
              <p className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faRocket} className="text-muted-foreground" />
                <label className="text-muted-foreground">Last Launched : </label> Nov 29, 2024
              </p>
            </div>
          </section>

          {/* Announcements  */}
          {announcements?.map((item, index) => (
            <AnnouncementContainer key={index} item={item} />
          ))}
        </div>
        {/* right column ========================================== */}
        <div className="w-1/3 min-w-[300px] flex flex-col gap-8">
          <section className="bg-background shadow-flat-sm w-full p-6 rounded-2xl flex flex-col gap-6">
            {/* price */}
            <div className="flex flex-col gap-2">
              <p>current price</p>
              <div className="text-3xl font-bold">
                {priceIsFree ? (
                  'FREE'
                ) : (
                  <PriceCoin amount={rawPrice ?? 0} tokenCanister={tokenCanister} textSize="xl" />
                )}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4">
              {(hasWeb || installed) && (
                <ButtonWithSound
                  onClick={() => onLaunch()}
                  className="bg-accent px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center"
                >
                  <FontAwesomeIcon icon={faPlay} />
                  {hasWeb && !installed ? 'Play Now (Web)' : 'Launch'}
                </ButtonWithSound>
              )}

              {!installed && hasNativeForOS && (
                <ButtonWithSound
                  onClick={installHere}
                  className="border border-foreground/20 px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Download for {osKey === 'macos' ? 'macOS' : osKey}
                </ButtonWithSound>
              )}

              <ButtonWithSound className="border border-foreground/20 px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center">
                <FontAwesomeIcon icon={faStore} />
                Item Market
              </ButtonWithSound>
            </div>

            {/* detail kecil status */}
            <div className="text-sm opacity-70">{getWebStatus()}</div>
          </section>

          <div className="my-32" />
        </div>
      </div>
    </main>
  );
}
