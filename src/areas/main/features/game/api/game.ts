import { GameWholeUpsertPayload, GameWhole, GameMetadataResponse } from '@shared/interfaces/gameDraft';


const API_BASE = import.meta.env.VITE_API_BASE + '/api/games';

const handleResponse = async (res: Response) => {
  if (res.ok) {
    return res.json();
  }

  let message = 'An unknown error occurred';
  try {
    const errorData = await res.json();
    if (typeof errorData.message === 'string') {
      message = errorData.message;
    } else if (Array.isArray(errorData.message)) {
      message = errorData.message.join('; ');
    }
  } catch {
    message = `Request failed: ${res.status} ${res.statusText}`;
  }

  const error = new Error(message);
  (error as any).statusCode = res.status;
  throw error;
};

const pickFirst = <T,>(...values: (T | undefined)[]): T | undefined => {
  for (const value of values) {
    if (value !== undefined) {
      return value;
    }
  }
  return undefined;
};

const normalizeGameWholePayload = (payload: GameWholeUpsertPayload) => {
  const result: Record<string, unknown> = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) {
      result[key] = value;
    }
  };

  assign('game_id', pickFirst(payload.game_id, payload.gameId));
  assign('name', payload.name);
  assign('description', payload.description);
  assign('required_age', pickFirst(payload.required_age, payload.requiredAge));
  assign('price', payload.price);
  assign('website', payload.website);
  assign('banner_image', pickFirst(payload.banner_image, payload.bannerImage));
  assign(
    'cover_vertical_image',
    pickFirst(payload.cover_vertical_image, payload.coverVerticalImage),
  );
  assign(
    'cover_horizontal_image',
    pickFirst(payload.cover_horizontal_image, payload.coverHorizontalImage),
  );
  assign('is_published', pickFirst(payload.is_published, payload.isPublished));
  assign('release_date', pickFirst(payload.release_date, payload.releaseDate));
  assign('draft_status', pickFirst(payload.draft_status, payload.draftStatus));
  assign('created_at', pickFirst(payload.created_at, payload.createdAt));
  assign('updated_at', pickFirst(payload.updated_at, payload.updatedAt));
  assign('categories', payload.categories);
  assign('tags', payload.tags);
  assign('previews', payload.previews);
  assign('distributions', payload.distributions);

  return result;
};

export const fetchGameWhole = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}`);
  return handleResponse(res) as Promise<GameWhole>;
};

export const fetchGameMetadata = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}/metadata`);
  return handleResponse(res) as Promise<GameMetadataResponse>;
};

export const setGameWhole = async (gameId: string, payload: GameWholeUpsertPayload) => {
  const normalized = normalizeGameWholePayload(payload);
  const res = await fetch(`${API_BASE}/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalized),
  });
  return handleResponse(res) as Promise<GameWhole>;
};

export { fetchMetadata } from '@shared/api/metadata.api';
