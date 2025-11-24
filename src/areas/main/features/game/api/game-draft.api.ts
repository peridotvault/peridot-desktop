import {
  AppendManifestPayload,
  CategoriesResponse,
  CategoryDb,
  GameBuilds,
  GameDraft,
  GameGeneral,
  GamePreview,
  SetHardwarePayload,
  TagDb,
  TagsResponse,
} from '../types/game-draft';

// api/gameDraftApi.ts
// const BASE_URL = import.meta.env.VITE_OFFCHAIN_API_BASE + '/games';
const API_BASE = import.meta.env.VITE_API_BASE + '/api/games';

// Helper: handle error response
// Helper: handle error response
const handleResponse = async (res: Response) => {
  if (res.ok) {
    return await res.json();
  }

  // Try to parse structured error
  let message = 'An unknown error occurred';
  try {
    const errorData = await res.json();
    // Match your NestJS error shape: { statusCode, message, ... }
    if (typeof errorData.message === 'string') {
      message = errorData.message;
    } else if (Array.isArray(errorData.message)) {
      message = errorData.message.join('; ');
    }
  } catch {
    // Fallback to status text
    message = `Request failed: ${res.status} ${res.statusText}`;
  }

  // Throw a custom error with clean message
  const error = new Error(message);
  (error as any).statusCode = res.status;
  throw error;
};

// ===== WHOLE DRAFT =====
export const fetchWholeDraft = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts`);
  return handleResponse(res) as Promise<GameDraft>;
};

export const updateWholeDraft = async (gameId: string, patch: Partial<GameDraft>) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  });
  return handleResponse(res) as Promise<GameDraft>;
};

export const deleteDraft = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts`, { method: 'DELETE' });
  return handleResponse(res);
};

// ===== GENERAL =====
export const fetchGeneral = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts/general`);
  console.log(res);
  return handleResponse(res) as Promise<GameGeneral>;
};

const pickDefined = <T>(...values: (T | undefined)[]): T | undefined => {
  for (const value of values) {
    if (value !== undefined) return value;
  }
  return undefined;
};

export const updateGeneral = async (gameId: string, data: GameGeneral) => {
  const payload: Record<string, unknown> = {};

  const assign = (key: string, value: unknown) => {
    if (value !== undefined) payload[key] = value;
  };

  assign('name', pickDefined(data.name));
  assign('description', pickDefined(data.description));
  assign('price', pickDefined(data.price));
  assign('website', pickDefined(data.website));
  assign('required_age', pickDefined(data.required_age, data.requiredAge));
  assign(
    'cover_vertical_image',
    pickDefined(data.cover_vertical_image, data.coverVerticalImage),
  );
  assign(
    'cover_horizontal_image',
    pickDefined(data.cover_horizontal_image, data.coverHorizontalImage),
  );
  assign('banner_image', pickDefined(data.banner_image, data.bannerImage));
  assign('categories', pickDefined(data.categories));
  assign('tags', pickDefined(data.tags));

  const res = await fetch(`${API_BASE}/${gameId}/drafts/general`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res) as Promise<GameGeneral>;
};

// ===== PREVIEWS =====
export const fetchPreviews = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts/previews`);
  return handleResponse(res) as Promise<GamePreview>;
};

export const updatePreviews = async (gameId: string, data: GamePreview) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts/previews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res) as Promise<GamePreview>;
};

// ===== BUILDS =====
export const fetchBuilds = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts/builds`);
  return handleResponse(res) as Promise<GameBuilds>;
};

export const setHardware = async (gameId: string, data: SetHardwarePayload) => {
  try {
    const res = await fetch(`${API_BASE}/${gameId}/drafts/builds/hardware`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res) as Promise<SetHardwarePayload>;
  } catch (error) {
    error;
  }
};

export const appendManifest = async (gameId: string, data: AppendManifestPayload) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts/builds/manifest`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res) as Promise<AppendManifestPayload>;
};

export const setLive = async (gameId: string, data: { platformId: string; version: string }) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts/builds/live_version`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return handleResponse(res) as Promise<{ platformId: string; version: string }>;
};

// ===== ADDITIONAL =====
type RawCategory = Partial<CategoryDb> & { category_id?: string | number; name?: string | null };
type RawTag = Partial<TagDb> & { tag_id?: string | number; name?: string | null };

const normalizeCategories = (raw?: RawCategory[] | null): CategoryDb[] => {
  if (!Array.isArray(raw)) return [];
  const mapped = raw
    .map((entry) => {
      const categoryId =
        (typeof entry.categoryId === 'string' && entry.categoryId.trim()) ||
        (typeof entry.category_id === 'string' && entry.category_id.trim()) ||
        (typeof entry.category_id === 'number' ? String(entry.category_id) : undefined);
      const name = entry.name?.trim();
      if (!categoryId || !name) return null;
      return { categoryId, name };
    })
    .filter((entry): entry is CategoryDb => entry !== null);
  return mapped;
};

const normalizeTags = (raw?: RawTag[] | null): TagDb[] => {
  if (!Array.isArray(raw)) return [];
  const mapped = raw
    .map((entry) => {
      const tagId =
        (typeof entry.tagId === 'string' && entry.tagId.trim()) ||
        (typeof entry.tag_id === 'string' && entry.tag_id.trim()) ||
        (typeof entry.tag_id === 'number' ? String(entry.tag_id) : undefined);
      const name = entry.name?.trim();
      if (!tagId || !name) return null;
      return { tagId, name };
    })
    .filter((entry): entry is TagDb => entry !== null);
  return mapped;
};

export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`);
  const payload = (await handleResponse(res)) as { categories?: RawCategory[] };
  return { categories: normalizeCategories(payload.categories) } as CategoriesResponse;
};

export const fetchTags = async () => {
  const res = await fetch(`${API_BASE}/tags`);
  const payload = (await handleResponse(res)) as { tags?: RawTag[] };
  return { tags: normalizeTags(payload.tags) } as TagsResponse;
};
