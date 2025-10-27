import {
  AppendManifestPayload,
  CategoriesResponse,
  GameBuilds,
  GameDraft,
  GameGeneral,
  GamePreview,
  SetHardwarePayload,
  TagsResponse
} from '../types/game-draft.type';

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

export const updateGeneral = async (gameId: string, data: GameGeneral) => {
  const res = await fetch(`${API_BASE}/${gameId}/drafts/general`, {
    method: 'POST', // sesuai controller-mu: @Post('general')
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
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
export const fetchCategories = async () => {
  const res = await fetch(`${API_BASE}/categories`);
  return handleResponse(res) as Promise<CategoriesResponse>;
};

export const fetchTags = async () => {
  const res = await fetch(`${API_BASE}/tags`);
  return handleResponse(res) as Promise<TagsResponse>;
};
