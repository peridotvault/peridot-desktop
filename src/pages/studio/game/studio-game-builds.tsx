import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGlobe,
  faCirclePlay,
  faTrash,
  faDownload,
  faSearch,
  faRocket,
} from '@fortawesome/free-solid-svg-icons';
import { faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { formatMDY } from '../../../lib/helpers/helper-date';
import { ButtonWithSound } from '../../../components/atoms/button-with-sound';
import { DraftService } from '../../../local-db/game/services/draft-services';
import {
  Hardware,
  Manifest,
  Platform,
  ViewMode,
  WebBuild,
} from '../../../lib/interfaces/types-game';
import { InputTextarea } from '../../../components/atoms/input-textarea';
import { InputFloating } from '../../../components/atoms/input-floating';
import { isNativeBuild, isWebBuild } from '../../../lib/helpers/helper-pgl1';
import { BuildService } from '../../../services/studio/build-service';

const platformInfo: Record<Platform, { label: string; icon: any }> = {
  windows: { label: 'Windows', icon: faWindows },
  macos: { label: 'macOS', icon: faApple },
  linux: { label: 'Linux', icon: faLinux },
  web: { label: 'Website', icon: faGlobe },
};

// ✅ Type guards yang benar

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => (
  <span
    className={
      'inline-flex items-center gap-2 rounded-full border px-3 py-1 bg-background ' + className
    }
  >
    {children}
  </span>
);

const StatusPill: React.FC<{ isLive: boolean }> = ({ isLive }) => {
  if (isLive) {
    return (
      <Badge className="text-green-600 border-green-600/40">
        <FontAwesomeIcon icon={faRocket} /> Live
      </Badge>
    );
  }
  return (
    <Badge className="text-muted-foreground border-muted-foreground/40">
      <FontAwesomeIcon icon={faCirclePlay} /> Draft
    </Badge>
  );
};

const bytesToHuman = (b: number) => {
  if (b < 1024) return `${b} B`;
  const k = b / 1024;
  if (k < 1024) return `${k.toFixed(1)} KB`;
  const m = k / 1024;
  if (m < 1024) return `${m.toFixed(1)} MB`;
  return `${(m / 1024).toFixed(1)} GB`;
};

export const StudioGameBuilds: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();

  const [nativeBuilds, setNativeBuilds] = React.useState<
    Array<{
      platform: Platform;
      manifest: Manifest;
      isLive: boolean;
      hardware: any;
    }>
  >([]);
  const [webBuild, setWebBuild] = React.useState<WebBuild | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('live');

  // State untuk hardware form (Native)
  const [hardwareForms, setHardwareForms] = React.useState<Record<Platform, Hardware>>({
    windows: { processor: '', graphics: '', memory: '', storage: '', additionalNotes: '' },
    macos: { processor: '', graphics: '', memory: '', storage: '', additionalNotes: '' },
    linux: { processor: '', graphics: '', memory: '', storage: '', additionalNotes: '' },
    web: { processor: '', graphics: '', memory: '', storage: '', additionalNotes: '' },
  });

  // State untuk WebBuild form
  const [webBuildForm, setWebBuildForm] = React.useState<WebBuild>({
    url: '',
    processor: '',
    graphics: '',
    additionalNotes: '',
    storage: 0,
    memory: 0,
  });

  const loadData = async () => {
    try {
      const draft = await DraftService.get(gameId!);
      if (!draft?.pgl1_distribution) {
        setLoading(false);
        return;
      }

      // Ekstrak data
      let webBuildData: WebBuild | null = null;
      const nativeBuildsData: Array<{
        platform: Platform;
        manifest: Manifest;
        isLive: boolean;
        hardware: any;
      }> = [];

      for (const dist of draft.pgl1_distribution) {
        if (isNativeBuild(dist)) {
          const native = dist.native;
          const liveVersion = native.liveVersion;

          native.manifests.forEach((manifest: Manifest) => {
            nativeBuildsData.push({
              platform: native.os as Platform,
              manifest,
              isLive: manifest.version === liveVersion,
              hardware: {
                processor: native.processor,
                graphics: native.graphics,
                memory: native.memory,
                storage: native.storage,
                additionalNotes: native.additionalNotes,
              },
            });
          });
        } else if (isWebBuild(dist)) {
          webBuildData = dist.web;
        }
      }

      setNativeBuilds(nativeBuildsData);
      setWebBuild(webBuildData);

      if (webBuildData) {
        setWebBuildForm(webBuildData);
      }
    } catch (err) {
      console.error('Failed to load builds:', err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Load semua data
  React.useEffect(() => {
    loadData();
  }, [gameId]);

  // ✅ Load hardware saat ganti platform
  React.useEffect(() => {
    if (viewMode === 'live' || viewMode === 'web') return;

    const loadHardware = async () => {
      const draft = await DraftService.get(gameId!);
      if (!draft?.pgl1_distribution) return;

      // Reset ke default dulu
      const defaultForm = {
        processor: '',
        graphics: '',
        memory: '',
        storage: '',
        additionalNotes: '',
      };

      // Cari data hardware untuk platform ini
      for (const dist of draft.pgl1_distribution) {
        if (isNativeBuild(dist) && dist.native.os === viewMode) {
          setHardwareForms((prev) => ({
            ...prev,
            [viewMode]: {
              processor: dist.native.processor,
              graphics: dist.native.graphics,
              memory: dist.native.memory.toString(),
              storage: dist.native.storage.toString(),
              additionalNotes: dist.native.additionalNotes,
            },
          }));
          return;
        }
      }

      // Jika tidak ada data, set ke default
      setHardwareForms((prev) => ({
        ...prev,
        [viewMode]: defaultForm,
      }));
    };

    loadHardware();
  }, [viewMode, gameId]);

  const handleSaveWebBuild = async () => {
    BuildService.saveWebBuild(gameId!, webBuildForm);
    setWebBuild(webBuildForm);
    alert('Web build configuration saved!');
  };

  const handleSaveNativeHardware = async () => {
    BuildService.handleSaveNativeHardware;
    alert('Hardware requirements saved!');
  };

  const handleSetLive = async (platform: Platform, version: string) => {
    await BuildService.setLiveVersion(gameId!, platform, version);
    loadData();
    alert(`Build ${platform} v${version} sekarang LIVE!`);
  };

  // Filter builds
  const filteredNativeBuilds = nativeBuilds.filter((build) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      build.manifest.version.toLowerCase().includes(q) ||
      build.platform.toLowerCase().includes(q)
    );
  });

  if (loading) {
    return <div className="flex justify-center p-10">Loading builds...</div>;
  }

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-10">
        {/* Header */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Builds</h1>
            <p className="text-foreground/70 text-base">
              {viewMode === 'live'
                ? 'Versi live yang sedang aktif di PeridotVault'
                : `Kelola build untuk ${platformInfo[viewMode]?.label || 'platform ini'}`}
            </p>
          </div>
          <ButtonWithSound
            type="button"
            onClick={() => navigate(`/studio/game/${gameId}/builds/new`)}
            className="rounded-lg bg-card-foreground text-card px-6 py-2 text-base font-semibold hover:opacity-95"
          >
            + New Build
          </ButtonWithSound>
        </section>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <ButtonWithSound
              type="button"
              onClick={() => setViewMode('live')}
              className={
                'rounded-lg border px-4 py-2 text-base ' +
                (viewMode === 'live'
                  ? 'border-foreground text-foreground bg-foreground/10'
                  : 'border-muted-foreground/60 text-muted-foreground hover:border-foreground/70')
              }
            >
              <FontAwesomeIcon icon={faRocket} className="mr-2" />
              Live Builds
            </ButtonWithSound>

            {(['windows', 'macos', 'linux', 'web'] as Platform[]).map((p) => (
              <ButtonWithSound
                key={p}
                type="button"
                onClick={() => setViewMode(p)}
                className={
                  'rounded-lg border px-4 py-2 text-base flex items-center gap-2 ' +
                  (viewMode === p
                    ? 'border-foreground text-foreground bg-foreground/10'
                    : 'border-muted-foreground/60 text-muted-foreground hover:border-foreground/70')
                }
              >
                <FontAwesomeIcon icon={platformInfo[p].icon} />
                {platformInfo[p].label}
              </ButtonWithSound>
            ))}
          </div>

          <div className="ml-auto relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari versi atau platform..."
              className="pl-9 pr-3 py-2 rounded-lg border bg-transparent border-muted-foreground/60 focus:border-foreground/70 focus:outline-none text-base"
            />
          </div>
        </div>

        {/* WebBuild Form */}
        {viewMode === 'web' && (
          <div className="bg-muted/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={faGlobe} />
              Website Build Configuration
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <InputFloating
                placeholder="Game Web URL"
                value={webBuildForm.url}
                onChange={(e) => setWebBuildForm((prev) => ({ ...prev, url: e.target.value }))}
                required
              />
              <InputFloating
                placeholder="Processor Requirement"
                value={webBuildForm.processor}
                onChange={(e) =>
                  setWebBuildForm((prev) => ({ ...prev, processor: e.target.value }))
                }
                required
              />
              <InputFloating
                placeholder="Graphics Requirement"
                value={webBuildForm.graphics}
                onChange={(e) => setWebBuildForm((prev) => ({ ...prev, graphics: e.target.value }))}
                required
              />
              <InputFloating
                placeholder="Memory (MB)"
                type="number"
                min={0}
                value={webBuildForm.memory.toString()}
                onChange={(e) =>
                  setWebBuildForm((prev) => ({ ...prev, memory: parseInt(e.target.value) || 0 }))
                }
                required
              />
              <InputFloating
                placeholder="Storage (MB)"
                type="number"
                min={0}
                value={webBuildForm.storage.toString()}
                onChange={(e) =>
                  setWebBuildForm((prev) => ({ ...prev, storage: parseInt(e.target.value) || 0 }))
                }
                required
              />
              <div className="col-span-2">
                <InputTextarea
                  placeholder="Additional Notes"
                  value={webBuildForm.additionalNotes}
                  onChange={(e) =>
                    setWebBuildForm((prev) => ({ ...prev, additionalNotes: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <ButtonWithSound
                onClick={handleSaveWebBuild}
                className="bg-card-foreground text-card px-4 py-2 rounded-md"
              >
                Save Web Build
              </ButtonWithSound>
            </div>
          </div>
        )}

        {/* Native Hardware Form */}
        {viewMode !== 'live' && viewMode !== 'web' && (
          <div className="bg-muted/10 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FontAwesomeIcon icon={platformInfo[viewMode].icon} />
              {platformInfo[viewMode].label} Hardware Requirements
            </h3>

            <div className="grid md:grid-cols-2 gap-6">
              <InputFloating
                placeholder="Processor"
                value={hardwareForms[viewMode].processor}
                onChange={(e) =>
                  setHardwareForms((prev) => ({
                    ...prev,
                    [viewMode]: { ...prev[viewMode], processor: e.target.value },
                  }))
                }
                required
              />
              <InputFloating
                placeholder="Graphics"
                value={hardwareForms[viewMode].graphics}
                onChange={(e) =>
                  setHardwareForms((prev) => ({
                    ...prev,
                    [viewMode]: { ...prev[viewMode], graphics: e.target.value },
                  }))
                }
                required
              />
              <InputFloating
                placeholder="Memory (GB)"
                type="number"
                min={0}
                value={hardwareForms[viewMode].memory}
                onChange={(e) =>
                  setHardwareForms((prev) => ({
                    ...prev,
                    [viewMode]: { ...prev[viewMode], memory: e.target.value },
                  }))
                }
                required
              />
              <InputFloating
                placeholder="Storage (GB)"
                type="number"
                min={0}
                value={hardwareForms[viewMode].storage}
                onChange={(e) =>
                  setHardwareForms((prev) => ({
                    ...prev,
                    [viewMode]: { ...prev[viewMode], storage: e.target.value },
                  }))
                }
                required
              />
              <div className="col-span-2">
                <InputTextarea
                  placeholder="Additional Notes"
                  value={hardwareForms[viewMode].additionalNotes}
                  onChange={(e) =>
                    setHardwareForms((prev) => ({
                      ...prev,
                      [viewMode]: { ...prev[viewMode], additionalNotes: e.target.value },
                    }))
                  }
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <ButtonWithSound
                onClick={handleSaveNativeHardware}
                className="bg-card-foreground text-card px-4 py-2 rounded-md"
              >
                Save Hardware
              </ButtonWithSound>
            </div>
          </div>
        )}

        {/* Builds Table */}
        <div className="overflow-x-auto rounded-xl border border-muted-foreground/60">
          <table className="min-w-full bg-background">
            <thead className="text-left text-base text-muted-foreground border-b border-muted-foreground/30">
              <tr>
                <th className="px-4 py-3">Platform</th>
                <th className="px-4 py-3">Version</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Size</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-base">
              {viewMode === 'live' ? (
                <>
                  {webBuild && (
                    <tr className="border-b border-muted-foreground/20">
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faGlobe} />
                          <span>Website</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top font-medium text-foreground">Live</td>
                      <td className="px-4 py-3 align-top">
                        <StatusPill isLive={true} />
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">Always Live</td>
                      <td className="px-4 py-3 align-top">-</td>
                      <td className="px-4 py-3 align-top">
                        <span className="text-muted-foreground">URL: {webBuild.url}</span>
                      </td>
                    </tr>
                  )}
                  {nativeBuilds
                    .filter((build) => build.isLive)
                    .map((build, index) => (
                      <tr
                        key={`live-${build.platform}-${index}`}
                        className="border-b border-muted-foreground/20"
                      >
                        <td className="px-4 py-3 align-top">
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={platformInfo[build.platform].icon} />
                            <span>{platformInfo[build.platform].label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 align-top font-medium text-foreground">
                          {build.manifest.version}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <StatusPill isLive={true} />
                        </td>
                        <td className="px-4 py-3 align-top text-muted-foreground">
                          {formatMDY(new Date(build.manifest.createdAt).toISOString())}
                        </td>
                        <td className="px-4 py-3 align-top">
                          {bytesToHuman(build.manifest.size_bytes)}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <button
                            type="button"
                            className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70"
                            onClick={() => handleSetLive(build.platform, build.manifest.version)}
                            disabled={build.isLive}
                          >
                            Live
                          </button>
                        </td>
                      </tr>
                    ))}
                </>
              ) : viewMode === 'web' ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                    Website build tidak memiliki versi manifest. Konfigurasi hardware dan URL dapat
                    diatur di form di atas.
                  </td>
                </tr>
              ) : (
                filteredNativeBuilds
                  .filter((build) => build.platform === viewMode)
                  .map((build, index) => (
                    <tr
                      key={`${build.platform}-${build.manifest.version}-${index}`}
                      className="border-b border-muted-foreground/20"
                    >
                      <td className="px-4 py-3 align-top">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={platformInfo[build.platform].icon} />
                          <span>{platformInfo[build.platform].label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 align-top font-medium text-foreground">
                        {build.manifest.version}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusPill isLive={build.isLive} />
                      </td>
                      <td className="px-4 py-3 align-top text-muted-foreground">
                        {formatMDY(new Date(build.manifest.createdAt).toISOString())}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {bytesToHuman(build.manifest.size_bytes)}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70"
                            onClick={() => handleSetLive(build.platform, build.manifest.version)}
                            disabled={build.isLive}
                          >
                            {build.isLive ? 'Live' : 'Set Live'}
                          </button>
                          <button
                            type="button"
                            className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70"
                            onClick={() => alert(`Download: ${build.manifest.listing}`)}
                          >
                            <FontAwesomeIcon icon={faDownload} />
                          </button>
                          <button
                            type="button"
                            className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70"
                            onClick={() => alert('Hapus belum diimplementasi')}
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>

        <div className="text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
          <p>
            <FontAwesomeIcon icon={faRocket} className="mr-2 text-green-600" />
            <strong>Versi Live:</strong> Hanya satu versi per platform yang bisa di-live-kan.
          </p>
        </div>
      </div>
    </div>
  );
};
