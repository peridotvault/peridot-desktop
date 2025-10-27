const AI_API_BASE = import.meta.env.VITE_AI_API_BASE || 'http://localhost:9000';

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function chat(query: string) {
  return json<{ response: string }>(
    await fetch(`${AI_API_BASE}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    }),
  );
}
