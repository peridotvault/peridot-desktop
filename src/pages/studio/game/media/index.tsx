import React, { useState } from 'react';
import { ButtonWithSound } from '../../../../shared/components/ui/ButtonWithSound';
import { InputPreviews } from '../../../../components/atoms/input-previews';
import { useParams } from 'react-router-dom';
import { PreviewItem } from '@shared/interfaces/game.types';
import {
  API_BASE_STORAGE,
  initAppStorage,
  uploadToPrefix,
} from '../../../../shared/api/wasabi.api'; // ✅
import { LoadingPage } from '../../../additional/loading-page';
import { updatePreviews } from '../../../../features/game/api/game-draft.api';
import { GamePreview } from '@shared/interfaces/game-draft.types';
import { LoadingComponent } from '../../../../components/atoms/loading.component';
import { fetchDraftPreviewsCombined } from '@features/game/services/draft.service';

export const StudioGameMedia = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const [loading, setLoading] = useState<boolean>(false);
  if (!gameId) {
    return <div>Invalid game ID</div>;
  }

  const [previews, setPreviews] = React.useState<PreviewItem[]>([]);

  // --- Load draft ---
  const loadDraft = async () => {
    try {
      setLoading(true);
      const { data } = await fetchDraftPreviewsCombined(gameId);
      const previewItems: PreviewItem[] = [];
      (data.previews || []).forEach((p, i) => {
        const src = (p.src ?? p.url ?? '').trim();
        if (!src) return;
        previewItems.push({
          id: `preview-${i}`,
          file:
            typeof File !== 'undefined'
              ? new File([], src.split('/').pop() || 'preview.jpg')
              : undefined,
          url: src,
          src,
          kind: p.kind,
        });
      });
      setPreviews(previewItems);
    } catch (error) {
      console.error('Failed to load previews:', error);
      alert('Gagal memuat preview');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDraft();
  }, [gameId]);

  // --- Upload helper ---
  const uploadFile = async (file: File, index: number): Promise<string> => {
    const storage = await initAppStorage(gameId);
    const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
    const fileName = `${gameId}-preview-${index}.${ext}`;

    const { key } = await uploadToPrefix({
      file,
      prefix: storage.prefixes.previews,
      fileName,
      contentType: file.type,
      public: true,
    });

    return `${API_BASE_STORAGE}/files/${key}`;
  };

  // --- Handle file selection ---
  const handlePreviewsChange = async (newItems: PreviewItem[]) => {
    try {
      setLoading(true);
      const updatedItems = [...newItems];

      // Upload file yang masih pakai blob URL
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];

        // Jika URL masih blob:, berarti belum di-upload
        if (item.url.startsWith('blob:') && item.file) {
          try {
            const permanentUrl = await uploadFile(item.file, i);
            updatedItems[i] = {
              ...item,
              url: permanentUrl,
              src: permanentUrl,
              // Tetap simpan file untuk alt text
            };
          } catch (err) {
            console.error('Upload failed:', err);
            alert(`Gagal upload preview ke-${i + 1}`);
          }
        }
      }

      setPreviews(updatedItems);
    } catch (error) {
      error;
    } finally {
      setLoading(false);
    }
  };

  // --- Save ---
  const handleSaveDraft = async () => {
    try {
      const savePreviews = previews.map((p) => ({
        kind: p.kind,
        src: p.src ?? p.url,
      }));
      const apiPreviews: GamePreview = { previews: savePreviews };
      await updatePreviews(gameId, apiPreviews);
      alert('Draft saved successfully!');
    } catch (err) {
      console.error('Failed to save draft:', err);
      alert('Failed to save draft');
    }
  };

  // --- UI ---
  const HeaderContainer = ({ title, description }: { title: string; description: string }) => (
    <div>
      <h2 className="text-2xl mb-2">{title}</h2>
      <p className="text-foreground/70">{description}</p>
    </div>
  );

  if (loading) {
    <LoadingPage />;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-14">
        {/* Header */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Media Upload</h1>
            <p className="text-foreground/70">This information appears on PeridotVault</p>
          </div>
          <ButtonWithSound
            onClick={handleSaveDraft}
            className="bg-card-foreground text-card font-bold py-2 px-6 rounded-md"
          >
            <span>Save to Draft</span>
          </ButtonWithSound>
        </section>

        {loading ? (
          <LoadingComponent />
        ) : (
          <section className="grid gap-8">
            <HeaderContainer
              title="Upload Previews"
              description="Upload cover for your game page on PeridotVault"
            />
            <InputPreviews
              label="Previews"
              multiple
              className="h-72"
              maxFiles={20}
              maxSize={8 * 1024 * 1024}
              helperText="Dukungan gambar & video. Rekomendasi rasio 16:9. Urutan akan dipakai untuk tampilan."
              value={previews}
              onChange={handlePreviewsChange}
            />
          </section>
        )}
      </div>
    </div>
  );
};
