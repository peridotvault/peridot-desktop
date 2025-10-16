import React from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faCircleXmark, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faApple, faLinux, faWindows } from '@fortawesome/free-brands-svg-icons';
import { ButtonWithSound } from '../../../components/atoms/button-with-sound';

/** ====== UI ONLY — HARDCODED SAMPLE DATA ====== */
type Platform = 'windows' | 'macos' | 'linux' | 'web';

const platformIcon: Record<Platform, any> = {
  windows: faWindows,
  macos: faApple,
  linux: faLinux,
  web: faGlobe,
};

const mock = {
  // === Details ===
  pgl1_game_id: 'GAME-1234',
  pgl1_name: 'Starfall Tactics',
  pgl1_description:
    'A fast-paced tactical shooter set in a retro-futuristic galaxy. Build squads, outsmart enemies, and seize the stars.',
  pgl1_required_age: 13,
  pgl1_price: 19.99,
  pgl1_website: 'https://starfall.example',
  pgl1_categories: ['action', 'shooter'],
  pgl1_tags: ['Sci-Fi', 'Fast-Paced', 'Controller Support'],

  // === Media ===
  pgl1_cover_image:
    'https://images.unsplash.com/photo-1517976487492-576ea6b2936d?q=80&w=1280&auto=format&fit=crop',
  pgl1_banner_image:
    'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1600&auto=format&fit=crop',
  pgl1_previews: [
    { kind: 'image', url: 'https://images.unsplash.com/photo-1520975867597-0f8d3cb7b810?w=1200' },
    { kind: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' },
    { kind: 'image', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200' },
  ] as Array<{ kind: 'image' | 'video'; url: string }>,

  // === Builds (ringkas) ===
  version: '1.2.0',
  platforms: (['windows', 'macos', 'web'] as Platform[]).map((p) => ({
    key: p as Platform,
    info:
      p === 'web'
        ? {
            webUrl: 'https://play.starfall.example',
            requirement: {
              processor: 'Intel i3 / Apple M1',
              graphics: 'Integrated',
              memory: '4',
              storage: '2',
              notes: 'Works best on Chromium-based browsers.',
            },
          }
        : {
            fileName:
              p === 'windows'
                ? 'starfall-win64-v1.2.0.zip'
                : p === 'macos'
                  ? 'starfall-macos-1.2.0.dmg'
                  : 'starfall-linux.AppImage',
            fileSizeMB: p === 'windows' ? 1350 : p === 'macos' ? 1280 : 1420,
            requirement: {
              processor: p === 'macos' ? 'Apple M1 / Intel i5' : 'Intel i5',
              graphics: 'GTX 1050 / RX 560',
              memory: '8',
              storage: '20',
              notes: 'Controller recommended.',
            },
          },
  })),
  lastUpdated: Date.now(),
};

/** Simple completeness check (UI only) */
function checkDetails() {
  const missing: string[] = [];
  if (!mock.pgl1_name) missing.push('Name');
  if (!mock.pgl1_description) missing.push('Description');
  if (!mock.pgl1_categories?.length) missing.push('Categories');
  if (!mock.pgl1_tags?.length) missing.push('Tags');
  return { ok: missing.length === 0, missing };
}
function checkMedia() {
  const missing: string[] = [];
  if (!mock.pgl1_cover_image) missing.push('Cover Image');
  if (!mock.pgl1_banner_image) missing.push('Banner Image');
  if (!mock.pgl1_previews?.length) missing.push('Previews (min. 1)');
  return { ok: missing.length === 0, missing };
}
function checkBuilds() {
  const missing: string[] = [];
  if (!mock.version) missing.push('Version');
  if (!mock.platforms?.length) missing.push('At least 1 platform');

  mock.platforms?.forEach((p) => {
    const r = (p.info as any).requirement;
    if (p.key === 'web') {
      if (!(p.info as any).webUrl) missing.push('Web URL (Website)');
    } else {
      if (!(p.info as any).fileName) missing.push(`File (${p.key})`);
    }
    if (!r?.processor) missing.push(`Processor (${p.key})`);
    if (!r?.graphics) missing.push(`Graphics (${p.key})`);
    if (!r?.memory) missing.push(`Memory GB (${p.key})`);
    if (!r?.storage) missing.push(`Storage GB (${p.key})`);
  });
  return { ok: missing.length === 0, missing };
}

const SectionCard: React.FC<{
  title: string;
  ok: boolean;
  missing: string[];
  children?: React.ReactNode;
}> = ({ title, ok, missing, children }) => (
  <div className="rounded-xl border border-muted-foreground/40 bg-background">
    <div className="flex items-center justify-between px-5 py-4 border-b border-muted-foreground/20">
      <h3 className="text-xl font-semibold">{title}</h3>
      {ok ? (
        <span className="inline-flex items-center gap-2 text-green-600">
          <FontAwesomeIcon icon={faCheckCircle} />
          Complete
        </span>
      ) : (
        <span className="inline-flex items-center gap-2 text-chart-5">
          <FontAwesomeIcon icon={faCircleXmark} />
          Incomplete
        </span>
      )}
    </div>
    <div className="p-5 grid gap-4">
      {children}
      {!ok && missing.length > 0 && (
        <div className="text-base">
          <div className="mb-2 font-medium">Missing:</div>
          <ul className="list-disc pl-6 text-chart-5">
            {missing.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  </div>
);

const bytes = (mb: number) => `${mb.toFixed(0)} MB`;
const mdy = (t: number) =>
  new Date(t).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric' });

export const StudioGamePublish: React.FC = () => {
  const { gameId } = useParams<{ gameId: string }>();

  const vDetails = checkDetails();
  const vMedia = checkMedia();
  const vBuilds = checkBuilds();
  const allOk = vDetails.ok && vMedia.ok && vBuilds.ok;

  return (
    <div className="flex justify-center w-full">
      <div className="w-full max-w-[1400px] flex flex-col p-10 gap-8">
        {/* Header  */}
        <section className="flex justify-between items-center gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold">Review & Publish</h1>
            <p className="text-foreground/70">This information appears on PeridotVault</p>
          </div>
          <ButtonWithSound
            disabled={!allOk}
            onClick={() => alert('Publish clicked (UI only)')}
            className="bg-card-foreground text-card font-bold py-2 px-6 rounded-md"
          >
            <span>Publish</span>
          </ButtonWithSound>
        </section>

        {/* Meta ringkas + Publish */}
        <div className="flex flex-wrap items-center gap-8">
          <div>
            <div className="text-sm text-muted-foreground">Game ID</div>
            <div className="text-lg font-medium">{gameId}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Last Updated</div>
            <div className="text-lg font-medium">{mdy(mock.lastUpdated)}</div>
          </div>
        </div>

        {/* DETAILS */}
        <SectionCard title="Details" ok={vDetails.ok} missing={vDetails.missing}>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-muted-foreground">Name</div>
              <div className="text-lg">{mock.pgl1_name}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Required Age</div>
              <div className="text-lg">{mock.pgl1_required_age}+</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="text-lg whitespace-pre-wrap">{mock.pgl1_description}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Categories</div>
              <div className="text-lg">
                {mock.pgl1_categories?.length ? mock.pgl1_categories.join(', ') : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Tags</div>
              <div className="text-lg">
                {mock.pgl1_tags?.length ? mock.pgl1_tags.join(', ') : '—'}
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-sm text-muted-foreground">Website</div>
              <div className="text-lg break-all">{mock.pgl1_website}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Price</div>
              <div className="text-lg">${mock.pgl1_price}</div>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="button"
              className="text-accent-foreground hover:underline"
              onClick={() => alert('Go to Edit Details (UI only)')}
            >
              Edit Details
            </button>
          </div>
        </SectionCard>

        {/* MEDIA */}
        <SectionCard title="Media" ok={vMedia.ok} missing={vMedia.missing}>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="col-span-1">
              <div className="text-sm text-muted-foreground">Cover</div>
              {mock.pgl1_cover_image ? (
                <img
                  src={mock.pgl1_cover_image}
                  alt="cover"
                  className="rounded-lg border border-muted-foreground/30 w-full aspect-video object-cover"
                />
              ) : (
                <div className="rounded-lg border border-muted-foreground/30 w-full aspect-video flex items-center justify-center text-muted-foreground">
                  No cover
                </div>
              )}
            </div>
            <div className="col-span-2">
              <div className="text-sm text-muted-foreground mb-2">Banner & Previews</div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg border border-muted-foreground/30 aspect-video overflow-hidden">
                  {mock.pgl1_banner_image ? (
                    <img
                      src={mock.pgl1_banner_image}
                      alt="banner"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No banner
                    </div>
                  )}
                </div>
                {mock.pgl1_previews.slice(0, 5).map((p, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-muted-foreground/30 aspect-video overflow-hidden"
                  >
                    {p.kind === 'image' ? (
                      <img src={p.url} className="w-full h-full object-cover" />
                    ) : (
                      <video src={p.url} className="w-full h-full object-cover" controls />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="pt-2">
            <button
              type="button"
              className="text-accent-foreground hover:underline"
              onClick={() => alert('Go to Edit Media (UI only)')}
            >
              Edit Media
            </button>
          </div>
        </SectionCard>

        {/* BUILDS */}
        <SectionCard title="Builds" ok={vBuilds.ok} missing={vBuilds.missing}>
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center gap-6">
              <div>
                <div className="text-sm text-muted-foreground">Version</div>
                <div className="text-lg">{mock.version}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Platforms</div>
                <div className="flex items-center gap-4 text-xl">
                  {mock.platforms.map((p) => (
                    <span key={p.key} title={p.key}>
                      <FontAwesomeIcon icon={platformIcon[p.key]} />
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {mock.platforms.map((p) => (
                <div key={p.key} className="rounded-lg border border-muted-foreground/30 p-4">
                  <div className="flex items-center gap-2 text-lg font-medium mb-2 capitalize">
                    <FontAwesomeIcon icon={platformIcon[p.key]} />
                    {p.key}
                  </div>

                  {p.key === 'web' ? (
                    <div className="text-base grid gap-2">
                      <div>
                        <div className="text-sm text-muted-foreground">Web URL</div>
                        <div className="break-all">{(p.info as any).webUrl}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="CPU" value={(p.info as any).requirement.processor} />
                        <Field label="GPU" value={(p.info as any).requirement.graphics} />
                        <Field label="Memory (GB)" value={(p.info as any).requirement.memory} />
                        <Field label="Storage (GB)" value={(p.info as any).requirement.storage} />
                      </div>
                      {((p.info as any).requirement.notes as string) && (
                        <div>
                          <div className="text-sm text-muted-foreground">Notes</div>
                          <div>{(p.info as any).requirement.notes}</div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-base grid gap-2">
                      <div className="flex items-center justify-between rounded-md border border-muted-foreground/30 px-3 py-2">
                        <div className="text-muted-foreground">File</div>
                        <div className="font-medium">
                          {(p.info as any).fileName || '—'}{' '}
                          {typeof (p.info as any).fileSizeMB === 'number' &&
                            `(${bytes((p.info as any).fileSizeMB)})`}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <Field label="CPU" value={(p.info as any).requirement.processor} />
                        <Field label="GPU" value={(p.info as any).requirement.graphics} />
                        <Field label="Memory (GB)" value={(p.info as any).requirement.memory} />
                        <Field label="Storage (GB)" value={(p.info as any).requirement.storage} />
                      </div>
                      {((p.info as any).requirement.notes as string) && (
                        <div>
                          <div className="text-sm text-muted-foreground">Notes</div>
                          <div>{(p.info as any).requirement.notes}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              className="text-accent-foreground hover:underline"
              onClick={() => alert('Go to Edit Builds (UI only)')}
            >
              Edit Builds
            </button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

/** kecil-kecil */
const Field: React.FC<{ label: string; value?: string }> = ({ label, value }) => (
  <div>
    <div className="text-sm text-muted-foreground">{label}</div>
    <div>{value || '—'}</div>
  </div>
);

export default StudioGamePublish;
