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
import { faAndroid, faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import { useNavigate, useParams } from 'react-router-dom';
import { formatMDY } from '@shared/lib/helpers/helper-date';
import { ButtonWithSound } from '../../../shared/components/ui/button-with-sound';
import type {
  Distribution,
  Manifest,
  NativeDistribution,
  Platform,
  ViewMode,
  WebDistribution,
} from '@shared/blockchain/icp/types/game.types';
import { InputTextarea } from '../../../shared/components/ui/input-textarea';
import { InputFloating } from '../../../shared/components/ui/input-floating';
import { setHardware, setLive } from '../../../features/game/api/game-draft.api';
import { LoadingComponent } from '../../../components/atoms/loading.component';
import { SetHardwarePayload } from '@shared/lib/interfaces/game-draft.types';
import toast from 'react-hot-toast';
import { fetchDraftBuildsCombined } from '@features/game/services/draft.service';

type HardwareForm = {
  processor: string;
  graphics: string;
  memory: string;
  storage: string;
  additionalNotes: string;
};

const createEmptyHardware = (): HardwareForm => ({
  processor: '',
  graphics: '',
  memory: '',
  storage: '',
  additionalNotes: '',
});

type WebBuildForm = {
  url: string;
  processor: string;
  graphics: string;
  memory: string;
  storage: string;
  additionalNotes?: string;
};

const platformInfo: Record<Platform, { label: string; icon: any }> = {
  windows: { label: 'Windows', icon: faWindows },
  macos: { label: 'macOS', icon: faApple },
  linux: { label: 'Linux', icon: faLinux },
  web: { label: 'Website', icon: faGlobe },
  android: { label: 'Android', icon: faAndroid },
  ios: { label: 'iOS', icon: faApple },
  other: { label: 'Other', icon: faGlobe },
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

const bytesToHuman = (b: number | bigint) => {
  const value = Number(b);
  if (value < 1024) return `${value} B`;
  const k = value / 1024;
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
      hardware: {
        processor: string;
        graphics: string;
        memory: number;
        storage: number;
        additionalNotes?: string;
      };
    }>
  >([]);
  const [webBuild, setWebBuild] = React.useState<WebDistribution | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [viewMode, setViewMode] = React.useState<ViewMode>('live');
  const [distributions, setDistributions] = React.useState<Distribution[]>([]);

  // handle loading
  const [savingHardware, setSavingHardware] = React.useState(false);
  const [settingLive, setSettingLive] = React.useState(false);
  const [savingWeb, setSavingWeb] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // State untuk hardware form (Native)
  const [hardwareForms, setHardwareForms] = React.useState<Record<Platform, HardwareForm>>({
    windows: createEmptyHardware(),
    macos: createEmptyHardware(),
    linux: createEmptyHardware(),
    web: createEmptyHardware(),
    android: createEmptyHardware(),
    ios: createEmptyHardware(),
    other: createEmptyHardware(),
  });

  // State untuk WebBuild form
  const [webBuildForm, setWebBuildForm] = React.useState<WebBuildForm>({
    url: '',
    processor: '',
    graphics: '',
    additionalNotes: '',
    storage: '0',
    memory: '0',
  });

  const loadData = async () => {
    setError(null);
    setLoading(true);
    try {
      const { data, sources } = await fetchDraftBuildsCombined(gameId!);
      const distributionsPayload = data.distributions || [];

      setDistributions(distributionsPayload);
      console.log({
        offChainDistributions: sources.offChain?.distributions,
        onChainMeta: sources.onChain,
      });

      if (!distributionsPayload.length) {
        setNativeBuilds([]);
        setWebBuild(null);
        return;
      }

      // Ekstrak data
      let webBuildData: WebDistribution | null = null;
      const nativeBuildsData: Array<{
        platform: Platform;
        manifest: Manifest;
        isLive: boolean;
        hardware: {
          processor: string;
          graphics: string;
          memory: number;
          storage: number;
          additionalNotes?: string;
        };
      }> = [];

      const normalizeNotes = (notes: NativeDistribution['additionalNotes']) => {
        if (Array.isArray(notes)) return notes[0] ?? '';
        return notes ?? '';
      };

      const normalizeWebNotes = (notes: WebDistribution['additionalNotes']) => {
        if (Array.isArray(notes)) return notes[0] ?? '';
        return notes ?? '';
      };

      for (const dist of distributionsPayload) {
        if ('native' in dist) {
          const native = dist.native;
          const liveVersion = native.liveVersion;
          const nativeNotes = normalizeNotes(native.additionalNotes);

          native.manifests.forEach((manifest: Manifest) => {
            nativeBuildsData.push({
              platform: native.os as Platform,
              manifest,
              isLive: liveVersion ? manifest.version === liveVersion : false,
              hardware: {
                processor: native.processor ?? '',
                graphics: native.graphics ?? '',
                memory: native.memory ? Number(native.memory) : 0,
                storage: native.storage ? Number(native.storage) : 0,
                additionalNotes: nativeNotes || undefined,
              },
            });
          });
        } else if ('web' in dist) {
          webBuildData = {
            ...dist.web,
            additionalNotes: normalizeWebNotes(dist.web.additionalNotes) || undefined,
          };
        }
      }

      setNativeBuilds(nativeBuildsData);
      setWebBuild(webBuildData);
      if (webBuildData) {
        setWebBuildForm({
          url: webBuildData.url ?? '',
          processor: webBuildData.processor ?? '',
          graphics: webBuildData.graphics ?? '',
          memory: Number(webBuildData.memory ?? 0).toString(),
          storage: Number(webBuildData.storage ?? 0).toString(),
          additionalNotes:
            typeof webBuildData.additionalNotes === 'string' ? webBuildData.additionalNotes : '',
        });
      }
    } catch (err: any) {
      console.error('Failed to load builds:', err);
      setError(err.message || 'Failed to load builds');
      toast.error('Failed to load builds');
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

    // Cari distribusi native untuk platform ini
    const dist = distributions.find((d) => 'native' in d && d.native.os === viewMode);

    if (dist && 'native' in dist) {
      const native = dist.native;
      const nativeNotes = Array.isArray(native.additionalNotes)
        ? (native.additionalNotes[0] ?? '')
        : (native.additionalNotes ?? '');
      setHardwareForms((prev) => ({
        ...prev,
        [viewMode]: {
          processor: native.processor || '',
          graphics: native.graphics || '',
          memory: native.memory?.toString() || '',
          storage: native.storage?.toString() || '',
          additionalNotes: nativeNotes,
        },
      }));
    } else {
      // Reset ke kosong jika belum ada
      setHardwareForms((prev) => ({
        ...prev,
        [viewMode]: {
          processor: '',
          graphics: '',
          memory: '',
          storage: '',
          additionalNotes: '',
        },
      }));
    }
  }, [viewMode, distributions]);

  const handleSaveWebBuild = async () => {
    setSavingWeb(true);
    try {
      // You should also update your BuildService to use the new API
      // For now, mimic setHardware
      const data: SetHardwarePayload = {
        platform: 'web',
        hardware: {
          processor: webBuildForm.processor,
          graphics: webBuildForm.graphics,
          memory: webBuildForm.memory ? Number(webBuildForm.memory) : undefined,
          storage: webBuildForm.storage ? Number(webBuildForm.storage) : undefined,
          additionalNotes: webBuildForm.additionalNotes,
        },
        // @ts-ignore — your API expects webUrl separately?
        webUrl: webBuildForm.url,
      };
      await setHardware(gameId!, data);
      setWebBuild({
        url: webBuildForm.url,
        processor: webBuildForm.processor,
        graphics: webBuildForm.graphics,
        memory: webBuildForm.memory ? Number(webBuildForm.memory) : 0,
        storage: webBuildForm.storage ? Number(webBuildForm.storage) : 0,
        additionalNotes: webBuildForm.additionalNotes?.trim()
          ? [webBuildForm.additionalNotes.trim()]
          : [],
      });
      toast.success('Web build configuration saved!');
    } catch (err: any) {
      console.error('Save web build error:', err);
      toast.error(err.message || 'Failed to save web build');
    } finally {
      setSavingWeb(false);
    }
  };

  // const handleSaveNativeHardware = async () => {
  //   BuildService.handleSaveNativeHardware;
  //   alert('Hardware requirements saved!');
  // };
  const handleSaveNativeHardware = async () => {
    if (viewMode === 'live' || viewMode === 'web') return;

    setSavingHardware(true);
    try {
      const h = hardwareForms[viewMode];
      const data: SetHardwarePayload = {
        platform: viewMode,
        os: viewMode,
        hardware: {
          processor: h.processor || undefined,
          graphics: h.graphics || undefined,
          memory: h.memory ? Number(h.memory) : undefined,
          storage: h.storage ? Number(h.storage) : undefined,
          additionalNotes: h.additionalNotes || undefined,
        },
      };

      await setHardware(gameId!, data);
      await loadData(); // refresh
      toast.success('Hardware requirements saved!');
    } catch (err: any) {
      console.error('Save hardware error:', err);
      toast.error(err.message || 'Failed to save hardware');
    } finally {
      setSavingHardware(false);
    }
  };

  const handleSetLive = async (platform: Platform, version: string) => {
    setSettingLive(true);
    try {
      await setLive(gameId!, { platformId: platform, version });
      await loadData();
      toast.success(`Build ${platform} v${version} is now LIVE!`);
    } catch (err: any) {
      console.error('Set live error:', err);
      toast.error(err.message || 'Failed to set live version');
    } finally {
      setSettingLive(false);
    }
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
          <div className="ml-auto relative">
            <FontAwesomeIcon
              icon={faSearch}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search version..."
              className="pl-9 pr-3 py-2 rounded-lg border bg-transparent border-muted-foreground/60 focus:border-foreground/70 focus:outline-none placeholder:text-muted-foreground text-base"
            />
          </div>
        </section>

        {loading ? (
          error ? (
            <div className="flex justify-center p-10 text-red-500">{error}</div>
          ) : (
            <LoadingComponent />
          )
        ) : (
          <div className="flex flex-col gap-10">
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
            </div>

            {/* WebBuild Form */}
            {viewMode === 'web' ? (
              <div className="bg-muted/10 rounded-lg mb-6">
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
                    onChange={(e) =>
                      setWebBuildForm((prev) => ({ ...prev, graphics: e.target.value }))
                    }
                    required
                  />
                  <InputFloating
                    placeholder="Memory (MB)"
                    type="number"
                    min={0}
                    value={webBuildForm.memory}
                    onChange={(e) =>
                      setWebBuildForm((prev) => ({
                        ...prev,
                        memory: e.target.value,
                      }))
                    }
                    required
                  />
                  <InputFloating
                    placeholder="Storage (MB)"
                    type="number"
                    min={0}
                    value={webBuildForm.storage}
                    onChange={(e) =>
                      setWebBuildForm((prev) => ({
                        ...prev,
                        storage: e.target.value,
                      }))
                    }
                    required
                  />
                  <div className="col-span-2">
                    <InputTextarea
                      placeholder="Additional Notes"
                      value={webBuildForm.additionalNotes ?? ''}
                      onChange={(e) =>
                        setWebBuildForm((prev) => ({ ...prev, additionalNotes: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <ButtonWithSound
                    onClick={handleSaveWebBuild}
                    disabled={savingWeb}
                    className="bg-card-foreground text-card px-4 py-2 rounded-md"
                  >
                    Save Web Build
                  </ButtonWithSound>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {/* Native Hardware Form */}
                {viewMode !== 'live' && (
                  <div className="bg-muted/10 rounded-lg mb-6">
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
                        disabled={savingHardware}
                        className="bg-card-foreground text-card px-4 py-2 rounded-md"
                      >
                        Save Hardware
                      </ButtonWithSound>
                    </div>
                  </div>
                )}

                {viewMode !== 'live' && (
                  <ButtonWithSound
                    type="button"
                    onClick={() => navigate(`/studio/game/${gameId}/builds/new`)}
                    className="rounded-lg bg-card-foreground text-card px-6 py-2 text-base font-semibold hover:opacity-95"
                  >
                    + New Build
                  </ButtonWithSound>
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
                              <td className="px-4 py-3 align-top font-medium text-foreground">
                                Live
                              </td>
                              <td className="px-4 py-3 align-top">
                                <StatusPill isLive={true} />
                              </td>
                              <td className="px-4 py-3 align-top text-muted-foreground">
                                Always Live
                              </td>
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
                                  {formatMDY(Number(build.manifest.createdAt ?? 0))}
                                </td>
                                <td className="px-4 py-3 align-top">
                                  {bytesToHuman(build.manifest.sizeBytes)}
                                </td>
                                <td className="px-4 py-3 align-top">
                                  <ButtonWithSound
                                    type="button"
                                    className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70"
                                    onClick={() =>
                                      handleSetLive(build.platform, build.manifest.version)
                                    }
                                    disabled={build.isLive || settingLive}
                                  >
                                    Live
                                  </ButtonWithSound>
                                </td>
                              </tr>
                            ))}
                        </>
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
                                {formatMDY(Number(build.manifest.createdAt ?? 0))}
                              </td>
                              <td className="px-4 py-3 align-top">
                                {bytesToHuman(build.manifest.sizeBytes)}
                              </td>
                              <td className="px-4 py-3 align-top">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    className="rounded-md border px-3 py-1.5 text-base border-muted-foreground/40 hover:border-foreground/70"
                                    onClick={() =>
                                      handleSetLive(build.platform, build.manifest.version)
                                    }
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
                    <strong>Versi Live:</strong> Hanya satu versi per platform yang bisa
                    di-live-kan.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
