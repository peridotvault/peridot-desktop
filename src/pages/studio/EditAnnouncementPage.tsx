// UpdateApp.tsx (replaces your old CreateApp.tsx for edit flow)
// @ts-ignore
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { InputFieldComponent } from '../../components/atoms/InputFieldComponent';
import { faCheck, faHeading, faMessage } from '@fortawesome/free-solid-svg-icons';
import { PhotoFieldComponent } from '../../components/atoms/PhotoFieldComponent';
import { DropDownComponent } from '../../components/atoms/DropDownComponent';
import { AppStatus } from '../../interfaces/app/GameInterface';
import { useWallet } from '@shared/contexts/WalletContext';
import {
  initAppStorage,
  InitResp,
  safeFileName,
  uploadToPrefix,
} from '../../shared/api/wasabi.api';
import { useParams } from 'react-router-dom';
import { AnnouncementContainer } from '../../features/announcement/components/ann-container.component';
import {
  createAnnouncement,
  getAllAnnouncementsByGameId,
  CreateAnnouncementTypes,
} from '../../blockchain/icp/vault/services/ICPAnnouncementService';
import { GameAnnouncementType } from '../../blockchain/icp/vault/service.did.d';

export default function EditAnnouncementPage() {
  const { wallet } = useWallet();

  /** ======================
   *  Storage App ID (folder)
   *  ====================== */
  const { gameId } = useParams();
  const [storage, setStorage] = useState<InitResp | null>(null);
  const [announcements, setAnnouncements] = useState<GameAnnouncementType[] | null>(null);

  // fetch all dev apps (so we can hydrate by gameId)

  // Init Wasabi folder structure (cover/, previews/, builds/..., metadata/)
  useEffect(() => {
    (async () => {
      try {
        if (!wallet || !gameId) return;
        const s = await initAppStorage(gameId!);
        setStorage(s);
      } catch (e) {
        console.error('initAppStorage failed:', e);
      }
    })();
  }, [gameId, wallet]);

  // Get all announcements by app id
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        if (!wallet) return;
        let listAnnouncement =
          (await getAllAnnouncementsByGameId({
            gameId: gameId!,
            wallet,
          })) ?? [];
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
        console.error(e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [gameId, wallet]);

  // ===== Announcements =====
  const [headline, setHeadline] = useState('');
  const [content, setContent] = useState('');
  const [announcementCoverImage, setAnnouncementCoverImage] = useState<string>('');
  const [announcementStatus, setAnnouncementStatus] = useState('');
  const [isAnnouncementPinned, setIsAnnouncementPinned] = useState(false);
  const announcementStatusOptions = [
    { code: 'draft', name: 'Draft' },
    { code: 'published', name: 'Published' },
    { code: 'archived', name: 'Archived' },
  ];

  // ===== General form =====

  // Tags (string array)

  // Previews (URL public Wasabi

  // per-OS manifests

  // native shared hw

  // UI
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ ok?: string; err?: string }>({});

  /** ======================
   *  HYDRATE FROM EXISTING APP
   *  ====================== */

  /** ======================
   *  UPLOAD HELPERS (Wasabi)
   *  ====================== */

  async function handleAnnouncementCoverChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    try {
      const { key } = await uploadToPrefix({
        file,
        prefix: storage.prefixes.announcements,
        fileName: safeFileName(file.name),
        contentType: file.type,
      });

      const apiUrl = `${import.meta.env.VITE_API_BASE}/files/${key}`;
      setAnnouncementCoverImage(apiUrl);
    } catch (err) {
      console.error('Upload announcement cover failed:', err);
    } finally {
      e.target.value = '';
    }
  }

  // Build file upload per manifest
  // REPLACE seluruh fungsi uploadBuildForManifest dengan ini

  /** ======================
   *  Payload ke canister
   *  ====================== */

  function mapAnnouncementStatusToBackend(code: string): string {
    if (code === 'published') return 'published';
    if (code === 'archived') return 'archived';
    return 'draft';
  }

  // ====== submit ======

  // ===== submit announcement =====
  const [isCreateAnnouncementFormDisplayed, setIsCreateAnnouncementFormDisplayed] = useState(false);
  async function onAnnouncementSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setBusy(true);
      setToast({});

      if (!announcementCoverImage) throw new Error('Announcement cover image is required.');

      const createData: CreateAnnouncementTypes = {
        headline: headline,
        content: content,
        coverImage: announcementCoverImage,
        pinned: isAnnouncementPinned,
        status: mapAnnouncementStatusToBackend(announcementStatus),
      };

      await createAnnouncement({
        createAnnouncementTypes: createData,
        wallet: wallet,
        gameId: gameId!,
      });

      // Refresh announcements list without reloading the page
      if (wallet && gameId) {
        let listAnnouncement =
          (await getAllAnnouncementsByGameId({
            gameId: gameId,
            wallet,
          })) ?? [];
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
        setAnnouncements(listAnnouncement);
      }

      setIsCreateAnnouncementFormDisplayed(false);
      setHeadline('');
      setContent('');
      setAnnouncementCoverImage('');
      setIsAnnouncementPinned(false);
      setAnnouncementStatus('');
      setToast({ ok: 'Announcement created successfully 🎉' });
    } catch (err: any) {
      console.error(err);
      setToast({ err: err?.message ?? String(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl pb-4">Announcements</h1>
      {toast.ok && (
        <div className="rounded-lg border border-success text-success px-4 py-2">{toast.ok}</div>
      )}
      {toast.err && (
        <div className="rounded-lg border border-danger text-danger px-4 py-2">{toast.err}</div>
      )}
      <div className="flex justify-start">
        <button
          type="button"
          disabled={busy}
          className={
            isCreateAnnouncementFormDisplayed
              ? 'shadow-flat-sm my-6 px-6 py-3 rounded-md bg-red-500/20'
              : 'shadow-flat-sm my-6 px-6 py-3 rounded-md bg-green-500/20'
          }
          onClick={() => setIsCreateAnnouncementFormDisplayed(!isCreateAnnouncementFormDisplayed)}
        >
          {isCreateAnnouncementFormDisplayed ? 'Cancel' : 'Create New Announcement'}
        </button>
      </div>
      <form
        onSubmit={onAnnouncementSubmit}
        className={isCreateAnnouncementFormDisplayed ? 'container flex flex-col gap-8' : 'hidden'}
      >
        <h1 className="text-3xl pb-4">Announcements</h1>

        <InputFieldComponent
          name="Headline"
          icon={faHeading}
          type="text"
          placeholder="Headline"
          value={headline}
          onChange={(e) => setHeadline((e.target as HTMLInputElement).value)}
        />
        <InputFieldComponent
          name="Content"
          icon={faMessage}
          type="text"
          placeholder="Content"
          value={content}
          onChange={(e) => setContent((e.target as HTMLInputElement).value)}
        />
        <PhotoFieldComponent
          title="Cover Image"
          imageUrl={announcementCoverImage}
          onChange={handleAnnouncementCoverChange}
        />
        <DropDownComponent
          name="status"
          icon={faCheck}
          placeholder="Status"
          className=""
          value={announcementStatus}
          options={announcementStatusOptions.map((s) => ({
            code: s.code,
            name: s.name,
          }))}
          onChange={(e) =>
            setAnnouncementStatus((e.target as HTMLSelectElement).value as keyof AppStatus)
          }
        />
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="pin-announcement"
            checked={isAnnouncementPinned}
            onChange={(e) => setIsAnnouncementPinned(e.target.checked)}
          />
          <label htmlFor="pin-announcement" className="cursor-pointer select-none">
            Pin Announcement
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={busy}
            className={`shadow-flat-sm my-6 px-6 py-3 rounded-md ${
              busy ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {busy ? 'Creating...' : 'Create Announcement'}
          </button>
        </div>
      </form>
      <div className="flex flex-col gap-6">
        {announcements?.map((item, index) => (
          <AnnouncementContainer item={item} key={index} />
        ))}
      </div>
    </div>
  );
}
