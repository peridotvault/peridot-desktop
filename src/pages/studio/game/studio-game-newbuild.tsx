import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe, faCloudArrowUp } from '@fortawesome/free-solid-svg-icons';
import { faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import { InputDropdown } from '../../../components/atoms/input-dropdown';
import { ButtonWithSound } from '../../../components/atoms/button-with-sound';
import { InputFloating } from '../../../components/atoms/input-floating';
import { Manifest, Platform } from '../../../lib/interfaces/game.types';
import { initAppStorage, uploadToPrefix } from '../../../api/wasabiClient';
import { appendManifest, fetchBuilds } from '../../../api/game-draft.api';

type PlatformBuildData = {
  version: string;
  file: File | null;
};

type NewBuildFormData = {
  platforms: Platform[];
  webUrl: string;
  platformData: Partial<Record<Platform, PlatformBuildData>>;
};

const platformInfo: Record<Platform, { label: string; icon: any; accept?: string; hint?: string }> =
  {
    windows: { label: 'Windows', icon: faWindows, accept: '.zip,.exe', hint: 'ZIP/EXE (Win64)' },
    macos: {
      label: 'macOS',
      icon: faApple,
      accept: '.zip,.dmg',
      hint: 'ZIP/DMG (Apple Silicon/Intel)',
    },
    linux: { label: 'Linux', icon: faLinux, accept: '.zip,.AppImage', hint: 'ZIP/AppImage' },
    web: { label: 'Website', icon: faGlobe },
  };

const bytesToHuman = (b: number) => {
  if (b < 1024) return `${b} B`;
  const k = b / 1024;
  if (k < 1024) return `${k.toFixed(1)} KB`;
  const m = k / 1024;
  if (m < 1024) return `${m.toFixed(1)} MB`;
  return `${(m / 1024).toFixed(1)} GB`;
};

// ✅ Helper: Data default untuk setiap platform
const getDefaultPlatformData = (): PlatformBuildData => ({
  version: '',
  file: null,
});

export const StudioGameNewBuild: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  if (!gameId) {
    alert('Game ID tidak ditemukan');
    navigate('/studio');
    return;
  }

  const [formData, setFormData] = React.useState<NewBuildFormData>({
    platforms: [],
    webUrl: '',
    platformData: {},
  });

  const [error, setError] = React.useState<string | null>(null);

  const totalSize = React.useMemo(() => {
    return Object.values(formData.platformData)
      .map((data) => data?.file?.size || 0)
      .reduce((a, b) => a + b, 0);
  }, [formData.platformData]);

  const platformOptions = [
    { value: 'windows' as Platform, label: 'Windows' },
    { value: 'macos' as Platform, label: 'macOS' },
    { value: 'linux' as Platform, label: 'Linux' },
    // { value: 'web' as Platform, label: 'Website' },
  ];

  // ✅ Helper: Pastikan data platform ada
  const getPlatformData = (platform: Platform): PlatformBuildData => {
    return formData.platformData[platform] || getDefaultPlatformData();
  };

  const updateVersion = (platform: Platform, version: string) => {
    setFormData((prev) => ({
      ...prev,
      platformData: {
        ...prev.platformData,
        [platform]: {
          ...getDefaultPlatformData(),
          ...prev.platformData[platform],
          version,
        },
      },
    }));
  };

  const updateFile = (platform: Platform, file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      platformData: {
        ...prev.platformData,
        [platform]: {
          ...getDefaultPlatformData(),
          ...prev.platformData[platform],
          file,
        },
      },
    }));
  };

  const pickFile = (platform: Platform, fileList: FileList | null) => {
    const file = fileList?.[0] || null;
    updateFile(platform, file);
  };

  const removeFile = (platform: Platform) => {
    updateFile(platform, null);
  };

  const handlePlatformChange = (platforms: string[]) => {
    const newPlatforms = platforms as Platform[];
    const newPlatformData = { ...formData.platformData };

    newPlatforms.forEach((platform) => {
      if (!newPlatformData[platform]) {
        newPlatformData[platform] = getDefaultPlatformData();
      }
    });

    setFormData((prev) => ({
      ...prev,
      platforms: newPlatforms,
      platformData: newPlatformData,
    }));
  };

  const submit = async () => {
    setError(null);
    const chosen = formData.platforms;

    if (chosen.length === 0) return setError('Pilih minimal satu platform.');

    // validasi native saja (web memang tidak dipakai di flow ini)
    for (const platform of chosen) {
      const data = getPlatformData(platform);
      if (!data.version.trim())
        return setError(`Version wajib diisi untuk ${platformInfo[platform].label}.`);
      if (!data.file)
        return setError(`File build wajib diupload untuk ${platformInfo[platform].label}.`);
    }

    try {
      // (opsional) ambil dulu untuk referensi (bila butuh)
      await fetchBuilds(gameId!);

      for (const platform of chosen) {
        const data = getPlatformData(platform);
        if (!data.file) continue;

        // upload ke storage
        const storage = await initAppStorage(gameId!);
        const ext = data.file.name.split('.').pop()?.toLowerCase() || 'zip';
        const safeVersion = data.version.trim().replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${gameId}-${platform}-v${safeVersion}.${ext}`;

        await uploadToPrefix({
          file: data.file,
          prefix: storage.prefixes[`builds/${platform}` as const],
          fileName,
          contentType: data.file.type || 'application/octet-stream',
          public: true,
        });

        // bentuk manifest sesuai tipe API (Timestamp = number)
        const manifest: Manifest = {
          listing: fileName,
          createdAt: Date.now(),
          size_bytes: data.file.size,
          version: data.version.trim(),
          checksum: 'temp-checksum',
          storageRef: {
            s3: {
              bucket: storage.bucket,
              basePath: storage.prefixes[`builds/${platform}` as const],
            },
          },
        };

        // simpan ke backend
        await appendManifest(gameId!, {
          os: platform, // 'windows' | 'macos' | 'linux'
          manifest,
          setLive: false, // (opsional) kalau ingin sekaligus set live
        });
      }

      alert('Build berhasil disimpan ke draft!');
      navigate(`/studio/game/${gameId}/builds`);
    } catch (err: any) {
      console.error('Build upload failed:', err);
      setError(err.message || 'Gagal menyimpan build');
    }
  };

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1100px] flex flex-col p-10 gap-8">
        {/* Header */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">New Build</h1>
            <p className="text-foreground/70">
              Upload build per platform dengan versi masing-masing
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ButtonWithSound
              type="button"
              className="rounded-md border px-4 py-2 text-base border-muted-foreground/60 hover:border-foreground/70"
              onClick={() => navigate(-1)}
            >
              Cancel
            </ButtonWithSound>
            <ButtonWithSound
              type="button"
              className="rounded-md bg-card-foreground text-card px-5 py-2 text-base font-bold hover:opacity-95"
              onClick={submit}
            >
              Save to Draft
            </ButtonWithSound>
          </div>
        </section>

        {/* Form */}
        <div className="grid gap-6">
          {/* Platforms */}
          <InputDropdown
            label="Platforms"
            placeholder="Pilih platform yang akan diupload..."
            options={platformOptions}
            value={formData.platforms}
            onChange={handlePlatformChange}
          />

          {/* Per-platform sections */}
          <div className="grid gap-5">
            {formData.platforms.map((platform) => {
              const platformData = getPlatformData(platform);

              return (
                <div key={platform} className="rounded-lg border border-muted-foreground/40">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-muted-foreground/20">
                    <div className="flex items-center gap-2 text-lg font-medium">
                      <FontAwesomeIcon icon={platformInfo[platform].icon} />
                      {platformInfo[platform].label}
                    </div>
                    {platform !== 'web' && (
                      <div className="flex items-center gap-2 text-base text-muted-foreground">
                        Diterima: {platformInfo[platform].accept} • {platformInfo[platform].hint}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {platform === 'web' ? (
                      <InputFloating
                        placeholder="Game Web URL"
                        type="text"
                        value={formData.webUrl}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, webUrl: e.target.value }))
                        }
                        required
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputFloating
                          placeholder="Version (1.2.0)"
                          value={platformData.version}
                          onChange={(e) => updateVersion(platform, e.target.value)}
                          required
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-muted-foreground/40 px-3 py-2">
                          <div className="flex items-center gap-2 text-base">
                            <FontAwesomeIcon icon={faCloudArrowUp} />
                            {platformData.file?.name ? (
                              <span className="text-foreground">{platformData.file.name}</span>
                            ) : (
                              <span className="text-muted-foreground">Belum ada file</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {platformData.file && (
                              <button
                                type="button"
                                className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70"
                                onClick={() => removeFile(platform)}
                              >
                                Hapus
                              </button>
                            )}
                            <label className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70 cursor-pointer">
                              Pilih file
                              <input
                                type="file"
                                accept={platformInfo[platform].accept}
                                className="hidden"
                                onChange={(e) => pickFile(platform, e.target.files)}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="text-base text-muted-foreground">
              Total size: <b>{bytesToHuman(totalSize)}</b>
            </div>
          </div>

          {error && <p className="text-base text-chart-5">{error}</p>}
        </div>
      </div>
    </div>
  );
};
