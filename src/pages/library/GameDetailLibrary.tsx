// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
import { faClock, faDownload, faPlay, faRocket, faStore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isNative, isWeb } from '../../interfaces/app/AppInterface';
import { useParams } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { AnnouncementContainer } from '../../components/atoms/AnnouncementContainer';
import { useInstalled } from '../../hooks/useInstalled';
import { getInstalledRecord } from '../../utils/installedStorage';
import { useDownloadManager } from '../../components/molecules/DownloadManager';
import { getGamesByGameId } from '../../blockchain/icp/vault/services/ICPGameService';
import {
  Distribution,
  GameAnnouncementType,
  PGLMeta,
} from '../../blockchain/icp/vault/service.did.d';
import { getAllAnnouncementsByGameId } from '../../blockchain/icp/vault/services/ICPAnnouncementService';
import { optGetOr } from '../../interfaces/helpers/icp.helpers';
import { ImageLoading } from '../../constants/lib.const';

// helper deteksi OSKey
function detectOSKey(): 'windows' | 'macos' | 'linux' {
  const p = (navigator.platform || '').toLowerCase();
  const ua = (navigator.userAgent || '').toLowerCase();
  if (p.includes('win') || ua.includes('windows')) return 'windows';
  if (p.includes('mac') || ua.includes('mac') || ua.includes('darwin')) return 'macos';
  return 'linux';
}

export default function GameDetailLibrary() {
  const { gameId } = useParams();
  const { openInstallModal } = useDownloadManager();
  const { wallet } = useWallet();
  const [announcements, setAnnouncements] = useState<GameAnnouncementType[] | null>(null);

  const [theGame, setTheGame] = useState<PGLMeta | null>();

  // normalize appId untuk localStorage key
  const appIdKey = useMemo(() => {
    try {
      return gameId ? gameId : undefined;
    } catch {
      return gameId;
    }
  }, [gameId]);

  const installHere = () => {
    if (!theGame) return;
    openInstallModal(theGame);
  };

  // pilih OS aktif (untuk native)
  const osKey = useMemo(() => detectOSKey(), []);
  const { installed, latest } = useInstalled(appIdKey!, osKey); // status ter-install untuk OS ini

  // apakah ada web dist?
  const hasWeb = useMemo(() => {
    const dists = unwrapOptVec<Distribution>(theGame?.pgl1_distribution as any);
    return dists.some(isWeb);
  }, [theGame]);

  // apakah ada native dist utk OS ini?
  const hasNativeForOS = useMemo(() => {
    const dists = unwrapOptVec<Distribution>(theGame?.pgl1_distribution as any);
    return dists.some(
      (d) => isNative(d),
      // &&
      //   (('windows' in d.native.os && osKey === 'windows') ||
      //     ('macos' in d.native.os && osKey === 'macos') ||
      //     ('linux' in d.native.os && osKey === 'linux')),
    );
  }, [theGame, osKey]);

  const onLaunch = async () => {
    if (hasWeb) return openWebApp();

    const rec = appIdKey ? getInstalledRecord(appIdKey) : null;
    const entry = latest || rec?.entries[0];
    if (!entry) {
      alert('App belum terpasang.');
      return;
    }

    const candidate = entry.launchPath || entry.filePath || entry.installDir;
    if (!candidate) {
      alert('Lokasi aplikasi tidak ditemukan. Silakan install ulang.');
      return;
    }

    if ((window as any).electronAPI?.launchApp) {
      const res = await (window as any).electronAPI.launchApp(candidate);
      if (!res?.ok) alert('Gagal menjalankan aplikasi: ' + (res?.error || 'unknown'));
    } else {
      // Fallback: buka folder (browser)
      if (entry.installDir) {
        alert('Tidak berjalan di Electron. Buka folder: ' + entry.installDir);
      } else {
        alert('Tidak berjalan di Electron.');
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
        const res = await getGamesByGameId({ gameId: gameId! });
        console.log(res);
        if (!cancelled) setTheGame(res);

        let listAnnouncement =
          (await getAllAnnouncementsByGameId({
            gameId: gameId!,
            wallet,
          })) ?? [];
        // Sort: pinned first, then by createdAt descending
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

  function unwrapOptVec<T>(v: T[] | [T[]] | null | undefined): T[] {
    if (!v) return [];
    return Array.isArray(v) && v.length === 1 && Array.isArray(v[0]) ? v[0] : (v as T[]);
  }

  // Ambil url web pertama dari distributions
  function getWebUrlFromApp(app?: PGLMeta | null): string | null {
    if (!app) return null;
    const dists = unwrapOptVec<Distribution>(app.pgl1_distribution as any);
    const web = dists.find(isWeb) as { web: { url: string } } | undefined;
    return web?.web?.url ?? null;
  }

  const openWebApp = () => {
    const url = getWebUrlFromApp(theGame);
    if (!url) {
      alert('Web build URL tidak tersedia untuk app ini.');
      return;
    }
    // Jika jalan di Electron + preload expose electronAPI
    if ((window as any).electronAPI?.openWebGame) {
      (window as any).electronAPI.openWebGame(url);
    } else {
      // fallback browser biasa
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };
  return (
    <main className="flex flex-col items-center gap-5 mb-32">
      <div className="bg-white w-full h-96 relative">
        <img
          src={optGetOr(theGame!.pgl1_banner_image, ImageLoading)}
          className="object-cover w-full h-[30rem]"
          alt=""
        />
        <div className="bg-gradient-to-t from-background_primary via-background_primary/50 w-full h-[7rem] absolute bottom-0 translate-y-[6.2rem]"></div>
      </div>

      {/* column */}
      <div className="container flex gap-8 px-6 z-10 ">
        {/* left column ========================================== */}
        <div className="flex flex-col gap-8 w-2/3">
          {/* Header  */}
          <section className="flex flex-col gap-4">
            <p className="text-3xl font-medium">{theGame?.pgl1_name}</p>
            <div className="flex gap-4">
              <p className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faClock} className="text-text_disabled" />
                <label className="text-text_disabled">Play Time : </label> 2038 hours
              </p>
              <div className="border border-background_disabled"></div>
              <p className="flex gap-2 items-center">
                <FontAwesomeIcon icon={faRocket} className="text-text_disabled" />
                <label className="text-text_disabled">Last Launched : </label> Nov 29, 2024
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
          <section className="bg-background_primary shadow-flat-sm w-full p-6 rounded-2xl flex flex-col gap-6">
            {/* price */}
            <div className="flex flex-col gap-2">
              <p>current price</p>
              <p className="text-3xl font-bold">
                {Number(theGame?.pgl1_price) > 0 ? String(theGame?.pgl1_price) + ' PER' : 'FREE'}
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col gap-4">
              {installed || hasWeb ? (
                <button
                  onClick={onLaunch}
                  className="bg-accent_secondary px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center"
                >
                  <FontAwesomeIcon icon={faPlay} />
                  {hasWeb && !installed ? 'Play (Web)' : 'Launch'}
                </button>
              ) : null}

              {!installed && hasNativeForOS && (
                <button
                  onClick={installHere}
                  className="border border-white/20 px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center"
                >
                  <FontAwesomeIcon icon={faDownload} />
                  Install for {osKey === 'macos' ? 'macOS' : osKey}
                </button>
              )}

              <button className="border border-white/20 px-6 py-2 rounded-lg flex gap-2 items-center w-full justify-center">
                <FontAwesomeIcon icon={faStore} />
                Item Market
              </button>
            </div>

            {/* detail kecil status */}
            <div className="text-sm opacity-70">
              {installed ? (
                <>Installed {latest?.version ? <>v{latest.version}</> : null}</>
              ) : hasWeb ? (
                'Playable via Web'
              ) : hasNativeForOS ? (
                'Not installed'
              ) : (
                'No build for this OS'
              )}
            </div>
          </section>

          <div className="my-32" />
        </div>
      </div>
    </main>
  );
}
