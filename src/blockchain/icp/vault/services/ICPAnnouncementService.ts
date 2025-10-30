import type { GameAnnouncementType } from '../service.did.d';

export interface CreateAnnouncementTypes {
    headline: string;
    content: string;
    coverImage?: string;
    pinned?: boolean;
    status?: string;
}

const store = new Map<string, GameAnnouncementType[]>();

const nowNs = (): bigint => BigInt(Date.now()) * 1_000_000n;

export async function getAllAnnouncementsByGameId({
    gameId,
}: {
    gameId: string;
    wallet?: any;
}): Promise<GameAnnouncementType[]> {
    return store.get(gameId) ?? [];
}

export async function getAnnouncementsByAnnouncementId({
    announcementId,
}: {
    announcementId: bigint | number;
    wallet?: any;
}): Promise<GameAnnouncementType | null> {
    for (const announcements of store.values()) {
        const found = announcements.find((ann) => ann.announcementId === announcementId.toString());
        if (found) return found;
    }
    return null;
}

export async function createAnnouncement({
    createAnnouncementTypes,
    gameId,
}: {
    createAnnouncementTypes: CreateAnnouncementTypes;
    wallet?: any;
    gameId: string;
}): Promise<GameAnnouncementType> {
    const record: GameAnnouncementType = {
        announcementId: `${gameId}-${Date.now()}`,
        headline: createAnnouncementTypes.headline,
        content: createAnnouncementTypes.content,
        coverImage: createAnnouncementTypes.coverImage,
        pinned: !!createAnnouncementTypes.pinned,
        createdAt: nowNs(),
        status: createAnnouncementTypes.status
            ? { status: createAnnouncementTypes.status }
            : undefined,
    };

    const list = store.get(gameId) ?? [];
    list.push(record);
    store.set(gameId, list);
    return record;
}

export async function commentByAnnouncementId({
    annId,
    comment,
}: {
    annId: bigint | number;
    wallet?: any;
    comment: string;
}): Promise<void> {
    console.info('commentByAnnouncementId stub', { annId: annId.toString(), comment });
}
