import { Metadata } from '../types/game.type';

// api/gameDraftApi.ts
// const BASE_URL = import.meta.env.VITE_OFFCHAIN_API_BASE + '/games';
// const API_BASE = import.meta.env.VITE_API_BASE + '/api/games';

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
export const fetchMetadata = async (url: string) => {
  const res = await fetch(url);
  return handleResponse(res) as Promise<Metadata>;
};
