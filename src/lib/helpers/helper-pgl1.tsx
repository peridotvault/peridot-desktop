import type {
  MediaItem,
  Metadata,
  PublishInfo,
  Value,
  PreviewItem as InputPreviewMediaItem,
  Distribution,
  NativeBuild,
  WebBuild,
} from '../../lib/interfaces/types-game';

// type guards
export const isText = (v?: Value | null): v is { text: string } => !!v && 'text' in v;
export const isArray = (v?: Value | null): v is { array: Value[] } => !!v && 'array' in v;
export const isMap = (v?: Value | null): v is { map: Array<[string, Value]> } => !!v && 'map' in v;
export const isNat = (v?: Value | null): v is { nat: number } => !!v && 'nat' in v;
export const isInt = (v?: Value | null): v is { int: number } => !!v && 'int' in v;
export const isBlob = (v?: Value | null): v is { blob: Uint8Array | number[] } =>
  !!v && 'blob' in v;

export const metaFind = (meta?: Metadata, key?: string) => meta?.find?.(([k]) => k === key)?.[1];

// pgl1_categories / pgl1_tags = array of text
export const metaGetTextArray = (meta?: Metadata, key?: string): string[] => {
  const v = metaFind(meta, key);
  if (!isArray(v)) return [];
  return v.array.map((it) => (isText(it) ? it.text : '')).filter(Boolean);
};

// pgl1_previews = array of map { kind: text('image'|'video'), url: text }
export type PreviewItem = { kind: 'image' | 'video'; url: string };
export const metaGetPreviews = (meta?: Metadata, key = 'pgl1_previews'): PreviewItem[] => {
  const v = metaFind(meta, key);
  if (!isArray(v)) return [];
  const out: PreviewItem[] = [];
  for (const item of v.array) {
    if (!isMap(item)) continue;
    const kindV = item.map.find(([k]) => k === 'kind')?.[1];
    const urlV = item.map.find(([k]) => k === 'url')?.[1];
    if (isText(kindV) && isText(urlV) && (kindV.text === 'image' || kindV.text === 'video')) {
      out.push({ kind: kindV.text, url: urlV.text });
    }
  }
  return out;
};

// pgl1_status = map { published: boolean-ish, release_date: bigint-ish }
// Karena Value union kamu tidak punya boolean/bigint eksplisit,
// kita deteksi dari int/nat/text untuk published; release_date dari nat/int/text angka.
export const metaGetStatus = (meta?: Metadata, key = 'pgl1_status') => {
  const v = metaFind(meta, key);
  if (!isMap(v)) return { published: false, releaseDateMs: undefined as number | undefined };

  const getBool = (val?: Value): boolean => {
    if (!val) return false;
    if (isInt(val)) return !!val.int;
    if (isNat(val)) return !!val.nat;
    if (isText(val)) return val.text.toLowerCase() === 'true';
    // blob/array/map -> anggap false
    return false;
  };

  const getNumber = (val?: Value): number | undefined => {
    if (!val) return undefined;
    if (isNat(val)) return Number(val.nat);
    if (isInt(val)) return Number(val.int);
    if (isText(val)) {
      const n = Number(val.text);
      return Number.isFinite(n) ? n : undefined;
    }
    return undefined;
  };

  const publishedV = v.map.find(([k]) => k === 'published')?.[1];
  const releaseDateV = v.map.find(([k]) => k === 'release_date')?.[1];

  const published = getBool(publishedV);
  const releaseDateMs = getNumber(releaseDateV); // jika kamu simpan epoch ms → langsung terpakai

  return { published, releaseDateMs };
};

// -------- writers opsional (kalau kamu perlu menyimpan balik) --------
export const toText = (s: string): Value => ({ text: s });
export const toArrayText = (arr: string[]): Value => ({ array: arr.map(toText) });
export const toMap = (entries: Array<[string, Value]>): Value => ({ map: entries });
export const toPreviews = (items: PreviewItem[]): Value => ({
  array: items.map((it) => ({
    map: [
      ['kind', toText(it.kind)],
      ['url', toText(it.url)],
    ],
  })),
});
export const toArray = (vals: Value[]): Value => ({ array: vals });

/** Upsert key-value ke Metadata */
export const metaUpsert = (meta: Metadata | undefined, key: string, value: Value): Metadata => {
  const arr = Array.isArray(meta) ? [...meta] : [];
  const idx = arr.findIndex(([k]) => k === key);
  if (idx >= 0) {
    arr[idx] = [key, value];
  } else {
    arr.push([key, value]);
  }
  return arr;
};

// writers

// --- Categories & Tags ---
// const META_CATEGORIES = 'pgl1_categories';
// const META_TAGS = 'pgl1_tags';

export const readStringArray = (meta?: Metadata, key?: string): string[] => {
  const v = metaFind(meta, key);
  if (!isArray(v)) return [];
  return v.array.map((x) => (isText(x) ? x.text : '')).filter(Boolean);
};

export const writeStringArray = (meta: Metadata | undefined, key: string, values: string[]) =>
  metaUpsert(meta, key, toArrayText(values));

// ------- previews -------
const META_PREVIEWS = 'pgl1_previews';
export const readPreviews = (meta?: Metadata, key = META_PREVIEWS): MediaItem[] => {
  const v = metaFind(meta, key);
  if (!isArray(v)) return [];
  const out: MediaItem[] = [];
  for (const it of v.array) {
    if (!isMap(it)) continue;
    const kindV = it.map.find(([k]) => k === 'kind')?.[1];
    const srcV = it.map.find(([k]) => k === 'src')?.[1] ?? it.map.find(([k]) => k === 'url')?.[1];
    if (!isText(kindV) || !isText(srcV)) continue;

    const kind = kindV.text as 'image' | 'video';
    if (kind !== 'image' && kind !== 'video') continue;

    const altV = it.map.find(([k]) => k === 'alt')?.[1];
    const alt = isText(altV) ? altV.text : undefined;

    if (kind === 'image') {
      out.push({ kind, src: srcV.text, alt });
    } else {
      // kind === 'video'
      const posterV = it.map.find(([k]) => k === 'poster')?.[1];
      const poster = isText(posterV) ? posterV.text : undefined;
      out.push({ kind, src: srcV.text, alt, poster });
    }
  }
  return out;
};

export const writePreviews = (
  meta: Metadata | undefined,
  items: MediaItem[],
  key = META_PREVIEWS,
): Metadata => {
  const arrayValue: Array<{ map: Array<[string, Value]> }> = items.map((m) => {
    const base: Array<[string, Value]> = [
      ['kind', toText(m.kind)],
      ['src', toText(m.src)],
    ];

    if (m.alt) base.push(['alt', toText(m.alt)]);

    // Hanya tambahkan 'poster' jika video
    if (m.kind === 'video' && m.poster) {
      base.push(['poster', toText(m.poster)]);
    }

    return { map: base };
  });

  return metaUpsert(meta, key, { array: arrayValue });
};

// --- Publish Status ---
const META_STATUS = 'pgl1_status';
export const readPublishInfo = (meta?: Metadata, key = META_STATUS): PublishInfo => {
  const v = metaFind(meta, key);
  if (!isMap(v)) return { isPublished: false };

  const publishedV = v.map.find(([k]) => k === 'isPublished')?.[1];
  const releaseDateV = v.map.find(([k]) => k === 'releaseDate')?.[1];

  const isPublished = isText(publishedV) ? publishedV.text.toLowerCase() === 'true' : false;
  let releaseDate: number | undefined;

  if (isText(releaseDateV)) {
    const num = Number(releaseDateV.text);
    if (Number.isFinite(num)) releaseDate = num;
  }

  return { isPublished, releaseDate };
};

export const writePublishInfo = (
  meta: Metadata | undefined,
  info: PublishInfo,
  key = META_STATUS,
): Metadata => {
  const entries: Array<[string, Value]> = [
    ['isPublished', toText(info.isPublished ? 'true' : 'false')],
  ];

  if (info.releaseDate !== undefined && info.releaseDate !== null) {
    entries.push(['releaseDate', toText(String(info.releaseDate))]);
  }

  return metaUpsert(meta, key, toMap(entries));
};

export function dbToInputPreviews(dbItems: MediaItem[]): InputPreviewMediaItem[] {
  return dbItems.map((item, index) => ({
    id: `preview-${Date.now()}-${index}`,
    // Buat file dummy karena kita tidak punya file asli
    file: new File([], item.src.split('/').pop() || 'preview.jpg', {
      type: item.kind === 'image' ? 'image/jpeg' : 'video/mp4',
    }),
    url: item.src, // Gunakan permanent URL langsung
    kind: item.kind,
    primary: index === 0, // Set item pertama sebagai primary
  }));
}

// InputPreviews → Database
export function inputPreviewsToDb(inputItems: InputPreviewMediaItem[]): MediaItem[] {
  return inputItems.map((item) => ({
    kind: item.kind,
    src: item.url, // Harus URL permanen (bukan blob:)
    alt: item.file.name,
    // Tidak ada poster di InputPreviews, jadi skip
  }));
}

export const isNativeBuild = (dist: Distribution): dist is { native: NativeBuild } => {
  return 'native' in dist;
};

export const isWebBuild = (dist: Distribution): dist is { web: WebBuild } => {
  return 'web' in dist;
};
