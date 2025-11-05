import type {
  GameMetadataResponse,
  GameWhole,
  GameWholeUpsertPayload,
} from '../types/game-draft.type';

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

export const fetchGameWhole = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}`);
  return handleResponse(res) as Promise<GameWhole>;
};

export const fetchGameMetadata = async (gameId: string) => {
  const res = await fetch(`${API_BASE}/${gameId}/metadata`);
  return handleResponse(res) as Promise<GameMetadataResponse>;
};

export const setGameWhole = async (gameId: string, payload: GameWholeUpsertPayload) => {
  const res = await fetch(`${API_BASE}/${gameId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(res) as Promise<GameWhole>;
};

export { fetchMetadata } from '@shared/api/metadata.api';
