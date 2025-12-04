import { GameManifest } from "../interfaces/gameManifest";

export async function getGameManifest(
    gameId: string,
    platform: string
): Promise<GameManifest> {
    const res = await fetch(
        `https://api.peridotvault.com/games/${gameId}/latest?platform=${platform}`
    );

    if (!res.ok) {
        throw new Error(`Failed to fetch manifest: ${res.status}`);
    }

    const json = await res.json();

    return {
        gameId,
        title: json.name,
        version: json.version,
        platform,
        sizeBytes: json.size_bytes,
        downloadUrl: json.download_url,
        entryExe: json.entry_exe,
    };
}
