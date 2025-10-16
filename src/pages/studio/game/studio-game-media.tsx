import React from 'react';
import { ButtonWithSound } from '../../../components/atoms/button-with-sound';
import { InputPreviews } from '../../../components/atoms/input-previews';
import { useParams } from 'react-router-dom';
import { DraftService } from '../../../local-db/game/services/draft-services';
import {
  dbToInputPreviews,
  inputPreviewsToDb,
  readPreviews,
} from '../../../lib/helpers/helper-pgl1';
import { PreviewItem } from '../../../lib/interfaces/types-game';
import { initAppStorage, uploadToPrefix } from '../../../api/wasabiClient'; // ✅

export const StudioGameMedia = () => {
  const { gameId } = useParams<{ gameId: string }>();
  if (!gameId) {
    return <div>Invalid game ID</div>;
  }

  const [previews, setPreviews] = React.useState<PreviewItem[]>([]); // ✅ tipe benar

  // --- Load draft ---
  React.useEffect(() => {
    const loadDraft = async () => {
      const draft = await DraftService.get(gameId);
      if (draft) {
        // ✅ Konversi dari DB ke format InputPreviews
        setPreviews(dbToInputPreviews(readPreviews(draft.pgl1_metadata)));
      }
    };
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

    return `${import.meta.env.VITE_API_BASE}/files/${key}`;
  };

  // --- Handle file selection ---
  const handlePreviewsChange = async (newItems: PreviewItem[]) => {
    const updatedItems = [...newItems];

    // Upload file yang masih pakai blob URL
    for (let i = 0; i < updatedItems.length; i++) {
      const item = updatedItems[i];

      // Jika URL masih blob:, berarti belum di-upload
      if (item.url.startsWith('blob:')) {
        try {
          const permanentUrl = await uploadFile(item.file, i);
          updatedItems[i] = {
            ...item,
            url: permanentUrl,
            // Tetap simpan file untuk alt text
          };
        } catch (err) {
          console.error('Upload failed:', err);
          alert(`Gagal upload preview ke-${i + 1}`);
        }
      }
    }

    setPreviews(updatedItems);
  };

  // --- Save ---
  const handleSaveDraft = async () => {
    try {
      // ✅ Konversi ke format database sebelum simpan
      const dbPreviews = inputPreviewsToDb(previews);
      await DraftService.updatePreviews(gameId, dbPreviews);
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

        {/* Previews */}
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
      </div>
    </div>
  );
};
