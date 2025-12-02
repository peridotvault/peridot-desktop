// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
import { faClock, faDownload, faPlay, faRocket, faStore } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { getGameByGameId, getLiveManifestForPlatform } from '@shared/blockchain/icp/services/game';
import { useParams } from 'react-router-dom';
import { useWallet } from '@shared/contexts/WalletContext';
import { AnnouncementContainer } from '@features/announcement/components/ann-container.component';
import { useInstalled } from '@features/download/hooks/useInstalled';
import { useDownloadManager } from '@components/molecules/DownloadManager';
import type { Distribution, PGCGame } from '@shared/blockchain/icp/types/game';
import type { GameAnnouncementType } from '@shared/blockchain/icp/types/game';
import { getAllAnnouncementsByGameId } from '@features/game/services/announcement';
import { PriceCoin } from '@shared/components/ui/CoinPrice';
import { isZeroTokenAmount, resolveTokenInfo } from '@shared/utils/token-info';
import { getGameRecordById } from '@features/game/services/record';
import type { Manifest as PGCLiveManifest } from '@shared/blockchain/icp/sdk/canisters/pgc1.did.d';
import { ButtonWithSound } from '@shared/components/ui/ButtonWithSound';
import { ImageLoading } from '@shared/constants/images';
import {
  buildLaunchState,
  launchGame,
  resolveDistributions,
  resolveWebBuildUrl,
} from '@features/game/services/launchGame';
import { detectOSKey } from '@shared/utils/os';

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

  // normalize appId untuk penyimpanan lokal
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

  const resolvedDistributions: Distribution[] = useMemo(
    () => resolveDistributions(theGame),
    [theGame],
  );

  // pilih OS aktif (untuk native)
  const osKey = useMemo(() => detectOSKey(), []);
  const { installed, latest } = useInstalled(appIdKey, osKey); // status ter-install untuk OS ini

  const webUrl = useMemo(
    () =>
      resolveWebBuildUrl({
        game: theGame,
        distributions: resolvedDistributions,
        chainWebUrl,
      }),
    [chainWebUrl, resolvedDistributions, theGame],
  );

  const launchState = useMemo(
    () =>
      buildLaunchState({
        game: theGame,
        gameId: appIdKey,
        distributions: resolvedDistributions,
        osKey,
        webUrl,
        installedEntry: latest,
        installed,
      }),
    [appIdKey, installed, latest, osKey, resolvedDistributions, theGame, webUrl],
  );

  const hasNativeForOS = launchState?.hasNativeForOS ?? false;
  const hasWeb = launchState?.hasWeb ?? false;

  const heroImage =
    theGame?.bannerImage ??
    theGame?.coverHorizontalImage ??
    theGame?.coverVerticalImage ??
    theGame?.metadata?.bannerImage ??
    theGame?.metadata?.coverHorizontalImage ??
    theGame?.metadata?.coverVerticalImage ??
    ImageLoading;

  const onLaunch = async () => {
    await launchGame(launchState, {
      preferGameWindow: true,
      notify: (msg) => alert(msg),
    });
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
